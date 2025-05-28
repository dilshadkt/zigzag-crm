import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useGetRecentActivities } from "../../../api/hooks";
import {
  FaFilter,
  FaProjectDiagram,
  FaClock,
  FaTasks,
  FaFileAlt,
  FaPlus,
} from "react-icons/fa";

const ActivityStream = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { data: activitiesData, isLoading } = useGetRecentActivities(
    12,
    selectedFilter
  );

  const filterOptions = [
    { value: "all", label: "All Activities", icon: FaFilter },
    { value: "time_log", label: "Time Logs", icon: FaClock },
    { value: "task_update", label: "Task Updates", icon: FaTasks },
    { value: "project", label: "Projects", icon: FaProjectDiagram },
    { value: "attachments", label: "File Uploads", icon: FaFileAlt },
  ];

  const getActivityIcon = (activity) => {
    switch (activity.action) {
      case "logged_time":
        return "/icons/clock.svg";
      case "task_update":
        return "/icons/upload.svg";
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
      <div className="flexBetween mb-4">
        <h4 className="font-semibold text-lg text-gray-800">Activity Stream</h4>
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
                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="22" fill="%23E5E7EB"/><text x="22" y="28" text-anchor="middle" font-size="16" font-family="Arial" fill="%236B7280">${activity.user.firstName.charAt(
                          0
                        )}</text></svg>`;
                      }}
                    />
                  ) : (
                    <span className="text-gray-600 font-medium text-lg">
                      {activity.user.firstName.charAt(0)}
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
                    {formatTimeAgo(activity.timestamp)}
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

                  {/* Project details for project activities */}
                  {activity.project && (
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
          onClick={() => {
            // You can implement a modal or navigate to a full activity page
            console.log("View more activities");
          }}
        >
          View more ({activitiesData?.total || activities.length} total)
        </button>
      )}
    </div>
  );
};

export default ActivityStream;
