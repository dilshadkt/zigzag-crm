import { useQuery } from "@tanstack/react-query";
import apiClient from "../client";

export const useGetCompanyStatsChecking = (companyId, taskMonth) => {
  console.log(taskMonth);
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
