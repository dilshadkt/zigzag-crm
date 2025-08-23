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
      className={`min-h-[60px] md:min-h-[120px] border group border-[#E6EBF5] relative p-1
        ${isToday(item.fullDate) ? "bg-blue-50" : ""}
      `}
    >
      {/* Date Number */}
      {item?.date && (
        <div
          className={` w-4 md:w-6  h-4 md:h-6 rounded-full ${
            isToday(item.fullDate) ? "bg-blue-500 text-white" : "text-gray-600"
          } 
          text-xs md:text-[13px] font-medium flexCenter absolute top-1 right-1`}
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

      {/* More Button with Dropdown */}
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
    </div>
  );
};

export default CalendarDay;
