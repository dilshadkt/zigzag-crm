import React from "react";
import {
  FiX,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUser,
  FiFlag,
  FiArrowUp,
} from "react-icons/fi";

const FilterDrawer = ({
  isOpen,
  onClose,
  superFilters,
  handleFilterChange,
  handleMultiSelectFilter,
  clearAllFilters,
  hasActiveFilters,
  users,
  projects,
}) => {
  if (!isOpen) return null;

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
              {hasActiveFilters() && (
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
                  value={superFilters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Status
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
                    value: "approved",
                    label: "Approved",
                    color: "bg-teal-100 text-teal-800",
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
                      checked={superFilters.status.includes(status.value)}
                      onChange={() =>
                        handleMultiSelectFilter("status", status.value)
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

            {/* Priority Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "High",
                    label: "High",
                    color: "bg-red-100 text-red-800",
                  },
                  {
                    value: "Medium",
                    label: "Medium",
                    color: "bg-yellow-100 text-yellow-800",
                  },
                  {
                    value: "Low",
                    label: "Low",
                    color: "bg-green-100 text-green-800",
                  },
                ].map((priority) => (
                  <label
                    key={priority.value}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={superFilters.priority.includes(priority.value)}
                      onChange={() =>
                        handleMultiSelectFilter("priority", priority.value)
                      }
                      className="checkbox checkbox-sm"
                    />
                    <span className="text-sm text-gray-700">
                      {priority.label}
                    </span>
                  </label>
                ))}
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
                      checked={superFilters.assignedTo.includes(user._id)}
                      onChange={() =>
                        handleMultiSelectFilter("assignedTo", user._id)
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
                      checked={superFilters.project.includes(project._id)}
                      onChange={() =>
                        handleMultiSelectFilter("project", project._id)
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
                    value={superFilters.dateRange.start}
                    onChange={(e) =>
                      handleFilterChange("dateRange", {
                        ...superFilters.dateRange,
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
                    value={superFilters.dateRange.end}
                    onChange={(e) =>
                      handleFilterChange("dateRange", {
                        ...superFilters.dateRange,
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
                    value={superFilters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
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
                    value={superFilters.sortOrder}
                    onChange={(e) =>
                      handleFilterChange("sortOrder", e.target.value)
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
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
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
