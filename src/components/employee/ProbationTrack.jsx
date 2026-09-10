import React from "react";
import { formatJoiningDate, getProbationTrack } from "../../utils/leaveEntitlement";

const TimelineStep = ({ label, date, active, done, isLast }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div
        className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
          done
            ? "bg-emerald-500 border-emerald-500"
            : active
              ? "bg-amber-500 border-amber-500"
              : "bg-white border-slate-300"
        }`}
      />
      {!isLast && (
        <div
          className={`w-0.5 flex-1 min-h-[28px] ${
            done ? "bg-emerald-300" : "bg-slate-200"
          }`}
        />
      )}
    </div>
    <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-[13px] font-semibold text-[#0A1629]">
        {formatJoiningDate(date) || "—"}
      </p>
    </div>
  </div>
);

const ProbationTrack = ({ employee, compact = false }) => {
  const track = getProbationTrack(employee);
  if (!track?.hasProbationHistory && !track?.isOnProbation) return null;

  const remainingLabel =
    track.isCompleted
      ? "Completed"
      : track.remainingDays == null
        ? ""
        : track.remainingDays < 0
          ? `${Math.abs(track.remainingDays)} days overdue`
          : `${track.remainingDays} days left`;

  const joinedDone = Boolean(track.joiningDate);
  const startedDone = Boolean(track.startDate);
  const endedDone = Boolean(track.isCompleted || track.closedAt);

  return (
    <div
      className={`rounded-[14px] border ${
        track.isCompleted
          ? "border-emerald-100 bg-emerald-50/70"
          : "border-amber-100 bg-amber-50/70"
      } ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <p
          className={`text-[11px] font-semibold uppercase tracking-wide ${
            track.isCompleted ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {track.isCompleted ? "Probation history" : "Probation track"}
        </p>
        {remainingLabel && (
          <span
            className={`text-[11px] font-semibold ${
              track.isCompleted
                ? "text-emerald-700"
                : track.isExpired || track.remainingDays < 0
                  ? "text-red-600"
                  : "text-amber-700"
            }`}
          >
            {remainingLabel}
          </span>
        )}
      </div>

      <div className={compact ? "pl-0.5" : "pl-1"}>
        <TimelineStep
          label="Joined"
          date={track.joiningDate}
          done={joinedDone}
          active={!startedDone && joinedDone}
        />
        <TimelineStep
          label="Probation started"
          date={track.startDate}
          done={startedDone && (endedDone || track.isOnProbation)}
          active={track.isOnProbation && !endedDone}
        />
        <TimelineStep
          label={track.isCompleted ? "Probation ended" : "Probation ends"}
          date={track.closedAt || track.scheduledEndDate || track.endDate}
          done={endedDone}
          active={track.isOnProbation && !endedDone}
          isLast
        />
      </div>

      <div className="mt-2 pt-2 border-t border-black/5 space-y-1.5 text-[12px] text-[#0A1629]">
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">Period</span>
          <span className="font-medium">
            {track.originalPeriodMonths} month
            {track.originalPeriodMonths === 1 ? "" : "s"}
          </span>
        </div>
        {track.scheduledEndDate && track.closedAt && (
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Scheduled end</span>
            <span className="font-medium">
              {formatJoiningDate(track.scheduledEndDate)}
            </span>
          </div>
        )}
        {track.closeReason && (
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">End note</span>
            <span className="font-medium text-right max-w-[60%]">
              {track.closeReason}
            </span>
          </div>
        )}
      </div>

      {track.extensions?.length > 0 && (
        <div className="mt-3 pt-2 border-t border-black/5 space-y-1.5">
          <p
            className={`text-[10px] font-semibold uppercase tracking-wide ${
              track.isCompleted ? "text-emerald-700" : "text-amber-700"
            }`}
          >
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
