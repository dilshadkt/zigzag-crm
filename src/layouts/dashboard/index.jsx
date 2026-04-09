import React, { useEffect } from "react";
import Sidebar from "../../components/sidebar";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../../components/header";
import socketService from "../../services/socketService";
import { useQueryClient } from "@tanstack/react-query";
import notificationSound from "../../assets/audio/new-notification-017-352293.mp3";
import { useAttendanceManager } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import AttendanceModal from "../../components/header/components/AttendanceModal";

const DashboardLayout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const attendance = useAttendanceManager();
  
  const isCompanyAdmin = user?.role === "company-admin";
  const isClient = user?.role === "client";
  const showContent = isCompanyAdmin || isClient || attendance.isShiftActive;

  useEffect(() => {
    // Request notification permission on mount
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      Notification.requestPermission().catch(e => console.log("Notification permission request failed", e));
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
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const icon =
          notification.data?.senderImage ||
          notification.data?.assignedBy?.profileImage ||
          notification.data?.updatedBy?.profileImage ||
          notification.data?.submittedBy?.profileImage ||
          notification.data?.approvedBy?.profileImage ||
          "/icons/alert.svg";

        try {
          new Notification(notification.title, {
            body: notification.message,
            icon: icon,
          });
        } catch (e) {
          console.error("Failed to show browser notification:", e);
        }
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
    <main className="bg-[#F4F9FD] h-screen overflow-hidden flex relative">
      {!isClient && <Sidebar />}
      <section className={`w-full gap-y-4 md:gap-y-3 h-full overflow-auto flex flex-col relative ${isClient ? 'p-0' : 'p-2 md:p-3'}`}>
        {!isClient && <DashboardHeader />}
        <div className={`px-1 w-full h-full overflow-auto ${isClient ? 'p-4' : ''}`}>
          <Outlet />
        </div>
      </section>

      {/* Global Mandatory Attendance Overlay */}
      {!showContent && !attendance.statusLoading && (
        <div className="fixed inset-0 z-[9999] flexCenter px-4 bg-black/40 backdrop-blur-[3px]">
          <AttendanceModal
            isOpen={true}
            isClosable={false}
            user={user}
            isClockingIn={attendance.isClockingIn}
            isProcessingAttendance={attendance.isClockingIn}
            clockInError={attendance.clockInError}
            onClockIn={attendance.handleClockIn}
            onClose={() => {}}
          />
          <div className="fixed bottom-10 left-0 right-0 flexCenter flex-col gap-2 z-[10001] pointer-events-none">
            <p className="text-[11px] text-white/70 uppercase font-bold tracking-[0.3em] bg-black/20 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
              Zigzag CRM Security Access
            </p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {!isCompanyAdmin && attendance.statusLoading && (
        <div className="fixed inset-0 z-[9999] flexCenter bg-white/60 backdrop-blur-sm">
          <div className="flexCenter flex-col gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 font-medium italic">Verifying attendance integrity...</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default DashboardLayout;
