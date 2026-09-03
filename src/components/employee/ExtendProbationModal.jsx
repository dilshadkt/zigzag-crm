import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useExtendEmployeeProbation } from "../../api/hooks";
import { formatJoiningDate, getProbationTrack } from "../../utils/leaveEntitlement";

const ExtendProbationModal = ({ employee, employeeId, onClose }) => {
  const track = getProbationTrack(employee);
  const [months, setMonths] = useState("1");
  const [days, setDays] = useState("0");
  const [reason, setReason] = useState("");
  const extendMutation = useExtendEmployeeProbation(employeeId);

  const previewEndDate = useMemo(() => {
    if (!track?.endDate) return null;
    const next = new Date(track.endDate);
    next.setMonth(next.getMonth() + (Number(months) || 0));
    next.setDate(next.getDate() + (Number(days) || 0));
    return next;
  }, [track?.endDate, months, days]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const addedMonths = Number(months) || 0;
    const addedDays = Number(days) || 0;
    if (addedMonths <= 0 && addedDays <= 0) {
      toast.error("Add at least one month or day");
      return;
    }

    try {
      await extendMutation.mutateAsync({
        months: addedMonths,
        days: addedDays,
        reason,
      });
      toast.success("Probation period extended");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to extend probation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl w-full max-w-md p-6 relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
        >
          <RxCross2 size={20} />
        </button>
        <h3 className="text-lg font-semibold text-[#0A1629] mb-1">
          Extend probation
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          Current end date: {formatJoiningDate(track?.endDate) || "—"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
            Months
            <input
              type="number"
              min="0"
              max="24"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
              className="rounded-[14px] border-2 border-[#D8E0F0]/80 px-3 py-2 text-sm text-[#0A1629] outline-none focus:border-[#3F8CFF]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
            Extra days
            <input
              type="number"
              min="0"
              max="31"
              value={days}
              onChange={(event) => setDays(event.target.value)}
              className="rounded-[14px] border-2 border-[#D8E0F0]/80 px-3 py-2 text-sm text-[#0A1629] outline-none focus:border-[#3F8CFF]"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600 mt-3">
          Reason
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why is probation being extended?"
            className="rounded-[14px] border-2 border-[#D8E0F0]/80 px-3 py-2 text-sm text-[#0A1629] outline-none focus:border-[#3F8CFF] min-h-[90px] resize-none"
          />
        </label>
        {previewEndDate && (
          <p className="text-xs font-medium text-amber-700 mt-3">
            New end date: {formatJoiningDate(previewEndDate)}
          </p>
        )}
        <button
          type="submit"
          disabled={extendMutation.isLoading}
          className="w-full mt-5 py-2.5 rounded-xl bg-[#3F8CFF] text-white text-sm font-medium disabled:opacity-50"
        >
          {extendMutation.isLoading ? "Saving..." : "Extend period"}
        </button>
      </form>
    </div>
  );
};

export default ExtendProbationModal;
