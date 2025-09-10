import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEye,
  FiFilter,
  FiFlag,
  FiSearch,
  FiUser,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetTasksOnPublish } from "../../api/hooks";
import Navigator from "../../components/shared/navigator";
import { useAuth } from "../../hooks/useAuth";
import socketService from "../../services/socketService";

const TaskOnPublish = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  // Get current month in YYYY-MM format as default
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const taskMonth = searchParams.get("taskMonth") || getCurrentMonth();

  // Get all tasks on publish across the company
  const {
    data: tasksOnPublishData,
    isLoading,
    refetch,
    error,
  } = useGetTasksOnPublish({
    page: 1,
    limit: 100,
    sortBy: "dueDate",
    sortOrder: "asc",
    taskMonth: taskMonth,
  });
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Auto-refresh when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Listen for real-time task status changes
  useEffect(() => {
    const handleTaskStatusChange = (data) => {
      console.log("📋 Task status changed in task-on-publish:", data);

      // If a task was moved to "client-approved", refresh the task list
      if (data.newStatus === "client-approved") {
        console.log("🔄 Refreshing task list due to new task client-approved");
        refetch();

        // Show a toast notification for new client-approved task
        if (data.updatedBy && data.updatedBy._id !== user?._id) {
          // Only show notification if it wasn't the current user who moved the task
          const notification = document.createElement("div");
          notification.className =
            "fixed top-4 right-4 bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full";
          notification.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div>
                <div class="font-medium">New Task Client Approved</div>
                <div class="text-sm opacity-90">"${data.taskTitle}" approved by client ${data.updatedBy.name}</div>
              </div>
            </div>
          `;
          document.body.appendChild(notification);

          // Animate in
          setTimeout(() => {
            notification.classList.remove("translate-x-full");
          }, 100);

          // Remove after 5 seconds
          setTimeout(() => {
            notification.classList.add("translate-x-full");
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 300);
          }, 5000);
        }
      }
      // If a task was moved away from "client-approved", also refresh to remove it
      else if (data.oldStatus === "client-approved") {
        console.log(
          "🔄 Refreshing task list due to task moved from client-approved"
        );
        refetch();
      }
    };

    const handleNewNotification = (data) => {
      console.log("🔔 New notification in task-on-publish:", data);
      // Refresh if it's a task-related notification
      if (
        data.type === "task_client_approved" ||
        data.type === "task_updated"
      ) {
        refetch();
        // Also invalidate the tasks on publish query
        queryClient.invalidateQueries(["tasksOnPublish"]);
      }
    };

    // Set up socket listeners
    socketService.onTaskStatusChange(handleTaskStatusChange);
    socketService.onNewNotification(handleNewNotification);

    // Cleanup listeners on unmount
    return () => {
      socketService.offTaskStatusChange(handleTaskStatusChange);
      socketService.offNewNotification(handleNewNotification);
    };
  }, [refetch]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    priority: [],
    project: [],
    dateRange: {
      start: "",
      end: "",
    },
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  // Get unique filter options from tasks
  const getFilterOptions = () => {
    if (!tasksOnPublishData?.tasks) return { projects: [] };

    const projects = [];
    const projectIds = new Set();

    tasksOnPublishData.tasks.forEach((task) => {
      if (task.project && !projectIds.has(task.project._id)) {
        projectIds.add(task.project._id);
        projects.push(task.project);
      }
    });

    return { projects };
  };

  useEffect(() => {
    if (tasksOnPublishData?.tasks) {
      console.log(
        "🔍 All tasks on publish (client-approved) from API:",
        tasksOnPublishData.tasks.length
      );
      console.log(
        "🔍 Task details:",
        tasksOnPublishData.tasks.map((t) => ({
          id: t._id,
          title: t.title,
          status: t.status,
          assignedTo:
            t.assignedTo && t.assignedTo.length > 0
              ? t.assignedTo
                  .map((user) => `${user.firstName} ${user.lastName}`)
                  .join(", ")
              : "Unassigned",
          project: t.project?.name,
        }))
      );

      // All tasks from this API are already client-approved status
      let filtered = [...tasksOnPublishData.tasks];

      console.log("🔍 Tasks after filtering:", filtered.length);
      console.log(
        "🔍 Filtered tasks:",
        filtered.map((t) => ({ id: t._id, title: t.title, status: t.status }))
      );

      // Apply URL-based filter
      const today = new Date();
      switch (filter) {
        case "overdue":
          filtered = filtered.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return dueDate < today;
          });
          break;
        case "today":
          filtered = filtered.filter((task) => {
            const dueDate = new Date(task.dueDate);
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            return dueDate >= todayStart && dueDate <= todayEnd;
          });
          break;
        case "this-week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          filtered = filtered.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return dueDate >= weekStart && dueDate <= weekEnd;
          });
          break;
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
  }, [tasksOnPublishData, filter, filters]);

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
      filters.priority.length > 0 ||
      filters.project.length > 0 ||
      filters.dateRange.start ||
      filters.dateRange.end
    );
  };

  const getFilterTitle = () => {
    switch (filter) {
      case "overdue":
        return "Overdue Client Approved Tasks & Subtasks";
      case "today":
        return "Today's Client Approved Tasks & Subtasks";
      case "this-week":
        return "This Week's Client Approved Tasks & Subtasks";
      default:
        return "Client Approved Tasks & Subtasks";
    }
  };

  const getFilterIcon = () => {
    switch (filter) {
      case "overdue":
        return FiAlertCircle;
      case "today":
        return FiCalendar;
      case "this-week":
        return FiClock;
      default:
        return FiCheckCircle;
    }
  };

  const getFilterColor = () => {
    switch (filter) {
      case "overdue":
        return "text-red-500";
      case "today":
        return "text-blue-500";
      case "this-week":
        return "text-green-500";
      default:
        return "text-green-500";
    }
  };

  const getEmptyStateMessage = () => {
    if (isLoading) return "Loading client approved tasks and subtasks...";

    if (filteredTasks.length === 0) {
      if (filter) {
        return `No client approved tasks or subtasks found for ${filter.replace(
          "-",
          " "
        )}`;
      }
      return "No tasks or subtasks are currently client approved";
    }

    return "";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50";
      case "medium":
        return "text-yellow-500 bg-yellow-50";
      case "low":
        return "text-green-500 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
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

  const handleTaskClick = (task) => {
    if (task.type === "subtask") {
      // For subtasks, navigate to the parent task detail page
      if (task.parentTask?._id) {
        navigate(`/tasks/${task.parentTask._id}?subtask=${task._id}`);
      } else if (task.project?._id) {
        navigate(`/projects/${task.project._id}?subtask=${task._id}`);
      }
    } else {
      // For regular tasks
      if (task.project?._id) {
        navigate(`/projects/${task.project._id}/${task._id}`);
      } else {
        navigate(`/tasks/${task._id}`);
      }
    }
  };

  const { projects } = getFilterOptions();

  if (isLoading) {
    return (
      <div className="h-screen w-full flexCenter">
        <img src="/icons/loading.svg" alt="" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Navigator />

                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {getFilterTitle()}
                  </h1>
                  <p className="text-gray-500">
                    {filteredTasks.length} client approved item
                    {filteredTasks.length !== 1 ? "s" : ""}
                    {tasksOnPublishData?.statistics && (
                      <span className="ml-2 text-sm">
                        ({tasksOnPublishData.statistics.total} total)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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

                {/* Refresh Button */}
                <button
                  onClick={() => {
                    refetch();
                  }}
                  className="p-2 bg-white hover:bg-gray-50 transition-colors rounded-lg border border-gray-200"
                  title="Refresh tasks and subtasks"
                >
                  <img
                    src="/icons/refresh.svg"
                    alt="Refresh"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={filters.search}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Priority */}
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
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">
                            {priority}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Project */}
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
                          <span className="ml-2 text-sm text-gray-700 truncate">
                            {project.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="priority">Priority</option>
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
                      className="mt-2 w-full px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
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
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <FiX className="w-4 h-4" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No client approved tasks or subtasks
                  </h3>
                  <p className="text-gray-500">{getEmptyStateMessage()}</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => handleTaskClick(task)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {task.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                            Client Approved
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              task.type === "subtask"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {task.type === "subtask" ? "Subtask" : "Task"}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {task.assignedTo && task.assignedTo.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FiUser className="w-4 h-4" />
                              <span>
                                Assigned to:{" "}
                                {task.assignedTo
                                  .map(
                                    (user) =>
                                      `${user.firstName} ${user.lastName}`
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          )}

                          {task.project && (
                            <div className="flex items-center gap-1">
                              <FiFlag className="w-4 h-4" />
                              <span>Project: {task.project.name}</span>
                            </div>
                          )}

                          {task.type === "subtask" && task.parentTask && (
                            <div className="flex items-center gap-1">
                              <FiArrowLeft className="w-4 h-4" />
                              <span>Parent: {task.parentTask.title}</span>
                            </div>
                          )}

                          {task.creator && (
                            <div className="flex items-center gap-1">
                              <FiUser className="w-4 h-4" />
                              <span>
                                Created by: {task.creator.firstName}{" "}
                                {task.creator.lastName}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            <span>Due: {formatDate(task.dueDate)}</span>
                            {new Date(task.dueDate) < new Date() && (
                              <span className="text-red-500 ml-1">
                                ({getDaysOverdue(task.dueDate)} days overdue)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOnPublish;
