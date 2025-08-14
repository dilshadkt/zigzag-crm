import React from "react";
import { isSameDay } from "date-fns";
import CalendarEventItem from "./CalendarEventItem";

// Maximum number of items to display per day before showing a "more" indicator
const MAX_ITEMS_PER_DAY = 2;

const CalendarDay = ({
  item,
  calendarData,
  isLoading,
  onOpenModal,
  isEmployee,
}) => {
  // Determine if a date is today
  const isToday = (date) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  return (
    <div
      className={`min-h-[60px] md:min-h-[120px] border border-[#E6EBF5] relative p-1
        ${isToday(item.fullDate) ? "bg-blue-50" : ""}
      `}
    >
      {/* Date Number */}
      {item?.date && (
        <div
          className={` w-4 md:w-6  h-4 md:h-6 rounded-full ${
            isToday(item.fullDate) ? "bg-blue-500 text-white" : "text-gray-600"
          } 
          text-xs md:text-sm font-medium flexCenter absolute top-1 right-1`}
        >
          {item.date}
        </div>
      )}

      {/* Projects, Tasks and Birthdays for this date */}
      {item?.fullDate && (
        <div className="w-[88%] flex flex-col gap-1 pr-1">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded-md mb-1"></div>
              <div className="h-6 bg-gray-200 rounded-md"></div>
            </div>
          ) : (
            <CalendarDayContent
              date={item.fullDate}
              calendarData={calendarData}
              onOpenModal={onOpenModal}
              isEmployee={isEmployee}
            />
          )}
        </div>
      )}
    </div>
  );
};

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
      <div className="hidden md:block">
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
            className="text-xs bg-gray-100 text-gray-700 rounded-md px-2 py-1.5 mt-1 
                      cursor-pointer hover:bg-gray-200 text-center font-medium"
          >
            +{totalItems - MAX_ITEMS_PER_DAY} more
          </div>
        )}
      </div>
    </>
  );
};

export default CalendarDay;
