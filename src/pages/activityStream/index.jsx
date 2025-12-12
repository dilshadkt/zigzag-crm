import React, { useState, useEffect } from "react";
import {
  format,
  formatDistanceToNow,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useGetRecentActivities } from "../../api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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

  // State for filters
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, yesterday, week, month, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [limit, setLimit] = useState(50); // Show more activities

  const {
    data: activitiesData,
    isLoading,
    refetch,
    dataUpdatedAt,
    isFetching,
  } = useGetRecentActivities(limit, selectedFilter);

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
          <div className="bg-white px-2 py-1 rounded-md text-xs text-[#7D8592] border">
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
            className={`bg-white px-2 py-1 rounded-md text-xs border ${changeColorClass}`}
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
            className={`bg-white px-2 py-1 rounded-md text-xs border ${subTaskChangeColorClass}`}
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
          <div className="bg-white px-2 py-1 rounded-md text-xs text-purple-600 border border-purple-200">
            🆕 New Project
          </div>
        );
      case "project_updated":
        return (
          <div className="bg-white px-2 py-1 rounded-md text-xs text-indigo-600 border border-indigo-200">
            📊 {activity.project.progress || 0}%
          </div>
        );
      case "file_attachment":
        return (
          <div className="bg-white px-2 py-1 rounded-md text-xs text-orange-600 border border-orange-200">
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
            className={`bg-white px-2 py-1 rounded-md text-xs border ${colorClass}`}
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

    switch (dateFilter) {
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
        if (!customStartDate || !customEndDate) return activities;
        const startDate = startOfDay(new Date(customStartDate));
        const endDate = endOfDay(new Date(customEndDate));
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
    if (!searchTerm.trim()) return activities;

    const searchLower = searchTerm.toLowerCase();
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

  const activities = activitiesData?.data || [];
  const filteredByDate = filterActivitiesByDate(activities);
  const filteredBySearch = filterActivitiesBySearch(filteredByDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Activity Stream
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <span>
                  Updated{" "}
                  {dataUpdatedAt ? formatTimeAgo(dataUpdatedAt) : "Never"}
                </span>
                {isFetching && !isLoading && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-lg border transition-colors ${
                  isRefreshing
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
                title="Refresh activities"
              >
                <FaSync
                  className={`w-4 h-4 ${
                    isRefreshing || isFetching ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Activity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {dateFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            {dateFilter === "custom" && (
              <div className="md:col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by user, task, project, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredBySearch.length} of {activities.length}{" "}
              activities
            </div>
            <div className="text-sm text-gray-600">
              {dateFilter !== "all" && (
                <span className="inline-flex items-center gap-1">
                  <FaCalendar className="w-3 h-3" />
                  {
                    dateFilterOptions.find((opt) => opt.value === dateFilter)
                      ?.label
                  }
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex gap-4 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex flex-col flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-16 bg-gray-200 rounded-xl mb-4"></div>
              </div>
            ))}
          </div>
        ) : filteredBySearch.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No activities found
            </h3>
            <p className="text-gray-600">
              {searchTerm || dateFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "No activities have been recorded yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBySearch.map((activity, index) => (
              <div
                key={activity.id || index}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {activity.user.profileImage ? (
                      <img
                        src={activity.user.profileImage}
                        alt={`${activity.user.firstName} ${activity.user.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="24" fill="%23E5E7EB"/><text x="24" y="30" text-anchor="middle" font-size="18" font-family="Arial" fill="%236B7280">${
                            activity.user.firstName?.charAt(0) || "?"
                          }</text></svg>`;
                        }}
                      />
                    ) : (
                      <span className="text-gray-600 font-medium text-lg">
                        {activity.user.firstName?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900">
                        {activity.user.firstName} {activity.user.lastName}
                      </h5>
                      <span className="text-sm text-gray-500">
                        {activity.user.position || "Team Member"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </div>
                  </div>
                  {getActivityBadge(activity)}
                </div>

                <div
                  className={`flex items-start ${getActivityColor(
                    activity
                  )} rounded-xl p-4 gap-4`}
                >
                  <img
                    src={getActivityIcon(activity)}
                    alt=""
                    className="w-6 h-6 flex-shrink-0 mt-1"
                  />
                  <div className="flex flex-col flex-1">
                    <p className="text-gray-900 font-medium">
                      {getActivityMessage(activity)}
                    </p>

                    {/* Project context */}
                    {activity.task?.project && (
                      <p className="text-sm text-gray-600 mt-1">
                        Project: {activity.task.project.name}
                      </p>
                    )}

                    {/* Subtask context */}
                    {activity.action === "subtask_change" &&
                      activity.parentTask && (
                        <p className="text-sm text-gray-600 mt-1">
                          Parent Task: {activity.parentTask.title} • Project:{" "}
                          {activity.project?.name}
                        </p>
                      )}

                    {/* Project details for project activities */}
                    {activity.project && !activity.parentTask && (
                      <p className="text-sm text-gray-600 mt-1">
                        Priority: {activity.project.priority} • Status:{" "}
                        {activity.project.status}
                      </p>
                    )}

                    {/* Time log description */}
                    {activity.action === "logged_time" &&
                      activity.description && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{activity.description}"
                        </p>
                      )}

                    {/* File attachment details */}
                    {activity.action === "file_attachment" &&
                      activity.attachments && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Files:</p>
                          <div className="flex flex-wrap gap-2">
                            {activity.attachments.map((file, idx) => (
                              <span
                                key={idx}
                                className="text-sm bg-white px-3 py-1 rounded-lg border"
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
                      <div className="mt-3 p-3 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Change Details:</strong>
                        </div>
                        {activity.oldValue && activity.newValue && (
                          <div className="text-sm">
                            <span className="text-red-600 line-through">
                              {activity.oldValue}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600">
                              {activity.newValue}
                            </span>
                          </div>
                        )}
                        {activity.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredBySearch.length > 0 &&
          filteredBySearch.length < activities.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setLimit((prev) => prev + 25)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
