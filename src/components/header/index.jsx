import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PrimaryButton from "../shared/buttons/primaryButton";
import NotificationBar from "../notificationBar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetUnreadNotificationCount,
  useGetStickyNotes,
  useAttendanceManager,
} from "../../api/hooks";
import {
  IoDocumentTextOutline,
  IoTimeOutline,
  IoFingerPrintOutline,
  IoChevronDownOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { syncTimer, updateTimer } from "../../store/slice/timerSlice";
import { getUserLocation, getDeviceInfo } from "../../utils/locationUtils";
import logo from "../../assets/icons/logo.svg";
import { SIDE_MENU } from "../../constants";
import { useRouteAccess } from "../../hooks/useRouteAccess";
const DashboardHeader = () => {
  const [isNotifyMenuOpen, setNotifyMenuOpen] = useState(false);
  const [isAttendanceMenuOpen, setAttendanceMenuOpen] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [showEndShiftMenu, setShowEndShiftMenu] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [isSwipeCompleted, setIsSwipeCompleted] = useState(false);
  const [isProcessingAttendance, setIsProcessingAttendance] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
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
  const { userPosition } = useRouteAccess();
  // Calculate elapsed time for active shift
  const [shiftElapsedTime, setShiftElapsedTime] = useState(0);

  // Get timer state from Redux
  const { remainingTime, isRunning } = useSelector((state) => state.timer);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Sync timer state on component mount
  useEffect(() => {
    dispatch(syncTimer());
  }, [dispatch]);

  // Update timer display when running
  useEffect(() => {
    let interval;
    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingTime, dispatch]);

  // Update shift elapsed time
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

  // Clear errors when closing modals
  useEffect(() => {
    if (!isAttendanceMenuOpen) {
      setAttendanceError(null);
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
      setIsProcessingAttendance(false);
    }
  }, [isAttendanceMenuOpen]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

  const formatShiftTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSwipeStart = (e) => {
    // Prevent starting new swipe if already processing or completed
    if (isProcessingAttendance || isSwipeCompleted) {
      return;
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = clientX - rect.left;

    const handleSwipeMove = (e) => {
      // Don't update progress if already completed or processing
      if (isSwipeCompleted || isProcessingAttendance) {
        return;
      }

      const currentX =
        (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const progress = Math.min(Math.max((currentX - startX) / 200, 0), 1);
      setSwipeProgress(progress);

      // Only trigger attendance marking once when progress reaches 1
      if (progress >= 1 && !isSwipeCompleted && !isProcessingAttendance) {
        setIsSwipeCompleted(true); // Prevent multiple triggers
        markAttendance();
      }
    };

    const handleSwipeEnd = () => {
      // Only reset progress if not completed and not processing
      if (!isSwipeCompleted && !isProcessingAttendance && swipeProgress < 1) {
        setSwipeProgress(0);
      }

      // Clean up event listeners
      document.removeEventListener("mousemove", handleSwipeMove);
      document.removeEventListener("mouseup", handleSwipeEnd);
      document.removeEventListener("touchmove", handleSwipeMove);
      document.removeEventListener("touchend", handleSwipeEnd);
    };

    document.addEventListener("mousemove", handleSwipeMove);
    document.addEventListener("mouseup", handleSwipeEnd);
    document.addEventListener("touchmove", handleSwipeMove);
    document.addEventListener("touchend", handleSwipeEnd);
  };

  const markAttendance = async () => {
    // Prevent multiple API calls
    if (isProcessingAttendance || isClockingIn) {
      return;
    }

    try {
      setIsProcessingAttendance(true);
      setAttendanceError(null);

      const location = await getUserLocation();
      const deviceInfo = getDeviceInfo();

      const result = await handleClockIn(location, deviceInfo);

      if (result.success) {
        // Auto-close modal after successful clock in
        setTimeout(() => {
          setAttendanceMenuOpen(false);
          setSwipeProgress(0);
          setIsSwipeCompleted(false);
          setIsProcessingAttendance(false);
        }, 1000); // Give user time to see success state
      }
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      setAttendanceError(
        error.message || "Failed to clock in. Please try again."
      );

      // Reset states on error to allow retry
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
      setIsProcessingAttendance(false);
    }
  };

  const endShift = async () => {
    // Prevent multiple API calls
    if (isClockingOut) {
      return;
    }

    try {
      setAttendanceError(null);
      const location = await getUserLocation();
      const workDescription = "Completed daily tasks"; // You can make this configurable

      const result = await handleClockOut(location, workDescription);

      if (result.success) {
        setShowEndShiftMenu(false);
      }
    } catch (error) {
      console.error("Failed to end shift:", error);
      setAttendanceError(
        error.message || "Failed to clock out. Please try again."
      );
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  const handleLogout = () => {
    navigate("/auth/signin");
  };
  return (
    <div className="  bg-white lg:bg-transparent rounded-xl py-1  md:py-0 flexBetween">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <img src={logo} alt="" className="w-10 md:hidden h-10 ml-3" />
      </button>
      <div className="hidden lg:block relative w-1/3">
        <input
          type="text"
          className="bg-white py-3 text-sm w-full rounded-[14px] pr-3 pl-11 outline-none"
          placeholder="Search"
        />
        <img
          src="/icons/search.svg"
          alt=""
          className="absolute top-0 bottom-0 h-fit my-auto left-3"
        />
      </div>
      <div className="flexEnd gap-x-2  ">
        {/* Active Shift Status - Compact */}
        {isShiftActive && (
          <div className="flex items-center bg-white rounded-[14px] px-3 h-12 gap-2 relative">
            <span className="text-xs font-medium text-gray-600">
              {isOnBreak ? "On Break" : "Active Shift"}
            </span>
            <span className="text-sm font-mono font-bold text-gray-800">
              {formatShiftTime(shiftElapsedTime)}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowEndShiftMenu(!showEndShiftMenu)}
                className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                disabled={isClockingOut}
              >
                <span className="text-xs font-medium text-gray-600">
                  {isClockingOut ? "Ending..." : "End Shift"}
                </span>
                <IoChevronDownOutline className="w-3 h-3 text-gray-600" />
              </button>

              {showEndShiftMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[120px] z-50">
                  <button
                    onClick={endShift}
                    disabled={isClockingOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isClockingOut ? "Ending Shift..." : "End Shift"}
                  </button>
                  <button
                    onClick={() => setShowEndShiftMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                isOnBreak ? "bg-yellow-500" : "bg-green-500"
              }`}
            ></div>
          </div>
        )}

        <Link
          to="/sticky-notes"
          className=" hidden  lg:flexCenter cursor-pointer w-12 h-12
           rounded-[14px] bg-white relative"
        >
          <IoDocumentTextOutline className="w-5 h-5 text-gray-600" />
          {stickyNotesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {stickyNotesCount > 9 ? "9+" : stickyNotesCount}
            </span>
          )}
        </Link>

        {!isShiftActive && (
          <button
            onClick={() => setAttendanceMenuOpen(true)}
            className="flexCenter cursor-pointer w-12 h-12 rounded-[14px] bg-white relative hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={statusLoading || isClockingIn}
          >
            {statusLoading ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <IoFingerPrintOutline className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}

        <Link
          to="/timer"
          className={` hidden lg:flexCenter cursor-pointer rounded-[14px] bg-white relative transition-all ${
            isRunning ? "px-3 h-12" : "w-12 h-12"
          }`}
        >
          {isRunning ? (
            <div className="flex items-center gap-2">
              <IoTimeOutline className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-mono font-medium text-blue-600">
                {formatTime(remainingTime)}
              </span>
            </div>
          ) : (
            <IoTimeOutline className="w-5 h-5 text-gray-600" />
          )}
          {isRunning && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </Link>
        <button
          onClick={() => setNotifyMenuOpen(true)}
          className="flexCenter cursor-pointer w-12 h-12 rounded-[14px] bg-white relative"
        >
          <img src={"/icons/alert.svg"} alt="" className="w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <div className="h-12 rounded-[14px] gap-x-2 px-3 w-fit bg-white flexCenter  ">
          <div className="w-[30px] aspect-square rounded-full overflow-hidden bg-black">
            <img
              src={user?.profileImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <Link
            to={"/settings"}
            className="  hidden lg:flexStart gap-x-3.5 cursor-pointer"
          >
            <span className="text-sm font-medium ">{user?.firstName}</span>
            <img src="/icons/arrowDown.svg" alt="" className="w-5" />
          </Link>
        </div>
      </div>

      {isNotifyMenuOpen && (
        <NotificationBar setNotifyMenuOpen={setNotifyMenuOpen} />
      )}

      {isAttendanceMenuOpen && (
        <div className="fixed inset-0 bg-black/55 bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-6 w-80 mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoFingerPrintOutline className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {getGreeting()}, {user?.firstName}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Punch in now to track your hours and let your team know you're
                here
              </p>
              <div className="text-center mt-4">
                <div className="text-2xl font-bold text-gray-800">
                  {getCurrentTime()}
                </div>
                <div className="text-sm text-gray-600">{getCurrentDate()}</div>
              </div>
            </div>

            <div className="mb-6">
              <div
                className={`relative bg-gray-100 rounded-full h-12 overflow-hidden select-none ${
                  isProcessingAttendance || isClockingIn || isSwipeCompleted
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-pointer"
                }`}
                onMouseDown={handleSwipeStart}
                onTouchStart={handleSwipeStart}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${swipeProgress * 100}%` }}
                />
                <div
                  className="absolute top-1 left-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-out"
                  style={{ transform: `translateX(${swipeProgress * 200}px)` }}
                >
                  {isClockingIn || isProcessingAttendance ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : isSwipeCompleted ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-sm font-medium transition-all duration-300 ${
                      swipeProgress > 0.3 ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {isClockingIn || isProcessingAttendance
                      ? "Clocking in..."
                      : isSwipeCompleted
                      ? "Success! Clocking in..."
                      : "Swipe right to start shift"}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {(attendanceError || clockInError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {attendanceError ||
                    clockInError?.message ||
                    "An error occurred. Please try again."}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setAttendanceMenuOpen(false);
                setSwipeProgress(0);
                setAttendanceError(null);
                setIsSwipeCompleted(false);
                setIsProcessingAttendance(false);
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isClockingIn || isProcessingAttendance}
            >
              {isClockingIn || isProcessingAttendance
                ? "Processing..."
                : "Cancel"}
            </button>
          </div>
        </div>
      )}
      {/* sidebar menu  */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="bg-[#2155A3]/15 fixed w-full h-screen flex p-2 flex-col inset-0 m-auto
       z-[1000]"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="bg-white w-[220px] overflow-hidden flex flex-col justify-between
         rounded-3xl h-dvh  p-3 "
          >
            <div
              className="flex flex-col
        "
            >
              <img src={logo} alt="" className="w-10" />
              {/* menu items  */}
              <ul className="flex flex-col gap-y-1  mt-5 text-[#7D8592] ">
                {filteredSidebar.length > 0 ? (
                  filteredSidebar.map((item, index) => (
                    <li
                      key={index}
                      onClick={(e) => {
                        setIsSidebarOpen(false);
                        navigate(item.path);
                      }}
                      className={` relative cursor-pointer px-2 py-[10px] flexStart
        gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] group ${
          pathname === item.path && `bg-[#ECF3FF] text-[#3F8CFF]`
        }`}
                    >
                      <item.icon className="text-lg group-hover:text-[#3F8CFF]" />
                      <span
                        className="group-hover:text-[#3F8CFF] group-hover:translate-x-1
          transition-all duration-300 text-sm"
                      >
                        {item.title}
                      </span>
                      <span
                        className="absolute hidden group-hover:block
          -right-2.5 h-full w-1 bg-[#3F8CFF]"
                      ></span>
                    </li>
                  ))
                ) : (
                  <li className="px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] text-[#7D8592] text-[13px]">
                    <span>No accessible menu items</span>
                  </li>
                )}
              </ul>
            </div>
            <button
              onClick={handleLogout}
              className={` relative text-[#7D8592] cursor-pointer px-2 py-[10px] flexStart
        gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] font-semibold group `}
            >
              <IoLogOutOutline className="text-lg group-hover:text-[#3F8CFF]" />
              <span
                className="group-hover:text-[#3F8CFF] group-hover:translate-x-1
          transition-all duration-300 text-sm"
              >
                Logout
              </span>
              <span
                className="absolute hidden group-hover:block
          -right-2.5 h-full w-1 bg-[#3F8CFF]"
              ></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
