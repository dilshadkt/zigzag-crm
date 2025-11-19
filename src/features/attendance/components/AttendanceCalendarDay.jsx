import React from "react";
import { isSameDay } from "date-fns";
import { format } from "date-fns";
import { FiClock, FiLogIn, FiLogOut } from "react-icons/fi";

const AttendanceCalendarDay = ({
  item,
  getAttendanceForDate,
  isLoading,
  weekIndex = 0,
}) => {
  // Determine if a date is today
  const isToday = (date) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  // Get attendance records for this day
  const attendanceRecords = item?.fullDate
    ? getAttendanceForDate(item.fullDate)
    : [];

  const hasAttendance = attendanceRecords.length > 0;

  // Calculate total hours for the day
  const totalHours = attendanceRecords.reduce((sum, record) => {
    return sum + (record.totalHours || 0);
  }, 0);

  // Get status indicators
  const hasCheckedIn = attendanceRecords.some(
    (r) => r.status === "checked-in" || r.clockInTime
  );
  const hasCheckedOut = attendanceRecords.some(
    (r) => r.status === "checked-out" && r.clockOutTime
  );
  const isLate = attendanceRecords.some((r) => r.isLate);
  const isEarlyOut = attendanceRecords.some((r) => r.isEarlyOut);

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "h:mm a");
    } catch {
      return "";
    }
  };

  // Get first check-in and last check-out
  const firstCheckIn =
    attendanceRecords.length > 0
      ? attendanceRecords
          .filter((r) => r.clockInTime)
          .sort((a, b) => new Date(a.clockInTime) - new Date(b.clockInTime))[0]
      : null;

  const lastCheckOut =
    attendanceRecords.length > 0
      ? attendanceRecords
          .filter((r) => r.clockOutTime)
          .sort(
            (a, b) => new Date(b.clockOutTime) - new Date(a.clockOutTime)
          )[0]
      : null;

  return (
    <div
      className={`min-h-[60px] md:min-h-[150px] border group border-[#E6EBF5] relative p-1
        ${isToday(item.fullDate) ? "bg-blue-50" : ""}
      `}
    >
      {/* Date Number */}
      {item?.date && (
        <div
          className={`w-4 md:w-6 h-4 md:h-6 rounded-full ${
            isToday(item.fullDate) ? "bg-blue-500 text-white" : "text-gray-600"
          } 
          text-xs md:text-[13px] font-medium flexCenter absolute top-1 right-1`}
        >
          {item.date}
        </div>
      )}

      {/* Attendance Details */}
      {item?.fullDate && (
        <div className="w-[88%] flex flex-col gap-1 pr-1 mt-6 md:mt-1">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded-md mb-1"></div>
              <div className="h-6 bg-gray-200 rounded-md"></div>
            </div>
          ) : hasAttendance ? (
            <div className="flex flex-col gap-1">
              {/* Check-in Time */}
              {firstCheckIn?.clockInTime && (
                <div className="text-[10px] md:text-xs bg-green-50 text-green-700 border border-green-200 rounded-md px-1.5 py-1 flex items-center gap-1">
                  <FiLogIn className="text-xs" />
                  <span className="truncate">
                    In: {formatTime(firstCheckIn.clockInTime)}
                  </span>
                  {isLate && (
                    <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded">
                      Late
                    </span>
                  )}
                </div>
              )}

              {/* Check-out Time */}
              {lastCheckOut?.clockOutTime && (
                <div className="text-[10px] md:text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-1.5 py-1 flex items-center gap-1">
                  <FiLogOut className="text-xs" />
                  <span className="truncate">
                    Out: {formatTime(lastCheckOut.clockOutTime)}
                  </span>
                  {isEarlyOut && (
                    <span className="text-[9px] bg-orange-100 text-orange-700 px-1 rounded">
                      Early
                    </span>
                  )}
                </div>
              )}

              {/* Total Hours */}
              {totalHours > 0 && (
                <div className="text-[10px] md:text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-md px-1.5 py-1 flex items-center gap-1">
                  <FiClock className="text-xs" />
                  <span className="truncate">
                    {totalHours.toFixed(1)}h
                  </span>
                </div>
              )}

              {/* Multiple Records Indicator */}
              {attendanceRecords.length > 1 && (
                <div className="text-[9px] bg-gray-100 text-gray-600 rounded-md px-1.5 py-0.5 text-center">
                  {attendanceRecords.length} session
                  {attendanceRecords.length > 1 ? "s" : ""}
                </div>
              )}

              {/* Status Badge */}
              {attendanceRecords.some((r) => r.status === "checked-in") && (
                <div className="text-[9px] bg-yellow-100 text-yellow-700 rounded-md px-1.5 py-0.5 text-center">
                  Active
                </div>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 italic mt-2">
              No attendance
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendarDay;

