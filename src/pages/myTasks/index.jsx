import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useGetEmployeeTasks } from "../../api/hooks";
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
} from "react-icons/fi";

const MyTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter"); // Can be: 'overdue', 'in-progress', 'pending', 'completed'
  const taskMonth = searchParams.get("taskMonth"); // Get taskMonth from URL query

  // Get employee tasks and filter based on URL parameter
  const { data: employeeTasksData, isLoading } = useGetEmployeeTasks(
    user?._id,
    { taskMonth }
  );
  const [filteredTasks, setFilteredTasks] = useState([]);

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

  // Get unique filter options from tasks
  const getFilterOptions = () => {
    if (!employeeTasksData?.tasks) return { projects: [] };

    const projects = [];
    const projectIds = new Set();

    employeeTasksData.tasks.forEach((task) => {
      if (task.project && !projectIds.has(task.project._id)) {
        projectIds.add(task.project._id);
        projects.push(task.project);
      }
    });

    return { projects };
  };

  useEffect(() => {
    if (employeeTasksData?.tasks) {
      let filtered = [
        ...employeeTasksData.tasks,
        ...employeeTasksData.subTasks,
      ];

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
        case "client-approved":
          filtered = filtered.filter(
            (task) => task.status === "client-approved"
          );
          break;
        case "on-review":
          filtered = filtered.filter((task) => task.status === "on-review");
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
        case "unscheduled":
          // Filter for tasks that have no startDate and no dueDate
          filtered = filtered.filter((task) => {
            return (
              (!task.startDate || task.startDate === null) &&
              (!task.dueDate || task.dueDate === null)
            );
          });
          break;
        case "upcoming":
          // Filter for tasks due in the next 3 days
          const threeDaysFromNow = new Date(today);
          threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 2); // Add 2 days to today

          filtered = filtered.filter((task) => {
            const dueDate = new Date(task.dueDate);
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
            const threeDaysFromNowStart = new Date(
              threeDaysFromNow.getFullYear(),
              threeDaysFromNow.getMonth(),
              threeDaysFromNow.getDate()
            );
            return (
              dueDateStart >= todayStart &&
              dueDateStart <= threeDaysFromNowStart &&
              task.status !== "approved" &&
              task.status !== "completed" &&
              task.status !== "client-approved"
            );
          });
          break;
        // No default case - show all tasks for 'all' or no filter
      }

      // Apply additional filters
      if (filters.search) {
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            task.description
              ?.toLowerCase()
              .includes(filters.search.toLowerCase())
        );
      }

      if (filters.status.length > 0) {
        filtered = filtered.filter((task) =>
          filters.status.includes(task.status)
        );
      }

      if (filters.priority.length > 0) {
        filtered = filtered.filter((task) =>
          filters.priority.includes(task.priority)
        );
      }

      if (filters.project.length > 0) {
        filtered = filtered.filter(
          (task) => task.project && filters.project.includes(task.project._id)
        );
      }

      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        filtered = filtered.filter((task) => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= startDate;
        });
      }

      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        filtered = filtered.filter((task) => {
          const taskDate = new Date(task.dueDate);
          return taskDate <= endDate;
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
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority] || 0;
            bValue = priorityOrder[b.priority] || 0;
            break;
          case "status":
            const statusOrder = {
              pending: 1,
              "in-progress": 2,
              "on-review": 3,
              approved: 4,
              "client-approved": 5,
              "re-work": 6,
              completed: 7,
            };
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

      setFilteredTasks(filtered);
    }
  }, [employeeTasksData, filter, filters]);

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
        return "Overdue Tasks";
      case "in-progress":
        return "In Progress Tasks";
      case "pending":
        return "Pending Tasks";
      case "completed":
        return "Completed Tasks";
      case "approved":
        return "Approved Tasks";
      case "client-approved":
        return "Client Approved Tasks";
      case "on-review":
        return "Tasks On Review";
      case "re-work":
        return "Re-work Tasks";
      case "today":
        return "Today's Tasks";
      case "unscheduled":
        return "Unscheduled Tasks";
      case "upcoming":
        return "Upcoming 3 Days Tasks";
      default:
        return "My Tasks";
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
      case "client-approved":
        return FiCheckCircle;
      case "on-review":
        return FiClock;
      case "re-work":
        return FiAlertCircle;
      case "today":
        return FiCalendar;
      case "unscheduled":
        return FiCalendar;
      case "upcoming":
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
        return "text-yellow-600 bg-yellow-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "approved":
        return "text-teal-600 bg-teal-50";
      case "client-approved":
        return "text-indigo-600 bg-indigo-50";
      case "on-review":
        return "text-orange-600 bg-orange-50";
      case "re-work":
        return "text-red-600 bg-red-50";
      case "today":
        return "text-purple-600 bg-purple-50";
      case "unscheduled":
        return "text-gray-600 bg-gray-50";
      case "upcoming":
        return "text-cyan-600 bg-cyan-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getEmptyStateMessage = () => {
    switch (filter) {
      case "overdue":
        return {
          title: "No Overdue Tasks! 🎉",
          message: "Great job! You're all caught up with your deadlines.",
        };
      case "in-progress":
        return {
          title: "No Tasks In Progress",
          message: "Start working on some pending tasks to see them here.",
        };
      case "pending":
        return {
          title: "No Pending Tasks",
          message: "All your tasks are either completed or in progress!",
        };
      case "completed":
        return {
          title: "No Completed Tasks Yet",
          message: "Complete some tasks to see your achievements here.",
        };
      case "approved":
        return {
          title: "No Approved Tasks Yet",
          message: "Tasks that have been approved will appear here.",
        };
      case "client-approved":
        return {
          title: "No Client Approved Tasks Yet",
          message: "Tasks approved by clients will appear here.",
        };
      case "on-review":
        return {
          title: "No Tasks On Review",
          message: "Tasks submitted for review will appear here.",
        };
      case "re-work":
        return {
          title: "No Re-work Tasks",
          message: "Tasks that need revision will appear here.",
        };
      case "today":
        return {
          title: "No Tasks Due Today",
          message:
            "You have no tasks due today. Great job staying on top of your schedule!",
        };
      case "unscheduled":
        return {
          title: "No Unscheduled Tasks",
          message:
            "All your tasks have been scheduled with start and due dates.",
        };
      case "upcoming":
        return {
          title: "No Upcoming Tasks",
          message:
            "You have no tasks due in the next 3 days. Great job staying ahead of your schedule!",
        };
      default:
        return {
          title: "No Tasks Assigned",
          message: "You don't have any tasks assigned to you yet.",
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-teal-100 text-teal-800";
      case "client-approved":
        return "bg-indigo-100 text-indigo-800";
      case "on-review":
        return "bg-orange-100 text-orange-800";
      case "re-work":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    if (task.project) {
      navigate(`/projects/${task.project._id}/${task._id}`);
    } else {
      // For tasks without project, navigate to task details directly
      navigate(`/tasks/${task._id}`);
    }
  };

  const filterOptions = getFilterOptions();
  const FilterIcon = getFilterIcon();

  if (isLoading) {
    return (
      <section className="flex flex-col">
        <div className="flexBetween">
          <Header>My Tasks</Header>
        </div>
        <div className="flex items-center justify-center h-64">
          <img src="/icons/loading.svg" alt="Loading..." className="w-8 h-8" />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col">
      {/* Header */}
      <div className="flexBetween mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <Header>{getFilterTitle()}</Header>
          <div
            className={`px-3 py-1 rounded-full flex items-center gap-2 ${getFilterColor()}`}
          >
            <FilterIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{filteredTasks.length}</span>
          </div>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-2 ${
              hasActiveFilters()
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FiFilter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
            {hasActiveFilters() && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filters.status.length +
                  filters.priority.length +
                  filters.project.length +
                  (filters.dateRange.start ? 1 : 0) +
                  (filters.dateRange.end ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigator */}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FiX className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {[
                  "pending",
                  "in-progress",
                  "on-review",
                  "approved",
                  "client-approved",
                  "re-work",
                  "completed",
                ].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => handleMultiSelectFilter("status", status)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      checked={filters.priority.includes(priority)}
                      onChange={() =>
                        handleMultiSelectFilter("priority", priority)
                      }
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">{priority}</span>
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
                {filterOptions.projects.map((project) => (
                  <label key={project._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.project.includes(project._id)}
                      onChange={() =>
                        handleMultiSelectFilter("project", project._id)
                      }
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      start: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      end: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="title">Title</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="createdAt">Created Date</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    handleFilterChange("sortOrder", e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {filter === "completed" ? "🎉" : "📋"}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {getEmptyStateMessage().title}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {getEmptyStateMessage().message}
            </p>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => {
              const isOverdue =
                new Date(task.dueDate) < new Date() &&
                task.status !== "completed";
              const daysOverdue = isOverdue ? getDaysOverdue(task.dueDate) : 0;

              return (
                <div
                  key={task._id}
                  onClick={() => handleTaskClick(task)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status.replace("-", " ")}
                          </span>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.project && (
                          <div className="flex items-center gap-1">
                            <FiFlag className="w-4 h-4" />
                            <span>{task.project.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          <span>Due {formatDate(task.dueDate)}</span>
                          {isOverdue && (
                            <span className="text-red-600 font-medium">
                              ({daysOverdue} day{daysOverdue > 1 ? "s" : ""}{" "}
                              overdue)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOverdue && (
                        <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded">
                          <FiAlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Overdue</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyTasks;
