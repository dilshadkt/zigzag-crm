import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployeeSubTasksToday } from "../api/hooks";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/shared/header";
import {
  FiClock,
  FiUser,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiFolder,
} from "react-icons/fi";

const TodayTasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: todayData, isLoading } = useGetEmployeeSubTasksToday(
    user?._id ? user._id : null
  );

  const [filteredItems, setFilteredItems] = useState([]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: [],
    priority: [],
    project: [],
    sortBy: "priority", // Default sort by priority for today's tasks
    sortOrder: "desc",
  });

  // Get unique filter options from subtasks
  const combinedItems = useMemo(() => {
    if (!todayData) return [];
    const tasks = todayData.tasks || [];
    const subTasks = todayData.subTasks || [];
    // Tag items to distinguish for UI logic
    return [
      ...tasks.map((t) => ({ ...t, __type: "task" })),
      ...subTasks.map((s) => ({ ...s, __type: "subtask" })),
    ];
  }, [todayData]);

  const getFilterOptions = () => {
    if (!combinedItems.length) return { projects: [] };

    const projects = [];
    const projectIds = new Set();

    combinedItems.forEach((item) => {
      if (item.project && !projectIds.has(item.project._id)) {
        projectIds.add(item.project._id);
        projects.push(item.project);
      }
    });

    return { projects };
  };

  useEffect(() => {
    if (combinedItems.length) {
      let filtered = [...combinedItems];

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (filters.status.length > 0) {
        filtered = filtered.filter((item) =>
          filters.status.includes(item.status)
        );
      }

      // Apply priority filter
      if (filters.priority.length > 0) {
        filtered = filtered.filter((item) =>
          filters.priority.includes(item.priority)
        );
      }

      // Apply project filter
      if (filters.project.length > 0) {
        filtered = filtered.filter(
          (item) => item.project && filters.project.includes(item.project._id)
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (filters.sortBy) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "priority": {
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            aValue = priorityOrder[a.priority] || 0;
            bValue = priorityOrder[b.priority] || 0;
            break;
          }
          case "status": {
            const statusOrder = { todo: 1, "in-progress": 2, completed: 3 };
            aValue = statusOrder[a.status] || 0;
            bValue = statusOrder[b.status] || 0;
            break;
          }
          case "createdAt":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default: // dueDate (though mostly same for today)
            aValue = new Date(a.dueDate);
            bValue = new Date(b.dueDate);
        }

        if (filters.sortOrder === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });

      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [combinedItems, filters]);

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
      sortBy: "priority",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.project.length > 0
    );
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

  const handleSubTaskClick = (subTask) => {
    navigate(
      `/projects/${subTask.project._id}/${subTask.parentTask._id}?subTaskId=${subTask._id}`
    );
  };

  const { projects } = getFilterOptions();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex flex-col h-full">
      {/* Header */}
      <div className="flexBetween ">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <Header>Today's Tasks</Header>
            <p className="text-sm text-gray-500 ">
              {filteredItems.length} task
              {filteredItems.length !== 1 ? "s" : ""} due today
            </p>
          </div>
        </div>
        {/* Search and Filters */}
        <div className="mb-5">
          <div className="flex gap-3 mb-2">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
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
                        <span className="ml-2 text-sm capitalize">
                          {status}
                        </span>
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
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="priority">Priority</option>
                    <option value="dueDate">Due Date</option>
                    <option value="status">Status</option>
                    <option value="title">Title</option>
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
                    {filters.sortOrder === "asc"
                      ? "↑ Ascending"
                      : "↓ Descending"}
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
      </div>

      {/* Tasks/Subtasks List */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length > 0 ? (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                onClick={() =>
                  item.__type === "subtask" && handleSubTaskClick(item)
                }
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Type Badge */}
                    <span className="px-2 py-1 text-xs font-medium rounded-full border text-gray-600 bg-gray-50 border-gray-200">
                      {item.__type === "subtask" ? "Subtask" : "Task"}
                    </span>
                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status === "todo" ? "Pending" : item.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    {/* Project */}
                    {item.project && (
                      <div className="flex items-center gap-1">
                        <FiFolder className="w-4 h-4" />
                        <span>{item.project.name}</span>
                      </div>
                    )}
                    {/* Parent Task */}
                    {item.__type === "subtask" && item.parentTask && (
                      <div className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        <span>Task: {item.parentTask.title}</span>
                      </div>
                    )}
                    {/* Due Date */}
                    {item.dueDate && (
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDate(item.dueDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Time Estimate */}
                  {item.timeEstimate && (
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      <span>{item.timeEstimate}h</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No tasks due today
            </h3>
            <p className="text-gray-500 text-sm">
              You're all caught up! Check back tomorrow for new tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayTasks;
