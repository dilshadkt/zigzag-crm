import React, { useState } from "react";
import Header from "../../components/shared/header";
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../api/hooks";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/shared/buttons/primaryButton";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // all, unread, task_assigned, message, etc.
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useGetNotifications(limit * page);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;
  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return "/icons/task.svg";
      case "message":
        return "/icons/message.svg";
      case "task_updated":
        return "/icons/update.svg";
      case "deadline_reminder":
        return "/icons/clock.svg";
      case "project_update":
        return "/icons/project.svg";
      case "comment":
        return "/icons/comment.svg";
      default:
        return "/icons/alert.svg";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "task_assigned":
        return "bg-blue-100 text-blue-600";
      case "message":
        return "bg-green-100 text-green-600";
      case "task_updated":
        return "bg-purple-100 text-purple-600";
      case "deadline_reminder":
        return "bg-red-100 text-red-600";
      case "project_update":
        return "bg-yellow-100 text-yellow-600";
      case "comment":
        return "bg-indigo-100 text-indigo-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "task_assigned":
      case "task_updated":
      case "deadline_reminder":
      case "comment":
        if (notification.data?.taskId) {
          navigate(
            `/projects/${notification.data.projectName}/${notification.data.taskId}`
          );
        }
        break;
      case "message":
        if (notification.data?.conversationId) {
          navigate(
            `/messenger?conversation=${notification.data.conversationId}`
          );
        } else {
          navigate("/messenger");
        }
        break;
      case "project_update":
        if (notification.data?.projectId) {
          navigate(`/projects/${notification.data.projectId}`);
        }
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const filterOptions = [
    { value: "all", label: "All", count: notifications.length },
    { value: "unread", label: "Unread", count: unreadCount },
    {
      value: "task_assigned",
      label: "Task Assignments",
      count: notifications.filter((n) => n.type === "task_assigned").length,
    },
    {
      value: "message",
      label: "Messages",
      count: notifications.filter((n) => n.type === "message").length,
    },
    {
      value: "deadline_reminder",
      label: "Deadlines",
      count: notifications.filter((n) => n.type === "deadline_reminder").length,
    },
    {
      value: "task_updated",
      label: "Task Updates",
      count: notifications.filter((n) => n.type === "task_updated").length,
    },
    {
      value: "project_update",
      label: "Project Updates",
      count: notifications.filter((n) => n.type === "project_update").length,
    },
    {
      value: "comment",
      label: "Comments",
      count: notifications.filter((n) => n.type === "comment").length,
    },
  ];

  return (
    <section className="flex flex-col gap-y-4 w-full h-full">
      <Header>Notifications</Header>

      <div className="bg-white rounded-2xl p-6 flex-1 flex flex-col">
        {/* Header with actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-x-4">
            <h2 className=" font-semibold text-gray-900">All Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm rounded-full px-3 py-1 font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-x-3">
            {unreadCount > 0 && (
              <PrimaryButton
                onclick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                {markAllAsReadMutation.isLoading
                  ? "Marking..."
                  : "Mark all as read"}
              </PrimaryButton>
            )}
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              disabled={isLoading}
            >
              <img
                src="/icons/refresh.svg"
                alt="Refresh"
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                onError={(e) => {
                  e.target.textContent = "↻";
                }}
              />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === option.value
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      filter === option.value
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border ${
                    !notification.read
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="flex gap-x-4">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {notification.data?.senderImage ||
                        notification.data?.assignedBy?.profileImage ||
                        notification.data?.updatedBy?.profileImage ? (
                          <img
                            src={
                              notification.data?.senderImage ||
                              notification.data?.assignedBy?.profileImage ||
                              notification.data?.updatedBy?.profileImage
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={getNotificationIcon(notification.type)}
                            alt=""
                            className="w-6 h-6"
                          />
                        )}
                      </div>
                      {!notification.read && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>

                      {/* Additional context */}
                      <div className="flex items-center gap-x-2">
                        {notification.type === "task_assigned" &&
                          notification.data?.projectName && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              📁 {notification.data.projectName}
                            </span>
                          )}

                        {notification.type === "deadline_reminder" && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            ⏰ Urgent
                          </span>
                        )}

                        {notification.data?.priority && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              notification.data.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : notification.data.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {notification.data.priority} priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <img
                src="/icons/bell-off.svg"
                alt="No notifications"
                className="w-16 h-16 opacity-40 mb-4"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {filter === "all"
                  ? "No notifications yet"
                  : `No ${filter.replace("_", " ")} notifications`}
              </h3>
              <p className="text-sm text-gray-500">
                {filter === "all"
                  ? "When you get notifications about tasks, messages, and updates, they'll appear here."
                  : `You don't have any ${filter.replace(
                      "_",
                      " "
                    )} notifications at the moment.`}
              </p>
            </div>
          )}
        </div>

        {/* Load more button */}
        {filteredNotifications.length > 0 &&
          filteredNotifications.length >= limit && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setPage(page + 1)}
                className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load more notifications"}
              </button>
            </div>
          )}
      </div>
    </section>
  );
};

export default NotificationsPage;
