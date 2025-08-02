import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import DatePicker from "../../shared/Field/date";

const FilterMenu = ({ isOpen, setShowModalFilter, onFilterChange }) => {
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: null,
      endDate: null,
    },
    status: [],
    priority: [],
    assignee: [],
    showSubtasks: true, // New filter for subtask visibility
  });

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };
    if (Array.isArray(filters[filterType])) {
      if (filters[filterType].includes(value)) {
        newFilters[filterType] = filters[filterType].filter(
          (item) => item !== value
        );
      } else {
        newFilters[filterType] = [...filters[filterType], value];
      }
    } else {
      newFilters[filterType] = value;
    }
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 bg-[#2155A3]/15 py-3 px-3 z-50 flexEnd">
      <div
        className="w-[400px] bg-white overflow-hidden rounded-3xl
       flex flex-col py-7 h-full shadow-lg"
      >
        <div className="flexBetween px-7 border-b border-[#E4E6E8]/80 pb-4">
          <h4 className="text-lg font-medium text-gray-800">Filters</h4>
          <PrimaryButton
            icon={"/icons/cancel.svg"}
            className={"bg-[#F4F9FD] hover:bg-gray-100 transition-colors"}
            onclick={() => setShowModalFilter(false)}
          />
        </div>

        <div className="w-full h-full flex flex-col overflow-y-auto">
          <div className="px-7 pb-5 pt-4 border-b border-[#E4E6E8]/80">
            <DatePicker
              title="Date Range"
              onChange={(dates) => handleFilterChange("dateRange", dates)}
            />
          </div>

          {/* Subtask Visibility Filter */}
          <div className="px-7 py-5 border-b border-[#E4E6E8]/80 flex flex-col">
            <h5 className="text-sm font-medium text-[#7D8592] mb-4">
              Task Visibility
            </h5>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-gray-700 text-sm font-medium">
                  Show Subtasks
                </span>
                <span className="text-gray-500 text-xs">
                  Display subtasks in the task list
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={filters.showSubtasks}
                  onChange={() =>
                    handleFilterChange("showSubtasks", !filters.showSubtasks)
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Status Filter */}
          <div className="px-7 py-5 border-b border-[#E4E6E8]/80 flex flex-col">
            <h5 className="text-sm font-medium text-[#7D8592] mb-4">Status</h5>
            <div className="flex flex-col gap-y-3">
              {["Todo", "In Progress", "Completed"].map((status) => (
                <label
                  key={status}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                    checked={filters.status.includes(status.toLowerCase())}
                    onChange={() =>
                      handleFilterChange("status", status.toLocaleLowerCase())
                    }
                  />
                  <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors">
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="px-7 py-5 border-b border-[#E4E6E8]/80 flex flex-col">
            <h5 className="text-sm font-medium text-[#7D8592] mb-4">
              Priority
            </h5>
            <div className="flex flex-col gap-y-3">
              {["High", "Medium", "Low"].map((priority) => (
                <label
                  key={priority}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                    checked={filters.priority.includes(priority)}
                    onChange={() => handleFilterChange("priority", priority)}
                  />
                  <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors">
                    {priority}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-7 py-5 mt-auto">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFilters({
                    dateRange: { startDate: null, endDate: null },
                    status: [],
                    priority: [],
                    assignee: [],
                    showSubtasks: true, // Reset to show subtasks by default
                  });
                  onFilterChange?.(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowModalFilter(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
