import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useAuth } from "../../hooks/useAuth";
import { useCloseEmployeeProbation, useGetLeavePolicy } from "../../api/hooks";
import {
  calculateLeaveQuotasFromProbationEnd,
  formatJoiningDate,
  getProbationTrack,
} from "../../utils/leaveEntitlement";

const toInputDate = (value = new Date()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return toInputDate(new Date());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const EndProbationModal = ({ employee, employeeId, onClose }) => {
  const track = getProbationTrack(employee);
  const { user } = useAuth();
  const { data: leavePolicy = [] } = useGetLeavePolicy(user?.company);
  const [reason, setReason] = useState("");
  // Default to the day the End probation button is clicked
  const [endDateInput, setEndDateInput] = useState(() => toInputDate(new Date()));
  const endMutation = useCloseEmployeeProbation(employeeId);

  const effectiveEnd = useMemo(() => {
    if (!endDateInput) return new Date();
    const parsed = new Date(`${endDateInput}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [endDateInput]);

  const leavePreview = useMemo(
    () => calculateLeaveQuotasFromProbationEnd(leavePolicy || [], effectiveEnd),
    [leavePolicy, effectiveEnd]
  );

  const scheduledEndLabel = formatJoiningDate(track?.scheduledEndDate);
  const scheduledEndInput = track?.scheduledEndDate
    ? toInputDate(track.scheduledEndDate)
    : "";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const finalEndDate = endDateInput
      ? effectiveEnd
      : new Date(); // if left empty, treat as click day

    try {
      const result = await endMutation.mutateAsync({
        reason,
        endDate: finalEndDate.toISOString(),
      });
      toast.success(
        result?.message || "Probation ended. Leave quotas recalculated."
      );
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to end probation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
        >
          <RxCross2 size={20} />
        </button>
        <h3 className="text-lg font-semibold text-[#0A1629] mb-1">
          End probation
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Enter the date probation ended. If you leave it as today, that click
          day is used. Leave is recalculated from this date.
        </p>

        <div className="rounded-[14px] border border-amber-100 bg-amber-50/70 p-4 mb-4 space-y-3">
          <div className="flex justify-between gap-2 text-[12px]">
            <span className="text-gray-500">Joined</span>
            <span className="font-semibold text-[#0A1629]">
              {formatJoiningDate(track?.joiningDate) || "—"}
            </span>
          </div>
          <div className="flex justify-between gap-2 text-[12px]">
            <span className="text-gray-500">Probation started</span>
            <span className="font-semibold text-[#0A1629]">
              {formatJoiningDate(track?.startDate) || "—"}
            </span>
          </div>
          {scheduledEndLabel && (
            <div className="flex justify-between gap-2 text-[12px]">
              <span className="text-gray-500">Originally scheduled end</span>
              <span className="font-semibold text-[#0A1629]">
                {scheduledEndLabel}
              </span>
            </div>
          )}

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#0A1629] pt-1 border-t border-amber-100">
            Probation end date
            <input
              type="date"
              value={endDateInput}
              onChange={(event) => setEndDateInput(event.target.value)}
              className="rounded-[14px] border-2 border-[#D8E0F0] bg-white px-3 py-2.5 text-sm font-medium text-[#0A1629] outline-none focus:border-[#3F8CFF]"
            />
            <span className="text-[11px] font-normal text-gray-500">
              Defaults to today ({formatJoiningDate(new Date())}). Change it if
              probation ended on a different day.
            </span>
          </label>

          {scheduledEndInput && scheduledEndInput !== endDateInput && (
            <button
              type="button"
              onClick={() => setEndDateInput(scheduledEndInput)}
              className="text-[11px] font-semibold text-[#3F8CFF] hover:underline text-left"
            >
              Use scheduled end ({scheduledEndLabel})
            </button>
          )}
        </div>

        <div className="rounded-[14px] border border-blue-100 bg-blue-50/60 p-3 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 mb-2">
            Leave recalculation preview
          </p>
          <p className="text-[11px] text-blue-700/80 mb-2">
            From {formatJoiningDate(effectiveEnd)} through Dec{" "}
            {leavePreview.meta.year}
          </p>
          <div className="space-y-1.5">
            {leavePreview.meta.breakdown.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 text-[12px]"
              >
                <span className="text-slate-600">
                  {item.name}
                  <span className="text-slate-400">
                    {" "}
                    ({item.yearlyQuota}/yr · {item.distribution})
                  </span>
                </span>
                <span className="font-semibold text-[#0A1629]">
                  {item.granted == null ? "Unlimited" : `${item.granted} days`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
          Reason (optional)
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Notes about ending probation..."
            className="rounded-[14px] border-2 border-[#D8E0F0]/80 px-3 py-2 text-sm text-[#0A1629] outline-none focus:border-[#3F8CFF] min-h-[80px] resize-none"
          />
        </label>
        <button
          type="submit"
          disabled={endMutation.isLoading}
          className="w-full mt-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {endMutation.isLoading
            ? "Ending..."
            : "End probation & recalculate leave"}
        </button>
      </form>
    </div>
  );
};

export default EndProbationModal;
