import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/client";

// --- LEADS CORE API ---

export const getLeads = async (params = {}) => {
  // Stringify filters object if it exists to ensure proper transmission to backend
  const processedParams = { ...params };
  if (processedParams.filters && typeof processedParams.filters === 'object') {
    processedParams.filters = JSON.stringify(processedParams.filters);
  }
  const response = await apiClient.get("/leads", { params: processedParams });
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

export const bulkUpdateLeads = async (leadIds, updateData) => {
  const response = await apiClient.put("/leads/bulk", { leadIds, updateData });
  return response.data;
};

export const bulkDeleteLeads = async (leadIds) => {
  const response = await apiClient.delete("/leads/bulk", { data: { leadIds } });
  return response.data;
};

export const deleteLead = async (leadId) => {
  const response = await apiClient.delete(`/leads/${leadId}`);
  return response.data;
};

export const getLeadStats = async (params = {}) => {
  const response = await apiClient.get("/leads/stats", { params });
  return response.data;
};

export const getLeadById = async (leadId) => {
  const response = await apiClient.get(`/leads/${leadId}`);
  return response.data;
};

export const getLeadNotes = async (leadId) => {
  const response = await apiClient.get(`/leads/${leadId}/notes`);
  return response.data;
};

export const addLeadNote = async ({ leadId, noteData }) => {
  const response = await apiClient.post(`/leads/${leadId}/notes`, noteData);
  return response.data;
};

export const updateLeadNote = async ({ leadId, noteId, noteData }) => {
  const response = await apiClient.put(`/leads/${leadId}/notes/${noteId}`, noteData);
  return response.data;
};

export const deleteLeadNote = async ({ leadId, noteId }) => {
  const response = await apiClient.delete(`/leads/${leadId}/notes/${noteId}`);
  return response.data;
};

export const getLeadAttachments = async (leadId) => {
  const response = await apiClient.get(`/leads/${leadId}/attachments`);
  return response.data;
};

export const getLeadActivities = async (leadId) => {
  const response = await apiClient.get(`/leads/${leadId}/activities`);
  return response.data;
};

export const uploadLeadAttachment = async ({ leadId, file }) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(`/leads/${leadId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const logLeadActivity = async ({ leadId, ...activityData }) => {
  const response = await apiClient.post(`/leads/${leadId}/activities`, activityData);
  return response.data;
};

export const getLeadFormConfig = async (projectId = null) => {
  const params = projectId ? { project: projectId } : {};
  const response = await apiClient.get("/leads/settings/form-config", { params });
  return response.data;
};

export const updateLeadFormConfig = async (config) => {
  const response = await apiClient.put("/leads/settings/form-config", { fields: config });
  return response.data;
};

export const getAllFormConfigs = async () => {
  const response = await apiClient.get("/leads/settings/form-configs");
  return response.data;
};

export const createLeadFormConfig = async (configData) => {
  const response = await apiClient.post("/leads/settings/form-configs", configData);
  return response.data;
};

export const getLeadStatuses = async (projectId = null) => {
  const params = projectId ? { projectId } : {};
  const response = await apiClient.get("/leads/settings/statuses", { params });
  return response.data;
};

// --- LEAD SCORING RULES API ---

export const getLeadScoringRules = async (companyId, projectId = null) => {
  const params = projectId ? { projectId } : {};
  const response = await apiClient.get(`/companies/${companyId}/lead-scoring-rules`, { params });
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

export const getLeadAssignmentRules = async (companyId, projectId = null) => {
  const params = projectId ? { projectId } : {};
  const response = await apiClient.get(`/companies/${companyId}/lead-assignment-rules`, { params });
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

export const reorderLeadAssignmentRules = async (companyId, ruleIds, projectId = null) => {
  const params = projectId ? { projectId } : {};
  const response = await apiClient.put(`/companies/${companyId}/lead-assignment-rules/reorder`, { orderedIds: ruleIds }, { params });
  return response.data;
};

export const mapFacebookField = async ({ leadId, facebookField, crmFieldKey, scope, targetBranch, facebookValue }) => {
  const response = await apiClient.post(`leads/${leadId}/map-facebook-field`, {
    leadId,
    facebookField,
    crmFieldKey,
    scope,
    targetBranch,
    facebookValue
  });
  return response.data;
};

// --- HOOKS ---

// Lead Hooks
export const useGetLeads = (params = {}) => {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => getLeads(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadStats"] });
      queryClient.invalidateQueries({ queryKey: ["leadAssignmentRules"] });
    },
  });
};

export const useBulkCreateLeads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateLeads,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadStats"] });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, leadData }) => updateLead(leadId, leadData),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadStats"] });
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        queryClient.invalidateQueries({ queryKey: ["leadActivities", leadId] });
      }
    },
  });
};

export const useBulkUpdateLeads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadIds, updateData }) => bulkUpdateLeads(leadIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadStats"] });
    },
  });
};

export const useBulkDeleteLeads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteLeads,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadStats"] });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadStats"] });
    },
  });
};

export const useGetLeadStats = (params = {}) => {
  return useQuery({
    queryKey: ["leadStats", params],
    queryFn: () => getLeadStats(params),
  });
};

export const useGetLeadById = (leadId) => {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLeadById(leadId),
    enabled: !!leadId,
  });
};

export const useGetLeadNotes = (leadId) => {
  return useQuery({
    queryKey: ["leadNotes", leadId],
    queryFn: () => getLeadNotes(leadId),
    enabled: !!leadId,
  });
};

export const useAddLeadNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, noteData }) => addLeadNote({ leadId, noteData }),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries(["leadNotes", leadId]);
      queryClient.invalidateQueries(["lead", leadId]);
      queryClient.invalidateQueries(["leadActivities", leadId]);
    },
  });
};

export const useUpdateLeadNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, noteId, noteData }) => updateLeadNote({ leadId, noteId, noteData }),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries(["leadNotes", leadId]);
      queryClient.invalidateQueries(["lead", leadId]);
      queryClient.invalidateQueries(["leadActivities", leadId]);
    },
  });
};

export const useDeleteLeadNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, noteId }) => deleteLeadNote({ leadId, noteId }),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries(["leadNotes", leadId]);
      queryClient.invalidateQueries(["lead", leadId]);
      queryClient.invalidateQueries(["leadActivities", leadId]);
    },
  });
};

export const useGetLeadAttachments = (leadId) => {
  return useQuery({
    queryKey: ["leadAttachments", leadId],
    queryFn: () => getLeadAttachments(leadId),
    enabled: !!leadId,
  });
};

export const useGetLeadActivities = (leadId) => {
  return useQuery({
    queryKey: ["leadActivities", leadId],
    queryFn: () => getLeadActivities(leadId),
    enabled: !!leadId,
  });
};

export const useUploadLeadAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, file }) => uploadLeadAttachment({ leadId, file }),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries(["leadAttachments", leadId]);
      queryClient.invalidateQueries(["lead", leadId]);
      queryClient.invalidateQueries(["leadActivities", leadId]);
    },
  });
};

export const useLogLeadActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, ...activityData }) => logLeadActivity({ leadId, ...activityData }),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries(["leadActivities", leadId]);
      queryClient.invalidateQueries(["lead", leadId]);
    },
  });
};

export const useGetLeadFormConfig = (projectId = null) => {
  return useQuery({
    queryKey: ["leadFormConfig", projectId],
    queryFn: () => getLeadFormConfig(projectId),
  });
};

export const useGetAllLeadFormConfigs = () => {
  return useQuery({
    queryKey: ["allLeadFormConfigs"],
    queryFn: getAllFormConfigs,
  });
};

export const useCreateLeadFormConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeadFormConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(["allLeadFormConfigs"]);
      queryClient.invalidateQueries(["leadFormConfig"]);
    },
  });
};

export const useUpdateLeadFormConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLeadFormConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(["leadFormConfig"]);
    },
  });
};

export const useGetLeadStatuses = (projectId = null) => {
  return useQuery({
    queryKey: ["leadStatuses", projectId],
    queryFn: () => getLeadStatuses(projectId),
  });
};

// Scoring Hooks
export const useGetLeadScoringRules = (companyId, projectId = null) => {
  return useQuery({
    queryKey: ["leadScoringRules", companyId, projectId],
    queryFn: () => getLeadScoringRules(companyId, projectId),
    enabled: !!companyId,
  });
};

export const useCreateLeadScoringRule = (companyId, projectId = null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleData) => {
      const data = projectId ? { ...ruleData, projectId } : ruleData;
      return createLeadScoringRule(companyId, data);
    },
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
export const useGetLeadAssignmentRules = (companyId, projectId = null) => {
  return useQuery({
    queryKey: ["leadAssignmentRules", companyId, projectId],
    queryFn: () => getLeadAssignmentRules(companyId, projectId),
    enabled: !!companyId,
  });
};

export const useCreateLeadAssignmentRule = (companyId, projectId = null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleData) => {
      const data = projectId ? { ...ruleData, projectId } : ruleData;
      return createLeadAssignmentRule(companyId, data);
    },
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

export const useReorderLeadAssignmentRules = (companyId, projectId = null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleIds) => reorderLeadAssignmentRules(companyId, ruleIds, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries(["leadAssignmentRules", companyId]);
    },
  });
};

export const useMapFacebookField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mapFacebookField,
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries(["lead", leadId]);
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["leadActivities", leadId]);
      queryClient.invalidateQueries(["leadStats"]);
    },
  });
};
