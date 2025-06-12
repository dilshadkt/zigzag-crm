import React, { useState } from "react";
import {
  useGetCurrentAttendanceStatus,
  useGetEmployeeAttendanceHistory,
  useAttendanceManager,
} from "../api/hooks";
import { useAuth } from "../hooks/useAuth";
import { formatLocation } from "../utils/locationUtils";
import {
  IoFingerPrintOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
} from "react-icons/io5";

const AttendancePage = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days ago
    endDate: new Date().toISOString().split("T")[0], // Today
  });

  const {
    currentStatus,
    isShiftActive,
    isOnBreak,
    shiftStartTime,
    handleStartBreak,
    handleEndBreak,
    isStartingBreak,
    isEndingBreak,
  } = useAttendanceManager();

  const { data: attendanceHistory, isLoading: historyLoading } =
    useGetEmployeeAttendanceHistory(user?.id, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 50,
    });

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return "0h 0m";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "checked-in":
        return "text-green-600 bg-green-100";
      case "checked-out":
        return "text-gray-600 bg-gray-100";
      case "break":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance</h1>
        <p className="text-gray-600">
          Track your work hours and attendance history
        </p>
      </div>

      {/* Current Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Current Status
          </h2>
          <div className="flex items-center gap-2">
            <IoFingerPrintOutline className="w-5 h-5 text-blue-600" />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                currentStatus?.status
              )}`}
            >
              {currentStatus?.status === "checked-in" &&
                !isOnBreak &&
                "Working"}
              {currentStatus?.status === "break" && "On Break"}
              {currentStatus?.status === "checked-out" && "Checked Out"}
              {!currentStatus?.status && "Not Clocked In"}
            </span>
          </div>
        </div>

        {isShiftActive ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <IoTimeOutline className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clock In Time</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatTime(currentStatus?.clockInTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <IoStatsChartOutline className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hours Worked</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatDuration(currentStatus?.currentDuration || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <IoLocationOutline className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatLocation(currentStatus?.clockInLocation)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <IoFingerPrintOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              You're not clocked in
            </h3>
            <p className="text-gray-600">
              Use the fingerprint button in the header to start your shift
            </p>
          </div>
        )}

        {/* Break Management */}
        {isShiftActive && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                Break Management
              </h3>
              {isOnBreak ? (
                <button
                  onClick={handleEndBreak}
                  disabled={isEndingBreak}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isEndingBreak ? "Ending Break..." : "End Break"}
                </button>
              ) : (
                <button
                  onClick={() => handleStartBreak("Manual break")}
                  disabled={isStartingBreak}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {isStartingBreak ? "Starting Break..." : "Start Break"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Attendance History
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {historyLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance history...</p>
          </div>
        ) : attendanceHistory?.attendance?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Clock In
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Clock Out
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Total Hours
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Approval
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.attendance.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                        {formatDate(record.date)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {formatTime(record.clockInTime)}
                    </td>
                    <td className="py-3 px-4">
                      {formatTime(record.clockOutTime)}
                    </td>
                    <td className="py-3 px-4">
                      {formatDuration(record.totalHours)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(
                          record.approvalStatus
                        )}`}
                      >
                        {record.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <IoCalendarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No attendance records found
            </h3>
            <p className="text-gray-600">
              No attendance records found for the selected date range
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
