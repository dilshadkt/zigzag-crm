import React, { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown, MdChevronLeft, MdChevronRight } from "react-icons/md";
import clsx from "clsx";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  isToday
} from "date-fns";
import { useCalendarDataOptimized } from "../../../../features/calender/hooks/useCalendarDataOptimized";

const AssigneeDatePicker = ({
  title = "Select Date",
  placeholder = "MM/DD/YYYY",
  className,
  value,
  onChange,
  name,
  errors,
  touched,
  readOnly = false,
  disabled,
  assignedTo = [], // Array of string IDs or objects with _id
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || "");
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  
  const menuRef = useRef();
  
  // Extract assigner IDs for the filter
  const assignerFilter = React.useMemo(() => {
    if (!assignedTo) return [];
    if (Array.isArray(assignedTo)) {
      return assignedTo.map(a => (typeof a === "object" ? a._id || a.id || a.value : a));
    }
    return [typeof assignedTo === "object" ? assignedTo._id || assignedTo.id || assignedTo.value : assignedTo];
  }, [assignedTo]);

  // Use the optimized calendar data hook
  const { calendarData, isLoading } = useCalendarDataOptimized(
    currentMonth,
    { tasks: true, subtasks: true }, // We only care about tasks and subtasks
    assignerFilter,
    [] // No project filter
  );

  // Update selected date when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value);
      if (value) {
        setCurrentMonth(new Date(value));
      }
    }
  }, [value]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleCloseMenu = (e) => {
      if (!menuRef?.current?.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleCloseMenu);
    }
    return () => {
      document.removeEventListener("mousedown", handleCloseMenu);
    };
  }, [isMenuOpen]);

  // Format date for display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return format(d, "MM/dd/yyyy");
    } catch {
      return dateStr;
    }
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = (day, e) => {
    e.stopPropagation();
    const formattedDate = format(day, "yyyy-MM-dd");
    setSelectedDate(formattedDate);
    if (onChange) {
      onChange({ target: { name, value: formattedDate } }); // Mimic event object for Formik
    }
    setIsMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsMenuOpen(false);
    }
  };

  // Generate days for the calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="flex flex-col gap-y-[7px]">
      <label className="text-sm pl-[6px] font-bold text-[#7D8592]">
        {title}
      </label>
      <div className="relative">
        <div
          onClick={() => !readOnly && !disabled && setIsMenuOpen(!isMenuOpen)}
          className={clsx(
            `rounded-[14px] text-sm border-2 text-[#7D8592] w-full border-[#D8E0F0]/80 py-[10px] px-4
            outline-none focus:outline-none relative transition-colors ${
              readOnly || disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-blue-300"
            }`,
            className,
            {
              "border-red-400/50": errors?.[name] && touched?.[name],
              "border-blue-400": isMenuOpen,
            }
          )}
        >
          {selectedDate ? formatDateDisplay(selectedDate) : placeholder}
          <MdKeyboardArrowDown className={clsx("text-[#7D8592] text-lg absolute top-0 bottom-0 my-auto right-4 transition-transform", isMenuOpen && "rotate-180")} />
        </div>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute w-72 rounded-2xl bg-white border border-[#D8E0F0] shadow-xl
            left-0 mt-2 p-4 z-[9999] animate-in fade-in zoom-in-95 duration-200"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <MdChevronLeft size={24} />
              </button>
              <h2 className="text-sm font-bold text-gray-800">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <MdChevronRight size={24} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Loading Overlay */}
            <div className="relative min-h-[180px]">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  
                  // Check if there are any tasks on this day for the assignees
                  let hasTask = false;
                  if (isCurrentMonth && calendarData && assignerFilter.length > 0) {
                    const dayData = calendarData.getItemsForDate(day);
                    if ((dayData.tasks && dayData.tasks.length > 0) || (dayData.subtasks && dayData.subtasks.length > 0)) {
                      hasTask = true;
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={(e) => handleDateSelect(day, e)}
                      className={clsx(
                        "h-8 flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer relative transition-all",
                        {
                          "text-gray-300 pointer-events-none": !isCurrentMonth,
                          "bg-blue-500 text-white font-semibold shadow-md": isSelected,
                          "hover:bg-blue-50 text-gray-700": !isSelected && isCurrentMonth,
                          "border border-blue-200 text-blue-600": isToday(day) && !isSelected && isCurrentMonth,
                        }
                      )}
                    >
                      <span>{format(day, dateFormat)}</span>
                      {/* Task Indicator Dot */}
                      {hasTask && (
                        <div className={clsx(
                          "absolute bottom-1 w-1 h-1 rounded-full",
                          isSelected ? "bg-white" : "bg-red-500"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend / Footer */}
            {assignerFilter.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Assignee has tasks on this day</span>
              </div>
            )}
          </div>
        )}
        {errors?.[name] && touched?.[name] && (
          <span
            className="text-[10px] text-red-500 bg-white whitespace-nowrap
          left-10 px-3 w-fit mx-auto absolute -bottom-2"
          >
            {errors?.[name]}
          </span>
        )}
      </div>
    </div>
  );
};

export default AssigneeDatePicker;
