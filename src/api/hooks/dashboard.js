import { useQuery } from "@tanstack/react-query";
import apiClient from "../client";

export const useGetCompanyStatsChecking = (companyId, taskMonth) => {
  return useQuery({
    queryKey: ["companyStats", taskMonth],
    queryFn: async () => {
      const response = await apiClient.get(
        `/dashboard/company-statistics?companyId=${companyId}&taskMonth=${taskMonth}`
      );
      return response.data;
    },
    enabled: !!companyId && !!taskMonth,
    staleTime: 1 * 20 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetUserStatsChecking = (taskMonth) => {
  return useQuery({
    queryKey: ["userStats", taskMonth],
    queryFn: async () => {
      const response = await apiClient.get(
        `/dashboard/user-statistics?taskMonth=${taskMonth}`
      );
      return response.data;
    },
    enabled: !!taskMonth,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetCompletionTrend = (userId = null, days = 14) => {
  return useQuery({
    queryKey: ["completionTrend", userId, days],
    queryFn: async () => {
      let url = userId
        ? `/dashboard/completion-trend?userId=${userId}&days=${days}`
        : `/dashboard/completion-trend?days=${days}`;
      const response = await apiClient.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
export const useTodayTasks = (userId = null, date = null) => {
  return useQuery({
    queryKey: ["todayTasks", userId, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (date) {
        // format date to ISO string or just passing the date object as string
        const dateStr = date instanceof Date ? date.toISOString() : date;
        params.append("date", dateStr);
      }
      
      const response = await apiClient.get(`/dashboard/today-tasks?${params.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

export const useEmployeesTodayStatus = () => {
  return useQuery({
    queryKey: ["employeesTodayStatus"],
    queryFn: async () => {
      const response = await apiClient.get("/dashboard/employees-today-status");
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
