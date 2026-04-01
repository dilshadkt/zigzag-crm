import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/client";

// --- LEADS CORE API ---

export const getLeads = async (params = {}) => {
  const response = await apiClient.get("/leads", { params });
  return response.data;
};

export const createLead = async (leadData) => {
  const response = await apiClient.post("/leads", leadData);
  return response.data;
};

export const bulkCreateLeads = async (leadsData) => {
  const response = await apiClient.post("/leads/bulk", leadsData);
  return response.data;
};

export const updateLead = async (leadId, leadData) => {
  const response = await apiClient.put(`/leads/${leadId}`, leadData);
  return response.data;
};

export const deleteLead = async (leadId) => {
  const response = await apiClient.delete(`/leads/${leadId}`);
  return response.data;
};

export const getLeadStats = async () => {
  const response = await apiClient.get("/leads/stats");
  return response.data;
};

export const getLeadFormConfig = async () => {
  const response = await apiClient.get("/leads/settings/form-config");
  return response.data;
};

export const getLeadStatuses = async () => {
  const response = await apiClient.get("/leads/settings/statuses");
  return response.data;
};

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

// Lead Hooks
export const useGetLeads = (params = {}) => {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => getLeads(params),
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["leadStats"]);
      queryClient.invalidateQueries(["leadAssignmentRules"]);
    },
  });
};

export const useBulkCreateLeads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateLeads,
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["leadStats"]);
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, leadData }) => updateLead(leadId, leadData),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["leadStats"]);
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["leadStats"]);
    },
  });
};

export const useGetLeadStats = () => {
  return useQuery({
    queryKey: ["leadStats"],
    queryFn: getLeadStats,
  });
};

export const useGetLeadFormConfig = () => {
  return useQuery({
    queryKey: ["leadFormConfig"],
    queryFn: getLeadFormConfig,
  });
};

export const useGetLeadStatuses = () => {
  return useQuery({
    queryKey: ["leadStatuses"],
    queryFn: getLeadStatuses,
  });
};

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
