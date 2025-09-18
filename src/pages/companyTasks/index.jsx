import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAllCompanyTasks } from "../../api/hooks";
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
} from "react-icons/fi";

const CompanyTasks = ({ filter: propFilter }) => {
  const { user, companyId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter"); // Can be: 'overdue', 'in-progress', 'pending', 'completed'
  const filter = propFilter || urlFilter; // Use prop filter if provided, otherwise use URL filter
  const taskMonth = searchParams.get("taskMonth");
  // Get all company tasks and filter based on URL parameter
  const { data: allTasksData, isLoading } = useGetAllCompanyTasks(
    companyId,
    taskMonth
  );
  const [filteredTasks, setFilteredTasks] = useState([]);
  // Super filter states
  const [showFilters, setShowFilters] = useState(false);
  const [superFilters, setSuperFilters] = useState({
    search: "",
    status: [],
    priority: [],
    assignedTo: [],
    project: [],
    dateRange: {
      start: "",
      end: "",
    },
    sortBy: "dueDate", // Options: 'dueDate', 'priority', 'status', 'title', 'createdAt'
    sortOrder: "asc", // 'asc' or 'desc'
  });

  // Get unique filter options from tasks
  const getFilterOptions = () => {
    if (!allTasksData?.tasks) return { users: [], projects: [] };

    const users = [];
    const projects = [];
    const userIds = new Set();
    const projectIds = new Set();

    allTasksData.tasks.forEach((task) => {
      task.assignedTo?.forEach((user) => {
        if (!userIds.has(user._id)) {
          userIds.add(user._id);
          users.push(user);
        }
      });

      if (task.project && !projectIds.has(task.project._id)) {
        projectIds.add(task.project._id);
        projects.push(task.project);
      }
    });

    return { users, projects };
  };

  useEffect(() => {
    if (allTasksData?.tasks) {
      let filtered = [...allTasksData.tasks];

      // Apply URL-based filter first
      const today = new Date();
      switch (filter) {
        case "overdue":
          filtered = filtered.filter((task) => {
            const dueDate = new Date(task.dueDate);
            // Set due date to start of day for comparison
            const dueDateStart = new Date(
              dueDate.getFullYear(),
              dueDate.getMonth(),
              dueDate.getDate()
            );
            const todayStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            return (
              dueDateStart < todayStart &&
              task.status !== "approved" &&
              task.status !== "completed" &&
              task.status !== "client-approved"
            );
          });
          break;
        case "in-progress":
          filtered = filtered.filter((task) => task.status === "in-progress");
          break;
        case "pending":
          filtered = filtered.filter((task) => task.status === "pending");
          break;
        case "completed":
          filtered = filtered.filter((task) => task.status === "completed");
          break;
        case "approved":
          filtered = filtered.filter((task) => task.status === "approved");
          break;
        case "re-work":
          filtered = filtered.filter((task) => task.status === "re-work");
          break;
        case "today":
          filtered = filtered.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return (
              dueDate.getDate() === today.getDate() &&
              dueDate.getMonth() === today.getMonth() &&
              dueDate.getFullYear() === today.getFullYear() &&
              task.status !== "completed"
            );
          });
          break;
        // No default case - show all tasks for 'all' or no filter
      }

      // Apply super filters
      if (superFilters.search) {
        filtered = filtered.filter(
          (task) =>
            task.title
              .toLowerCase()
              .includes(superFilters.search.toLowerCase()) ||
            task.description
              ?.toLowerCase()
              .includes(superFilters.search.toLowerCase())
        );
      }

      if (superFilters.status.length > 0) {
        filtered = filtered.filter((task) =>
          superFilters.status.includes(task.status)
        );
      }

      if (superFilters.priority.length > 0) {
        filtered = filtered.filter((task) =>
          superFilters.priority.includes(task.priority)
        );
      }

      if (superFilters.assignedTo.length > 0) {
        filtered = filtered.filter((task) =>
          task.assignedTo?.some((user) =>
            superFilters.assignedTo.includes(user._id)
          )
        );
      }

      if (superFilters.project.length > 0) {
        filtered = filtered.filter(
          (task) =>
            task.project && superFilters.project.includes(task.project._id)
        );
      }

      if (superFilters.dateRange.start) {
        const startDate = new Date(superFilters.dateRange.start);
        filtered = filtered.filter((task) => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= startDate;
        });
      }

      if (superFilters.dateRange.end) {
        const endDate = new Date(superFilters.dateRange.end);
        filtered = filtered.filter((task) => {
          const taskDate = new Date(task.dueDate);
          return taskDate <= endDate;
        });
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (superFilters.sortBy) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "priority":
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority] || 0;
            bValue = priorityOrder[b.priority] || 0;
            break;
          case "status":
            const statusOrder = { pending: 1, "in-progress": 2, completed: 3 };
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

        if (superFilters.sortOrder === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });

      setFilteredTasks(filtered);
    }
  }, [allTasksData, filter, superFilters]);

  const handleFilterChange = (key, value) => {
    setSuperFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiSelectFilter = (key, value) => {
    setSuperFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const clearAllFilters = () => {
    setSuperFilters({
      search: "",
      status: [],
      priority: [],
      assignedTo: [],
      project: [],
      dateRange: { start: "", end: "" },
      sortBy: "dueDate",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters = () => {
    return (
      superFilters.search ||
      superFilters.status.length > 0 ||
      superFilters.priority.length > 0 ||
      superFilters.assignedTo.length > 0 ||
      superFilters.project.length > 0 ||
      superFilters.dateRange.start ||
      superFilters.dateRange.end ||
      superFilters.sortBy !== "dueDate" ||
      superFilters.sortOrder !== "asc"
    );
  };

  const getFilterTitle = () => {
    switch (filter) {
      case "overdue":
        return "Overdue Tasks";
      case "in-progress":
        return "In Progress Tasks";
      case "pending":
        return "Pending Tasks";
      case "completed":
        return "Completed Tasks";
      case "approved":
        return "Approved Tasks";
      case "re-work":
        return "Re-work Tasks";
      case "today":
        return "Today's Tasks";
      default:
        return "All Tasks";
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
      case "approved":
        return FiCheckCircle;
      case "re-work":
        return FiAlertCircle;
      default:
        return FiFlag;
    }
  };

  const getFilterColor = () => {
    switch (filter) {
      case "overdue":
        return "text-red-600";
      case "in-progress":
        return "text-blue-600";
      case "pending":
        return "text-orange-600";
      case "completed":
        return "text-green-600";
      case "approved":
        return "text-teal-600";
      case "re-work":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getEmptyStateMessage = () => {
    switch (filter) {
      case "overdue":
        return {
          emoji: "🎉",
          title: "Great! No overdue tasks",
          message: "All tasks are on track. Keep up the excellent work!",
        };
      case "in-progress":
        return {
          emoji: "💼",
          title: "No tasks in progress",
          message: "Start working on pending tasks to see them here.",
        };
      case "pending":
        return {
          emoji: "📝",
          title: "No pending tasks",
          message: "All tasks have been started or completed.",
        };
      case "completed":
        return {
          emoji: "🚀",
          title: "No completed tasks yet",
          message: "Complete some tasks to see them here.",
        };
      case "approved":
        return {
          emoji: "✅",
          title: "No approved tasks yet",
          message: "Tasks that have been approved will appear here.",
        };
      case "re-work":
        return {
          emoji: "🔧",
          title: "No re-work tasks",
          message: "Tasks that need revision will appear here.",
        };
      default:
        return {
          emoji: "📋",
          title: "No tasks found",
          message: "Create some tasks to get started.",
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "in-progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "approved":
        return "text-teal-600 bg-teal-50 border-teal-200";
      case "re-work":
        return "text-red-600 bg-red-50 border-red-200";
      case "on-review":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTaskClick = (task) => {
    // If task has a parentTask, use the parent task's ID for navigation
    const taskIdToUse = task.parentTask ? task.parentTask._id : task._id;

    if (task.project) {
      navigate(`/projects/${task.project._id}/${taskIdToUse}`);
    } else {
      // For tasks without project, navigate to task details directly
      navigate(`/tasks/${taskIdToUse}`);
    }
  };

  if (isLoading) {
    return (
      <section className="flex flex-col">
        <Navigator path={"/"} title={"Back to Dashboard"} />
        <Header>{getFilterTitle()}</Header>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const FilterIcon = getFilterIcon();
  const emptyState = getEmptyStateMessage();
  const { users, projects } = getFilterOptions();

  return (
    <section className="flex flex-col">
      <Navigator path={"/"} title={"Back to Dashboard"} />
      <div className="flexBetween mb-6">
        <Header>{getFilterTitle()}</Header>
        <div className={`flex items-center gap-2 ${getFilterColor()}`}>
          <FilterIcon className="w-5 h-5" />
          <span className="font-medium">{filteredTasks.length} tasks</span>
        </div>
      </div>

      {/* Super Filter Panel */}
      <div className="bg-white rounded-xl mb-6 border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <FiFilter className="w-5 h-5" />
                <span className="font-medium">Advanced Filters</span>
                {showFilters ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
              </button>
              {hasActiveFilters() && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Filters Active
                </span>
              )}
            </div>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <FiX className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={superFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {["pending", "in-progress", "completed"].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={superFilters.status.includes(status)}
                        onChange={() =>
                          handleMultiSelectFilter("status", status)
                        }
                        className="mr-2 rounded"
                      />
                      <span className="text-sm capitalize">
                        {status.replace("-", " ")}
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
                  {["high", "medium", "low"].map((priority) => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={superFilters.priority.includes(priority)}
                        onChange={() =>
                          handleMultiSelectFilter("priority", priority)
                        }
                        className="mr-2 rounded"
                      />
                      <span className="text-sm capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Assigned To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {users.map((user) => (
                    <label key={user._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={superFilters.assignedTo.includes(user._id)}
                        onChange={() =>
                          handleMultiSelectFilter("assignedTo", user._id)
                        }
                        className="mr-2 rounded"
                      />
                      <span className="text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {projects.map((project) => (
                    <label key={project._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={superFilters.project.includes(project._id)}
                        onChange={() =>
                          handleMultiSelectFilter("project", project._id)
                        }
                        className="mr-2 rounded"
                      />
                      <span className="text-sm">{project.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={superFilters.dateRange.start}
                    onChange={(e) =>
                      handleFilterChange("dateRange", {
                        ...superFilters.dateRange,
                        start: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={superFilters.dateRange.end}
                    onChange={(e) =>
                      handleFilterChange("dateRange", {
                        ...superFilters.dateRange,
                        end: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="space-y-2">
                  <select
                    value={superFilters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="title">Title</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                    <option value="createdAt">Created Date</option>
                  </select>
                  <select
                    value={superFilters.sortOrder}
                    onChange={(e) =>
                      handleFilterChange("sortOrder", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">{emptyState.emoji}</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {emptyState.title}
          </h3>
          <p className="text-gray-600">{emptyState.message}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              onClick={() => handleTaskClick(task)}
              className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {task.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority?.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status?.replace("-", " ").toUpperCase()}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      {task.assignedTo?.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {task.assignedTo.slice(0, 2).map((user, index) => (
                              <div
                                key={user._id || index}
                                className="w-5 h-5 rounded-full overflow-hidden border border-white"
                                title={`${user.firstName} ${user.lastName}`}
                              >
                                <img
                                  src={user?.profileImage}
                                  alt={user?.firstName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <span>
                            {task.assignedTo
                              .slice(0, 2)
                              .map(
                                (user) => `${user.firstName} ${user.lastName}`
                              )
                              .join(", ")}
                            {task.assignedTo.length > 2 &&
                              ` +${task.assignedTo.length - 2} more`}
                          </span>
                        </div>
                      ) : (
                        <span>Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>

                    {task.project && (
                      <div className="flex items-center gap-2">
                        <FiFlag className="w-4 h-4" />
                        <span>{task.project.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {filter === "overdue" && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {getDaysOverdue(task.dueDate)} days overdue
                      </span>
                    </div>
                  )}

                  {filter === "in-progress" && (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      <FiPlay className="w-4 h-4" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                  )}

                  {filter === "pending" && (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                      <FiPause className="w-4 h-4" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                  )}

                  {filter === "completed" && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                      <FiCheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Created by {task.creator?.firstName} {task.creator?.lastName}
                </div>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CompanyTasks;
