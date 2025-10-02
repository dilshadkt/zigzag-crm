import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetUnreadNotificationCount,
  useGetStickyNotes,
  useAttendanceManager,
} from "../../api/hooks";
import { syncTimer, updateTimer } from "../../store/slice/timerSlice";
import { useRouteAccess } from "../../hooks/useRouteAccess";
import logo from "../../assets/icons/logo.svg";
import { SIDE_MENU } from "../../constants";

// Import components
import SearchBar from "./components/SearchBar";
import AttendanceStatus from "./components/AttendanceStatus";
import ActionButtons from "./components/ActionButtons";
import AttendanceModal from "./components/AttendanceModal";
import MobileSidebar from "./components/MobileSidebar";
import UserProfile from "./components/UserProfile";
import NotificationBar from "../notificationBar";

const DashboardHeader = () => {
  // State management
  const [isNotifyMenuOpen, setNotifyMenuOpen] = useState(false);
  const [isAttendanceMenuOpen, setAttendanceMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shiftElapsedTime, setShiftElapsedTime] = useState(0);

  // Hooks
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userPosition } = useRouteAccess();

  // Data fetching
  const { data: unreadData } = useGetUnreadNotificationCount();
  const { data: stickyNotes = [] } = useGetStickyNotes();
  const unreadCount = unreadData?.count || 0;
  const stickyNotesCount = stickyNotes.length || 0;

  // Attendance management
  const {
    currentStatus,
    isShiftActive,
    isOnBreak,
    shiftStartTime,
    statusLoading,
    handleClockIn,
    handleClockOut,
    handleStartBreak,
    handleEndBreak,
    isClockingIn,
    isClockingOut,
    clockInError,
    clockOutError,
  } = useAttendanceManager();

  // Timer state from Redux
  const { remainingTime, isRunning } = useSelector((state) => state.timer);

  // Filter sidebar menu based on user permissions
  const filteredSidebar = SIDE_MENU.filter((item) => {
    // Company admins have full access to all menu items
    if (user?.role === "company-admin") {
      return true;
    }

    // Dashboard, Board, and Settings are always accessible to everyone
    if (
      item.routeKey === "dashboard" ||
      item.routeKey === "board" ||
      item.routeKey === "settings"
    ) {
      return true;
    }

    // For other users, check if the routeKey is in their allowed routes
    const allowedRoutes = userPosition?.allowedRoutes || [];
    return allowedRoutes.includes(item.routeKey);
  });

  // Effects
  useEffect(() => {
    dispatch(syncTimer());
  }, [dispatch]);

  useEffect(() => {
    let interval;
    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingTime, dispatch]);

  useEffect(() => {
    let interval;
    if (isShiftActive && shiftStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - shiftStartTime) / 1000);
        setShiftElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isShiftActive, shiftStartTime]);

  // Utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleLogout = () => {
    navigate("/auth/signin");
  };

  const endShift = async () => {
    if (isClockingOut) return;

    try {
      const location = await import("../../utils/locationUtils").then((utils) =>
        utils.getUserLocation()
      );
      const workDescription = "Completed daily tasks";

      const result = await handleClockOut(location, workDescription);
      return result;
    } catch (error) {
      console.error("Failed to end shift:", error);
      throw error;
    }
  };

  return (
    <div className="bg-white lg:bg-transparent rounded-xl py-1 md:py-0 flexBetween">
      {/* Mobile Logo */}
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <img src={logo} alt="" className="w-10 md:hidden h-10 ml-3" />
      </button>

      {/* Search Bar */}
      <SearchBar />

      {/* Right Side Actions */}
      <div className="flexEnd gap-x-2">
        {/* Attendance Status */}
        <AttendanceStatus
          isShiftActive={isShiftActive}
          isOnBreak={isOnBreak}
          shiftElapsedTime={shiftElapsedTime}
          isClockingOut={isClockingOut}
          clockOutError={clockOutError}
          onEndShift={endShift}
        />

        {/* Action Buttons */}
        <ActionButtons
          isShiftActive={isShiftActive}
          statusLoading={statusLoading}
          isClockingIn={isClockingIn}
          onAttendanceClick={() => setAttendanceMenuOpen(true)}
          onNotifyClick={() => setNotifyMenuOpen(true)}
          unreadCount={unreadCount}
          stickyNotesCount={stickyNotesCount}
          remainingTime={remainingTime}
          isRunning={isRunning}
          formatTime={formatTime}
        />

        {/* User Profile */}
        <UserProfile user={user} />
      </div>

      {/* Notification Bar */}
      {isNotifyMenuOpen && (
        <NotificationBar setNotifyMenuOpen={setNotifyMenuOpen} />
      )}

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceMenuOpen}
        onClose={() => setAttendanceMenuOpen(false)}
        user={user}
        isClockingIn={isClockingIn}
        isProcessingAttendance={false}
        clockInError={clockInError}
        onClockIn={handleClockIn}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        filteredSidebar={filteredSidebar}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default DashboardHeader;
