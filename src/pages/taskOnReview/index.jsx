import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FiAlertCircle, FiCalendar, FiClock, FiEye } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetTasksOnReview } from "../../api/hooks";
import Navigator from "../../components/shared/navigator";
import { useAuth } from "../../hooks/useAuth";
import socketService from "../../services/socketService";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Task from "../../components/shared/task";
import FilterMenu from "../../components/projects/FilterMenu";
import { assetPath } from "../../utils/assetPath";
import TaskQuickFilters from "../../components/tasks/TaskQuickFilters";

const TaskOnReview = () => {
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

  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
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

  const [showTasks, setShowTasks] = useState(() => {
    const saved = localStorage.getItem(`task_on_review_showTasks`);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showSubtasks, setShowSubtasks] = useState(() => {
    const saved = localStorage.getItem(`task_on_review_showSubtasks`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(`task_on_review_showTasks`, JSON.stringify(showTasks));
  }, [showTasks]);

  useEffect(() => {
    localStorage.setItem(`task_on_review_showSubtasks`, JSON.stringify(showSubtasks));
  }, [showSubtasks]);

  const [superFilters, setSuperFilters] = useState({ assignedTo: [], project: [] });
  const [selectedTask, setSelectedTask] = useState(null);
  const [mobileShowDetails, setMobileShowDetails] = useState(false);

  const handleSuperFilterChange = (type, value) => {
    setSuperFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleMultiSelectFilter = (type, value) => {
    setSuperFilters((prev) => {
      const currentValues = prev[type] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [type]: newValues };
    });
  };

  const getFilterOptions = (tasks) => {
    const usersMap = new Map();
    const projectsMap = new Map();

    tasks.forEach(task => {
      if (task.project?._id) {
        projectsMap.set(task.project._id, task.project);
      }
      if (task.assignedTo && Array.isArray(task.assignedTo)) {
        task.assignedTo.forEach(user => {
          if (user?._id) {
            usersMap.set(user._id, user);
          }
        });
      }
    });

    return {
      users: Array.from(usersMap.values()),
      projects: Array.from(projectsMap.values())
    };
  };

  // Get all tasks on review across the company
  const {
    data: tasksOnReviewData,
    isLoading,
    refetch,
    error,
  } = useGetTasksOnReview({
    page: 1,
    limit: 100,
    sortBy: "dueDate",
    sortOrder: "asc",
    taskMonth: taskMonth,
    reporterId: activeFilters?.reporterId,
  });
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Auto-refresh when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Listen for real-time task status changes
  useEffect(() => {
    const handleTaskStatusChange = (data) => {
      console.log("📋 Task status changed in task-on-review:", data);

      // If a task was moved to "on-review", refresh the task list
      if (data.newStatus === "on-review") {
        console.log("🔄 Refreshing task list due to new task on review");
        refetch();

        // Show a toast notification for new task on review
        if (data.updatedBy && data.updatedBy._id !== user?._id) {
          // Only show notification if it wasn't the current user who moved the task
          const notification = document.createElement("div");
          notification.className =
            "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full";
          notification.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div>
                <div class="font-medium">New Task on Review</div>
                <div class="text-sm opacity-90">"${data.taskTitle}" moved to review by ${data.updatedBy.name}</div>
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
      // If a task was moved away from "on-review", also refresh to remove it
      else if (data.oldStatus === "on-review") {
        console.log("🔄 Refreshing task list due to task moved from review");
        refetch();
      }
    };

    const handleNewNotification = (data) => {
      console.log("🔔 New notification in task-on-review:", data);
      // Refresh if it's a task-related notification
      if (data.type === "task_review" || data.type === "task_updated") {
        refetch();
        // Also invalidate the tasks on review query
        queryClient.invalidateQueries(["tasksOnReview"]);
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



  // Filter task based on the process and active filters
  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      // Apply URL-based filter first
      const today = new Date();
      let passesUrlFilter = true;

      switch (filter) {
        case "overdue":
          const dueDate = new Date(task.dueDate);
          passesUrlFilter = dueDate < today;
          break;
        case "today":
          const taskDueDate = new Date(task.dueDate);
          const todayStart = new Date(today);
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          passesUrlFilter =
            taskDueDate >= todayStart && taskDueDate <= todayEnd;
          break;
        case "this-week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          const taskWeekDate = new Date(task.dueDate);
          passesUrlFilter =
            taskWeekDate >= weekStart && taskWeekDate <= weekEnd;
          break;
      }

      if (!passesUrlFilter) return false;

      // Apply additional filters if activeFilters is set
      if (activeFilters) {
        // Filter by status
        if (
          activeFilters.status.length > 0 &&
          !activeFilters.status.includes(task.status)
        ) {
          return false;
        }

        // Filter by priority
        if (
          activeFilters.priority.length > 0 &&
          !activeFilters.priority.includes(task.priority)
        ) {
          return false;
        }

        // Filter by date range
        if (
          activeFilters.dateRange.startDate &&
          activeFilters.dateRange.endDate
        ) {
          const taskDate = new Date(task.dueDate);
          const startDate = new Date(activeFilters.dateRange.startDate);
          const endDate = new Date(activeFilters.dateRange.endDate);
          if (taskDate < startDate || taskDate > endDate) {
            return false;
          }
        }
      }

      // Filter by assignedTo (super filter)
      if (superFilters.assignedTo?.length > 0) {
        const taskAssigneeIds = task.assignedTo?.map(u => u._id) || [];
        const hasAssignee = superFilters.assignedTo.some(id => taskAssigneeIds.includes(id));
        if (!hasAssignee) return false;
      }

      // Filter by project (super filter)
      if (superFilters.project?.length > 0) {
        const projectId = task.project?._id;
        if (!projectId || !superFilters.project.includes(projectId)) return false;
      }

      // Search by title / project / assignee
      const searchQuery = filters.search?.trim().toLowerCase();
      if (searchQuery) {
        const title = task.title?.toLowerCase() || "";
        const projectName = task.project?.name?.toLowerCase() || "";
        const assignees = (task.assignedTo || [])
          .map((u) => `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase())
          .join(" ");
        if (
          !title.includes(searchQuery) &&
          !projectName.includes(searchQuery) &&
          !assignees.includes(searchQuery)
        ) {
          return false;
        }
      }

      // Tasks / Subtasks visibility
      const isSubTask = task.parentTask || task.isSubTask;
      if (isSubTask && !showSubtasks) return false;
      if (!isSubTask && !showTasks) return false;

      return true;
    });
  };

  useEffect(() => {
    if (tasksOnReviewData?.tasks) {
      console.log(
        "🔍 All tasks on review from API:",
        tasksOnReviewData.tasks.length
      );

      // All tasks from this API are already on review status
      let filtered = filterTasks([...tasksOnReviewData.tasks]);

      console.log("🔍 Tasks after filtering:", filtered.length);

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
  }, [tasksOnReviewData, filter, activeFilters, filters, superFilters, showTasks, showSubtasks]);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const getFilterTitle = () => {
    switch (filter) {
      case "overdue":
        return "Overdue Tasks & Subtasks on Review";
      case "today":
        return "Today's Tasks & Subtasks on Review";
      case "this-week":
        return "This Week's Tasks & Subtasks on Review";
      default:
        return "Tasks & Subtasks on Review";
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
        return FiEye;
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
        return "text-purple-500";
    }
  };

  const getEmptyStateMessage = () => {
    if (isLoading) return "Loading tasks and subtasks...";

    if (filteredTasks.length === 0) {
      if (filter) {
        return `No tasks or subtasks on review found for ${filter.replace(
          "-",
          " "
        )}`;
      }
      return "No tasks or subtasks are currently in review status";
    }

    return "";
  };

  const handleTaskClick = (task) => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      setSelectedTask(task);
      setMobileShowDetails(true);
      return;
    }
    openFullTask(task);
  };

  const openFullTask = (task) => {
    if (task.type === "subtask" || task.itemType === "subtask" || task.parentTask) {
      if (task.parentTask?._id) {
        navigate(`/projects/${task.project._id}/${task.parentTask._id}`);
      } else if (task.project?._id) {
        navigate(`/projects/${task.project._id}/${task._id}`);
      }
    } else if (task.project?._id) {
      navigate(`/projects/${task.project._id}/${task._id}`);
    } else {
      navigate(`/tasks/${task._id}`);
    }
  };

  const formatDueDate = (isoDate) => {
    if (!isoDate) return "No due date";
    try {
      return new Date(isoDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "No due date";
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flexCenter">
        <img src={assetPath("icons/loading.svg")} alt="" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0 px-1 md:px-0">
          {/* Mobile details view */}
          {mobileShowDetails && selectedTask ? (
            <div className="md:hidden flex flex-col gap-4 pb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileShowDetails(false);
                    setSelectedTask(null);
                  }}
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700"
                  aria-label="Back to task list"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    On review
                  </p>
                  <h3 className="text-base font-semibold text-gray-800 truncate">
                    {selectedTask.title}
                  </h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700">
                    {selectedTask.status?.replace("-", " ") || "on review"}
                  </span>
                  <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700">
                    {selectedTask.priority || "medium"} priority
                  </span>
                  {(selectedTask.type === "subtask" ||
                    selectedTask.itemType === "subtask" ||
                    selectedTask.parentTask) && (
                    <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                      Subtask
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Project</p>
                    <p className="font-medium text-gray-800">
                      {selectedTask.project?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Due date</p>
                    <p className="font-medium text-gray-800">
                      {formatDueDate(selectedTask.dueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Assignees</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTask.assignedTo || []).length > 0 ? (
                        selectedTask.assignedTo.map((user) => (
                          <span
                            key={user._id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 px-2.5 py-1 text-xs text-gray-700"
                          >
                            {(user.firstName || "").slice(0, 1)}
                            {user.firstName} {user.lastName}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedTask.description && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Description</p>
                    <div
                      className="text-sm text-gray-700 line-clamp-6 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html:
                          typeof selectedTask.description === "string"
                            ? selectedTask.description
                            : "",
                      }}
                    />
                  </div>
                )}

                <PrimaryButton
                  title="Open full task"
                  className="w-full text-white mt-1"
                  onclick={() => openFullTask(selectedTask)}
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                <Task
                  task={selectedTask}
                  onClick={() => openFullTask(selectedTask)}
                  isBoardView={false}
                  compact
                />
              </div>
            </div>
          ) : (
            <div className="">
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
                <div className="flex items-start gap-2 md:gap-3 min-w-0">
                  <Navigator />
                  <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-medium text-gray-800 leading-snug">
                      {getFilterTitle()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {filteredTasks.length} item
                      {filteredTasks.length !== 1 ? "s" : ""} on review
                      {tasksOnReviewData?.statistics && (
                        <span className="ml-2">
                          ({tasksOnReviewData.statistics.total} total)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                  <PrimaryButton
                    icon={"/icons/refresh.svg"}
                    className={"bg-white hover:bg-gray-50 transition-colors"}
                    onclick={() => refetch()}
                  />
                  <PrimaryButton
                    icon={"/icons/filter.svg"}
                    className={"bg-white hover:bg-gray-50 transition-colors"}
                    onclick={() => setShowFilter(true)}
                  />
                </div>
              </div>

              {/* Search */}
              <div className="mb-3 md:mb-4">
                <label className="w-full text-sm text-[#91929E]">
                  <span className="sr-only">Search tasks</span>
                  <div className="flex items-center gap-2 rounded-full bg-white border border-[#E4E6E8] md:border-gray-200 px-3 py-2.5">
                    <img
                      src="/icons/search.svg"
                      alt=""
                      className="h-4 w-4 shrink-0"
                    />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      placeholder="Search by title, project, or assignee"
                      className="w-full bg-transparent text-sm text-[#0A1629] placeholder:text-[#91929E] focus:outline-none"
                    />
                  </div>
                </label>
              </div>

              {/* Quick Filters */}
              <div className="mb-4 md:mb-6 overflow-x-auto scrollbar-thin -mx-1 px-1">
                <TaskQuickFilters
                  superFilters={superFilters}
                  onFilterChange={handleSuperFilterChange}
                  onMultiSelectFilter={handleMultiSelectFilter}
                  users={getFilterOptions(tasksOnReviewData?.tasks || []).users}
                  projects={
                    getFilterOptions(tasksOnReviewData?.tasks || []).projects
                  }
                  showTasks={showTasks}
                  showSubtasks={showSubtasks}
                  onToggleTasks={() => setShowTasks((prev) => !prev)}
                  onToggleSubtasks={() => setShowSubtasks((prev) => !prev)}
                  nowrap
                  className="min-w-max md:min-w-0"
                />
              </div>

              {/* Tasks List */}
              <div className="flex flex-col h-full pb-5 gap-y-2 rounded-xl overflow-hidden overflow-y-auto">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiEye className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tasks or subtasks on review
                    </h3>
                    <p className="text-gray-500">{getEmptyStateMessage()}</p>
                  </div>
                ) : (
                  filteredTasks.map((task, index) => (
                    <Task
                      key={task._id}
                      task={task}
                      onClick={handleTaskClick}
                      isBoardView={false}
                      index={index}
                      compact
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <FilterMenu
        isOpen={showFilter}
        setShowModalFilter={setShowFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default TaskOnReview;
