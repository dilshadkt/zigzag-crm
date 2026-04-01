import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/client";

// --- LEAD SCORING RULES API ---

export const getLeadScoringRules = async (companyId) => {
  const response = await apiClient.get(`/companies/${companyId}/lead-scoring-rules`);
  return response.data;
};

export const createLeadScoringRule = async (companyId, ruleData) => {
  const response = await apiClient.post(`/companies/${companyId}/lead-scoring-rules`, ruleData);
  return response.data;
};

export const updateLeadScoringRule = async (companyId, ruleId, ruleData) => {
  const response = await apiClient.put(`/companies/${companyId}/lead-scoring-rules/${ruleId}`, ruleData);
  return response.data;
};

export const deleteLeadScoringRule = async (companyId, ruleId) => {
  const response = await apiClient.delete(`/companies/${companyId}/lead-scoring-rules/${ruleId}`);
  return response.data;
};

// --- LEAD ASSIGNMENT RULES API ---

export const getLeadAssignmentRules = async (companyId) => {
  const response = await apiClient.get(`/companies/${companyId}/lead-assignment-rules`);
  return response.data;
};

export const createLeadAssignmentRule = async (companyId, ruleData) => {
  const response = await apiClient.post(`/companies/${companyId}/lead-assignment-rules`, ruleData);
  return response.data;
};

export const updateLeadAssignmentRule = async (companyId, ruleId, ruleData) => {
  const response = await apiClient.put(`/companies/${companyId}/lead-assignment-rules/${ruleId}`, ruleData);
  return response.data;
};

export const deleteLeadAssignmentRule = async (companyId, ruleId) => {
  const response = await apiClient.delete(`/companies/${companyId}/lead-assignment-rules/${ruleId}`);
  return response.data;
};

export const reorderLeadAssignmentRules = async (companyId, ruleIds) => {
  const response = await apiClient.put(`/companies/${companyId}/lead-assignment-rules/reorder`, { ruleIds });
  return response.data;
};

// --- HOOKS ---

// Scoring Hooks
export const useGetLeadScoringRules = (companyId) => {
  return useQuery({
    queryKey: ["leadScoringRules", companyId],
    queryFn: () => getLeadScoringRules(companyId),
    enabled: !!companyId,
  });
};

export const useCreateLeadScoringRule = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleData) => createLeadScoringRule(companyId, ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries(["leadScoringRules", companyId]);
    },
  });
};

export const useUpdateLeadScoringRule = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, ruleData }) => updateLeadScoringRule(companyId, ruleId, ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries(["leadScoringRules", companyId]);
    },
  });
};

export const useDeleteLeadScoringRule = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => deleteLeadScoringRule(companyId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries(["leadScoringRules", companyId]);
    },
  });
};

// Assignment Hooks
export const useGetLeadAssignmentRules = (companyId) => {
  return useQuery({
    queryKey: ["leadAssignmentRules", companyId],
    queryFn: () => getLeadAssignmentRules(companyId),
    enabled: !!companyId,
  });
};

export const useCreateLeadAssignmentRule = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleData) => createLeadAssignmentRule(companyId, ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries(["leadAssignmentRules", companyId]);
    },
  });
};

export const useUpdateLeadAssignmentRule = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, ruleData }) => updateLeadAssignmentRule(companyId, ruleId, ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries(["leadAssignmentRules", companyId]);
    },
  });
};

export const useDeleteLeadAssignmentRule = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId) => deleteLeadAssignmentRule(companyId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries(["leadAssignmentRules", companyId]);
    },
  });
};

export const useReorderLeadAssignmentRules = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleIds) => reorderLeadAssignmentRules(companyId, ruleIds),
    onSuccess: () => {
      queryClient.invalidateQueries(["leadAssignmentRules", companyId]);
    },
  });
};
