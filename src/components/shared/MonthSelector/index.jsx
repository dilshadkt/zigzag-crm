import React, { useState, useEffect } from "react";
import { format, subMonths, addMonths } from "date-fns";

const MonthSelector = ({ selectedMonth, onMonthChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Default to current month if no month is selected
  const currentDate = selectedMonth ? new Date(selectedMonth) : new Date();

  // Set default month on component mount
  useEffect(() => {
    if (!selectedMonth) {
      const currentMonthKey = format(new Date(), "yyyy-MM");
      onMonthChange(currentMonthKey);
    }
  }, [selectedMonth, onMonthChange]);

  const months = [];
  for (let i = -6; i <= 6; i++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i,
      1
    );
    months.push(date);
  }

  const handleMonthSelect = (month) => {
    const monthKey = format(month, "yyyy-MM");
    onMonthChange(monthKey);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    const monthKey = format(newDate, "yyyy-MM");
    onMonthChange(monthKey);
  };

  const goToNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    const monthKey = format(newDate, "yyyy-MM");
    onMonthChange(monthKey);
  };

  const goToCurrentMonth = () => {
    const monthKey = format(new Date(), "yyyy-MM");
    onMonthChange(monthKey);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Month Display Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <span className="font-medium">
          {selectedMonth ? format(currentDate, "MMMM yyyy") : "Select Month"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
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
              className="p-1 hover:bg-gray-100 rounded"
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
              className="p-1 hover:bg-gray-100 rounded"
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
              const isSelected = selectedMonth === format(month, "yyyy-MM");
              const isCurrentMonth =
                format(month, "yyyy-MM") === format(new Date(), "yyyy-MM");

              return (
                <button
                  key={index}
                  onClick={() => handleMonthSelect(month)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                    isSelected ? "bg-blue-50 text-blue-600 font-medium" : ""
                  } ${isCurrentMonth ? "font-semibold" : ""}`}
                >
                  {format(month, "MMMM yyyy")}
                  {isCurrentMonth && !isSelected && " (Current)"}
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
