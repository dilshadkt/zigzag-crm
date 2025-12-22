import React, { useState, useEffect } from "react";
import {
  FiX,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUser,
  FiFlag,
} from "react-icons/fi";
import {
  FaClock,
  FaTasks,
  FaProjectDiagram,
  FaFileAlt,
} from "react-icons/fa";

const ActivityStreamFilterDrawer = ({
  isOpen,
  onClose,
  filters = {},
  onApplyFilters,
  employees = [],
  projects = [],
}) => {
  const [localFilters, setLocalFilters] = useState({
    type: "all",
    dateFilter: "all",
    customStartDate: "",
    customEndDate: "",
    searchTerm: "",
    employees: [],
    projects: [],
  });

  // Initialize local filters from props when drawer opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        type: filters?.type || "all",
        dateFilter: filters?.dateFilter || "all",
        customStartDate: filters?.customStartDate || "",
        customEndDate: filters?.customEndDate || "",
        searchTerm: filters?.searchTerm || "",
        employees: Array.isArray(filters?.employees) ? filters.employees : [],
        projects: Array.isArray(filters?.projects) ? filters.projects : [],
      });
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleLocalFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiSelectFilter = (key, value) => {
    setLocalFilters((prev) => {
      const currentArray = prev[key] || [];
      const isSelected = currentArray.includes(value);
      return {
        ...prev,
        [key]: isSelected
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value],
      };
    });
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters = {
      type: "all",
      dateFilter: "all",
      customStartDate: "",
      customEndDate: "",
      searchTerm: "",
      employees: [],
      projects: [],
    };
    setLocalFilters(clearedFilters);
    if (onApplyFilters) {
      onApplyFilters(clearedFilters);
    }
  };

  const hasActiveFilters = () => {
    return (
      localFilters.type !== "all" ||
      localFilters.dateFilter !== "all" ||
      localFilters.customStartDate ||
      localFilters.customEndDate ||
      localFilters.searchTerm ||
      localFilters.employees.length > 0 ||
      localFilters.projects.length > 0
    );
  };

  const filterOptions = [
    { value: "all", label: "All Activities" },
    { value: "time_log", label: "Time Logs" },
    { value: "task_update", label: "Task Changes" },
    { value: "subtask_update", label: "Subtask Changes" },
    { value: "project", label: "Projects" },
    { value: "attachments", label: "File Uploads" },
  ];

  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 rounded-tl-3xl rounded-bl-3xl overflow-hidden h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Filter Activities
              </h2>
              {hasActiveFilters() && (
                <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {/* Quick Activity Type Filters */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Activity Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    value: "all",
                    label: "All",
                    icon: FiFilter,
                    color: "bg-gray-100 text-gray-700 border-gray-200",
                  },
                  {
                    value: "time_log",
                    label: "Time Logs",
                    icon: FaClock,
                    color: "bg-blue-100 text-blue-700 border-blue-200",
                  },
                  {
                    value: "task_update",
                    label: "Tasks",
                    icon: FaTasks,
                    color: "bg-green-100 text-green-700 border-green-200",
                  },
                  {
                    value: "subtask_update",
                    label: "Subtasks",
                    icon: FaTasks,
                    color: "bg-teal-100 text-teal-700 border-teal-200",
                  },
                  {
                    value: "project",
                    label: "Projects",
                    icon: FaProjectDiagram,
                    color: "bg-amber-100 text-amber-700 border-amber-200",
                  },
                  {
                    value: "attachments",
                    label: "Files",
                    icon: FaFileAlt,
                    color: "bg-purple-100 text-purple-700 border-purple-200",
                  },
                ].map((button) => {
                  const Icon = button.icon;
                  const isActive = localFilters.type === button.value;
                  return (
                    <button
                      key={button.value}
                      onClick={() => handleLocalFilterChange("type", button.value)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border ${
                        isActive
                          ? `${button.color}`
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="text-xs" />
                      <span>{button.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Date Filters */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Quick Date Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "7 Days" },
                  { value: "month", label: "30 Days" },
                ].map((button) => {
                  const isActive = localFilters.dateFilter === button.value;
                  return (
                    <button
                      key={button.value}
                      onClick={() => {
                        handleLocalFilterChange("dateFilter", button.value);
                        if (button.value !== "custom") {
                          handleLocalFilterChange("customStartDate", "");
                          handleLocalFilterChange("customEndDate", "");
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <FiCalendar className="text-xs" />
                      <span>{button.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Date Range
              </label>
              <select
                value={localFilters.dateFilter}
                onChange={(e) =>
                  handleLocalFilterChange("dateFilter", e.target.value)
                }
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {dateFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            {localFilters.dateFilter === "custom" && (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={localFilters.customStartDate}
                    onChange={(e) =>
                      handleLocalFilterChange("customStartDate", e.target.value)
                    }
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={localFilters.customEndDate}
                    onChange={(e) =>
                      handleLocalFilterChange("customEndDate", e.target.value)
                    }
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            {/* Employee Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5" />
                Employees
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1.5 space-y-1">
                {employees.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3">
                    No employees available
                  </p>
                ) : (
                  employees.map((employee) => (
                    <label
                      key={employee._id || employee.id}
                      className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.employees.includes(
                          employee._id || employee.id
                        )}
                        onChange={() =>
                          handleMultiSelectFilter(
                            "employees",
                            employee._id || employee.id
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {employee.profileImage ? (
                          <img
                            src={employee.profileImage}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-gray-600">
                              {(employee.firstName?.[0] || "?").toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-700 truncate">
                          {employee.firstName} {employee.lastName}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Project Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <FiFlag className="w-3.5 h-3.5" />
                Projects
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1.5 space-y-1">
                {projects.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3">
                    No projects available
                  </p>
                ) : (
                  projects.map((project) => (
                    <label
                      key={project._id || project.id}
                      className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.projects.includes(
                          project._id || project.id
                        )}
                        onChange={() =>
                          handleMultiSelectFilter(
                            "projects",
                            project._id || project.id
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-gray-700 flex-1 truncate">
                        {project.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <FiSearch className="w-3.5 h-3.5" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by user, task, project, or description..."
                value={localFilters.searchTerm}
                onChange={(e) =>
                  handleLocalFilterChange("searchTerm", e.target.value)
                }
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 px-4 flex items-center justify-between gap-2">
            <button
              onClick={handleClearAll}
              disabled={!hasActiveFilters()}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                hasActiveFilters()
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              Clear All
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                Apply
                {hasActiveFilters() && (
                  <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {[
                      localFilters.type !== "all" ? 1 : 0,
                      localFilters.dateFilter !== "all" ? 1 : 0,
                      localFilters.customStartDate ? 1 : 0,
                      localFilters.customEndDate ? 1 : 0,
                      localFilters.searchTerm ? 1 : 0,
                      localFilters.employees.length,
                      localFilters.projects.length,
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityStreamFilterDrawer;

