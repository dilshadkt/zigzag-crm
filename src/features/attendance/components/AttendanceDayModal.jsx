import React from "react";
import { format } from "date-fns";
import { FiClock, FiLogIn, FiLogOut, FiMapPin } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";

const formatTime = (dateString) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "h:mm a");
  } catch {
    return "—";
  }
};

const statusStyles = {
  "checked-in": "bg-emerald-50 text-emerald-700",
  "checked-out": "bg-sky-50 text-sky-700",
  break: "bg-amber-50 text-amber-700",
  overtime: "bg-violet-50 text-violet-700",
};

const statusLabels = {
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  break: "On break",
  overtime: "Overtime",
};

const correctionStyles = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

const TimeTile = ({ label, time, icon: Icon, iconClass, expected, warning }) => (
  <div className="rounded-2xl bg-[#F7F9FC] border border-[#E6EBF5] p-3">
    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
      <Icon className={`text-sm ${iconClass}`} />
      {label}
    </div>
    <p className="text-[15px] font-semibold text-gray-900">{time}</p>
    {expected && (
      <p className="text-[11px] text-gray-400 mt-1">Expected {expected}</p>
    )}
    {warning && (
      <p className="text-[11px] font-medium text-red-500 mt-1">{warning}</p>
    )}
  </div>
);

const AttendanceDayModal = ({
  isOpen,
  selectedDayData,
  onClose,
  onRequestEdit,
}) => {
  if (!isOpen || !selectedDayData) return null;

  const { attendanceRecords, formattedDate } = selectedDayData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm:max-w-xl"
      title={
        <span className="block">
          Attendance details
          <span className="block text-sm font-normal text-gray-500 mt-0.5">
            {formattedDate}
          </span>
        </span>
      }
    >
      {attendanceRecords.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#F7F9FC] flex items-center justify-center">
            <FiClock className="text-gray-400 text-xl" />
          </div>
          <p className="text-sm text-gray-500">No attendance for this day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendanceRecords.map((record, index) => {
            const correctionStatus = record.correctionRequest?.status;
            const showCorrection =
              correctionStatus && correctionStatus !== "none";

            return (
              <div
                key={record._id || index}
                className="rounded-2xl border border-[#E6EBF5] p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-400">
                      Session {index + 1}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        statusStyles[record.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[record.status] || record.status}
                    </span>
                    {showCorrection && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          correctionStyles[correctionStatus] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Time change {correctionStatus}
                      </span>
                    )}
                  </div>
                  {record.totalHours > 0 && (
                    <span className="text-xs font-semibold text-[#3F8CFF] whitespace-nowrap">
                      {record.totalHours.toFixed(1)}h
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <TimeTile
                    label="Check-in"
                    time={formatTime(record.clockInTime)}
                    icon={FiLogIn}
                    iconClass="text-emerald-500"
                    expected={
                      record.expectedClockIn
                        ? formatTime(record.expectedClockIn)
                        : null
                    }
                    warning={
                      record.isLate
                        ? `Late by ${record.lateBy || 0} min`
                        : null
                    }
                  />
                  <TimeTile
                    label="Check-out"
                    time={formatTime(record.clockOutTime)}
                    icon={FiLogOut}
                    iconClass="text-[#3F8CFF]"
                    expected={
                      record.expectedClockOut
                        ? formatTime(record.expectedClockOut)
                        : null
                    }
                    warning={
                      record.isEarlyOut
                        ? `Early by ${record.earlyOutBy || 0} min`
                        : null
                    }
                  />
                </div>

                {(record.clockInLocation?.address ||
                  record.clockOutLocation?.address) && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                    <FiMapPin className="mt-0.5 shrink-0 text-[#3F8CFF]" />
                    <span>
                      {record.clockInLocation?.address ||
                        record.clockOutLocation?.address}
                    </span>
                  </div>
                )}

                {showCorrection && (
                  <div className="mt-3 rounded-xl bg-[#F7F9FC] px-3 py-2.5 text-xs text-gray-600 space-y-1">
                    {correctionStatus === "pending" && (
                      <p>
                        Requested {formatTime(record.correctionRequest.requestedClockInTime)}
                        {record.correctionRequest.requestedClockOutTime
                          ? ` – ${formatTime(record.correctionRequest.requestedClockOutTime)}`
                          : ""}
                      </p>
                    )}
                    {record.correctionRequest.reason && (
                      <p>Reason: {record.correctionRequest.reason}</p>
                    )}
                    {record.correctionRequest.reviewNotes && (
                      <p>Admin: {record.correctionRequest.reviewNotes}</p>
                    )}
                  </div>
                )}

                {onRequestEdit && (
                  <div className="mt-3 flex justify-end">
                    <PrimaryButton
                      title={
                        correctionStatus === "pending"
                          ? "Update request"
                          : "Request time change"
                      }
                      onclick={() => onRequestEdit(record)}
                      className="text-white h-9 px-3.5"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default AttendanceDayModal;
