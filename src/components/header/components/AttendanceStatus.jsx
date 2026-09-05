import React, { useEffect, useRef, useState } from "react";
import { IoFingerPrintOutline } from "react-icons/io5";
import EndShiftModal from "./EndShiftModal";

const AttendanceStatus = ({
  isShiftActive,
  isOnBreak,
  shiftElapsedTime,
  isClockingOut,
  clockOutError,
  onEndShift,
  onStartBreak,
  onEndBreak,
  isStartingBreak,
  isEndingBreak,
}) => {
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const formatShiftTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

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
          title={isOnBreak ? "On break" : "Active shift"}
          aria-expanded={menuOpen}
          aria-label="Shift access"
        >
          <span className="relative flex items-center justify-center shrink-0">
            <IoFingerPrintOutline
              className={`w-5 h-5 ${isOnBreak ? "text-yellow-600" : "text-emerald-600"}`}
            />
            <span
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse ${
                isOnBreak ? "bg-yellow-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-gray-800 tabular-nums">
            {formatShiftTime(shiftElapsedTime)}
          </span>
          <span
            className={`hidden sm:inline text-[10px] font-semibold uppercase tracking-wide ${
              isOnBreak ? "text-yellow-600" : "text-emerald-600"
            }`}
          >
            {isOnBreak ? "Break" : "In"}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-[1100] w-48 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {isOnBreak ? "On break" : "Active shift"} · {formatShiftTime(shiftElapsedTime)}
            </p>
            {isOnBreak ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEndBreak();
                }}
                disabled={isEndingBreak}
                className="w-full rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                {isEndingBreak ? "Ending break..." : "End break"}
              </button>
            ) : (
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
