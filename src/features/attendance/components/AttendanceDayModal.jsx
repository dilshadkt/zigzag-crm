import React from "react";
import { format } from "date-fns";
import { FiClock, FiLogIn, FiLogOut, FiMapPin, FiX } from "react-icons/fi";
import { MdAccessTime, MdCheckCircle, MdError } from "react-icons/md";

const AttendanceDayModal = ({ isOpen, selectedDayData, onClose }) => {
  if (!isOpen || !selectedDayData) return null;

  const { date, attendanceRecords, formattedDate } = selectedDayData;

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "h:mm:ss a");
    } catch {
      return "N/A";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      "checked-in": {
        label: "Checked In",
        bg: "bg-green-100",
        text: "text-green-700",
        icon: MdCheckCircle,
      },
      "checked-out": {
        label: "Checked Out",
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: MdCheckCircle,
      },
      break: {
        label: "On Break",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: MdAccessTime,
      },
      overtime: {
        label: "Overtime",
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: MdAccessTime,
      },
    };

    const config = statusConfig[status] || {
      label: status || "Unknown",
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: MdError,
    };

    const Icon = config.icon;

    return (
      <span
        className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
      >
        <Icon className="text-sm" />
        {config.label}
      </span>
    );
  };

  // Get approval status badge
  const getApprovalBadge = (approvalStatus) => {
    const approvalConfig = {
      approved: {
        label: "Approved",
        bg: "bg-green-100",
        text: "text-green-700",
      },
      pending: {
        label: "Pending",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
      },
      rejected: {
        label: "Rejected",
        bg: "bg-red-100",
        text: "text-red-700",
      },
      "auto-approved": {
        label: "Auto Approved",
        bg: "bg-blue-100",
        text: "text-blue-700",
      },
    };

    const config = approvalConfig[approvalStatus] || {
      label: approvalStatus || "Unknown",
      bg: "bg-gray-100",
      text: "text-gray-700",
    };

    return (
      <span
        className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Attendance Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance records for this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceRecords.map((record, index) => (
                <div
                  key={record._id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Session Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Session {index + 1}
                      </span>
                      {getStatusBadge(record.status)}
                      {getApprovalBadge(record.approvalStatus)}
                    </div>
                    {record.totalHours > 0 && (
                      <div className="flex items-center gap-1 text-sm font-semibold text-purple-700">
                        <FiClock className="text-base" />
                        <span>{record.totalHours.toFixed(2)} hours</span>
                      </div>
                    )}
                  </div>

                  {/* Check-in Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FiLogIn className="text-green-600" />
                        <span className="font-medium text-gray-700">
                          Check-in:
                        </span>
                        <span className="text-gray-900">
                          {formatTime(record.clockInTime)}
                        </span>
                      </div>
                      {record.isLate && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <MdError className="text-base" />
                          <span>
                            Late by {record.lateBy || 0} minutes
                          </span>
                        </div>
                      )}
                      {record.expectedClockIn && (
                        <div className="text-xs text-gray-500 ml-6">
                          Expected: {formatTime(record.expectedClockIn)}
                        </div>
                      )}
                    </div>

                    {/* Check-out Details */}
                    {record.clockOutTime && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FiLogOut className="text-blue-600" />
                          <span className="font-medium text-gray-700">
                            Check-out:
                          </span>
                          <span className="text-gray-900">
                            {formatTime(record.clockOutTime)}
                          </span>
                        </div>
                        {record.isEarlyOut && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <MdError className="text-base" />
                            <span>
                              Early by {record.earlyOutBy || 0} minutes
                            </span>
                          </div>
                        )}
                        {record.expectedClockOut && (
                          <div className="text-xs text-gray-500 ml-6">
                            Expected: {formatTime(record.expectedClockOut)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Regular Hours */}
                    {record.regularHours > 0 && (
                      <div>
                        <span className="text-gray-500">Regular Hours: </span>
                        <span className="font-medium text-gray-900">
                          {record.regularHours.toFixed(2)}h
                        </span>
                      </div>
                    )}

                    {/* Overtime Hours */}
                    {record.overtimeHours > 0 && (
                      <div>
                        <span className="text-gray-500">Overtime: </span>
                        <span className="font-medium text-purple-700">
                          {record.overtimeHours.toFixed(2)}h
                        </span>
                      </div>
                    )}

                    {/* Break Time */}
                    {record.breakTime > 0 && (
                      <div>
                        <span className="text-gray-500">Break Time: </span>
                        <span className="font-medium text-gray-900">
                          {record.breakTime} minutes
                        </span>
                      </div>
                    )}

                    {/* Shift Type */}
                    {record.shiftType && (
                      <div>
                        <span className="text-gray-500">Shift: </span>
                        <span className="font-medium text-gray-900 capitalize">
                          {record.shiftType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Location Information */}
                  {(record.clockInLocation?.address ||
                    record.clockOutLocation?.address) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-2 text-sm">
                        {record.clockInLocation?.address && (
                          <div className="flex items-start gap-2">
                            <FiMapPin className="text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-gray-500">Check-in: </span>
                              <span className="text-gray-900">
                                {record.clockInLocation.address}
                              </span>
                            </div>
                          </div>
                        )}
                        {record.clockOutLocation?.address && (
                          <div className="flex items-start gap-2">
                            <FiMapPin className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-gray-500">Check-out: </span>
                              <span className="text-gray-900">
                                {record.clockOutLocation.address}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Work Description */}
                  {record.workDescription && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        <span className="text-gray-500 font-medium">
                          Work Description:
                        </span>
                        <p className="text-gray-900 mt-1">
                          {record.workDescription}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {record.adminNotes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        <span className="text-gray-500 font-medium">
                          Admin Notes:
                        </span>
                        <p className="text-gray-900 mt-1">{record.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Breaks */}
                  {record.breaks && record.breaks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        <span className="text-gray-500 font-medium mb-2 block">
                          Breaks:
                        </span>
                        <div className="space-y-2">
                          {record.breaks.map((breakItem, breakIndex) => (
                            <div
                              key={breakIndex}
                              className="bg-gray-50 rounded p-2 text-xs"
                            >
                              <div>
                                <span className="text-gray-500">Start: </span>
                                <span className="text-gray-900">
                                  {formatTime(breakItem.startTime)}
                                </span>
                              </div>
                              {breakItem.endTime && (
                                <div>
                                  <span className="text-gray-500">End: </span>
                                  <span className="text-gray-900">
                                    {formatTime(breakItem.endTime)}
                                  </span>
                                </div>
                              )}
                              {breakItem.duration && (
                                <div>
                                  <span className="text-gray-500">
                                    Duration:{" "}
                                  </span>
                                  <span className="text-gray-900">
                                    {breakItem.duration} minutes
                                  </span>
                                </div>
                              )}
                              {breakItem.reason && (
                                <div>
                                  <span className="text-gray-500">Reason: </span>
                                  <span className="text-gray-900">
                                    {breakItem.reason}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDayModal;

