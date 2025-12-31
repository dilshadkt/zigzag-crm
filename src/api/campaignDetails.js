
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "./client";

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
