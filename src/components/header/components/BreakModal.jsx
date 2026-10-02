import React, { useEffect, useRef, useState } from "react";
import { IoCafeOutline } from "react-icons/io5";
import { signOutOfApp } from "../../../pwa/closeGuard";

const pad = (value) => String(value).padStart(2, "0");

const formatElapsed = (totalSeconds) => {
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    : `${pad(minutes)}:${pad(secs)}`;
};

const BreakModal = ({ isOpen, breaks, isEndingBreak, endBreakError, onEndBreak }) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeCompleted, setIsSwipeCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [knobTravel, setKnobTravel] = useState(200);
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  const markingRef = useRef(false);
  const trackRef = useRef(null);

  const openBreak = [...(breaks || [])].reverse().find((item) => item && !item.endTime);
  const startedAt = openBreak?.startTime ? new Date(openBreak.startTime).getTime() : null;

  useEffect(() => {
    if (!isOpen) {
      progressRef.current = 0;
      completedRef.current = false;
      markingRef.current = false;
      setSwipeProgress(0);
      setIsSwipeCompleted(false);
      setError(null);
      return;
    }

    const tick = () => {
      const start = Number.isFinite(startedAt) ? startedAt : Date.now();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    const measure = () => {
      if (trackRef.current) {
        setKnobTravel(Math.max(trackRef.current.clientWidth - 48, 1));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", measure);
    };
  }, [isOpen, startedAt]);

  const setProgress = (value) => {
    progressRef.current = value;
    setSwipeProgress(value);
  };

  const endBreak = async () => {
    if (markingRef.current || isEndingBreak) return;
    markingRef.current = true;
    completedRef.current = true;
    setIsSwipeCompleted(true);

    try {
      setError(null);
      const result = await onEndBreak();
      if (result && result.success === false) {
        setProgress(0);
        completedRef.current = false;
        setIsSwipeCompleted(false);
        markingRef.current = false;
        setError(result.message || "Could not end the break.");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Could not end the break.";
      setError(message);
      setProgress(0);
      completedRef.current = false;
      setIsSwipeCompleted(false);
      markingRef.current = false;
    }
  };

  const handleSwipeStart = (event) => {
    if (isEndingBreak || completedRef.current) return;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const rect = event.currentTarget.getBoundingClientRect();
    const startX = clientX - rect.left;
    const trackWidth = Math.max(rect.width - 48, 1);

    const handleSwipeMove = (moveEvent) => {
      if (completedRef.current || isEndingBreak) return;
      const currentX =
        (moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX) - rect.left;
      const progress = Math.min(Math.max((currentX - startX) / trackWidth, 0), 1);
      setProgress(progress);
      if (progress >= 1 && !completedRef.current) {
        endBreak();
      }
    };

    const handleSwipeEnd = () => {
      if (!completedRef.current && progressRef.current < 1) {
        setProgress(0);
      }
      document.removeEventListener("mousemove", handleSwipeMove);
      document.removeEventListener("mouseup", handleSwipeEnd);
      document.removeEventListener("touchmove", handleSwipeMove);
      document.removeEventListener("touchend", handleSwipeEnd);
    };

    document.addEventListener("mousemove", handleSwipeMove);
    document.addEventListener("mouseup", handleSwipeEnd);
    document.addEventListener("touchmove", handleSwipeMove, { passive: false });
    document.addEventListener("touchend", handleSwipeEnd);
  };

  if (!isOpen) return null;

  const progress = Math.min(swipeProgress, 1);
  const message = error || endBreakError?.message;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-[320px] rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <IoCafeOutline className="h-7 w-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">You're on a break</h3>
          <p className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
            {formatElapsed(elapsed)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Swipe to end the break and get back to work
          </p>
        </div>

        <div
          ref={trackRef}
          className={`relative mb-4 h-12 select-none overflow-hidden rounded-full bg-gray-100 ${
            isEndingBreak || isSwipeCompleted ? "cursor-not-allowed opacity-80" : "cursor-pointer"
          }`}
          onMouseDown={handleSwipeStart}
          onTouchStart={handleSwipeStart}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-amber-500 transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1 left-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-150"
            style={{ transform: `translateX(${progress * knobTravel}px)` }}
          >
            {isEndingBreak ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
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
            <span className={`text-sm font-medium ${progress > 0.35 ? "text-white" : "text-gray-500"}`}>
              {isEndingBreak ? "Ending break..." : isSwipeCompleted ? "Done" : "Swipe to end break"}
            </span>
          </div>
        </div>

        {message && (
          <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-600">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            signOutOfApp("/auth/signin");
          }}
          className="w-full py-2.5 text-sm font-medium text-gray-400 transition-colors hover:text-gray-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default BreakModal;
