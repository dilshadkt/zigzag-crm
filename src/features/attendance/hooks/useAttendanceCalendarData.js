import { useMemo } from "react";
import { isSameDay, format, startOfMonth, endOfMonth } from "date-fns";
import { useEmployeeAttendance } from "./useAttendanceAnalytics";

/**
 * Hook to fetch and organize attendance data for calendar view
 * @param {Date} currentDate - The current month being viewed
 * @param {string} employeeId - The employee ID to fetch attendance for
 */
export const useAttendanceCalendarData = (currentDate, employeeId) => {
  // Calculate start and end dates for the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Format dates for API
  const startDate = format(monthStart, "yyyy-MM-dd");
  const endDate = format(monthEnd, "yyyy-MM-dd");

  // Fetch attendance data for the month
  const { data, isLoading, error } = useEmployeeAttendance(
    employeeId,
    startDate,
    endDate,
    1,
    100 // Get up to 100 records for the month
  );

  // Organize attendance data by date
  const attendanceByDate = useMemo(() => {
    if (!data?.attendance || !Array.isArray(data.attendance)) {
      return new Map();
    }

    const map = new Map();

    data.attendance.forEach((record) => {
      if (!record.date) return;

      try {
        // Normalize date to start of day for consistent comparison
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        const dateKey = format(recordDate, "yyyy-MM-dd");

        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }

        map.get(dateKey).push(record);
      } catch (error) {
        console.error("Error processing attendance record date:", error, record);
      }
    });

    return map;
  }, [data?.attendance]);

  // Get attendance records for a specific date
  const getAttendanceForDate = (date) => {
    if (!date) return [];
    try {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const dateKey = format(dateObj, "yyyy-MM-dd");
      return attendanceByDate.get(dateKey) || [];
    } catch (error) {
      console.error("Error getting attendance for date:", error, date);
      return [];
    }
  };

  // Check if date has attendance
  const hasAttendance = (date) => {
    if (!date) return false;
    try {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const dateKey = format(dateObj, "yyyy-MM-dd");
      return attendanceByDate.has(dateKey);
    } catch (error) {
      console.error("Error checking attendance for date:", error, date);
      return false;
    }
  };

  return {
    attendanceByDate,
    getAttendanceForDate,
    hasAttendance,
    isLoading,
    error,
    attendanceData: data?.attendance || [],
  };
};

