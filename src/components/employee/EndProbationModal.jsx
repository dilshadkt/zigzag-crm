import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useAuth } from "../../hooks/useAuth";
import { useCloseEmployeeProbation, useGetLeavePolicy } from "../../api/hooks";
import ProbationTrack from "./ProbationTrack";
import {
  calculateLeaveQuotasFromProbationEnd,
  formatJoiningDate,
  getProbationTrack,
} from "../../utils/leaveEntitlement";

const EndProbationModal = ({ employee, employeeId, onClose }) => {
  const track = getProbationTrack(employee);
  const { user } = useAuth();
  const { data: leavePolicy = [] } = useGetLeavePolicy(user?.company);
  const [reason, setReason] = useState("");
  const endMutation = useCloseEmployeeProbation(employeeId);

  const effectiveEnd = useMemo(() => {
    if (track?.scheduledEndDate && track.scheduledEndDate <= new Date()) {
      return track.scheduledEndDate;
    }
    return new Date();
  }, [track?.scheduledEndDate]);

  const leavePreview = useMemo(
    () => calculateLeaveQuotasFromProbationEnd(leavePolicy || [], effectiveEnd),
    [leavePolicy, effectiveEnd]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const result = await endMutation.mutateAsync({
        reason,
        endDate: effectiveEnd.toISOString(),
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
          Ends probation, marks the employee active, and recalculates leave from
          the company leave policy for the rest of the year.
        </p>

        <div className="mb-4">
          <ProbationTrack employee={employee} />
        </div>

        <div className="rounded-[14px] border border-blue-100 bg-blue-50/60 p-3 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 mb-2">
            Leave recalculation preview
          </p>
          <p className="text-[11px] text-blue-700/80 mb-2">
            From {formatJoiningDate(effectiveEnd)} through Dec {leavePreview.meta.year}
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
          {endMutation.isLoading ? "Ending..." : "End probation & recalculate leave"}
        </button>
      </form>
    </div>
  );
};

export default EndProbationModal;
