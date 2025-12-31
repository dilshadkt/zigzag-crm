import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "./client";

export const useCreateCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (campaignData) => {
            const response = await apiClient.post("/campaigns", campaignData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["campaigns"]);
            // You might want to invalidate tasks or other related queries too
            queryClient.invalidateQueries(["tasksOnPublish"]);
        },
    });
};

export const useGetCampaigns = (params) => {
    return useQuery({
        queryKey: ["campaigns", params],
        queryFn: async () => {
            const { data } = await apiClient.get("/campaigns", { params });
            return data;
        },
    });
};
