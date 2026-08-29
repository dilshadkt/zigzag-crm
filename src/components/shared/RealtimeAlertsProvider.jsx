import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import socketService from "../../services/socketService";
import { useGetNotifications } from "../../api/hooks";
import {
  playNotificationSound,
  unlockNotificationSound,
} from "../../services/realtimeNotificationHandler";

const TOAST_DURATION_MS = 4000;
const FRESH_WINDOW_MS = 2 * 60 * 1000;
// The assignment socket fires before the notification row is committed, so the
// data-driven path must stay quiet for a moment after an instant alert.
const RECONCILE_WINDOW_MS = 8000;
const DUPLICATE_EVENT_MS = 1200;
// One assignment emits an early subtask event, a second one after the write,
// and a new_notification. All three carry the subtask id, so dedupe on that.
const ENTITY_DEDUPE_MS = 20000;

const getSocketMessage = (notification, payload) => {
  const subTask = payload?.subTask;
  if (subTask?.title) {
    const projectName = subTask.project?.displayName || subTask.project?.name;
    return `New task assigned: "${subTask.title}"${
      projectName ? ` in ${projectName}` : ""
    }`;
  }
  return (
    notification?.message ||
    notification?.title ||
    "New task assigned to you"
  );
};

const getNotificationText = (notification) =>
  notification?.message || notification?.title || "You have a new notification";

const RealtimeAlertsProvider = () => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState(null);

  const seenIdsRef = useRef(null);
  const lastAlertAtRef = useRef(0);
  const quietUntilRef = useRef(0);
  const bellFloorRef = useRef({ count: null, until: 0 });
  const alertedEntitiesRef = useRef(new Map());

  const { data: notificationsData } = useGetNotifications(10);

  const showToast = useCallback((message) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    const unlock = () => unlockNotificationSound();
    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const refetchNotificationQueries = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["employeeSubTasksToday"] });
      queryClient.invalidateQueries({ queryKey: ["employeeTasks"] });
    };

    const isDuplicate = (entityId, now) => {
      if (!entityId) return now - lastAlertAtRef.current < DUPLICATE_EVENT_MS;

      alertedEntitiesRef.current.forEach((at, key) => {
        if (now - at > ENTITY_DEDUPE_MS) alertedEntitiesRef.current.delete(key);
      });

      const alertedAt = alertedEntitiesRef.current.get(entityId);
      return Boolean(alertedAt) && now - alertedAt < ENTITY_DEDUPE_MS;
    };

    // Alert straight off the socket payload so sound, toast and badge land at
    // the same moment the dashboard list updates.
    const fireInstantAlert = ({ message, entityId, notificationId }) => {
      const now = Date.now();

      if (notificationId && seenIdsRef.current) {
        seenIdsRef.current.add(String(notificationId));
      }

      quietUntilRef.current = now + RECONCILE_WINDOW_MS;

      // The repeat events for the same assignment are already covered by the
      // refetch chain the first one scheduled.
      if (isDuplicate(entityId, now)) return;

      lastAlertAtRef.current = now;
      if (entityId) alertedEntitiesRef.current.set(entityId, now);

      playNotificationSound();
      showToast(message);

      queryClient.setQueryData(["unreadNotificationCount"], (oldData) => {
        const nextCount = (oldData?.count || 0) + 1;
        bellFloorRef.current = {
          count: nextCount,
          until: now + RECONCILE_WINDOW_MS,
        };
        return { ...(oldData || { success: true }), count: nextCount };
      });

      refetchNotificationQueries();
      // The notification row is written just after this event, so pull the list
      // again shortly to fill in the panel.
      window.setTimeout(refetchNotificationQueries, 900);
      window.setTimeout(refetchNotificationQueries, 2500);
    };

    const handleNewNotification = (notification) => {
      if (notification?.type !== "task_assigned") {
        refetchNotificationQueries();
        queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
        return;
      }
      const entityId =
        notification?.data?.subTaskId ||
        notification?.task?._id ||
        notification?.data?.taskId;

      fireInstantAlert({
        message: getSocketMessage(notification),
        entityId: entityId ? String(entityId) : null,
        notificationId: notification?._id,
      });
    };

    const handleSubtaskAssigned = (payload) => {
      const entityId = payload?.subTask?._id;

      fireInstantAlert({
        message: getSocketMessage(null, payload),
        entityId: entityId ? String(entityId) : null,
      });
    };

    socketService.onNewNotification(handleNewNotification);
    socketService.onSubtaskAssigned(handleSubtaskAssigned);

    return () => {
      socketService.offNewNotification(handleNewNotification);
      socketService.offSubtaskAssigned(handleSubtaskAssigned);
    };
  }, [queryClient, showToast]);

  // Reconciliation pass: keeps the badge exact and still alerts if the socket
  // never arrived.
  useEffect(() => {
    const notifications = notificationsData?.notifications;
    if (!Array.isArray(notifications)) return;

    const now = Date.now();
    const serverCount = notificationsData.unreadCount;

    if (typeof serverCount === "number") {
      const floor = bellFloorRef.current;
      const cachedCount =
        queryClient.getQueryData(["unreadNotificationCount"])?.count ?? 0;
      const isStaleCount =
        floor.count !== null &&
        now < floor.until &&
        serverCount < floor.count &&
        cachedCount >= floor.count;

      if (!isStaleCount) {
        if (floor.count !== null && serverCount >= floor.count) {
          bellFloorRef.current = { count: null, until: 0 };
        }
        queryClient.setQueryData(["unreadNotificationCount"], (oldData) => ({
          ...(oldData || { success: true }),
          count: serverCount,
        }));
      }
    }

    const unread = notifications.filter((item) => !item.read);
    const unreadIds = unread.map((item) => String(item._id));

    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(unreadIds);
      return;
    }

    const fresh = unread.filter((item) => {
      if (seenIdsRef.current.has(String(item._id))) return false;
      const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      return now - createdAt <= FRESH_WINDOW_MS;
    });

    unreadIds.forEach((id) => seenIdsRef.current.add(id));

    if (fresh.length === 0 || now < quietUntilRef.current) return;

    lastAlertAtRef.current = now;
    playNotificationSound();
    showToast(
      fresh.length === 1
        ? getNotificationText(fresh[0])
        : `${fresh.length} new notifications`
    );
  }, [notificationsData, queryClient, showToast]);

  if (!toast || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed top-5 right-5 w-[360px] max-w-[calc(100vw-2.5rem)] pointer-events-none"
      style={{ zIndex: 2147483647 }}
    >
      <div className="pointer-events-auto rounded-2xl bg-[#10B981] text-white shadow-2xl px-4 py-3 flex items-start gap-3 animate-[slideIn_.25s_ease-out]">
        <span className="text-xl leading-none mt-0.5">📋</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">New notification</p>
          <p className="text-sm text-white/95 leading-snug mt-0.5">
            {toast.message}
          </p>
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default RealtimeAlertsProvider;
