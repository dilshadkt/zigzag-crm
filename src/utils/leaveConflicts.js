// Client-side twin of findConflictingVacation in crm-api/controllers/vacationController.js.
// Keep the two in step: same statuses, same day comparison, same half-day exception.

const ACTIVE_STATUSES = ["pending", "approved"];

const TYPE_LABELS = {
  vacation: "casual leave",
  sick_leave: "sick leave",
  remote_work: "remote work",
  unpaid_leave: "unpaid leave",
};

// "yyyy-MM-dd" form values are used as they are; stored ISO timestamps are read
// as UTC days, which is how the server compares them.
const dayKey = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

/**
 * Returns the first pending/approved request in `existing` that already covers
 * any of the requested days, or null. Two half-days on the same day only clash
 * when they are the same half.
 */
export const findLeaveConflict = (
  existing = [],
  { startDate, endDate, isHalfDay = false, halfDayType = null, excludeId = null }
) => {
  const startKey = dayKey(startDate);
  const endKey = dayKey(endDate);
  if (!startKey || !endKey) return null;

  return (
    existing.find((request) => {
      if (!ACTIVE_STATUSES.includes(request.status)) return false;
      const requestId = request.id || request._id;
      if (excludeId && String(requestId) === String(excludeId)) return false;

      const requestStart = dayKey(request.startDate);
      const requestEnd = dayKey(request.endDate);
      if (!requestStart || !requestEnd) return false;
      if (requestStart > endKey || requestEnd < startKey) return false;

      const bothSingleDay = startKey === endKey && requestStart === requestEnd;
      const oppositeHalves =
        bothSingleDay &&
        isHalfDay &&
        request.isHalfDay &&
        halfDayType &&
        request.halfDayType &&
        halfDayType !== request.halfDayType;

      return !oppositeHalves;
    }) || null
  );
};

export const describeLeaveConflict = (request, isSelf = true) => {
  const label = TYPE_LABELS[request.type] || "leave";
  const start = dayKey(request.startDate);
  const end = dayKey(request.endDate);
  const range = start === end ? start : `${start} to ${end}`;
  const half = request.isHalfDay
    ? ` (${request.halfDayType === "second_half" ? "second" : "first"} half)`
    : "";
  const subject = isSelf ? "You already have" : "This employee already has";
  const article = request.status === "approved" ? "an" : "a";
  return `${subject} ${article} ${request.status} ${label} request${half} for ${range}. Cancel or edit it instead of sending another request for the same day.`;
};
