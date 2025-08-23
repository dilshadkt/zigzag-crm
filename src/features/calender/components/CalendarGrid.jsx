import React from "react";
import CalendarDay from "./CalendarDay";

const CalendarGrid = ({
  calendarDays,
  calendarData,
  isLoading,
  onOpenModal,
  onMenuItemClick,
  isEmployee,
}) => {
  // Day name headers for the calendar
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-[#E6EBF5]">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="h-10 flexCenter text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="w-full md:h-full overflow-y-auto grid grid-cols-7 ">
        {calendarDays.map((item, index) => {
          // Calculate week index (0 for first week, 1 for second week, etc.)
          const weekIndex = Math.floor(index / 7);

          return (
            <CalendarDay
              key={index}
              item={item}
              calendarData={calendarData}
              isLoading={isLoading}
              onOpenModal={onOpenModal}
              onMenuItemClick={onMenuItemClick}
              isEmployee={isEmployee}
              weekIndex={weekIndex}
            />
          );
        })}
      </div>
    </>
  );
};

export default CalendarGrid;
