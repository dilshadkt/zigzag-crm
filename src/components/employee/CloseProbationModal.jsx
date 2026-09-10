import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useCloseEmployeeProbation } from "../../api/hooks";
import { formatJoiningDate, getProbationTrack } from "../../utils/leaveEntitlement";

const CloseProbationModal = ({ employee, employeeId, onClose }) => {
  const track = getProbationTrack(employee);
  const [reason, setReason] = useState("");
  const closeMutation = useCloseEmployeeProbation(employeeId);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await closeMutation.mutateAsync({ reason });
      toast.success("Probation closed. Employee is now active.");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to close probation");
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
          Close probation
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          This ends probation and marks the employee as active. Paid leave
          (vacation, sick leave, remote work) will unlock.
        </p>
        <div className="rounded-[14px] border border-emerald-100 bg-emerald-50/70 p-3 mb-4 text-[12px] text-[#0A1629] space-y-1.5">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Probation ended</span>
            <span className="font-medium">
              {formatJoiningDate(track?.endDate) || "—"}
            </span>
          </div>
          {track?.isExpired && track?.remainingDays != null && (
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-red-600">
                {Math.abs(track.remainingDays)} days overdue
              </span>
            </div>
          )}
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
          Reason (optional)
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Notes about completing probation..."
            className="rounded-[14px] border-2 border-[#D8E0F0]/80 px-3 py-2 text-sm text-[#0A1629] outline-none focus:border-[#3F8CFF] min-h-[90px] resize-none"
          />
        </label>
        <button
          type="submit"
          disabled={closeMutation.isLoading}
          className="w-full mt-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {closeMutation.isLoading ? "Closing..." : "Close & make active"}
        </button>
      </form>
    </div>
  );
};

export default CloseProbationModal;
