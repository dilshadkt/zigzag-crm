import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useCalendarDataOptimized } from "./hooks/useCalendarDataOptimized";
import {
  CalendarGrid,
  CalendarHeader,
  EventFilters,
  EventsModal,
} from "./components";
import UnscheduledTasksModal from "./components/UnscheduledTasksModal";
import AddTask from "../../components/projects/addTask";
import {
  useCreateTaskFromBoard,
  useGetAllEmployees,
  useCompanyProjects,
} from "../../api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { uploadSingleFile } from "../../api/service";
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";
import {
  toggleEventFilter,
  setAssignerFilter,
  setProjectFilter,
  setCurrentDate as setCalendarCurrentDate,
  reloadCalendarState,
} from "../../store/slice/calendarSlice";

const Calendar = () => {
  const dispatch = useDispatch();
  const {
    eventFilters,
    assignerFilter,
    projectFilter,
    currentDate: persistedCurrentDate,
  } = useSelector((state) => state.calendar);

  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const isEmployee = user?.role === "employee";

  // Permission checks
  const canEditTasks = hasPermission("tasks", "edit");
  const canCreateTask = hasPermission("tasks", "create");

  // Use persisted current date or fallback to current month (new Date())
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to current month if no persisted date
    return new Date();
  });

  // Reload calendar state when user changes to get user-specific persisted date
  useEffect(() => {
    if (user?._id) {
      dispatch(reloadCalendarState());
    }
  }, [user?._id, dispatch]);

  // Sync local state with Redux persisted state when user loads or persisted date changes
  useEffect(() => {
    if (user?._id) {
      if (persistedCurrentDate) {
        const persistedDate = new Date(persistedCurrentDate);
        if (!Number.isNaN(persistedDate.getTime())) {
          setCurrentDate((prevDate) => {
            if (prevDate.getTime() === persistedDate.getTime()) {
              return prevDate;
            }
            return persistedDate;
          });
        } else {
          // If persisted date is invalid, default to current month
          setCurrentDate(new Date());
        }
      } else {
        // If no persisted date for this user, default to current month
        setCurrentDate(new Date());
      }
    }
  }, [user?._id, persistedCurrentDate]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [showModalTask, setShowModalTask] = useState(false);
  const [selectedDateForTask, setSelectedDateForTask] = useState(null);
  const [showUnscheduledModal, setShowUnscheduledModal] = useState(false);
  const [selectedDateForScheduling, setSelectedDateForScheduling] =
    useState(null);

  // Get projects and employees data for AddTask modal
  const { data: projectsData } = useCompanyProjects(user?.company);
  const { data: employeesData } = useGetAllEmployees();

  // Task creation hook
  const { mutate: createTask, isLoading: isCreatingTask } =
    useCreateTaskFromBoard(() => {
      setShowModalTask(false);
      // Refresh calendar data after task creation
      queryClient.invalidateQueries(["calendarData"]);
    });

  // Custom hook to manage calendar data (optimized with single API call)
  const { calendarData, isLoading } = useCalendarDataOptimized(
    currentDate,
    eventFilters,
    assignerFilter,
    projectFilter
  );

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    dispatch(setCalendarCurrentDate(newDate.toISOString()));
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    dispatch(setCalendarCurrentDate(newDate.toISOString()));
  };

  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Calculate day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Generate blank days to fill the calendar grid properly
  const blankDays = Array(firstDayOfWeek)
    .fill(null)
    .map((_, index) => ({ day: "", date: "", fullDate: null }));

  // Days in the current month
  const calendarDays = [
    ...blankDays,
    ...daysInMonth.map((date) => ({
      day: format(date, "EEE"),
      date: format(date, "d"),
      fullDate: date,
    })),
  ];

  // Toggle event filter
  const handleToggleEventFilter = (filterType) => {
    dispatch(toggleEventFilter(filterType));
  };

  // Handle assigner filter change
  const handleAssignerFilterChange = (assignerId) => {
    dispatch(setAssignerFilter(assignerId));
  };

  // Handle project filter change
  const handleProjectFilterChange = (projectId) => {
    dispatch(setProjectFilter(projectId));
  };

  // Open modal with events for selected day
  const openEventsModal = (date) => {
    const { projects, tasks, subtasks, birthdays } =
      calendarData.getItemsForDate(date);

    setSelectedDayData({
      date,
      projects,
      tasks,
      subtasks,
      birthdays,
      formattedDate: format(date, "EEEE, MMMM d, yyyy"),
    });
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedDayData(null);
  };

  // Handle menu item click from calendar day
  const handleMenuItemClick = (action, date) => {
    if (action === "create-task" && canCreateTask) {
      setSelectedDateForTask(date);
      setShowModalTask(true);
    } else if (action === "unscheduled-tasks" && canCreateTask) {
      setSelectedDateForScheduling(date);
      setShowUnscheduledModal(true);
    }
    // Add other actions here as needed
  };

  // Handle add task
  const handleAddTask = async (values, { resetForm }) => {
    try {
      const updatedValues = cleanTaskData(values);
      updatedValues.creator = user?._id;

      // Set the selected date as the start date if no start date is provided
      if (selectedDateForTask && !values.startDate) {
        updatedValues.startDate = format(selectedDateForTask, "yyyy-MM-dd");
      }

      // Process attachments if any
      if (values?.attachments && values.attachments.length > 0) {
        const processedAttachments = await processAttachments(
          values.attachments,
          uploadSingleFile
        );
        updatedValues.attachments = processedAttachments;
      }

      // Handle project field
      if (values.project === "other" || !values.project) {
        updatedValues.project = null;
        // Remove project-specific fields for "Other" project
        delete updatedValues.taskGroup;
        delete updatedValues.extraTaskWorkType;
        delete updatedValues.taskFlow;
      }

      // Create the task
      createTask(updatedValues, {
        onSuccess: () => {
          resetForm();
          setSelectedDateForTask(null);
        },
        onError: (error) => {
          console.error("Failed to create task:", error);
          alert("Failed to create task. Please try again.");
        },
      });
    } catch (error) {
      console.error("Error processing task data:", error);
      alert("Failed to process task data. Please try again.");
    }
  };

  return (
    <section className="flex flex-col  h-full">
      <div className="hidden md:flex mb-2">
        <EventFilters
          eventFilters={eventFilters}
          onToggleFilter={handleToggleEventFilter}
          assignerFilter={assignerFilter}
          onAssignerFilterChange={handleAssignerFilterChange}
          projectFilter={projectFilter}
          onProjectFilterChange={handleProjectFilterChange}
          calendarData={calendarData}
          canEditTasks={canEditTasks}
        />
      </div>
      <div
        className="w-full h-full  flex flex-col overflow-hidden
         bg-white rounded-3xl"
      >
        <div
          className="min-h-[48px] relative w-full flex items-center justify-center 
         border-b border-[#E6EBF5]"
        >
          {/* Calendar Header */}
          <CalendarHeader
            currentDate={currentDate}
            firstDay={firstDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            isLoading={isLoading}
          />
        </div>
        {/* Calendar Grid */}
        <CalendarGrid
          calendarDays={calendarDays}
          calendarData={calendarData}
          isLoading={isLoading}
          onOpenModal={openEventsModal}
          onMenuItemClick={handleMenuItemClick}
          isEmployee={isEmployee}
          canCreateTask={canCreateTask}
        />
      </div>
      {/* Event Type Filters */}

      {/* Events Modal */}
      <EventsModal
        isOpen={modalOpen}
        selectedDayData={selectedDayData}
        onClose={closeModal}
        calendarData={calendarData}
        isEmployee={isEmployee}
      />

      {/* Add Task Modal */}
      <AddTask
        isOpen={showModalTask}
        setShowModalTask={setShowModalTask}
        projects={projectsData || []}
        onSubmit={handleAddTask}
        teams={employeesData?.employees || []}
        selectedMonth={format(currentDate, "yyyy-MM")}
        isLoading={isCreatingTask}
        showProjectSelection={true}
        initialValues={
          selectedDateForTask
            ? {
              startDate: format(selectedDateForTask, "yyyy-MM-dd"),
              dueDate: format(selectedDateForTask, "yyyy-MM-dd"),
            }
            : {}
        }
      />

      {/* Unscheduled Tasks Modal */}
      <UnscheduledTasksModal
        isOpen={showUnscheduledModal}
        onClose={() => {
          setShowUnscheduledModal(false);
          setSelectedDateForScheduling(null);
        }}
        selectedDate={selectedDateForScheduling}
      />
    </section>
  );
};

export default Calendar;
