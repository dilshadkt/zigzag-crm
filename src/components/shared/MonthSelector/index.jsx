import React, { useState, useEffect, useRef } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { MdDateRange, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

const MonthSelector = ({
  selectedMonth,
  onMonthChange,
  className = "",
  activeProject = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Default to current month if no month is selected
  const currentDate = selectedMonth ? new Date(selectedMonth) : new Date();

  // Get available months from activeProject workDetails
  const getAvailableMonths = () => {
    if (
      !activeProject ||
      !activeProject.workDetails ||
      !Array.isArray(activeProject.workDetails)
    ) {
      return [];
    }

    return activeProject.workDetails.map((workDetail) => workDetail.month);
  };

  const availableMonths = getAvailableMonths();

  // Set default month on component mount
  useEffect(() => {
    if (!selectedMonth) {
      // If we have available months, select the first one
      if (availableMonths.length > 0) {
        onMonthChange(availableMonths[0]);
      } else {
        // Fallback to current month if no work details
        const currentMonthKey = format(new Date(), "yyyy-MM");
        onMonthChange(currentMonthKey);
      }
    } else if (
      availableMonths.length > 0 &&
      !availableMonths.includes(selectedMonth)
    ) {
      // If selected month is not available, automatically select the first available month
      onMonthChange(availableMonths[0]);
    }
  }, [selectedMonth, onMonthChange, availableMonths]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Generate months list based on available months or fallback to default range
  const getMonthsList = () => {
    if (availableMonths.length > 0) {
      // Use only available months from workDetails
      return availableMonths
        .map((monthStr) => {
          const [year, month] = monthStr.split("-");
          return new Date(parseInt(year), parseInt(month) - 1, 1);
        })
        .sort((a, b) => a - b); // Sort chronologically
    } else {
      // Fallback to default range when no project is selected
      const months = [];
      const now = new Date();
      // Show a range around now
      for (let i = -6; i <= 6; i++) {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() + i,
          1
        );
        months.push(date);
      }
      return months;
    }
  };

  const months = getMonthsList();

  const handleMonthSelect = (month) => {
    const monthKey = format(month, "yyyy-MM");
    onMonthChange(monthKey);
    setIsOpen(false);
  };

  const goToPreviousMonth = (e) => {
    e.stopPropagation();
    if (availableMonths.length > 0) {
      const currentIndex = availableMonths.indexOf(selectedMonth);
      if (currentIndex > 0) {
        onMonthChange(availableMonths[currentIndex - 1]);
      }
    } else {
      const newDate = subMonths(currentDate, 1);
      const monthKey = format(newDate, "yyyy-MM");
      onMonthChange(monthKey);
    }
  };

  const goToNextMonth = (e) => {
    e.stopPropagation();
    if (availableMonths.length > 0) {
      const currentIndex = availableMonths.indexOf(selectedMonth);
      if (currentIndex < availableMonths.length - 1) {
        onMonthChange(availableMonths[currentIndex + 1]);
      }
    } else {
      const newDate = addMonths(currentDate, 1);
      const monthKey = format(newDate, "yyyy-MM");
      onMonthChange(monthKey);
    }
  };

  const goToCurrentMonth = () => {
    const currentMonthKey = format(new Date(), "yyyy-MM");
    if (
      availableMonths.length === 0 ||
      availableMonths.includes(currentMonthKey)
    ) {
      onMonthChange(currentMonthKey);
      setIsOpen(false);
    }
  };

  // Check if navigation buttons should be disabled
  const canGoPrevious =
    availableMonths.length > 0
      ? availableMonths.indexOf(selectedMonth) > 0
      : true;

  const canGoNext =
    availableMonths.length > 0
      ? availableMonths.indexOf(selectedMonth) < availableMonths.length - 1
      : true;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Month Display Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center cursor-pointer gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium transition-all duration-200 hover:border-gray-300 min-w-[120px]"
      >
        <MdDateRange className="text-gray-400 text-sm" />
        <span className="font-medium text-gray-700 truncate">
          {selectedMonth ? format(currentDate, "MMMM yyyy") : "Select Month"}
        </span>
        <IoChevronDown className={`text-gray-400 transition-transform duration-200 ml-auto ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-1 animate-in fade-in slide-in-from-bottom-1 duration-200"
        >
          {/* Header with navigation */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 mb-1">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious}
              className={`p-1 rounded-lg transition-colors ${canGoPrevious
                ? "hover:bg-gray-100 text-gray-600"
                : "text-gray-300 cursor-not-allowed"
                }`}
            >
              <MdChevronLeft className="text-xl" />
            </button>
            <span className="font-bold text-xs text-gray-800">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext}
              className={`p-1 rounded-lg transition-colors ${canGoNext
                ? "hover:bg-gray-100 text-gray-600"
                : "text-gray-300 cursor-not-allowed"
                }`}
            >
              <MdChevronRight className="text-xl" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="px-2 pb-1">
            <button
              onClick={goToCurrentMonth}
              className="w-full text-left px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
            >
              Current Month
            </button>
          </div>

          {/* Month list */}
          <div className="max-h-56 overflow-y-auto scrollbar-thin px-1">
            <div className="h-px bg-gray-100 mb-1 mx-2" />
            {months.map((month, index) => {
              const monthKey = format(month, "yyyy-MM");
              const isSelected = selectedMonth === monthKey;
              const isCurrentMonth = monthKey === format(new Date(), "yyyy-MM");
              const isAvailable =
                availableMonths.length === 0 ||
                availableMonths.includes(monthKey);

              return (
                <button
                  key={index}
                  onClick={() => handleMonthSelect(month)}
                  disabled={!isAvailable}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${isSelected 
                    ? "bg-blue-50 text-blue-700 font-bold" 
                    : isAvailable ? "hover:bg-gray-50 text-gray-700" : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <span>{format(month, "MMMM yyyy")}</span>
                  {isCurrentMonth && !isSelected && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter">Current</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Clear selection */}
          <div className="mt-1 px-2 pt-1 border-t border-gray-100">
            <button
              onClick={() => {
                onMonthChange(null);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors hover:text-red-500"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthSelector;
