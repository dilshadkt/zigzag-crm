import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";

// ---- Raw API functions ----

export const getClientSalesTeam = async (projectId) => {
  const response = await apiClient.get("/client-sales-persons", {
    params: { project: projectId },
  });
  return response.data;
};

export const createClientSalesPerson = async (data) => {
  const response = await apiClient.post("/client-sales-persons", data);
  return response.data;
};

export const updateClientSalesPerson = async ({ id, ...data }) => {
  const response = await apiClient.put(`/client-sales-persons/${id}`, data);
  return response.data;
};

export const deleteClientSalesPerson = async (id) => {
  const response = await apiClient.delete(`/client-sales-persons/${id}`);
  return response.data;
};

export const getClientSalesPersonStats = async (id) => {
  const response = await apiClient.get(`/client-sales-persons/${id}/stats`);
  return response.data;
};

export const getClientTeamStats = async (projectId, branch) => {
  const response = await apiClient.get("/client-sales-persons/team-stats", {
    params: { project: projectId, branch: branch || undefined },
  });
  return response.data;
};

// ---- React Query Hooks ----

export const useGetClientSalesTeam = (projectId) => {
  return useQuery({
    queryKey: ["clientSalesTeam", projectId],
    queryFn: () => getClientSalesTeam(projectId),
    enabled: !!projectId,
  });
};

export const useGetClientTeamStats = (projectId, branch) => {
  return useQuery({
    queryKey: ["clientTeamStats", projectId, branch],
    queryFn: () => getClientTeamStats(projectId, branch),
    enabled: !!projectId,
  });
};

export const useGetClientSalesPersonStats = (id) => {
  return useQuery({
    queryKey: ["clientSalesPersonStats", id],
    queryFn: () => getClientSalesPersonStats(id),
    enabled: !!id,
  });
};

export const useCreateClientSalesPerson = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClientSalesPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSalesTeam", projectId] });
      queryClient.invalidateQueries({ queryKey: ["clientTeamStats", projectId] });
    },
  });
};

export const useUpdateClientSalesPerson = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateClientSalesPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSalesTeam", projectId] });
      queryClient.invalidateQueries({ queryKey: ["clientTeamStats", projectId] });
    },
  });
};

export const useDeleteClientSalesPerson = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClientSalesPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSalesTeam", projectId] });
      queryClient.invalidateQueries({ queryKey: ["clientTeamStats", projectId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};
