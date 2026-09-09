import React from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { FiClock, FiX } from "react-icons/fi";
import { useReviewAttendanceCorrection } from "../hooks/useAttendanceMutations";
import { formatAttendanceTime } from "../utils";

const employeeName = (employee) =>
  `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() || "Employee";

const AttendanceRequestsDrawer = ({ isOpen, onClose, requests = [], isLoading }) => {
  const reviewMutation = useReviewAttendanceCorrection();

  const handleReview = async (record, status) => {
    try {
      await reviewMutation.mutateAsync({
        attendanceId: record._id,
        data: { status },
      });
      toast.success(
        status === "approved" ? "Request approved" : "Request rejected"
      );
    } catch (error) {
      toast.error(error?.message || "Failed to update request");
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[80] backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#F8FAFC] z-[90] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">
                Time-change requests
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {requests.length} pending
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-sm text-gray-500">
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <FiClock className="w-8 h-8 mb-2" />
                <p className="text-sm">No pending requests</p>
              </div>
            ) : (
              requests.map((record) => {
                const name = employeeName(record.employee);
                const request = record.correctionRequest || {};
                const dateLabel = record.date
                  ? format(new Date(record.date), "EEE, MMM d")
                  : "";

                return (
                  <div
                    key={record._id}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#3F8CFF] text-white flex items-center justify-center shrink-0">
                        {record.employee?.profileImage ? (
                          <img
                            src={record.employee.profileImage}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {name}
                        </p>
                        <p className="text-xs text-gray-500">{dateLabel}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="rounded-xl bg-[#F7F9FC] p-2.5">
                        <p className="text-gray-400 mb-1">Current</p>
                        <p className="font-medium text-gray-800">
                          {formatAttendanceTime(record.clockInTime)} –{" "}
                          {formatAttendanceTime(record.clockOutTime)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-2.5">
                        <p className="text-amber-600 mb-1">Requested</p>
                        <p className="font-medium text-amber-800">
                          {formatAttendanceTime(request.requestedClockInTime)} –{" "}
                          {formatAttendanceTime(request.requestedClockOutTime)}
                        </p>
                      </div>
                    </div>

                    {request.reason && (
                      <p className="text-xs text-gray-600 mb-3">
                        {request.reason}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() => handleReview(record, "rejected")}
                        className="flex-1 h-9 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() => handleReview(record, "approved")}
                        className="flex-1 h-9 rounded-xl text-sm font-medium text-white bg-[#3F8CFF] hover:bg-blue-600 disabled:opacity-50"
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
      </div>
    </>
  );
};

export default AttendanceRequestsDrawer;
