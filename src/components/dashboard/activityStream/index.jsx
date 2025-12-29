import React, { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useGetRecentActivities } from "../../../api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FaFilter,
  FaProjectDiagram,
  FaClock,
  FaTasks,
  FaFileAlt,
  FaPlus,
  FaSync,
} from "react-icons/fa";

const ActivityStream = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: activitiesData,
    isLoading,
    refetch,
    dataUpdatedAt,
    isFetching,
  } = useGetRecentActivities(12, selectedFilter);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      // Also invalidate the query to ensure fresh data
      await queryClient.invalidateQueries(["recentActivities"]);
    } catch (error) {
      console.error("Failed to refresh activities:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle window focus to refresh data when user comes back to tab
  useEffect(() => {
    const handleWindowFocus = () => {
      // Only refetch if the data is stale (older than 30 seconds)
      const thirtySecondsAgo = Date.now() - 30 * 1000;
      if (dataUpdatedAt < thirtySecondsAgo) {
        refetch();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [refetch, dataUpdatedAt]);

  const filterOptions = [
    { value: "all", label: "All Activities", icon: FaFilter },
    { value: "time_log", label: "Time Logs", icon: FaClock },
    { value: "task_update", label: "Task Changes", icon: FaTasks },
    { value: "subtask_update", label: "Subtask Changes", icon: FaTasks },
    { value: "project", label: "Projects", icon: FaProjectDiagram },
    { value: "attachments", label: "File Uploads", icon: FaFileAlt },
  ];

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
            {activity.attachments?.length || 1} files
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
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const isToday =
      format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    if (isToday) {
      return format(date, "h:mm a");
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  if (isLoading) {
    return (
      <div className="flex mt-5 h-[450px] flex-col relative col-span-2 mb-3 bg-white pt-5 pb-10 px-4 rounded-3xl">
        <h4 className="font-semibold text-lg text-gray-800">Activity Stream</h4>
        <div className="flex h-full gap-y-6 overflow-y-auto flex-col mt-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex gap-x-3 mb-3">
                <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
                <div className="flex flex-col flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl mb-3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activities = activitiesData?.data || [];

  return (
    <div className="flex mt-5 h-[450px] flex-col relative col-span-2 mb-3 bg-white pt-5 pb-10 px-4 rounded-3xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <h4 className="font-semibold text-lg text-gray-800">
            Activity Stream
          </h4>
          <div
            className="text-[10px] text-gray-500 mr-2 flex items-center gap-1 cursor-help"
            title={`Last updated: ${
              dataUpdatedAt ? formatTimeAgo(dataUpdatedAt) : "Never"
            }. Auto-refreshes every 3 minutes.`}
          >
            <span>
              Updated {dataUpdatedAt ? formatTimeAgo(dataUpdatedAt) : "Never"}
            </span>
            {isFetching && !isLoading && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
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
              className={`w-3 h-3 ${
                isRefreshing || isFetching ? "animate-spin" : ""
              }`}
            />
          </button>
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex h-full gap-y-6 overflow-y-auto flex-col">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm text-center">No recent activities</p>
            <p className="text-xs text-center mt-1">
              Activities will appear here when team members work on projects
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id || index} className="flex flex-col gap-y-3">
              <div className="flexStart gap-x-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {activity.user.profileImage ? (
                    <img
                      src={activity.user.profileImage}
                      alt={`${activity.user.firstName} ${activity.user.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="22" fill="%23E5E7EB"/><text x="22" y="28" text-anchor="middle" font-size="16" font-family="Arial" fill="%236B7280">${
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
                  <h5 className="font-medium text-gray-800">
                    {activity.user.firstName} {activity.user.lastName}
                  </h5>
                  <span className="text-xs text-[#91929E]">
                    {activity.user.position || "Team Member"}
                  </span>
                  <span className="text-xs text-[#91929E] mt-1">
                    • {formatDateTime(activity.timestamp)}
                    {"   "}
                    <span className="text-gray-400 bg-slate-50 rounded-xl px-2 py-0.5">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </span>
                </div>
              </div>

              <div
                className={`flexStart ${getActivityColor(
                  activity
                )} rounded-xl p-4 gap-x-4`}
              >
                <img
                  src={getActivityIcon(activity)}
                  alt=""
                  className="w-5 flex-shrink-0"
                />
                <div className="flex flex-col flex-1">
                  <p className="text-[#0A1629] text-sm">
                    {getActivityMessage(activity)}
                  </p>

                  {/* Project context */}
                  {activity.task?.project && (
                    <p className="text-xs text-[#91929E] mt-1">
                      Project: {activity.task.project.name}
                    </p>
                  )}

                  {/* Subtask context */}
                  {activity.action === "subtask_change" &&
                    activity.parentTask && (
                      <p className="text-xs text-[#91929E] mt-1">
                        Parent Task: {activity.parentTask.title} • Project:{" "}
                        {activity.project?.name}
                      </p>
                    )}

                  {/* Project details for project activities */}
                  {activity.project && !activity.parentTask && (
                    <p className="text-xs text-[#91929E] mt-1">
                      Priority: {activity.project.priority} • Status:{" "}
                      {activity.project.status}
                    </p>
                  )}

                  {/* Time log description */}
                  {activity.action === "logged_time" &&
                    activity.description && (
                      <p className="text-xs text-[#91929E] mt-1 italic">
                        "{activity.description}"
                      </p>
                    )}

                  {/* File attachment details */}
                  {activity.action === "file_attachment" &&
                    activity.attachments && (
                      <div className="mt-2">
                        <p className="text-xs text-[#91929E] mb-1">Files:</p>
                        <div className="flex flex-wrap gap-1">
                          {activity.attachments.slice(0, 3).map((file, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white px-2 py-1 rounded border"
                            >
                              {file.title || `File ${idx + 1}`}
                            </span>
                          ))}
                          {activity.attachments.length > 3 && (
                            <span className="text-xs text-[#91929E]">
                              +{activity.attachments.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Activity badge */}
                  <div className="flex items-center gap-x-2 mt-2">
                    {getActivityBadge(activity)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <button
          className="absolute text-sm text-[#3F8CFF] bottom-3 cursor-pointer left-0 right-0 mx-auto hover:underline"
          onClick={() => navigate("/activity-stream")}
        >
          View more ({activitiesData?.total || activities.length} total)
        </button>
      )}
    </div>
  );
};

export default ActivityStream;
