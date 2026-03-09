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
export const useTodayTasks = (userId = null) => {
  return useQuery({
    queryKey: ["todayTasks", userId],
    queryFn: async () => {
      const url = userId
        ? `/dashboard/today-tasks?userId=${userId}`
        : "/dashboard/today-tasks";
      const response = await apiClient.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};
