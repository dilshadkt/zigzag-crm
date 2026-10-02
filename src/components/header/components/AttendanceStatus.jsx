import React, { useEffect, useRef, useState } from "react";
import { IoFingerPrintOutline } from "react-icons/io5";
import EndShiftModal from "./EndShiftModal";
import { formatBreakMinutes } from "../../../features/attendance/utils";

const breakSecondsAt = (breaks, now) =>
  (breaks || []).reduce((total, item) => {
    if (!item?.startTime) return total;
    const start = new Date(item.startTime).getTime();
    if (!Number.isFinite(start)) return total;
    const end = item.endTime ? new Date(item.endTime).getTime() : now;
    if (!Number.isFinite(end) || end < start) return total;
    return total + Math.floor((end - start) / 1000);
  }, 0);

const spanMinutes = (start, end) => {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.round(ms / 60000);
};

const isOpenStatus = (status) =>
  status === "checked-in" || status === "break" || status === "overtime";

const breakMinutesFor = (record, now) =>
  (record?.breaks || []).reduce((total, item) => {
    if (!item?.startTime) return total;
    return total + spanMinutes(item.startTime, item.endTime || now);
  }, 0);

const workMinutesFor = (record, now) => {
  const end = record?.clockOutTime || (isOpenStatus(record?.status) ? now : null);
  if (!record?.clockInTime || !end) {
    return record?.totalHours ? Math.round(Number(record.totalHours) * 60) : 0;
  }
  return Math.max(0, spanMinutes(record.clockInTime, end) - breakMinutesFor(record, now));
};

const AttendanceStatus = ({
  isShiftActive,
  isOnBreak,
  shiftElapsedTime,
  breaks,
  todayRecords = [],
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
  const sessions = todayRecords.length
    ? todayRecords
    : [{ breaks, status: isOnBreak ? "break" : "checked-in", clockOutTime: null, clockInTime: null }];
  const usingDayTotal = todayRecords.length > 0;
  const breakMinutes = usingDayTotal
    ? sessions.reduce((sum, record) => sum + breakMinutesFor(record, now), 0)
    : Math.round(breakSecondsAt(breaks, now) / 60);
  const workMinutes = usingDayTotal
    ? sessions.reduce((sum, record) => sum + workMinutesFor(record, now), 0)
    : Math.max(0, Math.round(shiftElapsedTime / 60) - breakMinutes);
  const workLabel = formatBreakMinutes(workMinutes);
  const breakLabel = formatBreakMinutes(breakMinutes);

  useEffect(() => {
    if (!isShiftActive) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isShiftActive]);

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
          title={`Today · work ${workLabel}, break ${breakLabel}`}
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
              {workLabel}
              <span className="ml-1 text-[10px] font-medium text-gray-400">work</span>
            </span>
            <span className={`mt-0.5 text-[10px] font-medium tabular-nums ${breakMinutes > 0 ? "text-amber-600" : "text-gray-400"}`}>
              {breakLabel} break
            </span>
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-[1100] w-48 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
            <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {isOnBreak ? "On break" : "Checked in"} · today {workLabel} work · {breakLabel} break
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
