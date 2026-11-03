import { useDailyReport, useDateRangeReport } from "./useAttendanceAnalytics";
import { useMemo } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendanceApi";

// Attendance list that loads the next page as the user scrolls. Works for a
// single day too (start and end the same). The "dateRangeReport" key prefix
// keeps it in step with the cache patching and invalidation after edits.
export const useInfiniteAttendance = ({
  startDate,
  endDate,
  search = "",
  limit = 50,
}) => {
  const query = useInfiniteQuery({
    queryKey: ["dateRangeReport", "infinite", startDate, endDate, search, limit],
    queryFn: ({ pageParam }) =>
      attendanceApi.getAttendanceByDateRange(
        startDate,
        endDate,
        pageParam,
        limit,
        search
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined,
    enabled: !!(startDate && endDate),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const pages = query.data?.pages || [];
  const attendanceRecords = useMemo(
    () => pages.flatMap((page) => page?.report || []),
    [query.data]
  );

  return {
    attendanceRecords,
    totalRecords: pages[pages.length - 1]?.pagination?.totalRecords || 0,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
};

// Helper function to calculate metrics
const calculateMetrics = (attendanceRecords) => {
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
};

// Custom hook that provides both raw data and calculated metrics for single date
export const useAttendanceData = (selectedDate, page = 1, limit = 50) => {
  const { data, isLoading, error, pagination } = useDailyReport(
    selectedDate,
    page,
    limit
  );

  // Get the raw attendance records
  const attendanceRecords = data?.report || [];

  // Memoized calculations for summary cards
  const calculatedMetrics = useMemo(
    () => calculateMetrics(attendanceRecords),
    [attendanceRecords]
  );

  return {
    // Raw data
    attendanceRecords,
    isLoading,
    error,

    // Calculated metrics for summary cards
    metrics: calculatedMetrics,

    // Pagination info
    pagination: data?.pagination || pagination,

    // Date info
    reportDate: data?.date || selectedDate,
  };
};

// Custom hook that provides both raw data and calculated metrics for date range
export const useAttendanceDataRange = (
  startDate,
  endDate,
  page = 1,
  limit = 50
) => {
  const { data, isLoading, error, pagination } = useDateRangeReport(
    startDate,
    endDate,
    page,
    limit
  );

  // Get the raw attendance records
  const attendanceRecords = data?.report || [];

  // Memoized calculations for summary cards
  const calculatedMetrics = useMemo(
    () => calculateMetrics(attendanceRecords),
    [attendanceRecords]
  );

  return {
    // Raw data
    attendanceRecords,
    isLoading,
    error,

    // Calculated metrics for summary cards
    metrics: calculatedMetrics,

    // Pagination info
    pagination: data?.pagination || pagination,

    // Date range info
    startDate: data?.startDate || startDate,
    endDate: data?.endDate || endDate,
  };
};
