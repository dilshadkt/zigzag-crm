import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetLeavePolicy,
  useUpdateEmployeeProbationDates,
} from "../../api/hooks";
import {
  calculateLeaveQuotasFromProbationEnd,
  formatJoiningDate,
  getProbationTrack,
} from "../../utils/leaveEntitlement";

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TimelineStep = ({
  label,
  date,
  active,
  done,
  isLast,
  editable,
  inputValue,
  onChange,
}) => (
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
    <div className={`pb-4 ${isLast ? "pb-0" : ""} flex-1`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {editable ? (
        <input
          type="date"
          value={inputValue}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full max-w-[180px] rounded-lg border border-[#D8E0F0] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0A1629] outline-none focus:border-[#3F8CFF]"
        />
      ) : (
        <p className="text-[13px] font-semibold text-[#0A1629]">
          {formatJoiningDate(date) || "—"}
        </p>
      )}
    </div>
  </div>
);

const ProbationTrack = ({
  employee,
  employeeId,
  compact = false,
  canEdit = false,
}) => {
  const track = getProbationTrack(employee);
  const { user } = useAuth();
  const { data: leavePolicy = [] } = useGetLeavePolicy(user?.company);
  const updateDatesMutation = useUpdateEmployeeProbationDates(
    employeeId || employee?._id
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    joiningDate: "",
    probationStartDate: "",
    probationEndDate: "",
    probationClosedAt: "",
  });

  useEffect(() => {
    if (!track) return;
    setDraft({
      joiningDate: toInputDate(track.joiningDate),
      probationStartDate: toInputDate(track.startDate),
      probationEndDate: toInputDate(track.scheduledEndDate || track.endDate),
      probationClosedAt: toInputDate(
        track.closedAt || (track.isCompleted ? track.endDate : null)
      ),
    });
  }, [
    track?.joiningDate,
    track?.startDate,
    track?.scheduledEndDate,
    track?.closedAt,
    track?.endDate,
    track?.isCompleted,
    employee?._id,
  ]);

  const leavePreview = useMemo(() => {
    if (!isEditing) return null;
    const stopValue = track?.isCompleted
      ? draft.probationClosedAt || draft.probationEndDate
      : null;
    if (!stopValue) return null;
    return calculateLeaveQuotasFromProbationEnd(
      leavePolicy || [],
      new Date(stopValue)
    );
  }, [
    isEditing,
    track?.isCompleted,
    draft.probationClosedAt,
    draft.probationEndDate,
    leavePolicy,
  ]);

  if (!track?.hasProbationHistory && !track?.isOnProbation) return null;

  const remainingLabel = track.isCompleted
    ? "Completed"
    : track.remainingDays == null
      ? ""
      : track.remainingDays < 0
        ? `${Math.abs(track.remainingDays)} days overdue`
        : `${track.remainingDays} days left`;

  const joinedDone = Boolean(track.joiningDate);
  const startedDone = Boolean(track.startDate);
  const endedDone = Boolean(track.isCompleted || track.closedAt);

  const startEditing = () => {
    setDraft({
      joiningDate: toInputDate(track.joiningDate),
      probationStartDate: toInputDate(track.startDate),
      probationEndDate: toInputDate(track.scheduledEndDate || track.endDate),
      probationClosedAt: toInputDate(
        track.closedAt || (track.isCompleted ? track.endDate : "")
      ),
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveDates = async () => {
    if (!draft.joiningDate || !draft.probationStartDate) {
      toast.error("Joined and probation start dates are required");
      return;
    }

    const endField = track.isCompleted
      ? draft.probationClosedAt
      : draft.probationEndDate;
    if (!endField) {
      toast.error(
        track.isCompleted
          ? "Probation stop date is required"
          : "Probation end date is required"
      );
      return;
    }

    const payload = {
      joiningDate: draft.joiningDate,
      probationStartDate: draft.probationStartDate,
      probationEndDate: track.isCompleted
        ? draft.probationEndDate || draft.probationClosedAt
        : draft.probationEndDate,
    };

    if (track.isCompleted) {
      payload.probationClosedAt = draft.probationClosedAt;
      payload.recalculateLeave = true;
    }

    try {
      const result = await updateDatesMutation.mutateAsync(payload);
      toast.success(
        result?.message ||
          (track.isCompleted
            ? "Dates updated and leave recalculated"
            : "Probation dates updated")
      );
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update probation dates"
      );
    }
  };

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
        <div className="flex items-center gap-2">
          {remainingLabel && !isEditing && (
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
          {canEdit && !isEditing && (
            <button
              type="button"
              onClick={startEditing}
              className="text-[11px] font-semibold text-[#3F8CFF] hover:underline"
            >
              Edit dates
            </button>
          )}
        </div>
      </div>

      <div className={compact ? "pl-0.5" : "pl-1"}>
        <TimelineStep
          label="Joined"
          date={track.joiningDate}
          done={joinedDone}
          active={!startedDone && joinedDone}
          editable={isEditing}
          inputValue={draft.joiningDate}
          onChange={(value) =>
            setDraft((prev) => ({ ...prev, joiningDate: value }))
          }
        />
        <TimelineStep
          label="Probation started"
          date={track.startDate}
          done={startedDone && (endedDone || track.isOnProbation)}
          active={track.isOnProbation && !endedDone}
          editable={isEditing}
          inputValue={draft.probationStartDate}
          onChange={(value) =>
            setDraft((prev) => ({ ...prev, probationStartDate: value }))
          }
        />
        <TimelineStep
          label={
            track.isCompleted
              ? "Probation stopped"
              : isEditing
                ? "Probation ends"
                : "Probation ends"
          }
          date={track.closedAt || track.scheduledEndDate || track.endDate}
          done={endedDone}
          active={track.isOnProbation && !endedDone}
          editable={isEditing}
          inputValue={
            track.isCompleted ? draft.probationClosedAt : draft.probationEndDate
          }
          onChange={(value) =>
            setDraft((prev) =>
              track.isCompleted
                ? { ...prev, probationClosedAt: value }
                : { ...prev, probationEndDate: value }
            )
          }
          isLast={!track.isCompleted || !isEditing}
        />
        {track.isCompleted && isEditing && (
          <TimelineStep
            label="Scheduled end (optional)"
            date={track.scheduledEndDate}
            done={Boolean(draft.probationEndDate)}
            editable
            inputValue={draft.probationEndDate}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, probationEndDate: value }))
            }
            isLast
          />
        )}
      </div>

      {leavePreview && (
        <div className="mt-3 rounded-xl border border-blue-100 bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 mb-1">
            Leave will be recalculated
          </p>
          <p className="text-[11px] text-blue-700/80 mb-2">
            From{" "}
            {formatJoiningDate(
              draft.probationClosedAt || draft.probationEndDate
            )}{" "}
            through Dec {leavePreview.meta.year}
          </p>
          <div className="space-y-1">
            {leavePreview.meta.breakdown.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-2 text-[12px]"
              >
                <span className="text-slate-600">{item.name}</span>
                <span className="font-semibold text-[#0A1629]">
                  {item.granted == null ? "Unlimited" : `${item.granted} days`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cancelEditing}
            className="px-3 py-1.5 rounded-lg bg-white text-slate-600 text-[12px] font-semibold border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveDates}
            disabled={updateDatesMutation.isLoading}
            className="px-3 py-1.5 rounded-lg bg-[#3F8CFF] text-white text-[12px] font-semibold disabled:opacity-50"
          >
            {updateDatesMutation.isLoading
              ? "Saving..."
              : track.isCompleted
                ? "Save & recalculate leave"
                : "Save dates"}
          </button>
        </div>
      )}

      {!isEditing && (
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
      )}

      {!isEditing && track.extensions?.length > 0 && (
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
