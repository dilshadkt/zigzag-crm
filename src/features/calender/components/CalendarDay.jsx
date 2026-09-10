import React, { useEffect, useRef, useState } from "react";
import { isSameDay } from "date-fns";
import { IoMdMore } from "react-icons/io";
import CalendarEventItem from "./CalendarEventItem";
import CalendarMenu from "./CalendarMenu";
import CalendarDayContent from "./CalendarDayContent";
import { MAX_ITEMS_PER_DAY } from "../constants";

const CalendarDay = ({
  item,
  calendarData,
  isLoading,
  onOpenModal,
  onMenuItemClick,
  isEmployee,
  canCreateTask,
  weekIndex = 0, // Add weekIndex prop to determine if it's first row
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine if a date is today
  const isToday = (date) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  // Determine menu position - show below for first row (weekIndex 0)
  const getMenuPosition = () => {
    return weekIndex === 0 ? "bottom" : "top";
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle dropdown toggle
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle menu item click
  const handleMenuItemClick = (action) => {
    setIsDropdownOpen(false);
    // Call the parent handler with action and date
    if (onMenuItemClick && item.fullDate) {
      onMenuItemClick(action, item.fullDate);
    }
  };

  return (
    <div
      className={`min-h-[60px] md:min-h-[180px] border group border-[#E6EBF5] relative p-1
        ${isToday(item.fullDate) ? "bg-blue-50" : ""}
      `}
    >
      {/* Date Number */}
      {item?.date && (
        <div
          className={` w-4 md:w-6  h-4 md:h-6 rounded-full ${isToday(item.fullDate) ? "bg-blue-500 text-white" : "text-gray-600"
            } 
          text-xs md:text-[13px] font-medium flexCenter absolute top-1 right-1`}
        >
          {item.date}
        </div>
      )}

      {/* Projects, Tasks and Birthdays for this date */}
      {item?.fullDate && (
        <div className="w-full flex flex-col gap-1 mt-6">
          {isLoading ? (
            <div className="flex flex-col gap-1">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="rounded-md px-2 py-1.5 border border-gray-100 bg-white"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%]" />
                    <div className="h-3 flex-1 rounded bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%]" />
                    <div className="h-2.5 w-10 rounded bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%]" />
                  </div>
                </div>
              ))}
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

      {/* More Button with Dropdown */}
      {canCreateTask && (
        <div className="absolute bottom-1 right-1" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="transition-all duration-200 cursor-pointer group-hover:block hidden
                     p-1 rounded-full hover:bg-gray-100"
          >
            <IoMdMore className="text-gray-500 text-lg" />
          </button>

          <CalendarMenu
            handleMenuItemClick={handleMenuItemClick}
            isDropdownOpen={isDropdownOpen}
            position={getMenuPosition()}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarDay;
