import React, { useEffect, useState } from "react";
import PrimaryButton from "../shared/buttons/primaryButton";
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../api/hooks";
import { useNavigate } from "react-router-dom";
import socketService from "../../services/socketService";
import {
  areBrowserNotificationsEnabled,
  disableBrowserNotifications,
  enableBrowserNotifications,
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
} from "../../services/browserNotificationService";

const NotificationBar = ({ setNotifyMenuOpen }) => {
  const navigate = useNavigate();
  const { data: notificationsData, isLoading, refetch } = useGetNotifications(10);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const [desktopPermission, setDesktopPermission] = useState(
    getBrowserNotificationPermission()
  );
  const [desktopEnabled, setDesktopEnabled] = useState(
    areBrowserNotificationsEnabled()
  );
  const [desktopBusy, setDesktopBusy] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };

    socketService.onNewNotification(handleUpdate);
    socketService.onSubtaskAssigned(handleUpdate);

    return () => {
      socketService.offNewNotification(handleUpdate);
      socketService.offSubtaskAssigned(handleUpdate);
    };
  }, [refetch]);

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
      case "project_deadline_reminder":
        return "/icons/clock.svg";
      case "project_update":
        return "/icons/project.svg";
      case "comment":
        return "/icons/comment.svg";
      case "ticket_assigned":
      case "ticket_mentioned":
      case "ticket_comment":
        return "/icons/alert.svg";
      case "meeting":
        return "/icons/alert.svg";
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
      case "project_deadline_reminder":
        return "bg-red-100 text-red-600";
      case "project_update":
        return "bg-yellow-100 text-yellow-600";
      case "comment":
        return "bg-indigo-100 text-indigo-600";
      case "ticket_assigned":
        return "bg-orange-100 text-orange-600";
      case "ticket_mentioned":
        return "bg-violet-100 text-violet-600";
      case "ticket_comment":
        return "bg-teal-100 text-teal-600";
      case "meeting":
        return "bg-blue-100 text-blue-600";
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
            `/projects/${notification.data.projectId}/${notification.data.taskId}`
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
      case "project_deadline_reminder":
        if (notification.data?.projectId) {
          navigate(`/projects/${notification.data.projectId}/edit`);
        }
        break;
      case "ticket_assigned":
      case "ticket_mentioned":
      case "ticket_comment":
        navigate("/tickets");
        break;
      case "meeting":
        navigate("/meetings");
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

  const handleToggleDesktopAlerts = async () => {
    if (!isBrowserNotificationSupported()) return;
    setDesktopBusy(true);
    try {
      if (desktopPermission === "granted" && desktopEnabled) {
        await disableBrowserNotifications();
        setDesktopEnabled(false);
        setDesktopPermission(getBrowserNotificationPermission());
      } else {
        const result = await enableBrowserNotifications();
        setDesktopPermission(result.permission);
        setDesktopEnabled(result.permission === "granted");
      }
    } finally {
      setDesktopBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 font-normal z-[1000] bg-[#2155A3]/20 backdrop-blur-sm flex items-end sm:items-stretch sm:justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) setNotifyMenuOpen(false); }}
    >
      <div className="w-full sm:w-[420px] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] sm:h-full">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="py-3 sm:h-[85px] sm:py-0 border-b border-[#E4E6E8] px-4 sm:px-[26px] w-full flex items-center">
          <div className="flexBetween w-full">
            <div className="flex items-center gap-x-2.5">
              <h3 className="font-semibold text-base sm:text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
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

        <div className="flex-1 flex flex-col overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex px-4 sm:px-[26px] border-[#E4E6E8] gap-x-2.5 sm:gap-x-3 py-3 sm:py-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 sm:w-[50px] sm:h-[50px] rounded-full overflow-hidden flex items-center justify-center ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {notification.data?.senderImage ||
                    notification.data?.assignedBy?.profileImage ||
                    notification.data?.updatedBy?.profileImage ||
                    notification.data?.submittedBy?.profileImage ||
                    notification.data?.approvedBy?.profileImage ? (
                      <img
                        src={
                          notification.data?.senderImage ||
                          notification.data?.assignedBy?.profileImage ||
                          notification.data?.updatedBy?.profileImage ||
                          notification.data?.submittedBy?.profileImage ||
                          notification.data?.approvedBy?.profileImage
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

                <div className="flex flex-col gap-y-0.5 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {notification.title}
                    </span>
                    <span className="text-[11px] text-[#7D8592] whitespace-nowrap shrink-0">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#7D8592] line-clamp-2">
                    {notification.message}
                  </p>

                  {/* Contextual tags */}
                  {notification.type === "task_assigned" && notification.data?.projectName && (
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        {notification.data.projectName}
                      </span>
                    </div>
                  )}
                  {(notification.type === "deadline_reminder" || notification.type === "project_deadline_reminder") && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">⏰ Urgent</span>
                    </div>
                  )}
                  {notification.type === "task_updated" && notification.data?.reviewRequired && (
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">👀 Needs Review</span>
                      {notification.data?.isSubTask && (
                        <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">Subtask</span>
                      )}
                    </div>
                  )}
                  {notification.type === "task_updated" && notification.data?.approved && (
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">✅ Approved</span>
                      {notification.data?.isSubTask && (
                        <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">Subtask</span>
                      )}
                    </div>
                  )}
                  {notification.type === "message" && notification.data?.messagePreview && (
                    <div className="text-[10px] text-gray-500 italic mt-1 truncate">
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

        <div className="border-t border-[#E4E6E8] px-4 sm:px-[26px] py-3 sm:py-4 space-y-2.5">
          {isBrowserNotificationSupported() && (
            <button
              type="button"
              onClick={handleToggleDesktopAlerts}
              disabled={desktopBusy || desktopPermission === "denied"}
              className="w-full flex items-center justify-between text-left text-sm text-gray-700"
            >
              <span>Desktop alerts for new leads</span>
              <span
                className={`text-xs font-medium ${
                  desktopPermission === "granted" && desktopEnabled
                    ? "text-green-600"
                    : desktopPermission === "denied"
                    ? "text-red-500"
                    : "text-blue-600"
                }`}
              >
                {desktopBusy
                  ? "..."
                  : desktopPermission === "granted" && desktopEnabled
                  ? "On"
                  : desktopPermission === "denied"
                  ? "Blocked"
                  : "Enable"}
              </span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => {
                navigate("/notifications");
                setNotifyMenuOpen(false);
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all notifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;
