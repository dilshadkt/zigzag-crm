import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../../components/shared/modal";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useRequestAttendanceCorrection } from "../hooks/useAttendanceMutations";
import { formatAttendanceTime, hasPendingCorrection, toDateTimeLocal } from "../utils";

const RequestCorrectionModal = ({ isOpen, record, onClose }) => {
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [reason, setReason] = useState("");
  const requestMutation = useRequestAttendanceCorrection();

  useEffect(() => {
    if (!record) return;
    const pending = hasPendingCorrection(record);
    setClockInTime(
      toDateTimeLocal(
        pending
          ? record.correctionRequest.requestedClockInTime
          : record.clockInTime
      )
    );
    setClockOutTime(
      toDateTimeLocal(
        pending
          ? record.correctionRequest.requestedClockOutTime
          : record.clockOutTime
      )
    );
    setReason(pending ? record.correctionRequest.reason || "" : "");
  }, [record]);

  if (!isOpen || !record) return null;

  const pending = hasPendingCorrection(record);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clockInTime) {
      toast.error("Check-in time is required");
      return;
    }
    if (clockOutTime && new Date(clockOutTime) < new Date(clockInTime)) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please add a reason for this request");
      return;
    }

    try {
      await requestMutation.mutateAsync({
        attendanceId: record._id,
        data: {
          clockInTime: new Date(clockInTime).toISOString(),
          clockOutTime: clockOutTime ? new Date(clockOutTime).toISOString() : null,
          reason: reason.trim(),
        },
      });
      toast.success("Request sent for admin approval");
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to submit request");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request time change"
      maxWidth="sm:max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Current times: {formatAttendanceTime(record.clockInTime)} in
          {record.clockOutTime
            ? ` · ${formatAttendanceTime(record.clockOutTime)} out`
            : " · no check-out yet"}
        </p>

        {pending && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            You already have a pending request. Submitting again will replace it.
          </div>
        )}

        {record.correctionRequest?.status === "rejected" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Last request was rejected
            {record.correctionRequest.reviewNotes
              ? `: ${record.correctionRequest.reviewNotes}`
              : "."}
          </div>
        )}

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Requested check-in</span>
          <input
            type="datetime-local"
            value={clockInTime}
            onChange={(e) => setClockInTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Requested check-out</span>
          <input
            type="datetime-local"
            value={clockOutTime}
            onChange={(e) => setClockOutTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Reason</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none"
            placeholder="Why should these times be changed?"
            required
          />
        </label>

        <div className="flex justify-end pt-2">
          <PrimaryButton
            type="submit"
            title={pending ? "Update request" : "Send request"}
            loading={requestMutation.isPending}
            disable={requestMutation.isPending}
          />
        </div>
      </form>
    </Modal>
  );
};

export default RequestCorrectionModal;
