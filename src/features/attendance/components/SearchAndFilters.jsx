import React, { useState, useRef, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { CiCalendarDate } from "react-icons/ci";
import { MdKeyboardArrowDown, MdOutlineCalendarMonth } from "react-icons/md";

const SearchAndFilters = ({
  selectedDate,
  onDateChange,
  onSearchChange,
  onPeriodChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [dateRange, setDateRange] = useState({
    startDate: selectedDate,
    endDate: selectedDate,
  });

  const datePickerRef = useRef(null);
  const periodDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(event.target)
      ) {
        setShowPeriodDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Handle date selection
  const handleDateChange = (date) => {
    setDateRange((prev) => ({
      ...prev,
      startDate: date,
      endDate: date,
    }));
    if (onDateChange) {
      onDateChange(date);
    }
    setShowDatePicker(false);
  };

  // Handle period selection
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
    setShowPeriodDropdown(false);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Select Date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Quick date options
  const quickDateOptions = [
    { label: "Today", value: new Date().toISOString().split("T")[0] },
    {
      label: "Yesterday",
      value: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "Last Month", value: "lastMonth" },
  ];

  const periodOptions = [
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Search Employee */}
      <div className="flex items-center gap-x-2">
        <div className="relative">
          <div
            className="absolute inset-y-0 left-0 pl-3 flex items-center
         pointer-events-none"
          >
            <IoSearchOutline className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employee"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border bg-white text-sm
           border-gray-200 rounded-lg 
            w-64 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                if (onSearchChange) onSearchChange("");
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {/* Date Picker */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 bg-white border border-gray-200
           text-sm  text-gray-700 px-4 py-2 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CiCalendarDate />
            {formatDate(selectedDate)}
            <MdKeyboardArrowDown />
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64">
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Quick Select
                  </p>
                  <div className="space-y-1">
                    {quickDateOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          if (
                            (typeof option.value === "string" &&
                              option.value.includes("Month")) ||
                            option.value === "week"
                          ) {
                            // Handle period-based selection
                            handlePeriodChange(option.value);
                          } else {
                            handleDateChange(option.value);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Period Filter */}
        <div className="relative" ref={periodDropdownRef}>
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 bg-white border text-sm
             font-semibold border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MdOutlineCalendarMonth />
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
            <MdKeyboardArrowDown />
          </button>

          {showPeriodDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-32">
              <div className="py-1">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodChange(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedPeriod === option.value
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-3">
        {/* View Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
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
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
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
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;
