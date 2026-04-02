import React, { useState, useEffect, useMemo } from "react";
import { IoTimeOutline, IoAlertCircleOutline } from "react-icons/io5";
import { MdChevronRight } from "react-icons/md";
import PendingTasksReasonModal from "./PendingTasksReasonModal";
import { useAttendanceManager } from "../../../api/hooks";

const EndShiftModal = ({
  isOpen,
  onClose,
  user,
  isClockingOut,
  clockOutError,
  onEndShift,
  shiftElapsedTime,
}) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeCompleted, setIsSwipeCompleted] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);

  const { isEndShiftBlocked, pendingTasksWithoutReasonCount, pendingTasksWithoutReason } = useAttendanceManager();

  useEffect(() => {
    if (!isOpen) {
      setAttendanceError(null);
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
      setShowReasonModal(false);
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

  const formatShiftTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSwipeStart = (e) => {
    if (isEndShiftBlocked) {
      setAttendanceError("Provide reasons for pending tasks to enable shift end.");
      return;
    }
    if (isClockingOut || isSwipeCompleted) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = clientX - rect.left;

    const handleSwipeMove = (e) => {
      if (isSwipeCompleted || isClockingOut) return;
      const currentX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const progress = Math.min(Math.max((currentX - startX) / 200, 0), 1);
      setSwipeProgress(progress);
      if (progress >= 1 && !isSwipeCompleted && !isClockingOut) {
        setIsSwipeCompleted(true);
        endShift();
      }
    };

    const handleSwipeEnd = () => {
      if (!isSwipeCompleted && !isClockingOut && swipeProgress < 1) {
        setSwipeProgress(0);
      }
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

  const endShift = async () => {
    if (isClockingOut || isEndShiftBlocked) return;
    try {
      setAttendanceError(null);
      const result = await onEndShift();
      if (result && result.success) {
        setTimeout(() => {
          onClose();
          setSwipeProgress(0);
          setIsSwipeCompleted(false);
        }, 1000);
      }
    } catch (error) {
      setAttendanceError(error.message || "Failed to clock out. Please try again.");
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/55 bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white rounded-2xl p-6 w-80 mx-4 shadow-xl">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isEndShiftBlocked ? "bg-orange-100 text-orange-600 font-bold text-lg" : "bg-green-100 text-green-600"
            }`}>
              {isEndShiftBlocked ? (
                <div onClick={() => setShowReasonModal(true)} className="cursor-pointer hover:scale-110 transition-transform">
                  {pendingTasksWithoutReasonCount}
                </div>
              ) : (
                <IoTimeOutline className="w-8 h-8" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isEndShiftBlocked ? "Action Required" : "End Your Shift"}
            </h3>
            <p className="text-sm text-gray-600 mb-1 leading-tight">
              {isEndShiftBlocked 
                ? `You have ${pendingTasksWithoutReasonCount} pending tasks. Click the number above to provide reasons.`
                : "Great work today! Swipe to complete your shift and log your hours."}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <div className="text-sm text-gray-600 mb-1">Shift Duration</div>
              <div className="text-2xl font-bold text-gray-800">
                {formatShiftTime(shiftElapsedTime)}
              </div>
            </div>

            <div className="text-center mt-4">
              <div className="text-lg font-medium text-gray-800">{getCurrentTime()}</div>
              <div className="text-sm text-gray-600">{getCurrentDate()}</div>
            </div>
          </div>

          <div className="mb-6">
            <div
              className={`relative bg-gray-100 rounded-full h-12 overflow-hidden select-none ${
                isClockingOut || isSwipeCompleted || isEndShiftBlocked
                  ? "cursor-not-allowed opacity-60 grayscale"
                  : "cursor-pointer"
              }`}
              onMouseDown={handleSwipeStart}
              onTouchStart={handleSwipeStart}
            >
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out rounded-full ${
                  isEndShiftBlocked ? "bg-gray-400" : "bg-gradient-to-r from-green-500 to-emerald-600"
                }`}
                style={{ width: `${swipeProgress * 100}%` }}
              />
              <div
                className="absolute top-1 left-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-out"
                style={{ transform: `translateX(${swipeProgress * 200}px)` }}
              >
                {isClockingOut ? (
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : isEndShiftBlocked ? (
                  <IoAlertCircleOutline className="w-5 h-5 text-gray-400" />
                ) : (
                  <MdChevronRight size={24} className={swipeProgress > 0.5 ? "text-emerald-600" : "text-gray-400"} />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={`text-sm font-medium transition-all duration-300 ${
                  swipeProgress > 0.3 ? "text-white" : "text-gray-500"
                }`}>
                  {isClockingOut ? "Processing..." : isEndShiftBlocked ? "Reasons Needed" : "Swipe Right"}
                </span>
              </div>
            </div>
          </div>

          {(attendanceError || clockOutError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600">
                {attendanceError || clockOutError?.message || "Error occurred. Try again."}
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-800 transition-colors font-medium text-sm"
            disabled={isClockingOut}
          >
            Cancel
          </button>
        </div>
      </div>

      <PendingTasksReasonModal 
        isOpen={showReasonModal} 
        onClose={() => setShowReasonModal(false)}
        onGlobalClose={onClose}
        tasks={pendingTasksWithoutReason}
      />
    </>
  );
};

export default EndShiftModal;
