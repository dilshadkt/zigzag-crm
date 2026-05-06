
import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "./client";

export const useGetCampaignLeads = (campaignId, search = "") => {
    return useInfiniteQuery({
        queryKey: ["campaign-leads", campaignId, search],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await apiClient.get(`/leads`, {
                params: {
                    campaignId,
                    search,
                    page: pageParam,
                    limit: 15,
                    sortBy: "createdAt",
                    sortOrder: "desc"
                }
            });
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page < lastPage.pagination.pages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        enabled: !!campaignId,
    });
};

export const useGetCampaignById = (id) => {
    return useQuery({
        queryKey: ["campaign", id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/campaigns/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
};

export const useUpdateCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await apiClient.put(`/campaigns/${id}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["campaigns"]);
            queryClient.invalidateQueries(["campaign", variables.id]);
        },
    });
};

export const useDeleteCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await apiClient.delete(`/campaigns/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["campaigns"]);
        },
    });
};

export const useAddLeadsToCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, leads }) => {
            const response = await apiClient.post(`/campaigns/${id}/leads`, { leads });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["campaign", variables.id]);
        },
    });
};

export const useRemoveLeadFromCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, leadId }) => {
            const response = await apiClient.delete(`/campaigns/${id}/leads`, { data: { leadId } });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["campaign", variables.id]);
        },
    });
};

export const useFetchLiveFacebookData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, startDate, endDate }) => {
            const response = await apiClient.get(`/campaigns/${id}/facebook-live`, {
                params: { startDate, endDate }
            });
            return response.data;
        },
        onSuccess: (data, { id }) => {
            // Update the cached campaign data with the fresh data
            queryClient.invalidateQueries(["campaign", id]);
            queryClient.invalidateQueries(["campaigns"]);
        },
    });
};

export const useSyncCampaignLeads = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, dateRange }) => {
            const response = await apiClient.post(`/campaigns/${id}/sync-leads`, { dateRange });
            return response.data;
        },
        onSuccess: (data, { id }) => {
            queryClient.invalidateQueries(["campaign", id]);
            queryClient.invalidateQueries(["campaigns"]);
            // Also invalidate general leads query if it exists
            queryClient.invalidateQueries(["leads"]);
        },
    });
};

