import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useReviewAttendanceCorrection, useUpdateAttendance } from "../hooks/useAttendanceMutations";
import {
  formatAttendanceTime,
  formatBreakMinutes,
  hasPendingCorrection,
  toDateTimeLocal,
} from "../utils";

const makeBreakRow = (breakItem = {}, index = 0) => ({
  key: breakItem._id || `break-${index}-${Date.now()}`,
  startTime: toDateTimeLocal(breakItem.startTime),
  endTime: toDateTimeLocal(breakItem.endTime),
  reason: breakItem.reason || "",
});

const getBreakDurationMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }
  return Math.max(0, Math.round((end - start) / (1000 * 60)));
};

const EditAttendanceModal = ({ isOpen, record, onClose }) => {
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [breaks, setBreaks] = useState([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const updateMutation = useUpdateAttendance();
  const reviewMutation = useReviewAttendanceCorrection();

  useEffect(() => {
    if (!record) return;
    setClockInTime(toDateTimeLocal(record.clockInTime));
    setClockOutTime(toDateTimeLocal(record.clockOutTime));
    setBreaks((record.breaks || []).map((item, index) => makeBreakRow(item, index)));
    setAdminNotes(record.adminNotes || "");
    setReviewNotes(record.correctionRequest?.reviewNotes || "");
  }, [record]);

  const totalBreakMinutes = useMemo(
    () =>
      breaks.reduce(
        (sum, item) => sum + getBreakDurationMinutes(item.startTime, item.endTime),
        0
      ),
    [breaks]
  );

  if (!isOpen || !record) return null;

  const employeeName = `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`.trim();
  const pending = hasPendingCorrection(record);
  const isSaving = updateMutation.isPending || reviewMutation.isPending;

  const updateBreak = (key, field, value) => {
    setBreaks((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const addBreak = () => {
    setBreaks((current) => [
      ...current,
      makeBreakRow({ startTime: clockInTime || record.clockInTime }, current.length),
    ]);
  };

  const removeBreak = (key) => {
    setBreaks((current) => current.filter((item) => item.key !== key));
  };

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

    const checkIn = new Date(clockInTime);
    const checkOut = clockOutTime ? new Date(clockOutTime) : null;

    for (let index = 0; index < breaks.length; index += 1) {
      const item = breaks[index];
      if (!item.startTime) {
        toast.error(`Break ${index + 1} needs a start time`);
        return;
      }
      const start = new Date(item.startTime);
      const end = item.endTime ? new Date(item.endTime) : null;
      if (end && end < start) {
        toast.error(`Break ${index + 1} must end after it starts`);
        return;
      }
      if (start < checkIn) {
        toast.error(`Break ${index + 1} cannot start before check-in`);
        return;
      }
      if (checkOut && start > checkOut) {
        toast.error(`Break ${index + 1} cannot start after check-out`);
        return;
      }
      if (checkOut && end && end > checkOut) {
        toast.error(`Break ${index + 1} cannot end after check-out`);
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({
        attendanceId: record._id,
        data: {
          clockInTime: checkIn.toISOString(),
          clockOutTime: checkOut ? checkOut.toISOString() : null,
          breaks: breaks.map((item) => ({
            startTime: new Date(item.startTime).toISOString(),
            endTime: item.endTime ? new Date(item.endTime).toISOString() : null,
            reason: item.reason,
          })),
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
      maxWidth="sm:max-w-xl"
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        </div>

        <div className="rounded-2xl border border-gray-100 bg-[#F7F9FC] p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Break time</p>
              <p className="text-xs text-gray-500">
                Total {formatBreakMinutes(totalBreakMinutes)}
              </p>
            </div>
            <button
              type="button"
              onClick={addBreak}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#3F8CFF] shadow-sm hover:bg-blue-50"
            >
              <FiPlus className="h-3.5 w-3.5" />
              Add break
            </button>
          </div>

          {breaks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-400">
              No breaks recorded. Add one to edit start and end time.
            </p>
          ) : (
            <div className="space-y-3">
              {breaks.map((item, index) => (
                <div
                  key={item.key}
                  className="rounded-xl border border-gray-200 bg-white p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600">
                      Break {index + 1}
                      <span className="ml-2 font-medium text-gray-400">
                        {formatBreakMinutes(
                          getBreakDurationMinutes(item.startTime, item.endTime)
                        )}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => removeBreak(item.key)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove break ${index + 1}`}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="block text-xs">
                      <span className="font-medium text-gray-500">Start</span>
                      <input
                        type="datetime-local"
                        value={item.startTime}
                        onChange={(e) => updateBreak(item.key, "startTime", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                      />
                    </label>
                    <label className="block text-xs">
                      <span className="font-medium text-gray-500">End</span>
                      <input
                        type="datetime-local"
                        value={item.endTime}
                        onChange={(e) => updateBreak(item.key, "endTime", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                      />
                    </label>
                  </div>
                  <label className="mt-2 block text-xs">
                    <span className="font-medium text-gray-500">Reason (optional)</span>
                    <input
                      type="text"
                      value={item.reason}
                      onChange={(e) => updateBreak(item.key, "reason", e.target.value)}
                      placeholder="Lunch, personal, etc."
                      className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm"
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

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
