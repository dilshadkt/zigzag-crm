import React, { useState, useEffect } from "react";
import { IoTimeOutline, IoAlertCircleOutline } from "react-icons/io5";
import { MdChevronRight } from "react-icons/md";
import PendingTasksReasonModal from "./PendingTasksReasonModal";
import { useAttendanceManager } from "../../../api/hooks";

const EndShiftModal = ({
  isOpen,
  onClose,
  isClockingOut,
  clockOutError,
  onEndShift,
  shiftElapsedTime,
}) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeCompleted, setIsSwipeCompleted] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);

  const {
    isEndShiftBlocked,
    pendingTasksWithoutReasonCount,
    pendingTasksWithoutReason,
  } = useAttendanceManager();

  useEffect(() => {
    if (!isOpen) {
      setAttendanceError(null);
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
      setShowReasonModal(false);
    }
  }, [isOpen]);

  const formatShiftTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSwipeStart = (e) => {
    if (isEndShiftBlocked) {
      setAttendanceError("Add reasons for pending tasks to end your shift.");
      return;
    }
    if (isClockingOut || isSwipeCompleted) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = clientX - rect.left;
    const trackWidth = Math.max(rect.width - 48, 1);

    const handleSwipeMove = (moveEvent) => {
      if (isSwipeCompleted || isClockingOut) return;
      const currentX =
        (moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX) -
        rect.left;
      const progress = Math.min(Math.max((currentX - startX) / trackWidth, 0), 1);
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
        }, 700);
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
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
        <div className="w-full max-w-[320px] rounded-3xl bg-white p-5 shadow-2xl">
          <div className="mb-5 flex flex-col items-center text-center">
            <div
              className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${
                isEndShiftBlocked ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {isEndShiftBlocked ? (
                <button
                  type="button"
                  onClick={() => setShowReasonModal(true)}
                  className="text-xl font-bold"
                  title="Provide reasons"
                >
                  {pendingTasksWithoutReasonCount}
                </button>
              ) : (
                <IoTimeOutline className="h-7 w-7" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEndShiftBlocked ? "Reasons needed" : "End shift"}
            </h3>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {formatShiftTime(shiftElapsedTime)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {isEndShiftBlocked
                ? `${pendingTasksWithoutReasonCount} pending task${
                    pendingTasksWithoutReasonCount === 1 ? "" : "s"
                  } need a reason`
                : "Swipe to clock out"}
            </p>
            {isEndShiftBlocked && (
              <button
                type="button"
                onClick={() => setShowReasonModal(true)}
                className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Add reasons
              </button>
            )}
          </div>

          <div
            className={`relative mb-4 h-12 select-none overflow-hidden rounded-full bg-gray-100 ${
              isClockingOut || isSwipeCompleted || isEndShiftBlocked
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
            onMouseDown={handleSwipeStart}
            onTouchStart={handleSwipeStart}
          >
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-150 ${
                isEndShiftBlocked ? "bg-gray-400" : "bg-emerald-600"
              }`}
              style={{ width: `${swipeProgress * 100}%` }}
            />
            <div
              className="absolute top-1 left-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-150"
              style={{ transform: `translateX(${swipeProgress * 220}px)` }}
            >
              {isClockingOut ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              ) : isEndShiftBlocked ? (
                <IoAlertCircleOutline className="h-5 w-5 text-gray-400" />
              ) : (
                <MdChevronRight
                  size={22}
                  className={swipeProgress > 0.5 ? "text-emerald-600" : "text-gray-400"}
                />
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span
                className={`text-sm font-medium ${
                  swipeProgress > 0.35 ? "text-white" : "text-gray-500"
                }`}
              >
                {isClockingOut
                  ? "Ending..."
                  : isEndShiftBlocked
                  ? "Blocked"
                  : "Swipe to end"}
              </span>
            </div>
          </div>

          {(attendanceError || clockOutError) && (
            <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {attendanceError || clockOutError?.message || "Something went wrong."}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
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
