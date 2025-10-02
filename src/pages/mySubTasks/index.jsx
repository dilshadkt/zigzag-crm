import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useGetEmployeeSubTasks } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/shared/header";
import Navigator from "../../components/shared/navigator";
import {
  FiClock,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiFlag,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiFolder,
} from "react-icons/fi";

const MySubTasks = ({ filter: propFilter }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter"); // Can be: 'overdue', 'in-progress', 'todo', 'completed'
  const filter = propFilter || urlFilter; // Use prop filter if provided, otherwise use URL filter

  // Get employee subtasks and filter based on URL parameter
  const { data: employeeSubTasksData, isLoading } = useGetEmployeeSubTasks(
    user?._id
  );
  const [filteredSubTasks, setFilteredSubTasks] = useState([]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: [],
    priority: [],
    project: [],
    dateRange: {
      start: "",
      end: "",
    },
    sortBy: "dueDate", // Options: 'dueDate', 'priority', 'status', 'title', 'createdAt'
    sortOrder: "asc", // 'asc' or 'desc'
  });

  // Get unique filter options from subtasks
  const getFilterOptions = () => {
    if (!employeeSubTasksData?.subTasks) return { projects: [] };

    const projects = [];
    const projectIds = new Set();

    employeeSubTasksData.subTasks.forEach((subTask) => {
      if (subTask.project && !projectIds.has(subTask.project._id)) {
        projectIds.add(subTask.project._id);
        projects.push(subTask.project);
      }
    });

    return { projects };
  };

  useEffect(() => {
    if (employeeSubTasksData?.subTasks) {
      let filtered = [...employeeSubTasksData.subTasks];

      // Apply URL-based filter first
      const today = new Date();
      switch (filter) {
        case "overdue":
          filtered = filtered.filter((subTask) => {
            const dueDate = new Date(subTask.dueDate);
            return dueDate < today && subTask.status !== "completed";
          });
          break;
        case "in-progress":
          filtered = filtered.filter(
            (subTask) => subTask.status === "in-progress"
          );
          break;
        case "pending":
          filtered = filtered.filter((subTask) => subTask.status === "todo");
          break;
        case "completed":
          filtered = filtered.filter(
            (subTask) => subTask.status === "completed"
          );
          break;
        case "today":
          filtered = filtered.filter((subTask) => {
            const dueDate = new Date(subTask.dueDate);
            return (
              dueDate.getDate() === today.getDate() &&
              dueDate.getMonth() === today.getMonth() &&
              dueDate.getFullYear() === today.getFullYear()
            );
          });
          break;
        // No default case - show all subtasks for 'all' or no filter
      }

      // Apply additional filters
      if (filters.search) {
        filtered = filtered.filter(
          (subTask) =>
            subTask.title
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            subTask.description
              ?.toLowerCase()
              .includes(filters.search.toLowerCase())
        );
      }

      if (filters.status.length > 0) {
        filtered = filtered.filter((subTask) =>
          filters.status.includes(subTask.status)
        );
      }

      if (filters.priority.length > 0) {
        filtered = filtered.filter((subTask) =>
          filters.priority.includes(subTask.priority)
        );
      }

      if (filters.project.length > 0) {
        filtered = filtered.filter(
          (subTask) =>
            subTask.project && filters.project.includes(subTask.project._id)
        );
      }

      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        filtered = filtered.filter((subTask) => {
          const subTaskDate = new Date(subTask.dueDate);
          return subTaskDate >= startDate;
        });
      }

      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        filtered = filtered.filter((subTask) => {
          const subTaskDate = new Date(subTask.dueDate);
          return subTaskDate <= endDate;
        });
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (filters.sortBy) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "priority":
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            aValue = priorityOrder[a.priority] || 0;
            bValue = priorityOrder[b.priority] || 0;
            break;
          case "status":
            const statusOrder = { todo: 1, "in-progress": 2, completed: 3 };
            aValue = statusOrder[a.status] || 0;
            bValue = statusOrder[b.status] || 0;
            break;
          case "createdAt":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default: // dueDate
            aValue = new Date(a.dueDate);
            bValue = new Date(b.dueDate);
        }

        if (filters.sortOrder === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });

      setFilteredSubTasks(filtered);
    }
  }, [employeeSubTasksData, filter, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiSelectFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: [],
      priority: [],
      project: [],
      dateRange: { start: "", end: "" },
      sortBy: "dueDate",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.project.length > 0 ||
      filters.dateRange.start ||
      filters.dateRange.end
    );
  };

  const getFilterTitle = () => {
    switch (filter) {
      case "overdue":
        return "Overdue Subtasks";
      case "in-progress":
        return "In Progress Subtasks";
      case "pending":
        return "Pending Subtasks";
      case "completed":
        return "Completed Subtasks";
      case "today":
        return "Today's Subtasks";
      default:
        return "My Subtasks";
    }
  };

  const getFilterIcon = () => {
    switch (filter) {
      case "overdue":
        return FiAlertCircle;
      case "in-progress":
        return FiPlay;
      case "pending":
        return FiPause;
      case "completed":
        return FiCheckCircle;
      case "today":
        return FiCalendar;
      default:
        return FiUser;
    }
  };

  const getFilterColor = () => {
    switch (filter) {
      case "overdue":
        return "text-red-600 bg-red-50";
      case "in-progress":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-orange-600 bg-orange-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "today":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getEmptyStateMessage = () => {
    switch (filter) {
      case "overdue":
        return "No overdue subtasks found";
      case "in-progress":
        return "No subtasks currently in progress";
      case "pending":
        return "No pending subtasks found";
      case "completed":
        return "No completed subtasks found";
      case "today":
        return "No subtasks due today";
      default:
        return "No subtasks assigned to you yet";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 border-red-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "in-progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "todo":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubTaskClick = (subTask) => {
    // Navigate to the parent task detail page with the correct URL structure
    navigate(
      `/projects/${subTask.project._id}/${subTask.parentTask._id}?subTaskId=${subTask._id}`
    );
  };

  const { projects } = getFilterOptions();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flexBetween mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <Header>{getFilterTitle()}</Header>
            <p className="text-sm text-gray-500 mt-1">
              {filteredSubTasks.length} subtask
              {filteredSubTasks.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Filter Badge */}
        {filter && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getFilterColor()}`}
          >
            <div className="flex items-center gap-2">
              {React.createElement(getFilterIcon(), { className: "w-4 h-4" })}
              {getFilterTitle()}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search subtasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
              hasActiveFilters()
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {hasActiveFilters() && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
            {showFilters ? (
              <FiChevronUp className="w-4 h-4" />
            ) : (
              <FiChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {["todo", "in-progress", "completed"].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={() =>
                          handleMultiSelectFilter("status", status)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {["High", "Medium", "Low"].map((priority) => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={() =>
                          handleMultiSelectFilter("priority", priority)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {projects.map((project) => (
                    <label key={project._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.project.includes(project._id)}
                        onChange={() =>
                          handleMultiSelectFilter("project", project._id)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm truncate">
                        {project.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="title">Title</option>
                  <option value="createdAt">Created Date</option>
                </select>
                <button
                  onClick={() =>
                    handleFilterChange(
                      "sortOrder",
                      filters.sortOrder === "asc" ? "desc" : "asc"
                    )
                  }
                  className="mt-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {filters.sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters() && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <FiX className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subtasks List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSubTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredSubTasks.map((subTask) => (
              <div
                key={subTask._id}
                onClick={() => handleSubTaskClick(subTask)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {subTask.title}
                    </h3>
                    {subTask.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {subTask.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        subTask.priority
                      )}`}
                    >
                      {subTask.priority}
                    </span>
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        subTask.status
                      )}`}
                    >
                      {subTask.status === "todo" ? "Pending" : subTask.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    {/* Project */}
                    {subTask.project && (
                      <div className="flex items-center gap-1">
                        <FiFolder className="w-4 h-4" />
                        <span>{subTask.project.name}</span>
                      </div>
                    )}
                    {/* Parent Task */}
                    {subTask.parentTask && (
                      <div className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        <span>Task: {subTask.parentTask.title}</span>
                      </div>
                    )}
                    {/* Due Date */}
                    {subTask.dueDate && (
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          {formatDate(subTask.dueDate)}
                          {new Date(subTask.dueDate) < new Date() &&
                            subTask.status !== "completed" && (
                              <span className="text-red-500 ml-1">
                                ({getDaysOverdue(subTask.dueDate)} days overdue)
                              </span>
                            )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Time Estimate */}
                  {subTask.timeEstimate && (
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      <span>{subTask.timeEstimate}h</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {getEmptyStateMessage()}
            </h3>
            <p className="text-gray-500 text-sm">
              {filter
                ? "Try adjusting your filters or check back later for new subtasks."
                : "Subtasks assigned to you will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubTasks;
