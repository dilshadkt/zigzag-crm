import { useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendanceApi";
import { useCallback } from "react";

// Enhanced attendance analytics hook with better caching and error handling
export const useAttendanceAnalytics = (period = "month") => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["attendanceAnalytics", period],
    queryFn: () => attendanceApi.getAttendanceAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("Failed to fetch attendance analytics:", error);
    },
  });

  // Invalidate and refetch analytics data
  const invalidateAnalytics = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["attendanceAnalytics", period],
    });
  }, [queryClient, period]);

  return {
    ...query,
    invalidateAnalytics,
  };
};

// Enhanced daily report hook with better caching
export const useDailyReport = (date) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["dailyReport", date],
    queryFn: () => attendanceApi.getDailyReport(date),
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("Failed to fetch daily report:", error);
    },
  });

  // Invalidate and refetch daily report data
  const invalidateDailyReport = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dailyReport", date] });
  }, [queryClient, date]);

  return {
    ...query,
    invalidateDailyReport,
  };
};

// Enhanced attendance summary hook
export const useAttendanceSummary = (startDate, endDate, employeeId = null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["attendanceSummary", startDate, endDate, employeeId],
    queryFn: () =>
      attendanceApi.getAttendanceSummary(startDate, endDate, employeeId),
    enabled: !!(startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("Failed to fetch attendance summary:", error);
    },
  });

  // Invalidate and refetch summary data
  const invalidateSummary = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["attendanceSummary", startDate, endDate, employeeId],
    });
  }, [queryClient, startDate, endDate, employeeId]);

  return {
    ...query,
    invalidateSummary,
  };
};

// Enhanced employee attendance hook with pagination
export const useEmployeeAttendance = (
  employeeId,
  startDate,
  endDate,
  page = 1,
  limit = 30
) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [
      "employeeAttendance",
      employeeId,
      startDate,
      endDate,
      page,
      limit,
    ],
    queryFn: () =>
      attendanceApi.getEmployeeAttendance(
        employeeId,
        startDate,
        endDate,
        page,
        limit
      ),
    enabled: !!(employeeId && startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("Failed to fetch employee attendance:", error);
    },
  });

  // Invalidate and refetch employee attendance data
  const invalidateEmployeeAttendance = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [
        "employeeAttendance",
        employeeId,
        startDate,
        endDate,
        page,
        limit,
      ],
    });
  }, [queryClient, employeeId, startDate, endDate, page, limit]);

  return {
    ...query,
    invalidateEmployeeAttendance,
  };
};

// Enhanced current status hook with real-time updates
export const useCurrentStatus = (refetchInterval = 30000) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["currentStatus"],
    queryFn: () => attendanceApi.getCurrentStatus(),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error("Failed to fetch current status:", error);
    },
  });

  // Invalidate and refetch current status
  const invalidateCurrentStatus = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["currentStatus"] });
  }, [queryClient]);

  return {
    ...query,
    invalidateCurrentStatus,
  };
};

// Hook for managing attendance actions (clock in/out, break, etc.)
export const useAttendanceActions = () => {
  const queryClient = useQueryClient();

  const invalidateAllAttendanceData = useCallback(() => {
    // Invalidate all attendance-related queries
    queryClient.invalidateQueries({ queryKey: ["dailyReport"] });
    queryClient.invalidateQueries({ queryKey: ["attendanceAnalytics"] });
    queryClient.invalidateQueries({ queryKey: ["attendanceSummary"] });
    queryClient.invalidateQueries({ queryKey: ["employeeAttendance"] });
    queryClient.invalidateQueries({ queryKey: ["currentStatus"] });
  }, [queryClient]);

  return {
    invalidateAllAttendanceData,
  };
};

// Hook for prefetching attendance data
export const useAttendancePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchDailyReport = useCallback(
    (date) => {
      queryClient.prefetchQuery({
        queryKey: ["dailyReport", date],
        queryFn: () => attendanceApi.getDailyReport(date),
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const prefetchAnalytics = useCallback(
    (period) => {
      queryClient.prefetchQuery({
        queryKey: ["attendanceAnalytics", period],
        queryFn: () => attendanceApi.getAttendanceAnalytics(period),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return {
    prefetchDailyReport,
    prefetchAnalytics,
  };
};
