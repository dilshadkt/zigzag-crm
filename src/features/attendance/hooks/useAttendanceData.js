import { useDailyReport } from "./useAttendanceAnalytics";
import { useMemo } from "react";

// Custom hook that provides both raw data and calculated metrics
export const useAttendanceData = (selectedDate) => {
  const { data, isLoading, error } = useDailyReport(selectedDate);

  // Get the raw attendance records
  const attendanceRecords = data?.report || [];

  // Memoized calculations for summary cards
  const calculatedMetrics = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return {
        totalEmployees: 0,
        checkedIn: 0,
        onBreak: 0,
        checkedOut: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        totalHours: 0,
        overtimeHours: 0,
        averageHours: 0,
        pendingApprovals: 0,
      };
    }

    const metrics = attendanceRecords.reduce(
      (acc, record) => {
        acc.totalEmployees++;

        // Count by status
        if (record.status === "checked-in") acc.checkedIn++;
        else if (record.status === "break") acc.onBreak++;
        else if (record.status === "checked-out") acc.checkedOut++;

        // Count late arrivals and early departures
        if (record.isLate) acc.lateArrivals++;
        if (record.isEarlyOut) acc.earlyDepartures++;

        // Count pending approvals
        if (record.approvalStatus === "pending") acc.pendingApprovals++;

        // Sum hours
        if (record.totalHours) acc.totalHours += record.totalHours;
        if (record.overtimeHours) acc.overtimeHours += record.overtimeHours;

        return acc;
      },
      {
        totalEmployees: 0,
        checkedIn: 0,
        onBreak: 0,
        checkedOut: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        totalHours: 0,
        overtimeHours: 0,
        averageHours: 0,
        pendingApprovals: 0,
      }
    );

    // Calculate average hours
    metrics.averageHours =
      metrics.totalEmployees > 0
        ? metrics.totalHours / metrics.totalEmployees
        : 0;

    return metrics;
  }, [attendanceRecords]);

  return {
    // Raw data
    attendanceRecords,
    isLoading,
    error,

    // Calculated metrics for summary cards
    metrics: calculatedMetrics,

    // Date info
    reportDate: data?.date || selectedDate,
  };
};
