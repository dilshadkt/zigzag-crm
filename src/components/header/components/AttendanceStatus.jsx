import React, { useEffect, useRef, useState } from "react";
import { IoFingerPrintOutline } from "react-icons/io5";
import EndShiftModal from "./EndShiftModal";

const breakSecondsAt = (breaks, now) =>
  (breaks || []).reduce((total, item) => {
    if (!item?.startTime) return total;
    const start = new Date(item.startTime).getTime();
    if (!Number.isFinite(start)) return total;
    const end = item.endTime ? new Date(item.endTime).getTime() : now;
    if (!Number.isFinite(end) || end < start) return total;
    return total + Math.floor((end - start) / 1000);
  }, 0);

const formatHours = (seconds) => {
  const safe = Math.max(0, seconds);
  const hours = safe / 3600;
  if (safe > 0 && hours < 0.1) {
    return `${Math.max(1, Math.round(safe / 60))}m`;
  }
  return `${hours.toFixed(1)}h`;
};

const AttendanceStatus = ({
  isShiftActive,
  isOnBreak,
  shiftElapsedTime,
  breaks,
  isClockingOut,
  clockOutError,
  onEndShift,
  onStartBreak,
  isStartingBreak,
}) => {
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const menuRef = useRef(null);
  const hasOpenBreak = (breaks || []).some((item) => item?.startTime && !item.endTime);
  const breakSeconds = breakSecondsAt(breaks, now);

  useEffect(() => {
    if (!hasOpenBreak) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasOpenBreak]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  if (!isShiftActive) return null;

  return (
    <>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-2 h-11 sm:h-12 rounded-[14px] bg-white px-2.5 sm:px-3 border border-transparent hover:border-gray-100 transition-colors"
          title={
            breakSeconds > 0
              ? `Checked in ${formatHours(shiftElapsedTime)}, break ${formatHours(breakSeconds)}`
              : `Checked in ${formatHours(shiftElapsedTime)}`
          }
          aria-expanded={menuOpen}
          aria-label="Shift access"
        >
          <span className="relative flex items-center justify-center shrink-0">
            <IoFingerPrintOutline
              className={`w-5 h-5 ${isOnBreak ? "text-yellow-600" : "text-emerald-600"}`}
            />
            <span
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                isOnBreak ? "bg-yellow-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-xs font-semibold tabular-nums text-gray-800">
              {formatHours(shiftElapsedTime)}
            </span>
            {breakSeconds > 0 && (
              <span className="mt-0.5 text-[10px] font-medium tabular-nums text-amber-600">
                {formatHours(breakSeconds)} break
              </span>
            )}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-[1100] w-48 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {isOnBreak ? "On break" : "Checked in"} · {formatHours(shiftElapsedTime)}
              {breakSeconds > 0 ? ` · break ${formatHours(breakSeconds)}` : ""}
            </p>
            {isOnBreak ? null : (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onStartBreak("Break");
                }}
                disabled={isStartingBreak}
                className="w-full rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-yellow-600 hover:bg-yellow-50 disabled:opacity-50"
              >
                {isStartingBreak ? "Starting..." : "Take break"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setShowEndShiftModal(true);
              }}
              disabled={isClockingOut}
              className="w-full rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isClockingOut ? "Ending..." : "End shift"}
            </button>
          </div>
        )}
      </div>

      <EndShiftModal
        isOpen={showEndShiftModal}
        onClose={() => setShowEndShiftModal(false)}
        user={null}
        isClockingOut={isClockingOut}
        clockOutError={clockOutError}
        onEndShift={onEndShift}
        shiftElapsedTime={shiftElapsedTime}
      />
    </>
  );
};

export default AttendanceStatus;
