import React from "react";
import { format } from "date-fns";
import { IoArrowUpOutline } from "react-icons/io5";

const CalendarHeader = ({
  currentDate,
  firstDay,
  onPrevMonth,
  onNextMonth,
  isLoading,
}) => {
  return (
    <div className="flex items-center justify-center  w-fit left-10 gap-x-8">
      <button
        onClick={onPrevMonth}
        className="h-8 w-8 rounded-full cursor-pointer hover:bg-gray-100 flexCenter transition-all duration-200"
        disabled={isLoading}
      >
        <IoArrowUpOutline className="-rotate-90 text-xl text-[#3F8CFF]" />
      </button>
      <span className="w-[200px] flexCenter font-medium">
        {format(firstDay, "MMMM yyyy")}
      </span>
      <button
        onClick={onNextMonth}
        className="h-8 w-8 rounded-full cursor-pointer hover:bg-gray-100 flexCenter transition-all duration-200"
        disabled={isLoading}
      >
        <IoArrowUpOutline className="rotate-90 text-xl text-[#3F8CFF]" />
      </button>
    </div>
  );
};

export default CalendarHeader;
