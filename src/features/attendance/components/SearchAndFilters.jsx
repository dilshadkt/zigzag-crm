import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { IoSearchOutline } from "react-icons/io5";
import { CiCalendarDate } from "react-icons/ci";
import { MdKeyboardArrowDown, MdOutlineCalendarMonth } from "react-icons/md";

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized dropdown component
const DropdownMenu = React.memo(
  ({ isOpen, onClose, children, className = "" }) => {
    if (!isOpen) return null;

    return (
      <div
        className={`absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    );
  }
);

// Memoized quick date options
const QuickDateOptions = React.memo(({ onDateSelect, onPeriodSelect }) => {
  const quickOptions = useMemo(
    () => [
      {
        label: "Today",
        value: new Date().toISOString().split("T")[0],
        type: "date",
      },
      {
        label: "Yesterday",
        value: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        type: "date",
      },
      {
        label: "This Week",
        value: "week",
        type: "period",
      },
      {
        label: "This Month",
        value: "month",
        type: "period",
      },
      {
        label: "Last Month",
        value: "lastMonth",
        type: "period",
      },
    ],
    []
  );

  const handleOptionClick = useCallback(
    (option) => {
      if (option.type === "date") {
        onDateSelect(option.value);
      } else {
        onPeriodSelect(option.value);
      }
    },
    [onDateSelect, onPeriodSelect]
  );

  return (
    <div className="border-t pt-3">
      <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
      <div className="space-y-1">
        {quickOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => handleOptionClick(option)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
});

const SearchAndFilters = ({
  selectedDate,
  searchTerm,
  selectedPeriod,
  onDateChange,
  onSearchChange,
  onPeriodChange,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const datePickerRef = useRef(null);
  const periodDropdownRef = useRef(null);

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // Update parent when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      onSearchChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchTerm, onSearchChange]);

  // Sync local state with props
  useEffect(() => {
    if (searchTerm !== localSearchTerm) {
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm]);

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

  // Memoized handlers
  const handleSearchInputChange = useCallback((e) => {
    setLocalSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm("");
    onSearchChange("");
  }, [onSearchChange]);

  const handleDateSelect = useCallback(
    (date) => {
      onDateChange(date);
      setShowDatePicker(false);
    },
    [onDateChange]
  );

  const handlePeriodSelect = useCallback(
    (period) => {
      onPeriodChange(period);
      setShowPeriodDropdown(false);
    },
    [onPeriodChange]
  );

  // Memoized period options
  const periodOptions = useMemo(
    () => [
      { label: "Today", value: "today" },
      { label: "This Week", value: "week" },
      { label: "This Month", value: "month" },
      { label: "This Year", value: "year" },
    ],
    []
  );

  // Format date for display
  const formatDate = useCallback((date) => {
    if (!date) return "Select Date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-x-2">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchOutline className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employee"
            value={localSearchTerm}
            onChange={handleSearchInputChange}
            className="pl-10 pr-4 py-2 border bg-white text-sm border-gray-200 rounded-lg w-64 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {localSearchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
            className="flex items-center gap-2 bg-white border border-gray-200 text-sm text-gray-700 px-4 py-2 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CiCalendarDate />
            {formatDate(selectedDate)}
            <MdKeyboardArrowDown />
          </button>

          <DropdownMenu
            isOpen={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            className="min-w-64"
          >
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <QuickDateOptions
                onDateSelect={handleDateSelect}
                onPeriodSelect={handlePeriodSelect}
              />
            </div>
          </DropdownMenu>
        </div>

        {/* Period Filter */}
        <div className="relative" ref={periodDropdownRef}>
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 bg-white border text-sm font-semibold border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MdOutlineCalendarMonth />
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
            <MdKeyboardArrowDown />
          </button>

          <DropdownMenu
            isOpen={showPeriodDropdown}
            onClose={() => setShowPeriodDropdown(false)}
            className="min-w-32"
          >
            <div className="py-1">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePeriodSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    selectedPeriod === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </DropdownMenu>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex items-center gap-3">
        {/* View Toggle - Keeping for future use */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button className="p-2 bg-blue-500 text-white transition-colors">
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

export default React.memo(SearchAndFilters);
