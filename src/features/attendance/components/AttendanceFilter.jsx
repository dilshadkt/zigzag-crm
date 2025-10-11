import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { HiOutlineFilter } from "react-icons/hi";

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

// Helper functions to get date ranges
const getDateRanges = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // This Week (Monday to Sunday)
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // This Month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Last Month
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
    today: {
      startDate: today.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    },
    yesterday: {
      startDate: yesterday.toISOString().split("T")[0],
      endDate: yesterday.toISOString().split("T")[0],
    },
    thisWeek: {
      startDate: weekStart.toISOString().split("T")[0],
      endDate: weekEnd.toISOString().split("T")[0],
    },
    thisMonth: {
      startDate: monthStart.toISOString().split("T")[0],
      endDate: monthEnd.toISOString().split("T")[0],
    },
    lastMonth: {
      startDate: lastMonthStart.toISOString().split("T")[0],
      endDate: lastMonthEnd.toISOString().split("T")[0],
    },
  };
};

const AttendanceFilter = ({
  searchTerm,
  selectedFilter,
  customStartDate,
  customEndDate,
  onSearchChange,
  onFilterChange,
  onCustomDateChange,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
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

  const handleFilterSelect = useCallback(
    (filter) => {
      onFilterChange(filter);
      setShowFilterDropdown(false);
    },
    [onFilterChange]
  );

  // Memoized filter options
  const filterOptions = useMemo(
    () => [
      { label: "Today", value: "today" },
      { label: "Yesterday", value: "yesterday" },
      { label: "This Week", value: "thisWeek" },
      { label: "This Month", value: "thisMonth" },
      { label: "Last Month", value: "lastMonth" },
      { label: "Custom", value: "custom" },
    ],
    []
  );

  // Get current filter label
  const currentFilterLabel = useMemo(() => {
    const option = filterOptions.find((opt) => opt.value === selectedFilter);
    return option ? option.label : "Today";
  }, [selectedFilter, filterOptions]);

  return (
    <div className="flex items-center justify-between mb-2">
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

        {/* Period Filter */}
        <div className="relative" ref={filterDropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 bg-white border text-sm font-semibold border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiOutlineFilter />
            {currentFilterLabel}
            <MdKeyboardArrowDown />
          </button>

          <DropdownMenu
            isOpen={showFilterDropdown}
            onClose={() => setShowFilterDropdown(false)}
            className="min-w-56"
          >
            <div className="py-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    selectedFilter === option.value
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

        {/* Custom Date Range Inputs - Only visible when Custom is selected */}
        {selectedFilter === "custom" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) =>
                  onCustomDateChange(e.target.value, customEndDate)
                }
                className="px-3 py-2 border bg-white text-sm border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) =>
                  onCustomDateChange(customStartDate, e.target.value)
                }
                className="px-3 py-2 border bg-white text-sm border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* View Controls */}
      <div className="flex items-center gap-3">
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

export default React.memo(AttendanceFilter);
export { getDateRanges };
