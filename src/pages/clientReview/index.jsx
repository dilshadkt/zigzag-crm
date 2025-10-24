import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiEye,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetClientReviewTasks } from "../../api/hooks";
import Navigator from "../../components/shared/navigator";
import { useAuth } from "../../hooks/useAuth";
import socketService from "../../services/socketService";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Task from "../../components/shared/task";
import FilterMenu from "../../components/projects/FilterMenu";

const ClientReview = () => {
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

  // Get all client review tasks across the company
  const {
    data: clientReviewData,
    isLoading,
    refetch,
    error,
  } = useGetClientReviewTasks({
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
      console.log("📋 Task status changed in client-review:", data);

      // If a task was moved to "approved", refresh the task list
      if (data.newStatus === "approved") {
        console.log("🔄 Refreshing task list due to new approved task");
        refetch();

        // Show a toast notification for new approved task
        if (data.updatedBy && data.updatedBy._id !== user?._id) {
          // Only show notification if it wasn't the current user who moved the task
          const notification = document.createElement("div");
          notification.className =
            "fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full";
          notification.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div>
                <div class="font-medium">New Task Approved</div>
                <div class="text-sm opacity-90">"${data.taskTitle}" approved by ${data.updatedBy.name}</div>
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
      // If a task was moved away from "approved", also refresh to remove it
      else if (data.oldStatus === "approved") {
        console.log("🔄 Refreshing task list due to task moved from approved");
        refetch();
      }
    };

    const handleNewNotification = (data) => {
      console.log("🔔 New notification in client-review:", data);
      // Refresh if it's a task-related notification
      if (data.type === "task_approved" || data.type === "task_updated") {
        refetch();
        // Also invalidate the client review query
        queryClient.invalidateQueries(["clientReviewTasks"]);
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

      return true;
    });
  };

  useEffect(() => {
    if (clientReviewData?.tasks) {
      console.log(
        "🔍 All client review tasks from API:",
        clientReviewData.tasks.length
      );

      // All tasks from this API are already approved status
      let filtered = filterTasks([...clientReviewData.tasks]);

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
  }, [clientReviewData, filter, activeFilters, filters]);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const getFilterTitle = () => {
    switch (filter) {
      case "overdue":
        return "Overdue Tasks & Subtasks for Client Review";
      case "today":
        return "Today's Tasks & Subtasks for Client Review";
      case "this-week":
        return "This Week's Tasks & Subtasks for Client Review";
      default:
        return "Tasks & Subtasks for Client Review";
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
        return "text-teal-500";
    }
  };

  const getEmptyStateMessage = () => {
    if (isLoading) return "Loading tasks and subtasks...";

    if (filteredTasks.length === 0) {
      if (filter) {
        return `No tasks or subtasks for client review found for ${filter.replace(
          "-",
          " "
        )}`;
      }
      return "No tasks or subtasks are currently approved and ready for client review";
    }

    return "";
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
            <div className="flexBetween mb-6">
              <div className="flex items-center gap-3">
                <Navigator />
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {getFilterTitle()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filteredTasks.length} item
                    {filteredTasks.length !== 1 ? "s" : ""} for client review
                    {clientReviewData?.statistics && (
                      <span className="ml-2">
                        ({clientReviewData.statistics.total} total)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
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

            {/* Tasks List */}
            <div className="flex flex-col h-full pb-5 gap-y-4 rounded-xl overflow-hidden overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tasks or subtasks for client review
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
                  />
                ))
              )}
            </div>
          </div>
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

export default ClientReview;
