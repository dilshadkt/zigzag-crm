import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
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
import { getCurrentMonthKey } from "../../lib/dateUtils";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [showModalTask, setShowModalTask] = useState(false);
  const [selectedDateForTask, setSelectedDateForTask] = useState(null);
  const [showUnscheduledModal, setShowUnscheduledModal] = useState(false);
  const [selectedDateForScheduling, setSelectedDateForScheduling] =
    useState(null);
  const [eventFilters, setEventFilters] = useState({
    tasks: true,
    subtasks: true,
    projects: true,
    birthdays: true,
  });
  const [assignerFilter, setAssignerFilter] = useState(null);
  const [projectFilter, setProjectFilter] = useState(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEmployee = user?.role === "employee";

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

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

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
  const toggleEventFilter = (filterType) => {
    setEventFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  // Handle assigner filter change
  const handleAssignerFilterChange = (assignerId) => {
    setAssignerFilter(assignerId);
  };

  // Handle project filter change
  const handleProjectFilterChange = (projectId) => {
    setProjectFilter(projectId);
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
    if (action === "create-task") {
      setSelectedDateForTask(date);
      setShowModalTask(true);
    } else if (action === "unscheduled-tasks") {
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
      <div
        className="w-full h-full  flex flex-col overflow-hidden
         bg-white rounded-3xl"
      >
        <div className="min-h-[48px] relative w-full flex items-center justify-center md:justify-end border-b border-[#E6EBF5]">
          {/* Calendar Header */}
          <CalendarHeader
            currentDate={currentDate}
            firstDay={firstDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            isLoading={isLoading}
          />

          {/* Event Type Filters */}
          <div className="hidden md:flex">
            <EventFilters
              eventFilters={eventFilters}
              onToggleFilter={toggleEventFilter}
              assignerFilter={assignerFilter}
              onAssignerFilterChange={handleAssignerFilterChange}
              projectFilter={projectFilter}
              onProjectFilterChange={handleProjectFilterChange}
              calendarData={calendarData}
            />
          </div>
        </div>
        {/* Calendar Grid */}
        <CalendarGrid
          calendarDays={calendarDays}
          calendarData={calendarData}
          isLoading={isLoading}
          onOpenModal={openEventsModal}
          onMenuItemClick={handleMenuItemClick}
          isEmployee={isEmployee}
        />
      </div>

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
        selectedMonth={getCurrentMonthKey()}
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
