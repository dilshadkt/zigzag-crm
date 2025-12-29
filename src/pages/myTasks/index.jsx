import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useGetEmployeeTasks } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/shared/header";
import Navigator from "../../components/shared/navigator";
import TaskList from "../../components/tasks/TaskList";
import MyTasksHeader from "./MyTasksHeader";
import MyTasksFiltersPanel from "./MyTasksFiltersPanel";
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
  // Map filter to status for backend, but keep special filters (overdue, today, unscheduled) for client-side filtering
  const getStatusFromFilter = (filter) => {
    const statusMap = {
      "in-progress": "in-progress",
      pending: "pending", // Backend accepts both "pending" and "todo"
      completed: "completed",
      approved: "approved",
      "client-approved": "client-approved",
      "on-review": "on-review",
      "re-work": "re-work",
      overdue: "overdue",
      upcoming: "upcoming", // Backend handles upcoming via getUpcomingThreeDayTasks
    };
    return statusMap[filter] || null; // Return null for special filters (overdue, today, unscheduled)
  };

  const { data: employeeTasksData, isLoading } = useGetEmployeeTasks(
    user?._id,
    {
      taskMonth,
      status: getStatusFromFilter(filter), // Pass status to backend for standard status filters
    }
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
      // Note: Standard status filters (pending, in-progress, completed, approved, client-approved, on-review, re-work, overdue, upcoming) are handled by backend
      // Only special filters (today, unscheduled) need client-side filtering
      const today = new Date();
      switch (filter) {
        // "overdue" is now handled by backend, so no client-side filtering needed
        // case "overdue" removed - backend handles it via getOverdueTaskUpToMonth
        case "today":
          // First, get tasks due today
          const todayTasks = filtered.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return (
              dueDate.getDate() === today.getDate() &&
              dueDate.getMonth() === today.getMonth() &&
              dueDate.getFullYear() === today.getFullYear() &&
              task.status !== "approved" &&
              task.status !== "completed" &&
              task.status !== "client-approved"
            );
          });

          // If today's tasks are less than 3, include upcoming tasks to reach at least 3
          if (todayTasks.length < 3) {
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 2); // Add 2 days to today

            const upcomingTasks = filtered.filter((task) => {
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
                dueDateStart > todayStart &&
                dueDateStart <= threeDaysFromNowStart &&
                task.status !== "approved" &&
                task.status !== "completed" &&
                task.status !== "client-approved"
              );
            });

            // Add upcoming tasks to reach minimum of 3
            const neededTasks = 3 - todayTasks.length;
            const tasksToAdd = Math.min(neededTasks, upcomingTasks.length);
            const selectedUpcomingTasks = upcomingTasks.slice(0, tasksToAdd);

            filtered = [...todayTasks, ...selectedUpcomingTasks];
          } else {
            filtered = todayTasks;
          }
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
        // "upcoming" is now handled by backend, so no client-side filtering needed
        // case "upcoming" removed - backend handles it via getUpcomingThreeDayTasks
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

  // Group overdue tasks by month (same logic as companyTasks)
  const overdueTaskGroups = useMemo(() => {
    if (filter !== "overdue" || filteredTasks.length === 0) {
      return [];
    }

    const groups = new Map();
    filteredTasks.forEach((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const hasValidDate =
        dueDate instanceof Date && !Number.isNaN(dueDate.getTime());

      const groupKey = hasValidDate
        ? `${dueDate.getFullYear()}-${dueDate.getMonth()}`
        : "no-date";

      const label = hasValidDate
        ? dueDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "No Due Date";

      const sortValue = hasValidDate
        ? new Date(dueDate.getFullYear(), dueDate.getMonth(), 1).getTime()
        : Number.MIN_SAFE_INTEGER;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label,
          sortValue,
          tasks: [],
        });
      }

      groups.get(groupKey).tasks.push(task);
    });

    return Array.from(groups.values()).sort(
      (a, b) => (b.sortValue || 0) - (a.sortValue || 0)
    );
  }, [filter, filteredTasks]);

  const shouldGroupOverdue =
    filter === "overdue" && overdueTaskGroups.length > 0;

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
    // Check if task has a parent task
    if (task.parentTask && task.parentTask._id) {
      // If it's a subtask, navigate to the parent task
      if (task.project) {
        navigate(`/projects/${task.project._id}/${task.parentTask._id}`);
      } else {
        navigate(`/tasks/${task.parentTask._id}`);
      }
    } else {
      // Regular task navigation
      if (task.project) {
        navigate(`/projects/${task.project._id}/${task._id}`);
      } else {
        // For tasks without project, navigate to task details directly
        navigate(`/tasks/${task._id}`);
      }
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
      <MyTasksHeader
        title={getFilterTitle()}
        filterColorClass={getFilterColor()}
        FilterIcon={FilterIcon}
        taskCount={filteredTasks.length}
        filters={filters}
        onSearchChange={(value) => handleFilterChange("search", value)}
        showFilters={showFilters}
        toggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={
          filters.status.length +
          filters.priority.length +
          filters.project.length +
          (filters.dateRange.start ? 1 : 0) +
          (filters.dateRange.end ? 1 : 0)
        }
        onClearAllFilters={clearAllFilters}
        onBack={() => navigate("/")}
      />

      {/* Navigator */}

      <MyTasksFiltersPanel
        showFilters={showFilters}
        filters={filters}
        filterOptions={filterOptions}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        handleMultiSelectFilter={handleMultiSelectFilter}
        handleFilterChange={handleFilterChange}
      />

      {/* Tasks List */}
      <div className=" ">
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
        ) : shouldGroupOverdue ? (
          <div className="space-y-6">
            {overdueTaskGroups.map((group) => (
              <div key={group.key}>
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {group.label}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {group.tasks.length}{" "}
                    {group.tasks.length === 1 ? "task" : "tasks"}
                  </p>
                </div>
                <TaskList
                  tasks={group.tasks}
                  filter={filter}
                  showSubtasks={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className=" flex flex-col gap-y-2">
            {filteredTasks.map((task) => {
              const isOverdue =
                new Date(task.dueDate) < new Date() &&
                task.status !== "completed";
              const daysOverdue = isOverdue ? getDaysOverdue(task.dueDate) : 0;

              return (
                <div
                  key={task._id}
                  onClick={() => handleTaskClick(task)}
                  className="p-4 bg-white rounded-lg hover:bg-gray-50 cursor-pointer 
                  transition-colors border border-gray-100"
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
