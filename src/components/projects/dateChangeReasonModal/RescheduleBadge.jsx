import React from "react";
import { RESCHEDULE_REASONS } from "../../../utils/rescheduleReasons";

const TONES = {
  red: "border-red-200 bg-red-50 text-red-700",
  green: "border-green-200 bg-green-50 text-green-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
};

/**
 * Shows why a due date moved and what it cost, for one dueDateHistory entry.
 * Entries recorded before reason types existed have no reasonType and render nothing.
 */
const RescheduleBadge = ({ change }) => {
  const option = RESCHEDULE_REASONS.find((r) => r.value === change?.reasonType);
  if (!option) return null;

  const fault = change?.faultUser;
  const faultName = fault
    ? `${fault.firstName || ""} ${fault.lastName || ""}`.trim()
    : "";
  const penalty = Number(change?.penaltyPoints) || 0;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <span
        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONES[option.tone]}`}
      >
        {option.label}
      </span>
      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
        {penalty > 0 ? `-${penalty} Pts` : "No penalty"}
      </span>
      {faultName && (
        <span className="text-[11px] text-gray-500">
          Caused by <span className="font-medium text-gray-700">{faultName}</span>
        </span>
      )}
    </div>
  );
};

export default RescheduleBadge;
