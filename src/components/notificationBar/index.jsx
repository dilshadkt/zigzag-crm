import React, { useEffect } from "react";
import PrimaryButton from "../shared/buttons/primaryButton";
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../api/hooks";
import { useNavigate } from "react-router-dom";

const NotificationBar = ({ setNotifyMenuOpen }) => {
  const navigate = useNavigate();
  const { data: notificationsData, isLoading } = useGetNotifications(10);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

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

    setNotifyMenuOpen(false);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  return (
    <div
      className="fixed left-0 font-normal right-0 bottom-0 flexEnd py-4 px-5 top-0 m-auto bg-[#2155A3]/20
     z-[1000] backdrop-blur-sm"
    >
      <div className="w-[420px] flex flex-col bg-white rounded-3xl overflow-hidden h-full">
        <div className="h-[85px] border-b border-[#E4E6E8] px-[26px] w-full flexCenter">
          <div className="flexBetween w-full">
            <div className="flex items-center gap-x-3">
              <h3 className="font-medium text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  disabled={markAllAsReadMutation.isLoading}
                >
                  Mark all read
                </button>
              )}
              <PrimaryButton
                onclick={() => setNotifyMenuOpen(false)}
                icon={"/icons/cancel.svg"}
                className={"bg-[#F4F9FD]"}
              />
            </div>
          </div>
        </div>

        <div className="h-full flex flex-col overflow-y-auto mb-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex px-[26px] border-[#E4E6E8] gap-x-3 py-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center ${getNotificationColor(
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

                <div className="flex flex-col gap-y-1 flex-1">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </span>
                    <span className="text-xs text-[#7D8592] whitespace-nowrap ml-2">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-[#7D8592] line-clamp-2">
                    {notification.message}
                  </p>

                  {/* Additional context based on notification type */}
                  {notification.type === "task_assigned" &&
                    notification.data?.projectName && (
                      <div className="flex items-center gap-x-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {notification.data.projectName}
                        </span>
                      </div>
                    )}

                  {notification.type === "deadline_reminder" && (
                    <div className="flex items-center gap-x-2 mt-1">
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        ⏰ Urgent
                      </span>
                    </div>
                  )}

                  {notification.type === "message" &&
                    notification.data?.messagePreview && (
                      <div className="text-xs text-gray-600 italic mt-1 truncate">
                        "{notification.data.messagePreview}"
                      </div>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <img
                src="/icons/bell-off.svg"
                alt="No notifications"
                className="w-16 h-16 opacity-40 mb-4"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <h4 className="text-lg font-medium text-gray-600 mb-2">
                No notifications yet
              </h4>
              <p className="text-sm text-gray-500">
                When you get notifications about tasks, messages, and updates,
                they'll appear here.
              </p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-[#E4E6E8] px-[26px] py-4">
            <button
              onClick={() => {
                navigate("/notifications");
                setNotifyMenuOpen(false);
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBar;
