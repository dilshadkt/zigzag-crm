export const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatAttendanceTime = (value) => {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatBreakMinutes = (minutes) => {
  const total = Number(minutes) || 0;
  if (total <= 0) return "0m";
  const hours = Math.floor(total / 60);
  const mins = Math.round(total % 60);
  if (hours <= 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const hasPendingCorrection = (record) =>
  record?.correctionRequest?.status === "pending";

const DEFAULT_OFFICE_END = "18:00";

const isSameCalendarDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Where an unfinished session (no clock-out) stops counting.
 * Today it is still running, so it counts up to `now`. On an earlier day the
 * person forgot to clock out, so it counts up to the office end time from the
 * work schedule (never before the clock-in). `assumed` flags that second case.
 * @param {{clockInTime: string|Date}} record
 * @param {Date} now
 * @param {string} [officeEnd] "HH:mm" working-hours end from the company work schedule
 * @param {Date} [lastActivity] latest known activity (e.g. a break start); the session cannot end before it
 * @returns {{end: Date, assumed: boolean}}
 */
export const getOpenSessionEnd = (record, now, officeEnd, lastActivity) => {
  const clockIn = new Date(record.clockInTime);
  if (isNaN(clockIn.getTime()) || isSameCalendarDay(clockIn, now)) {
    return { end: now, assumed: false };
  }
  const valid = /^\d{1,2}:\d{2}$/.test(String(officeEnd || ""));
  const [h, m] = (valid ? officeEnd : DEFAULT_OFFICE_END).split(":").map(Number);
  const cutoff = new Date(clockIn);
  cutoff.setHours(h, m, 0, 0);
  let end = cutoff < clockIn ? clockIn : cutoff;
  if (lastActivity && !isNaN(new Date(lastActivity).getTime()) && new Date(lastActivity) > end) {
    end = new Date(lastActivity);
  }
  return { end, assumed: true };
};

// A break that was never ended on a finished or past session (from before the
// break-out prompt existed) counts as this many minutes.
export const UNENDED_BREAK_MINUTES = 5;
