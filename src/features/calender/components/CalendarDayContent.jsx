import React from "react";
import CalendarEventItem from "./CalendarEventItem";
import { MAX_ITEMS_PER_DAY } from "../constants";
import { isSameDay } from "date-fns";

const CalendarDayContent = ({
  date,
  calendarData,
  onOpenModal,
  isEmployee,
}) => {
  // Get all items for this date
  const { projects, tasks, subtasks, birthdays } =
    calendarData.getItemsForDate(date);

  // Check if this date is today
  const isToday = isSameDay(date, new Date());

  // Separate actual tasks from carried tasks for today
  const actualTasks = tasks.filter((task) => !task.isCarriedTask);
  const carriedTasks = tasks.filter((task) => task.isCarriedTask);

  const actualSubtasks = subtasks.filter((subtask) => !subtask.isCarriedTask);
  const carriedSubtasks = subtasks.filter((subtask) => subtask.isCarriedTask);

  // For today's date: prioritize showing all actual tasks first, then carried tasks
  // For other dates: show normally
  let orderedTasks, orderedSubtasks;

  if (isToday) {
    // On today: show actual tasks first, then carried tasks
    orderedTasks = [...actualTasks, ...carriedTasks];
    orderedSubtasks = [...actualSubtasks, ...carriedSubtasks];
  } else {
    // On other dates: normal order (actual tasks only, no carried tasks should appear)
    orderedTasks = actualTasks;
    orderedSubtasks = actualSubtasks;
  }

  const totalItems =
    projects.length +
    orderedTasks.length +
    orderedSubtasks.length +
    birthdays.length;

  // Combine all items with priority order
  let allItems = [
    ...birthdays.map((item, idx) => ({
      type: "birthday",
      data: item,
      idx,
      priority: 0, // Highest priority
    })),
    ...projects.map((item, idx) => ({
      type: "project",
      data: item,
      idx,
      priority: 1,
    })),
    ...orderedTasks.map((item, idx) => ({
      type: "task",
      data: item,
      idx,
      priority: item.isCarriedTask ? 3 : 2, // Actual tasks before carried tasks
    })),
    ...orderedSubtasks.map((item, idx) => ({
      type: "subtask",
      data: item,
      idx,
      priority: item.isCarriedTask ? 5 : 4, // Actual subtasks before carried subtasks
    })),
  ];

  // Sort by priority
  allItems.sort((a, b) => a.priority - b.priority);

  // Calculate carried tasks count for compact display
  const carriedTasksCount = carriedTasks.length + carriedSubtasks.length;
  const hasCarriedTasks = isToday && carriedTasksCount > 0;

  // For today with carried tasks: Show only 1 item to make room for carried badge and more button
  // For other days: Show normal 2 items
  let itemsToShow;
  if (hasCarriedTasks) {
    // On today with carried tasks: show only 1 actual item (exclude carried from display)
    const actualItemsOnly = allItems.filter((item) => !item.data.isCarriedTask);
    itemsToShow = 1; // Show only 1 item
  } else {
    itemsToShow = MAX_ITEMS_PER_DAY; // Normal: show 2 items
  }

  const displayItems = hasCarriedTasks
    ? allItems.filter((item) => !item.data.isCarriedTask).slice(0, itemsToShow)
    : allItems.slice(0, itemsToShow);

  // Calculate if we need "more" button
  const actualTotalItems = hasCarriedTasks
    ? projects.length +
      actualTasks.length +
      actualSubtasks.length +
      birthdays.length
    : totalItems;
  const hasMore = actualTotalItems > itemsToShow;

  return (
    <>
      {/* Mobile: Show only count */}
      <div className="md:hidden absolute p-1  inset-0  h-full">
        {totalItems > 0 && (
          <div
            onClick={() => onOpenModal(date)}
            className="text-xs bg-blue-100/60 w-full h-full text-blue-700 rounded-md px-2 py-1.5 
                      cursor-pointer hover:bg-blue-200 text-center font-medium"
          >
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Desktop: Show detailed items */}
      <div className="hidden md:flex flex-col gap-y-1">
        {/* Display the combined list of birthdays, projects, tasks and subtasks */}
        {displayItems.map((item) => (
          <CalendarEventItem
            key={`${item.type}-${item.idx}`}
            type={item.type}
            data={item.data}
            isEmployee={isEmployee}
          />
        ))}

        {/* Compact carried tasks badge - only show on today */}
        {hasCarriedTasks && (
          <div
            onClick={() => onOpenModal(date)}
            className="text-[10px] bg-orange-100 border border-orange-300 text-orange-800 
                      rounded-md px-2 py-1 cursor-pointer hover:bg-orange-200 
                      transition-colors flex items-center justify-center gap-1 font-medium"
            title={`${carriedTasksCount} task${
              carriedTasksCount > 1 ? "s" : ""
            } carried to today`}
          >
            <span>📌</span>
            <span>
              {carriedTasksCount} Carried Task{carriedTasksCount > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Show "more" indicator if needed */}
        {hasMore && (
          <div
            onClick={() => onOpenModal(date)}
            className="text-xs bg-gray-100 text-gray-700 rounded-md px-2 py-1.5 
                      cursor-pointer hover:bg-gray-200 text-center font-medium"
          >
            +{actualTotalItems - itemsToShow} more
          </div>
        )}
      </div>
    </>
  );
};

export default CalendarDayContent;
