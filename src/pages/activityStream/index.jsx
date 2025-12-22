import React, { useState, useEffect } from "react";
import {
  format,
  formatDistanceToNow,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useGetRecentActivities, useCompanyProjects } from "../../api/hooks";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import apiClient from "../../api/client";
import ActivityStreamFilterDrawer from "../../components/activityStream/ActivityStreamFilterDrawer";
import ActivityStreamQuickFilters from "../../components/activityStream/ActivityStreamQuickFilters";
import {
  FaFilter,
  FaProjectDiagram,
  FaClock,
  FaTasks,
  FaFileAlt,
  FaSync,
  FaCalendar,
  FaSearch,
  FaArrowLeft,
} from "react-icons/fa";

const ActivityStreamPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { companyId } = useAuth();

  // State for filters
  const [filters, setFilters] = useState({
    type: "all",
    dateFilter: "all",
    customStartDate: "",
    customEndDate: "",
    searchTerm: "",
    employees: [],
    projects: [],
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [limit, setLimit] = useState(50); // Show more activities

  // Get employees for filter
  const { data: employees = [] } = useQuery({
    queryKey: ["companyEmployees"],
    queryFn: async () => {
      const response = await apiClient.get("/chat/employees");
      return response.data || [];
    },
    enabled: !!companyId,
  });

  // Get projects for filter
  const { data: projects = [] } = useCompanyProjects(companyId, 0);

  const {
    data: activitiesData,
    isLoading,
    refetch,
    dataUpdatedAt,
    isFetching,
  } = useGetRecentActivities(
    limit,
    filters.type,
    filters.employees.length > 0 ? filters.employees : null,
    filters.projects.length > 0 ? filters.projects : null
  );

  const filterOptions = [
    { value: "all", label: "All Activities", icon: FaFilter },
    { value: "time_log", label: "Time Logs", icon: FaClock },
    { value: "task_update", label: "Task Changes", icon: FaTasks },
    { value: "subtask_update", label: "Subtask Changes", icon: FaTasks },
    { value: "project", label: "Projects", icon: FaProjectDiagram },
    { value: "attachments", label: "File Uploads", icon: FaFileAlt },
  ];

  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      await queryClient.invalidateQueries(["recentActivities"]);
    } catch (error) {
      console.error("Failed to refresh activities:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getActivityIcon = (activity) => {
    switch (activity.action) {
      case "logged_time":
        return "/icons/clock.svg";
      case "task_change":
        return "/icons/upload.svg";
      case "task_update":
        return "/icons/upload.svg";
      case "subtask_change":
        return "/icons/assignment.svg";
      case "project_created":
        return "/icons/add.svg";
      case "project_updated":
        return "/icons/edit.svg";
      case "file_attachment":
        return "/icons/file.svg";
      default:
        return "/icons/clock.svg";
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.action) {
      case "logged_time":
        return `Logged ${activity.duration} minutes on "${activity.task.title}" task`;
      case "task_change":
        return activity.description || `Updated task "${activity.task.title}"`;
      case "task_update":
        const statusText =
          {
            todo: "To Do",
            "in-progress": "In Progress",
            completed: "Completed",
          }[activity.task.status] || activity.task.status;
        return `Updated "${activity.task.title}" status to ${statusText}`;
      case "project_created":
        return `Created new project "${activity.project.name}"`;
      case "project_updated":
        return `Updated project "${activity.project.name}" (${
          activity.project.progress || 0
        }% complete)`;
      case "subtask_change":
        return (
          activity.description ||
          `Updated subtask "${activity.subTask?.title || "Unknown"}"`
        );
      case "file_attachment":
        return `Added ${activity.attachments?.length || 1} file(s) to "${
          activity.task.title
        }"`;
      default:
        return activity.description || "Performed an action";
    }
  };

  const getActivityColor = (activity) => {
    switch (activity.action) {
      case "logged_time":
        return "bg-[#F4F9FD]";
      case "task_change":
        if (activity.changeType === "status_change") {
          if (activity.newValue === "completed") {
            return "bg-green-50";
          } else if (activity.newValue === "in-progress") {
            return "bg-blue-50";
          }
          return "bg-amber-50";
        } else if (activity.changeType === "created") {
          return "bg-green-50";
        } else if (activity.changeType === "deleted") {
          return "bg-red-50";
        }
        return "bg-blue-50";
      case "task_update":
        if (activity.task.status === "completed") {
          return "bg-green-50";
        } else if (activity.task.status === "in-progress") {
          return "bg-blue-50";
        }
        return "bg-amber-50";
      case "project_created":
        return "bg-purple-50";
      case "project_updated":
        return "bg-indigo-50";
      case "subtask_change":
        if (activity.changeType === "status_change") {
          if (activity.newValue === "completed") {
            return "bg-green-50";
          } else if (activity.newValue === "in-progress") {
            return "bg-blue-50";
          }
          return "bg-amber-50";
        } else if (activity.changeType === "created") {
          return "bg-green-50";
        } else if (activity.changeType === "deleted") {
          return "bg-red-50";
        }
        return "bg-teal-50";
      case "file_attachment":
        return "bg-orange-50";
      default:
        return "bg-[#F4F9FD]";
    }
  };

  const getActivityBadge = (activity) => {
    switch (activity.action) {
      case "logged_time":
        return (
          <div className="bg-white px-1.5 py-0.5 rounded text-[10px] text-[#7D8592] border">
            ⏱️ {activity.duration} min
          </div>
        );
      case "task_change":
        const changeTypeColors = {
          status_change: "text-blue-600 border-blue-200",
          priority_change: "text-purple-600 border-purple-200",
          due_date_change: "text-orange-600 border-orange-200",
          assignment_change: "text-indigo-600 border-indigo-200",
          title_change: "text-teal-600 border-teal-200",
          description_change: "text-cyan-600 border-cyan-200",
          attachments_change: "text-pink-600 border-pink-200",
          time_estimate_change: "text-yellow-600 border-yellow-200",
          created: "text-green-600 border-green-200",
          deleted: "text-red-600 border-red-200",
        };
        const changeColorClass =
          changeTypeColors[activity.changeType] ||
          "text-gray-600 border-gray-200";
        return (
          <div
            className={`bg-white px-1.5 py-0.5 rounded text-[10px] border ${changeColorClass}`}
          >
            {activity.changeType === "created" && "🆕"}
            {activity.changeType === "deleted" && "🗑️"}
            {activity.changeType === "status_change" && "🔄"}
            {activity.changeType === "priority_change" && "⚡"}
            {activity.changeType === "due_date_change" && "📅"}
            {activity.changeType === "assignment_change" && "👤"}
            {activity.changeType === "title_change" && "✏️"}
            {activity.changeType === "description_change" && "📝"}
            {activity.changeType === "attachments_change" && "📎"}
            {activity.changeType === "time_estimate_change" && "⏱️"}
            {activity.changeTypeLabel}
          </div>
        );
      case "subtask_change":
        const subTaskChangeTypeColors = {
          status_change: "text-blue-600 border-blue-200",
          priority_change: "text-purple-600 border-purple-200",
          due_date_change: "text-orange-600 border-orange-200",
          assignment_change: "text-indigo-600 border-indigo-200",
          title_change: "text-teal-600 border-teal-200",
          description_change: "text-cyan-600 border-cyan-200",
          attachments_change: "text-pink-600 border-pink-200",
          time_estimate_change: "text-yellow-600 border-yellow-200",
          created: "text-green-600 border-green-200",
          deleted: "text-red-600 border-red-200",
        };
        const subTaskChangeColorClass =
          subTaskChangeTypeColors[activity.changeType] ||
          "text-gray-600 border-gray-200";
        return (
          <div
            className={`bg-white px-1.5 py-0.5 rounded text-[10px] border ${subTaskChangeColorClass}`}
          >
            {activity.changeType === "created" && "🆕"}
            {activity.changeType === "deleted" && "🗑️"}
            {activity.changeType === "status_change" && "🔄"}
            {activity.changeType === "priority_change" && "⚡"}
            {activity.changeType === "due_date_change" && "📅"}
            {activity.changeType === "assignment_change" && "👤"}
            {activity.changeType === "title_change" && "✏️"}
            {activity.changeType === "description_change" && "📝"}
            {activity.changeType === "attachments_change" && "📎"}
            {activity.changeType === "time_estimate_change" && "⏱️"}
            {activity.changeTypeLabel}
          </div>
        );
      case "project_created":
        return (
          <div className="bg-white px-1.5 py-0.5 rounded text-[10px] text-purple-600 border border-purple-200">
            🆕 New Project
          </div>
        );
      case "project_updated":
        return (
          <div className="bg-white px-1.5 py-0.5 rounded text-[10px] text-indigo-600 border border-indigo-200">
            📊 {activity.project.progress || 0}%
          </div>
        );
      case "file_attachment":
        return (
          <div className="bg-white px-1.5 py-0.5 rounded text-[10px] text-orange-600 border border-orange-200">
            📎 {activity.attachments?.length || 1} files
          </div>
        );
      case "task_update":
        const statusColors = {
          completed: "text-green-600 border-green-200",
          "in-progress": "text-blue-600 border-blue-200",
          todo: "text-amber-600 border-amber-200",
        };
        const colorClass =
          statusColors[activity.task.status] || "text-gray-600 border-gray-200";
        return (
          <div
            className={`bg-white px-1.5 py-0.5 rounded text-[10px] border ${colorClass}`}
          >
            🔄 {activity.task.status}
          </div>
        );
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const formatDateTime = (timestamp) => {
    return format(new Date(timestamp), "MMM dd, yyyy 'at' h:mm a");
  };

  // Filter activities based on date filter
  const filterActivitiesByDate = (activities) => {
    if (!activities) return [];

    const now = new Date();

    switch (filters.dateFilter) {
      case "today":
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        return activities.filter((activity) => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= todayStart && activityDate <= todayEnd;
        });

      case "yesterday":
        const yesterday = subDays(now, 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);
        return activities.filter((activity) => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= yesterdayStart && activityDate <= yesterdayEnd;
        });

      case "week":
        const weekAgo = subDays(now, 7);
        return activities.filter((activity) => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= weekAgo;
        });

      case "month":
        const monthAgo = subDays(now, 30);
        return activities.filter((activity) => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= monthAgo;
        });

      case "custom":
        if (!filters.customStartDate || !filters.customEndDate)
          return activities;
        const startDate = startOfDay(new Date(filters.customStartDate));
        const endDate = endOfDay(new Date(filters.customEndDate));
        return activities.filter((activity) => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= startDate && activityDate <= endDate;
        });

      default:
        return activities;
    }
  };

  // Filter activities based on search term
  const filterActivitiesBySearch = (activities) => {
    if (!filters.searchTerm.trim()) return activities;

    const searchLower = filters.searchTerm.toLowerCase();
    return activities.filter((activity) => {
      // Search in user names
      const userName =
        `${activity.user.firstName} ${activity.user.lastName}`.toLowerCase();
      if (userName.includes(searchLower)) return true;

      // Search in task titles
      if (activity.task?.title?.toLowerCase().includes(searchLower))
        return true;

      // Search in subtask titles
      if (activity.subTask?.title?.toLowerCase().includes(searchLower))
        return true;

      // Search in project names
      if (activity.project?.name?.toLowerCase().includes(searchLower))
        return true;

      // Search in descriptions
      if (activity.description?.toLowerCase().includes(searchLower))
        return true;

      return false;
    });
  };

  // Filter activities by employee
  const filterActivitiesByEmployee = (activities) => {
    if (!filters.employees || filters.employees.length === 0) return activities;

    return activities.filter((activity) => {
      const userId = activity.user?.id || activity.user?._id;
      return filters.employees.includes(userId);
    });
  };

  // Filter activities by project
  const filterActivitiesByProject = (activities) => {
    if (!filters.projects || filters.projects.length === 0) return activities;

    return activities.filter((activity) => {
      const projectId =
        activity.project?.id ||
        activity.project?._id ||
        activity.task?.project?.id ||
        activity.task?.project?._id;
      return filters.projects.includes(projectId);
    });
  };

  const activities = activitiesData?.data || [];
  const filteredByDate = filterActivitiesByDate(activities);
  const filteredByEmployee = filterActivitiesByEmployee(filteredByDate);
  const filteredByProject = filterActivitiesByProject(filteredByEmployee);
  const filteredBySearch = filterActivitiesBySearch(filteredByProject);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle quick filter changes
  const handleQuickFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hasActiveFilters = () => {
    return (
      filters.type !== "all" ||
      filters.dateFilter !== "all" ||
      filters.customStartDate ||
      filters.customEndDate ||
      filters.searchTerm ||
      filters.employees.length > 0 ||
      filters.projects.length > 0
    );
  };

  // Handle activity click navigation
  const handleActivityClick = (activity) => {
    // For subtask changes, navigate to parent task
    if (activity.action === "subtask_change" && activity.parentTask) {
      const parentTaskId = activity.parentTask._id || activity.parentTask.id;
      const projectId =
        activity.project?._id ||
        activity.project?.id ||
        activity.subTask?.project?._id ||
        activity.subTask?.project?.id;

      if (parentTaskId) {
        if (projectId) {
          navigate(`/projects/${projectId}/${parentTaskId}`);
        } else {
          navigate(`/tasks/${parentTaskId}`);
        }
      }
      return;
    }

    // For task-related activities (task_change, logged_time, file_attachment, task_update)
    if (activity.task) {
      const taskId = activity.task._id || activity.task.id;
      const projectId =
        activity.task.project?._id ||
        activity.task.project?.id ||
        activity.project?._id ||
        activity.project?.id;

      if (taskId) {
        if (projectId) {
          navigate(`/projects/${projectId}/${taskId}`);
        } else {
          navigate(`/tasks/${taskId}`);
        }
      }
      return;
    }

    // For project activities (project_created, project_updated), navigate to project details
    if (
      (activity.action === "project_created" ||
        activity.action === "project_updated") &&
      activity.project
    ) {
      const projectId =
        activity.project._id ||
        activity.project.id ||
        (typeof activity.project === "string" ? activity.project : null);
      if (projectId) {
        navigate(`/projects/${projectId}`);
      }
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                Activity Stream
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>
                  Updated{" "}
                  {dataUpdatedAt ? formatTimeAgo(dataUpdatedAt) : "Never"}
                </span>
                {isFetching && !isLoading && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  hasActiveFilters()
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
                title="Filter activities"
              >
                <FaFilter className="w-3.5 h-3.5" />
                {hasActiveFilters() && (
                  <span className="bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {[
                      filters.type !== "all" ? 1 : 0,
                      filters.dateFilter !== "all" ? 1 : 0,
                      filters.customStartDate ? 1 : 0,
                      filters.customEndDate ? 1 : 0,
                      filters.searchTerm ? 1 : 0,
                      filters.employees.length,
                      filters.projects.length,
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isRefreshing
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
                title="Refresh activities"
              >
                <FaSync
                  className={`w-3.5 h-3.5 ${
                    isRefreshing || isFetching ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters Bar - Sticky */}
      <div className="sticky top-12 z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ActivityStreamQuickFilters
            filters={filters}
            onFilterChange={handleQuickFilterChange}
            employees={employees}
            projects={projects || []}
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing {filteredBySearch.length} of {activities.length}{" "}
              activities
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              {filters.type !== "all" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                  {
                    filterOptions.find((opt) => opt.value === filters.type)
                      ?.label
                  }
                </span>
              )}
              {filters.dateFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                  <FaCalendar className="w-2.5 h-2.5" />
                  {
                    dateFilterOptions.find(
                      (opt) => opt.value === filters.dateFilter
                    )?.label
                  }
                </span>
              )}
              {filters.employees.length > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {filters.employees.length} employee
                  {filters.employees.length > 1 ? "s" : ""}
                </span>
              )}
              {filters.projects.length > 0 && (
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                  {filters.projects.length} project
                  {filters.projects.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <ActivityStreamFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        employees={employees}
        projects={projects || []}
      />

      {/* Activities List */}
      <div className="w-full py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex flex-col flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-1 w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-12 bg-gray-200 rounded-lg mb-3"></div>
              </div>
            ))}
          </div>
        ) : filteredBySearch.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              No activities found
            </h3>
            <p className="text-sm text-gray-600">
              {filters.searchTerm ||
              filters.dateFilter !== "all" ||
              filters.employees.length > 0 ||
              filters.projects.length > 0
                ? "Try adjusting your filters or search terms"
                : "No activities have been recorded yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBySearch.map((activity, index) => {
              // Determine if activity is clickable (has task, subtask with parent, or project)
              const isClickable =
                (activity.task && (activity.task._id || activity.task.id)) ||
                (activity.action === "subtask_change" &&
                  activity.parentTask &&
                  (activity.parentTask._id || activity.parentTask.id)) ||
                ((activity.action === "project_created" ||
                  activity.action === "project_updated") &&
                  activity.project &&
                  (activity.project._id || activity.project.id));

              return (
                <div
                  key={activity.id || index}
                  onClick={() => isClickable && handleActivityClick(activity)}
                  className={`bg-white rounded-lg border border-gray-200 p-3 ${
                    isClickable
                      ? "cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {activity.user.profileImage ? (
                        <img
                          src={activity.user.profileImage}
                          alt={`${activity.user.firstName} ${activity.user.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="16" fill="%23E5E7EB"/><text x="16" y="20" text-anchor="middle" font-size="12" font-family="Arial" fill="%236B7280">${
                              activity.user.firstName?.charAt(0) || "?"
                            }</text></svg>`;
                          }}
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">
                          {activity.user.firstName?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h5 className="font-medium text-sm text-gray-900 truncate">
                          {activity.user.firstName} {activity.user.lastName}
                        </h5>
                        <span className="text-xs text-gray-500 truncate">
                          {activity.user.position || "Team Member"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(activity.timestamp)}
                      </div>
                    </div>
                    {getActivityBadge(activity)}
                  </div>

                  <div
                    className={`flex items-start ${getActivityColor(
                      activity
                    )} rounded-lg p-2.5 gap-2.5`}
                  >
                    <img
                      src={getActivityIcon(activity)}
                      alt=""
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {getActivityMessage(activity)}
                      </p>

                      {/* Project context */}
                      {activity.task?.project && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          Project: {activity.task.project.name}
                        </p>
                      )}

                      {/* Subtask context */}
                      {activity.action === "subtask_change" &&
                        activity.parentTask && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            Parent Task: {activity.parentTask.title} • Project:{" "}
                            {activity.project?.name}
                          </p>
                        )}

                      {/* Project details for project activities */}
                      {activity.project && !activity.parentTask && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          Priority: {activity.project.priority} • Status:{" "}
                          {activity.project.status}
                        </p>
                      )}

                      {/* Time log description */}
                      {activity.action === "logged_time" &&
                        activity.description && (
                          <p className="text-xs text-gray-600 mt-1.5 italic">
                            "{activity.description}"
                          </p>
                        )}

                      {/* File attachment details */}
                      {activity.action === "file_attachment" &&
                        activity.attachments && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1.5">
                              Files:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {activity.attachments.map((file, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-white px-2 py-0.5 rounded border"
                                >
                                  {file.title || `File ${idx + 1}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Change details for task/subtask changes */}
                      {(activity.action === "task_change" ||
                        activity.action === "subtask_change") && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <div className="text-xs text-gray-600 mb-1.5">
                            <strong>Change Details:</strong>
                          </div>
                          {activity.oldValue && activity.newValue && (
                            <div className="text-xs">
                              <span className="text-red-600 line-through">
                                {activity.oldValue}
                              </span>
                              <span className="mx-1.5">→</span>
                              <span className="text-green-600">
                                {activity.newValue}
                              </span>
                            </div>
                          )}
                          {activity.description && (
                            <div className="text-xs text-gray-600 mt-1">
                              {activity.description}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredBySearch.length > 0 &&
          filteredBySearch.length < activities.length && (
            <div className="text-center mt-4">
              <button
                onClick={() => setLimit((prev) => prev + 25)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load More Activities
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default ActivityStreamPage;
