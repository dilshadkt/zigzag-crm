import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../../components/shared/modal";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useReviewAttendanceCorrection, useUpdateAttendance } from "../hooks/useAttendanceMutations";
import { formatAttendanceTime, hasPendingCorrection, toDateTimeLocal } from "../utils";

const EditAttendanceModal = ({ isOpen, record, onClose }) => {
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const updateMutation = useUpdateAttendance();
  const reviewMutation = useReviewAttendanceCorrection();

  useEffect(() => {
    if (!record) return;
    setClockInTime(toDateTimeLocal(record.clockInTime));
    setClockOutTime(toDateTimeLocal(record.clockOutTime));
    setAdminNotes(record.adminNotes || "");
    setReviewNotes(record.correctionRequest?.reviewNotes || "");
  }, [record]);

  if (!isOpen || !record) return null;

  const employeeName = `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`.trim();
  const pending = hasPendingCorrection(record);
  const isSaving = updateMutation.isPending || reviewMutation.isPending;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!clockInTime) {
      toast.error("Check-in time is required");
      return;
    }
    if (clockOutTime && new Date(clockOutTime) < new Date(clockInTime)) {
      toast.error("Check-out must be after check-in");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        attendanceId: record._id,
        data: {
          clockInTime: new Date(clockInTime).toISOString(),
          clockOutTime: clockOutTime ? new Date(clockOutTime).toISOString() : null,
          adminNotes,
        },
      });
      toast.success("Attendance times updated");
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to update attendance");
    }
  };

  const applyRequestedTimes = () => {
    setClockInTime(toDateTimeLocal(record.correctionRequest?.requestedClockInTime));
    setClockOutTime(toDateTimeLocal(record.correctionRequest?.requestedClockOutTime));
  };

  const handleReview = async (status) => {
    try {
      await reviewMutation.mutateAsync({
        attendanceId: record._id,
        data: { status, reviewNotes },
      });
      toast.success(
        status === "approved"
          ? "Time-change request approved"
          : "Time-change request rejected"
      );
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to review request");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeName ? `Edit times · ${employeeName}` : "Edit attendance times"}
      maxWidth="sm:max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {pending && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
            <p className="font-medium text-amber-800 mb-1">Pending time-change request</p>
            <p className="text-amber-700">
              In: {formatAttendanceTime(record.correctionRequest.requestedClockInTime)}
              {" · "}
              Out: {formatAttendanceTime(record.correctionRequest.requestedClockOutTime)}
            </p>
            {record.correctionRequest.reason && (
              <p className="text-amber-700 mt-1">
                Reason: {record.correctionRequest.reason}
              </p>
            )}
            <button
              type="button"
              onClick={applyRequestedTimes}
              className="mt-2 text-sm font-medium text-[#3F8CFF] hover:underline"
            >
              Fill form with requested times
            </button>
          </div>
        )}

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Check-in</span>
          <input
            type="datetime-local"
            value={clockInTime}
            onChange={(e) => setClockInTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Check-out</span>
          <input
            type="datetime-local"
            value={clockOutTime}
            onChange={(e) => setClockOutTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Admin notes</span>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none"
            placeholder="Optional note about this change"
          />
        </label>

        {pending && (
          <label className="block text-sm">
            <span className="font-medium text-gray-700">Review note</span>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none"
              placeholder="Shown to the employee when you approve or reject"
            />
          </label>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          {pending && (
            <>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleReview("rejected")}
                className="h-10 px-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
              >
                Reject request
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleReview("approved")}
                className="h-10 px-3 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                Approve request
              </button>
            </>
          )}
          <PrimaryButton
            type="submit"
            title="Save times"
            loading={updateMutation.isPending}
            disable={isSaving}
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditAttendanceModal;
