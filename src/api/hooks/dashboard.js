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
  });
};
