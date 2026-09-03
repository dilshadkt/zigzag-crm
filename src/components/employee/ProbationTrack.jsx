import React from "react";
import { formatJoiningDate, getProbationTrack } from "../../utils/leaveEntitlement";

const ProbationTrack = ({ employee, compact = false }) => {
  const track = getProbationTrack(employee);
  if (!track?.isOnProbation) return null;

  const remainingLabel =
    track.remainingDays == null
      ? ""
      : track.remainingDays < 0
        ? `${Math.abs(track.remainingDays)} days overdue`
        : `${track.remainingDays} days left`;

  return (
    <div
      className={`rounded-[14px] border border-amber-100 bg-amber-50/70 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 mb-2">
        Probation track
      </p>
      <div className="space-y-1.5 text-[12px] text-[#0A1629]">
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Created</span>
          <span className="font-medium">
            {formatJoiningDate(track.createdAt) || "—"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Started</span>
          <span className="font-medium">
            {formatJoiningDate(track.startDate) || "—"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Period</span>
          <span className="font-medium">
            {track.originalPeriodMonths} month
            {track.originalPeriodMonths === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Ends</span>
          <span className="font-medium">
            {formatJoiningDate(track.endDate) || "—"}
          </span>
        </div>
        {remainingLabel && (
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Remaining</span>
            <span
              className={`font-semibold ${
                track.isExpired || track.remainingDays < 0
                  ? "text-red-600"
                  : "text-amber-700"
              }`}
            >
              {remainingLabel}
            </span>
          </div>
        )}
      </div>
      {track.extensions?.length > 0 && (
        <div className="mt-3 pt-2 border-t border-amber-100 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Extensions
          </p>
          {track.extensions.map((item, index) => {
            const extender =
              item.extendedBy && typeof item.extendedBy === "object"
                ? [item.extendedBy.firstName, item.extendedBy.lastName]
                    .filter(Boolean)
                    .join(" ")
                : "";
            const added = [
              item.addedMonths ? `${item.addedMonths} mo` : null,
              item.addedDays ? `${item.addedDays} d` : null,
            ]
              .filter(Boolean)
              .join(" + ");
            return (
              <div key={index} className="text-[11px] text-gray-600">
                <p className="font-medium text-[#0A1629]">
                  +{added || "extension"} → {formatJoiningDate(item.newEndDate)}
                </p>
                {item.reason && <p className="text-gray-500">{item.reason}</p>}
                <p className="text-[10px] text-gray-400">
                  {formatJoiningDate(item.extendedAt)}
                  {extender ? ` · ${extender}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProbationTrack;
