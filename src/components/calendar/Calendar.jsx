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
import { useCalendarData } from "../../hooks/useCalendarData";
import CalendarHeader from "./CalendarHeader";
import EventFilters from "./EventFilters";
import EventsModal from "./EventsModal";
import CalendarGrid from "./CalendarGrid";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [eventFilters, setEventFilters] = useState({
    tasks: true,
    subtasks: true,
    projects: true,
    birthdays: true,
  });
  const [assignerFilter, setAssignerFilter] = useState(null);
  const [projectFilter, setProjectFilter] = useState(null);

  const { user } = useAuth();
  const isEmployee = user?.role === "employee";

  // Custom hook to manage calendar data
  const { calendarData, isLoading } = useCalendarData(
    currentDate,
    eventFilters,
    assignerFilter,
    projectFilter
  );
  console.log(calendarData, "calendar data");
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

  return (
    <section className="flex flex-col h-full">
      <div
        className="w-full h-full  flex flex-col overflow-hidden
       bg-white rounded-3xl"
      >
        <div className="min-h-[48px] relative w-full flexEnd border-b border-[#E6EBF5]">
          {/* Calendar Header */}
          <CalendarHeader
            currentDate={currentDate}
            firstDay={firstDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            isLoading={isLoading}
          />

          {/* Event Type Filters */}
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
        {/* Calendar Grid */}
        <CalendarGrid
          calendarDays={calendarDays}
          calendarData={calendarData}
          isLoading={isLoading}
          onOpenModal={openEventsModal}
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
    </section>
  );
};

export default Calendar;
