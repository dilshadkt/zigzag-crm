import React, { useState, useEffect } from "react";
import {
  FiX,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUser,
  FiFlag,
  FiArrowUp,
  FiAlertCircle,
  FiPlay,
  FiPause,
  FiCheckCircle,
} from "react-icons/fi";

const FilterDrawer = ({
  isOpen,
  onClose,
  superFilters = {},
  handleFilterChange,
  handleMultiSelectFilter,
  clearAllFilters,
  hasActiveFilters,
  users = [],
  projects = [],
  onApplyFilters,
}) => {
  // Local state for temporary filter values (only applied when button is clicked)
  const [localFilters, setLocalFilters] = useState({
    search: "",
    status: [],
    priority: [],
    assignedTo: [],
    project: [],
    dateRange: {
      start: "",
      end: "",
    },
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  // Initialize local filters from props when drawer opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        search: superFilters?.search || "",
        status: Array.isArray(superFilters?.status) ? superFilters.status : [],
        priority: Array.isArray(superFilters?.priority)
          ? superFilters.priority
          : [],
        assignedTo: Array.isArray(superFilters?.assignedTo)
          ? superFilters.assignedTo
          : [],
        project: Array.isArray(superFilters?.project)
          ? superFilters.project
          : [],
        dateRange: {
          start: superFilters?.dateRange?.start || "",
          end: superFilters?.dateRange?.end || "",
        },
        sortBy: superFilters?.sortBy || "dueDate",
        sortOrder: superFilters?.sortOrder || "asc",
      });
    }
  }, [isOpen, superFilters]);

  if (!isOpen) return null;

  // Handle local filter changes (not applied yet)
  const handleLocalFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLocalMultiSelectFilter = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  // Apply filters when button is clicked
  const handleApplyFilters = () => {
    // Apply all local filter changes
    // React will batch these state updates, so React Query will only refetch once
    handleFilterChange("search", localFilters.search);
    handleFilterChange("status", localFilters.status);
    handleFilterChange("priority", localFilters.priority);
    handleFilterChange("assignedTo", localFilters.assignedTo);
    handleFilterChange("project", localFilters.project);
    handleFilterChange("dateRange", localFilters.dateRange);
    handleFilterChange("sortBy", localFilters.sortBy);
    handleFilterChange("sortOrder", localFilters.sortOrder);

    // Call optional callback if provided
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }

    // Close drawer
    onClose();
  };

  // Handle clear all - reset local filters and apply immediately
  const handleClearAll = () => {
    const defaultFilters = {
      search: "",
      status: [],
      priority: [],
      assignedTo: [],
      project: [],
      dateRange: { start: "", end: "" },
      sortBy: "dueDate",
      sortOrder: "asc",
    };
    setLocalFilters(defaultFilters);
    clearAllFilters();
    onClose();
  };

  // Check if local filters have any active values
  const hasLocalActiveFilters = () => {
    return (
      localFilters.search ||
      localFilters.status.length > 0 ||
      localFilters.priority.length > 0 ||
      localFilters.assignedTo.length > 0 ||
      localFilters.project.length > 0 ||
      localFilters.dateRange.start ||
      localFilters.dateRange.end ||
      localFilters.sortBy !== "dueDate" ||
      localFilters.sortOrder !== "asc"
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0  bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 rounded-tl-3xl rounded-bl-3xl overflow-hidden
         h-full w-full max-w-md
       bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Advanced Filters
              </h2>
              {(hasActiveFilters() || hasLocalActiveFilters()) && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={localFilters.search}
                  onChange={(e) =>
                    handleLocalFilterChange("search", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Quick Status Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    value: "todo",
                    label: "Todo",
                    icon: FiPause,
                    color: "bg-orange-100 text-orange-700 border-orange-200",
                  },
                  {
                    value: "in-progress",
                    label: "In Progress",
                    icon: FiPlay,
                    color: "bg-blue-100 text-blue-700 border-blue-200",
                  },
                  {
                    value: "on-review",
                    label: "Review",
                    icon: FiAlertCircle,
                    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
                  },
                  {
                    value: "completed",
                    label: "Completed",
                    icon: FiCheckCircle,
                    color: "bg-green-100 text-green-700 border-green-200",
                  },
                  {
                    value: "approved",
                    label: "Approved",
                    icon: FiCheckCircle,
                    color: "bg-teal-100 text-teal-700 border-teal-200",
                  },
                  {
                    value: "re-work",
                    label: "Re-work",
                    icon: FiAlertCircle,
                    color: "bg-red-100 text-red-700 border-red-200",
                  },
                ].map((button) => {
                  const Icon = button.icon;
                  const isActive = localFilters.status.includes(button.value);
                  return (
                    <button
                      key={button.value}
                      onClick={() =>
                        handleLocalMultiSelectFilter("status", button.value)
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${isActive
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

            {/* Status Filter - Checkbox List (for additional statuses) */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Additional Status Options
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "todo",
                    label: "Todo",
                    color: "bg-orange-100 text-orange-800",
                  },
                  {
                    value: "in-progress",
                    label: "In Progress",
                    color: "bg-blue-100 text-blue-800",
                  },
                  {
                    value: "on-review",
                    label: "On Review",
                    color: "bg-yellow-100 text-yellow-800",
                  },
                  {
                    value: "on-hold",
                    label: "On Hold",
                    color: "bg-gray-100 text-gray-800",
                  },
                  {
                    value: "approved",
                    label: "Approved",
                    color: "bg-teal-100 text-teal-800",
                  },
                  {
                    value: "client-approved",
                    label: "Client Approved",
                    color: "bg-purple-100 text-purple-800",
                  },
                  {
                    value: "re-work",
                    label: "Re-work",
                    color: "bg-red-100 text-red-800",
                  },
                  {
                    value: "completed",
                    label: "Completed",
                    color: "bg-green-100 text-green-800",
                  },
                ].map((status) => (
                  <label
                    key={status.value}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.status.includes(status.value)}
                      onChange={() =>
                        handleLocalMultiSelectFilter("status", status.value)
                      }
                      className="checkbox checkbox-sm"
                    />
                    <span className="text-sm text-gray-700">
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Priority Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    value: "High",
                    label: "High",
                    color: "bg-red-100 text-red-700 border-red-200",
                  },
                  {
                    value: "Medium",
                    label: "Medium",
                    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
                  },
                  {
                    value: "Low",
                    label: "Low",
                    color: "bg-green-100 text-green-700 border-green-200",
                  },
                ].map((button) => {
                  const isActive = localFilters.priority.includes(button.value);
                  return (
                    <button
                      key={button.value}
                      onClick={() =>
                        handleLocalMultiSelectFilter("priority", button.value)
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${isActive
                          ? `${button.color}`
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      <span>{button.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assigned To Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                Assigned To
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {users.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.assignedTo.includes(user._id)}
                      onChange={() =>
                        handleLocalMultiSelectFilter("assignedTo", user._id)
                      }
                      className="checkbox checkbox-sm"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <img
                          src={user?.profileImage}
                          alt={user?.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-gray-700">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Project Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiFlag className="w-4 h-4" />
                Project
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {projects.map((project) => (
                  <label
                    key={project._id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.project.includes(project._id)}
                      onChange={() =>
                        handleLocalMultiSelectFilter("project", project._id)
                      }
                      className="checkbox checkbox-sm"
                    />
                    <span className="text-sm text-gray-700">
                      {project.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                Due Date Range
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={localFilters.dateRange.start}
                    onChange={(e) =>
                      handleLocalFilterChange("dateRange", {
                        ...localFilters.dateRange,
                        start: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={localFilters.dateRange.end}
                    onChange={(e) =>
                      handleLocalFilterChange("dateRange", {
                        ...localFilters.dateRange,
                        end: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiArrowUp className="w-4 h-4" />
                Sort By
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Sort Field
                  </label>
                  <select
                    value={localFilters.sortBy}
                    onChange={(e) =>
                      handleLocalFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="title">Title</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                    <option value="createdAt">Created Date</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Order
                  </label>
                  <select
                    value={localFilters.sortOrder}
                    onChange={(e) =>
                      handleLocalFilterChange("sortOrder", e.target.value)
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              {(hasActiveFilters() || hasLocalActiveFilters()) && (
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#3f8cff] rounded-lg hover:bg-[#3f8cff] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;
