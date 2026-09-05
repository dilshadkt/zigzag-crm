import React, { useState } from "react";
import Sidebar from "../../components/sidebar";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../../components/header";
import { useAttendanceManager } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import AttendanceModal from "../../components/header/components/AttendanceModal";
import GlobalNudges from "../../components/shared/GlobalNudges";

const DashboardLayout = () => {
  const { user } = useAuth();
  const attendance = useAttendanceManager();
  const [isAttendanceDismissed, setIsAttendanceDismissed] = useState(false);
  
  const isCompanyAdmin = user?.role === "company-admin";
  const isClient = user?.role === "client";
  const showContent = isCompanyAdmin || isClient || attendance.isShiftActive;

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
      {!showContent && !attendance.statusLoading && !isAttendanceDismissed && (
        <div className="fixed inset-0 z-[9999] flexCenter px-4 bg-black/40 backdrop-blur-[3px]">
          <AttendanceModal
            isOpen={true}
            isClosable={true}
            user={user}
            isClockingIn={attendance.isClockingIn}
            isProcessingAttendance={attendance.isClockingIn}
            clockInError={attendance.clockInError}
            onClockIn={attendance.handleClockIn}
            onClose={() => setIsAttendanceDismissed(true)}
          />
          <div className="fixed bottom-10 left-0 right-0 flexCenter flex-col gap-2 z-[10001] pointer-events-none">
            <p className="text-[11px] text-white/80 font-medium tracking-wide bg-black/25 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
              Clock in to continue
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

      {/* Global Real-time Nudges */}
      <GlobalNudges />
    </main>
  );
};

export default DashboardLayout;
