import React, { useState, useEffect } from "react";
import { IoFingerPrintOutline } from "react-icons/io5";
import { getUserLocation, getDeviceInfo } from "../../../utils/locationUtils";

const AttendanceModal = ({
  isOpen,
  onClose,
  user,
  isClockingIn,
  isProcessingAttendance,
  clockInError,
  onClockIn,
}) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeCompleted, setIsSwipeCompleted] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  // Clear errors and reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAttendanceError(null);
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
    }
  }, [isOpen]);

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
    // Prevent multiple API calls - check both flags
    if (isProcessingAttendance || isClockingIn || isSwipeCompleted) {
      return;
    }

    // Set processing state immediately to prevent concurrent calls
    setIsSwipeCompleted(true);

    try {
      setAttendanceError(null);

      const location = await getUserLocation();
      const deviceInfo = getDeviceInfo();

      const result = await onClockIn(location, deviceInfo);

      if (result && result.success) {
        // Auto-close modal after successful clock in
        setTimeout(() => {
          onClose();
          setSwipeProgress(0);
          setIsSwipeCompleted(false);
        }, 1000); // Give user time to see success state
      } else {
        // If result doesn't indicate success, reset to allow retry
        setSwipeProgress(0);
        setIsSwipeCompleted(false);
      }
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      
      // Extract error message from response
      let errorMessage = "Failed to clock in. Please try again.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setAttendanceError(errorMessage);

      // Reset states on error to allow retry
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
    }
  };

  if (!isOpen) return null;

  return (
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
            Punch in now to track your hours and let your team know you're here.
            You can clock in multiple times per day to accumulate your work hours.
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
            onClose();
            setSwipeProgress(0);
            setAttendanceError(null);
            setIsSwipeCompleted(false);
          }}
          className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isClockingIn || isProcessingAttendance}
        >
          {isClockingIn || isProcessingAttendance ? "Processing..." : "Cancel"}
        </button>
      </div>
    </div>
  );
};

export default AttendanceModal;
