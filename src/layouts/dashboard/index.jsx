import React, { useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../../components/header";
import socketService from "../../services/socketService";
import { useQueryClient } from "@tanstack/react-query";
import notificationSound from "../../assets/audio/new-notification-017-352293.mp3";

const DashboardLayout = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Request notification permission on mount
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Handler for new notifications
    const handleNewNotification = (notification) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["unreadNotificationCount"]);

      // Play sound
      try {
        const audio = new Audio(notificationSound);
        audio.play().catch(e => console.log("Audio play failed", e));
      } catch (e) {
        console.log("Audio error", e);
      }

      // Show browser notification
      if (Notification.permission === "granted") {
        const icon =
          notification.data?.senderImage ||
          notification.data?.assignedBy?.profileImage ||
          notification.data?.updatedBy?.profileImage ||
          notification.data?.submittedBy?.profileImage ||
          notification.data?.approvedBy?.profileImage ||
          "/icons/alert.svg";

        new Notification(notification.title, {
          body: notification.message,
          icon: icon,
        });
      }
    };

    // Subscribe to notifications
    socketService.onNewNotification(handleNewNotification);

    return () => {
      // Unsubscribe on unmount
      socketService.offNewNotification(handleNewNotification);
    };
  }, [queryClient]);

  return (
    <main className="bg-[#F4F9FD] gap-x-2 h-screen overflow-hidden flex ">
      <Sidebar />
      <section className="w-full gap-y-4 md:gap-y-3 h-full overflow-auto flex flex-col p-2 md:p-3  ">
        <DashboardHeader />
        <div className="px-1 w-full h-full overflow-auto ">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default DashboardLayout;
