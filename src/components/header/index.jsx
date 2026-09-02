import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetUnreadNotificationCount,
  useGetStickyNotes,
  useAttendanceManager,
  useIsDepartmentHead,
  useGetUpcomingMeetingCount,
} from "../../api/hooks";
import { syncTimer, updateTimer } from "../../store/slice/timerSlice";
import { useRouteAccess } from "../../hooks/useRouteAccess";
import { usePermissions } from "../../hooks/usePermissions";
import { MdDashboard } from "react-icons/md";
import logo from "../../assets/icons/logo.svg";
import { SIDE_MENU } from "../../constants";
import { getMyPerformance } from "../../api/service";
import socketService from "../../services/socketService";
import { toast } from "react-hot-toast";
import { Zap } from "lucide-react";

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
  const [currentScore, setCurrentScore] = useState(0);

  // Hooks
  const { user, companyId } = useAuth();
  const effectiveCompanyId = companyId || user?.company;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userPosition } = useRouteAccess();
  const { hasAdminDashboardAccess } = usePermissions();
  const { isDepartmentHead } = useIsDepartmentHead(effectiveCompanyId, !!user);

  // Data fetching
  const { data: unreadData } = useGetUnreadNotificationCount();
  const { data: stickyNotes = [] } = useGetStickyNotes();
  const { data: upcomingMeetingsData } = useGetUpcomingMeetingCount();
  const unreadCount = unreadData?.count || 0;
  const stickyNotesCount = stickyNotes.length || 0;
  const upcomingMeetingCount = upcomingMeetingsData?.count || 0;

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
    isStartingBreak,
    isEndingBreak,
    clockInError,
    clockOutError,
    isEndShiftBlocked,
    pendingTasksWithoutReasonCount,
  } = useAttendanceManager();

  // Prevent multiple modal opens
  const handleAttendanceClick = () => {
    if (!isAttendanceMenuOpen && !isClockingIn) {
      setAttendanceMenuOpen(true);
    }
  };

  // Timer state from Redux
  const { remainingTime, isRunning } = useSelector((state) => state.timer);

  // Check if user has admin dashboard access permission
  // IMPORTANT: Company admins should NOT see this option - only non-admin users with permission
  const isCompanyAdmin = user?.role === "company-admin";
  const showHeaderActions = isCompanyAdmin || isShiftActive;
  const canAccessAdminDashboard = !isCompanyAdmin && hasAdminDashboardAccess();

  // Build sidebar menu items - only add Company Dashboard if user has permission (but NOT for admins)
  const sidebarMenuItems = SIDE_MENU.map((item) => {
    // If the item is "Dashboard", check if sub-items should be shown
    if (item.routeKey === "dashboard") {
      // ONLY Company Admin sees all sub-items under the main "Dashboard"
      if (isCompanyAdmin) {
        if (isDepartmentHead) {
          const hasDepartmentDashboard = item.children?.some(
            (child) => child.routeKey === "department-dashboard"
          );

          if (!hasDepartmentDashboard) {
            return {
              ...item,
              children: [
                ...(item.children || []),
                {
                  id: 107,
                  title: "Department Dashboard",
                  path: "/department-dashboard",
                  routeKey: "department-dashboard",
                },
              ],
            };
          }
        }

        return item;
      }

      // For others, check if they have specific dashboard permissions (like lead-dashboard)
      const allowedRoutes = userPosition?.allowedRoutes || [];
      const hasDashboardChildren = item.children?.some(
        (child) =>
          child.routeKey !== "dashboard" && allowedRoutes.includes(child.routeKey)
      );

      if (hasDashboardChildren) {
        // Return dashboard with only allowed children
        const allowedChildren = item.children.filter(
          (child) =>
            child.routeKey === "dashboard" ||
            allowedRoutes.includes(child.routeKey)
        );

        if (isDepartmentHead) {
          allowedChildren.push({
            id: 107,
            title: "Department Dashboard",
            path: "/department-dashboard",
            routeKey: "department-dashboard",
          });
        }

        return { ...item, children: allowedChildren };
      }

      if (isDepartmentHead) {
        return {
          ...item,
          children: [
            {
              id: 101,
              title: "Main Dashboard",
              path: "/",
              routeKey: "dashboard",
            },
            {
              id: 107,
              title: "Department Dashboard",
              path: "/department-dashboard",
              routeKey: "department-dashboard",
            },
          ],
        };
      }

      // If no specific dashboard permissions, return a flat "Dashboard" link
      const { children, ...rest } = item;
      return rest;
    }
    return item;
  });

  // IMPORTANT: Only add Company Dashboard menu item if user has the permission AND is NOT a company admin
  if (canAccessAdminDashboard) {
    // Insert Company Dashboard after Dashboard
    const dashboardIndex = sidebarMenuItems.findIndex(
      (item) => item.routeKey === "dashboard"
    );
    if (dashboardIndex !== -1) {
      sidebarMenuItems.splice(dashboardIndex + 1, 0, {
        id: 13,
        title: "Company Dashboard",
        icon: MdDashboard,
        path: "/company-dashboard",
        routeKey: "company-dashboard",
      });
    }
  }

  // Filter sidebar menu based on user permissions
  const filteredSidebar = sidebarMenuItems.filter((item) => {
    // Company admins have full access to all menu items EXCEPT Company Dashboard
    if (isCompanyAdmin) {
      // Hide Company Dashboard for admins
      if (item.routeKey === "company-dashboard") {
        return false;
      }
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

    // Company Dashboard is ONLY accessible if user has the permission (and is NOT an admin)
    if (item.routeKey === "company-dashboard") {
      return canAccessAdminDashboard;
    }

    // For other menu items, check if the routeKey is in their allowed routes
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

  useEffect(() => {
    if (isCompanyAdmin) return;

    fetchScore();

    const handlePointsAwarded = (data) => {
      console.log("[Gamification Debug] Header received points_awarded socket event:", data);
      
      // If the backend provided the new score directly, update instantly!
      if (data.newTotalScore !== undefined) {
        setCurrentScore(data.newTotalScore);
      } else {
        // Fallback: Add a small delay to ensure backend has completed all database transactions
        setTimeout(() => {
          fetchScore();
        }, 500);
      }
      
      // Determine style based on if it's a penalty or bonus
      if (data.title?.includes("Delayed") || data.message?.includes("-")) {
        toast.error(
          <div>
            <strong>{data.title}</strong>
            <p className="text-sm mt-1">{data.message}</p>
          </div>
        );
      } else {
        toast.success(
          <div>
            <strong>{data.title}</strong>
            <p className="text-sm mt-1">{data.message}</p>
          </div>
        );
      }
    };

    socketService.onPointsAwarded(handlePointsAwarded);

    return () => {
      socketService.offPointsAwarded(handlePointsAwarded);
    };
  }, []);

  const fetchScore = async () => {
    try {
      const res = await getMyPerformance("monthly");
      if (res.success && res.performance) {
        setCurrentScore(res.performance.totalScore || 0);
      }
    } catch (err) {
      console.error("Failed to fetch score", err);
    }
  };

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
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
        <img src={logo} alt="" className="w-10 h-10 ml-3" />
      </button>

      {/* Search Bar */}
      <SearchBar accessiblePages={filteredSidebar} />

      {/* Right Side Actions */}
      <div className="flexEnd gap-x-2">
        {/* Attendance Status */}
        <div className="hidden md:block">
          <AttendanceStatus
            isShiftActive={isShiftActive}
            isOnBreak={isOnBreak}
            shiftElapsedTime={shiftElapsedTime}
            isClockingOut={isClockingOut}
            clockOutError={clockOutError}
            onEndShift={endShift}
            onStartBreak={handleStartBreak}
            onEndBreak={handleEndBreak}
            isStartingBreak={isStartingBreak}
            isEndingBreak={isEndingBreak}
            isEndShiftBlocked={isEndShiftBlocked}
            pendingTasksWithoutReasonCount={pendingTasksWithoutReasonCount}
          />
        </div>

        {/* Action Buttons */}
        <ActionButtons
          isShiftActive={isShiftActive}
          isOnBreak={isOnBreak}
          statusLoading={statusLoading}
          isClockingIn={isClockingIn}
          onAttendanceClick={handleAttendanceClick}
          onNotifyClick={() => setNotifyMenuOpen(true)}
          unreadCount={unreadCount}
          stickyNotesCount={stickyNotesCount}
          upcomingMeetingCount={upcomingMeetingCount}
          remainingTime={remainingTime}
          isRunning={isRunning}
          formatTime={formatTime}
        />

        {/* Current Score Display */}
        {!isCompanyAdmin && (
          <div 
            onClick={() => navigate(`/my-points`)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full mr-2 hover:bg-blue-100 transition-colors cursor-pointer" 
            title="Your Current Score"
          >
            <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
            <span className="text-sm font-black text-blue-700">{currentScore} <span className="text-[10px] font-bold text-blue-400 uppercase">Pts</span></span>
          </div>
        )}

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
