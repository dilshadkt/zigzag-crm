import React, { useState, useEffect } from "react";
import { format, subMonths, addMonths } from "date-fns";

const MonthSelector = ({
  selectedMonth,
  onMonthChange,
  className = "",
  activeProject = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
      for (let i = -6; i <= 6; i++) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + i,
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

  const goToPreviousMonth = () => {
    if (availableMonths.length > 0) {
      // Find current index and go to previous available month
      const currentIndex = availableMonths.indexOf(selectedMonth);
      if (currentIndex > 0) {
        onMonthChange(availableMonths[currentIndex - 1]);
      }
    } else {
      // Fallback behavior
      const newDate = subMonths(currentDate, 1);
      const monthKey = format(newDate, "yyyy-MM");
      onMonthChange(monthKey);
    }
  };

  const goToNextMonth = () => {
    if (availableMonths.length > 0) {
      // Find current index and go to next available month
      const currentIndex = availableMonths.indexOf(selectedMonth);
      if (currentIndex < availableMonths.length - 1) {
        onMonthChange(availableMonths[currentIndex + 1]);
      }
    } else {
      // Fallback behavior
      const newDate = addMonths(currentDate, 1);
      const monthKey = format(newDate, "yyyy-MM");
      onMonthChange(monthKey);
    }
  };

  const goToCurrentMonth = () => {
    const currentMonthKey = format(new Date(), "yyyy-MM");
    // Only go to current month if it's available in the project
    if (
      availableMonths.length === 0 ||
      availableMonths.includes(currentMonthKey)
    ) {
      onMonthChange(currentMonthKey);
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
    <div className={`relative ${className}`}>
      {/* Month Display Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 md:px-4 py-2
         bg-white border border-gray-300 rounded-lg
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="font-medium text-xs md:text-base">
          {selectedMonth ? format(currentDate, "MMMM yyyy") : "Select Month"}
        </span>
        {availableMonths.length > 0 && (
          <span className="text-xs hidden md:block text-gray-500 bg-gray-100 px-1 rounded">
            {availableMonths.length} month
            {availableMonths.length !== 1 ? "s" : ""}
          </span>
        )}
        <svg
          className={`w-4 h-4 hidden md:block transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 
         bg-white border border-gray-300 rounded-lg shadow-lg z-[1000]"
        >
          {/* Header with navigation */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious}
              className={`p-1 rounded ${
                canGoPrevious
                  ? "hover:bg-gray-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="font-medium text-sm">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext}
              className={`p-1 rounded ${
                canGoNext
                  ? "hover:bg-gray-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Quick actions */}
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={goToCurrentMonth}
              className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Current Month
            </button>
          </div>

          {/* Month list */}
          <div className="max-h-48 overflow-y-auto">
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
                  className={`w-full text-left px-3 py-2 text-sm ${
                    isSelected ? "bg-blue-50 text-blue-600 font-medium" : ""
                  } ${isCurrentMonth ? "font-semibold" : ""} ${
                    isAvailable
                      ? "hover:bg-gray-50"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {format(month, "MMMM yyyy")}
                  {isCurrentMonth && !isSelected && " (Current)"}
                  {!isAvailable && " (No data)"}
                </button>
              );
            })}
          </div>

          {/* Clear selection */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => {
                onMonthChange(null);
                setIsOpen(false);
              }}
              className="w-full text-left px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default MonthSelector;
