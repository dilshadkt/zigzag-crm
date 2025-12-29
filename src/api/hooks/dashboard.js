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
