import React from "react";

// Marks work created by a project's recurring schedule. It is not an "Extra" task:
// these sit outside the monthly quota altogether.
const RecurringBadge = ({ className = "" }) => (
  <span
    className={`shrink-0 whitespace-nowrap rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 ${className}`}
    title="Created automatically from this project's recurring work"
  >
    ↻ Recurring
  </span>
);

// A task carries recurrenceRule itself; a subtask carries it on its parent task.
export const isRecurringItem = (item) =>
  Boolean(item?.recurrenceRule || item?.parentTask?.recurrenceRule);

export default RecurringBadge;
