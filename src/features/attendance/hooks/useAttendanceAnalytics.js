import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendanceApi";

export const useAttendanceAnalytics = (period = "month") => {
  return useQuery({
    queryKey: ["attendanceAnalytics", period],
    queryFn: () => attendanceApi.getAttendanceAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDailyReport = (date) => {
  return useQuery({
    queryKey: ["dailyReport", date],
    queryFn: () => attendanceApi.getDailyReport(date),
    enabled: !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAttendanceSummary = (startDate, endDate) => {
  return useQuery({
    queryKey: ["attendanceSummary", startDate, endDate],
    queryFn: () => attendanceApi.getAttendanceSummary(startDate, endDate),
    enabled: !!(startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEmployeeAttendance = (employeeId, startDate, endDate) => {
  return useQuery({
    queryKey: ["employeeAttendance", employeeId, startDate, endDate],
    queryFn: () =>
      attendanceApi.getEmployeeAttendance(employeeId, startDate, endDate),
    enabled: !!(employeeId && startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCurrentStatus = () => {
  return useQuery({
    queryKey: ["currentStatus"],
    queryFn: () => attendanceApi.getCurrentStatus(),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};
