import React, { useEffect, useState } from "react";
import { IoTimeOutline } from "react-icons/io5";
import { useAuth } from "../../../hooks/useAuth";
import { useGetWorkSchedule } from "../../../api/hooks";

const SNOOZE_KEY = "officeEndReminderSnoozeUntil";
const DEFAULT_END = "18:00";

const readSnooze = () => {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY)) || 0;
  } catch {
    return 0;
  }
};

const saveSnooze = (until) => {
  try {
    localStorage.setItem(SNOOZE_KEY, String(until));
  } catch {
    // storage unavailable: the in-memory state still snoozes this session
  }
};

const todayAt = (hhmm) => {
  const [h, m] = String(hhmm || DEFAULT_END).split(":").map(Number);
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 18, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
};

const formatClock = (date) =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

/**
 * Asks anyone still clocked in after office hours to clock out, so open sessions
 * don't pile up as "missing clock-out". Re-appears after a snooze.
 */
const OfficeEndReminder = ({ isShiftActive, shiftStartTime, workedLabel, onClockOut }) => {
  const { user, companyId } = useAuth();
  const { data: schedule } = useGetWorkSchedule(companyId || user?.company);
  const [now, setNow] = useState(() => Date.now());
  const [snoozeUntil, setSnoozeUntil] = useState(readSnooze);

  useEffect(() => {
    if (!isShiftActive) return undefined;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [isShiftActive]);

  if (!isShiftActive) return null;

  const officeEnd = todayAt(schedule?.workingHours?.end);
  const startedBeforeEnd = !shiftStartTime || shiftStartTime < officeEnd;
  const startedToday =
    shiftStartTime && shiftStartTime.toDateString() === new Date().toDateString();

  if (now < officeEnd.getTime() || !startedBeforeEnd || now < snoozeUntil) return null;

  const snooze = (minutes) => {
    const until = Date.now() + minutes * 60 * 1000;
    saveSnooze(until);
    setSnoozeUntil(until);
  };

  const handleClockOut = () => {
    snooze(10);
    onClockOut();
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/45 px-4">
      <div
        role="alertdialog"
        aria-labelledby="office-end-title"
        className="w-full max-w-[340px] rounded-3xl bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <IoTimeOutline className="h-7 w-7" />
          </div>
          <h3 id="office-end-title" className="text-lg font-semibold text-gray-900">
            {startedToday ? "Office time is over" : "You forgot to clock out"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {startedToday
              ? `Office ended at ${formatClock(officeEnd)} and you are still clocked in.`
              : `Your shift from ${formatClock(shiftStartTime)} is still open.`}
          </p>
          {workedLabel && (
            <p className="mt-2 text-xs font-medium text-gray-400">Worked today: {workedLabel}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleClockOut}
          className="mb-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Clock out now
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => snooze(30)}
            className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Remind me in 30 min
          </button>
          <button
            type="button"
            onClick={() => snooze(60)}
            className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Working late
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficeEndReminder;
