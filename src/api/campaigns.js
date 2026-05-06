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

export const useGetCampaignsByCompany = (companyId, params) => {
    return useQuery({
        queryKey: ["campaigns", "company", companyId, params],
        queryFn: async () => {
            const { data } = await apiClient.get(`/campaigns/company/${companyId}`, { params });
            return data;
        },
        enabled: !!companyId,
    });
};

export const useSyncFacebookAds = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId) => {
            const response = await apiClient.post("/campaigns/sync-facebook", { projectId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["campaigns"]);
        },
    });
};

export const useCheckFacebookStatus = () => {
    return useQuery({
        queryKey: ["facebook-status"],
        queryFn: async () => {
            const { data } = await apiClient.get("/campaigns/facebook-status");
            return data.data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: false,
    });
};

export const useGetFacebookAccounts = () => {
    return useQuery({
        queryKey: ["facebook-accounts"],
        queryFn: async () => {
            const { data } = await apiClient.get("/campaigns/facebook-accounts");
            return data.data;
        },
        staleTime: 10 * 60 * 1000,
    });
};

export const useSelectFacebookAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (adAccountId) => {
            const response = await apiClient.post("/campaigns/facebook-select-account", { adAccountId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["facebook-status"]);
            queryClient.invalidateQueries(["campaigns"]);
        },
    });
};