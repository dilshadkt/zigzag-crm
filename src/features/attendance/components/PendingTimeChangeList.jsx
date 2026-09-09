import React from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  usePendingCorrectionRequests,
  useReviewAttendanceCorrection,
} from "../hooks/useAttendanceMutations";
import { formatAttendanceTime } from "../utils";

const employeeName = (employee) =>
  `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() ||
  employee?.name ||
  "Employee";

const PendingTimeChangeList = ({ onReviewed }) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canReview =
    user?.role === "company-admin" || hasPermission("attendance", "edit");
  const { data, isLoading } = usePendingCorrectionRequests(canReview);
  const reviewMutation = useReviewAttendanceCorrection();
  const requests = data?.requests || [];

  const handleReview = async (record, status) => {
    try {
      await reviewMutation.mutateAsync({
        attendanceId: record._id,
        data: { status },
      });
      toast.success(
        status === "approved" ? "Request approved" : "Request rejected"
      );
      onReviewed?.();
    } catch (error) {
      toast.error(error?.message || "Failed to update request");
    }
  };

  if (!canReview) return null;

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200/60 flex flex-col h-72 min-h-72 shrink-0 overflow-hidden select-none">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
        <h5 className="font-bold text-slate-700 text-xs">
          Pending Time-Change Requests ({requests.length})
        </h5>
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 text-xs">
        {isLoading ? (
          <p className="text-slate-400 font-medium text-xs py-1">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-slate-400 font-medium text-xs py-1">
            No pending time-change requests.
          </p>
        ) : (
          requests.map((record) => {
            const name = employeeName(record.employee);
            const request = record.correctionRequest || {};
            const dateLabel = record.date
              ? format(new Date(record.date), "MMM d")
              : "";

            return (
              <div
                key={record._id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100/60"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#3F8CFF] text-white flex items-center justify-center shrink-0">
                    {record.employee?.profileImage ? (
                      <img
                        src={record.employee.profileImage}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-bold">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{name}</p>
                    <p className="text-slate-400">{dateLabel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] sm:min-w-[220px]">
                  <span className="text-slate-500">
                    {formatAttendanceTime(record.clockInTime)} –{" "}
                    {formatAttendanceTime(record.clockOutTime)}
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className="font-semibold text-amber-700">
                    {formatAttendanceTime(request.requestedClockInTime)} –{" "}
                    {formatAttendanceTime(request.requestedClockOutTime)}
                  </span>
                </div>

                {request.reason && (
                  <p className="text-slate-500 truncate sm:max-w-[160px]" title={request.reason}>
                    {request.reason}
                  </p>
                )}

                <div className="flex gap-1.5 sm:ml-auto shrink-0">
                  <button
                    type="button"
                    disabled={reviewMutation.isPending}
                    onClick={() => handleReview(record, "rejected")}
                    className="px-2.5 h-7 rounded-md text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={reviewMutation.isPending}
                    onClick={() => handleReview(record, "approved")}
                    className="px-2.5 h-7 rounded-md text-[11px] font-semibold text-white bg-[#3F8CFF] hover:bg-blue-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PendingTimeChangeList;
