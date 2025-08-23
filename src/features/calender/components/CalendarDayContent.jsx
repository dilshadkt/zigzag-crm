import React from "react";
import CalendarEventItem from "./CalendarEventItem";
import { MAX_ITEMS_PER_DAY } from "../constants";

const CalendarDayContent = ({
  date,
  calendarData,
  onOpenModal,
  isEmployee,
}) => {
  // Get all items for this date
  const { projects, tasks, subtasks, birthdays } =
    calendarData.getItemsForDate(date);
  const totalItems =
    projects.length + tasks.length + subtasks.length + birthdays.length;

  // Show only up to MAX_ITEMS_PER_DAY items
  const itemsToShow = Math.min(totalItems, MAX_ITEMS_PER_DAY);
  const hasMore = totalItems > MAX_ITEMS_PER_DAY;

  // Combine and sort all items (showing birthdays first, then projects, then parent tasks, then subtasks)
  const displayItems = [
    ...birthdays.map((item, idx) => ({
      type: "birthday",
      data: item,
      idx,
    })),
    ...projects.map((item, idx) => ({
      type: "project",
      data: item,
      idx,
    })),
    ...tasks.map((item, idx) => ({
      type: "task",
      data: item,
      idx,
    })),
    ...subtasks.map((item, idx) => ({
      type: "subtask",
      data: item,
      idx,
    })),
  ].slice(0, itemsToShow);

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

        {/* Show "more" indicator if needed */}
        {hasMore && (
          <div
            onClick={() => onOpenModal(date)}
            className="text-xs bg-gray-100 text-gray-700 rounded-md px-2 py-1.5 
                      cursor-pointer hover:bg-gray-200 text-center font-medium"
          >
            +{totalItems - MAX_ITEMS_PER_DAY} more
          </div>
        )}
      </div>
    </>
  );
};

export default CalendarDayContent;
