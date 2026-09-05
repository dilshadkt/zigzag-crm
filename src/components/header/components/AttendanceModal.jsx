import React, { useState, useEffect, useRef } from "react";
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
  isClosable = true,
}) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeCompleted, setIsSwipeCompleted] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const isMarkingRef = useRef(false);
  const trackRef = useRef(null);
  const [knobTravel, setKnobTravel] = useState(200);

  useEffect(() => {
    if (!isOpen) {
      setAttendanceError(null);
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
      isMarkingRef.current = false;
      return;
    }
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    const measure = () => {
      if (trackRef.current) {
        setKnobTravel(Math.max(trackRef.current.clientWidth - 48, 1));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      clearInterval(tick);
      window.removeEventListener("resize", measure);
    };
  }, [isOpen]);

  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleSwipeStart = (e) => {
    if (isProcessingAttendance || isSwipeCompleted || isClockingIn) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = clientX - rect.left;
    const trackWidth = Math.max(rect.width - 48, 1);

    const handleSwipeMove = (moveEvent) => {
      if (isSwipeCompleted || isProcessingAttendance) return;
      const currentX =
        (moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX) -
        rect.left;
      const progress = Math.min(Math.max((currentX - startX) / trackWidth, 0), 1);
      setSwipeProgress(progress);
      if (progress >= 1 && !isSwipeCompleted && !isProcessingAttendance) {
        setIsSwipeCompleted(true);
        markAttendance();
      }
    };

    const handleSwipeEnd = () => {
      if (!isSwipeCompleted && !isProcessingAttendance && swipeProgress < 1) {
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

  const markAttendance = async () => {
    if (
      isMarkingRef.current ||
      isProcessingAttendance ||
      isClockingIn
    ) {
      return;
    }

    isMarkingRef.current = true;
    setIsSwipeCompleted(true);

    try {
      setAttendanceError(null);
      const location = await getUserLocation();
      const deviceInfo = getDeviceInfo();
      const result = await onClockIn(location, deviceInfo);

      if (result && result.success) {
        setTimeout(() => {
          onClose();
          setSwipeProgress(0);
          setIsSwipeCompleted(false);
          isMarkingRef.current = false;
        }, 700);
      } else {
        setSwipeProgress(0);
        setIsSwipeCompleted(false);
        isMarkingRef.current = false;
      }
    } catch (error) {
      let errorMessage = "Failed to clock in. Please try again.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setAttendanceError(errorMessage);
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
      isMarkingRef.current = false;
    }
  };

  if (!isOpen) return null;

  const busy = isClockingIn || isProcessingAttendance;
  const trackRefProgress = Math.min(swipeProgress, 1);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-[320px] rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <IoFingerPrintOutline className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.firstName ? `Hi, ${user.firstName}` : "Clock in"}
          </h3>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
            {timeLabel}
          </p>
          <p className="mt-1 text-sm text-gray-500">Swipe to start your shift</p>
        </div>

        <div
          ref={trackRef}
          className={`relative mb-4 h-12 select-none overflow-hidden rounded-full bg-gray-100 ${
            busy || isSwipeCompleted
              ? "cursor-not-allowed opacity-80"
              : "cursor-pointer"
          }`}
          onMouseDown={handleSwipeStart}
          onTouchStart={handleSwipeStart}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-[width] duration-150"
            style={{ width: `${trackRefProgress * 100}%` }}
          />
          <div
            className="absolute top-1 left-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-150"
            style={{
              transform: `translateX(${trackRefProgress * knobTravel}px)`,
            }}
          >
            {busy ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : isSwipeCompleted ? (
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className={`text-sm font-medium ${
                trackRefProgress > 0.35 ? "text-white" : "text-gray-500"
              }`}
            >
              {busy ? "Clocking in..." : isSwipeCompleted ? "Done" : "Swipe to clock in"}
            </span>
          </div>
        </div>

        {(attendanceError || clockInError) && (
          <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-600">
            {attendanceError || clockInError?.message || "Something went wrong."}
          </div>
        )}

        {isClosable ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              setSwipeProgress(0);
              setAttendanceError(null);
              setIsSwipeCompleted(false);
            }}
            className="w-full py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800 disabled:opacity-50"
            disabled={busy}
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              window.location.href = "/auth/signin";
            }}
            className="w-full rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-medium text-red-600"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceModal;
