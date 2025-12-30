import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/client";

// Get lead form configuration
export const useGetLeadFormConfig = () => {
  return useQuery({
    queryKey: ["leadFormConfig"],
    queryFn: async () => {
      const response = await apiClient.get("/leads/settings/form-config");
      return response.data;
    },
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update lead form configuration
export const useUpdateLeadFormConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fields) => {
      const response = await apiClient.put("/leads/settings/form-config", {
        fields,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leadFormConfig"]);
    },
  });
};

// Get all lead statuses
export const useGetLeadStatuses = () => {
  return useQuery({
    queryKey: ["leadStatuses"],
    queryFn: async () => {
      const response = await apiClient.get("/leads/settings/statuses");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create lead status
export const useCreateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statusData) => {
      const response = await apiClient.post(
        "/leads/settings/statuses",
        statusData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leadStatuses"]);
    },
  });
};

// Update lead status
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ statusId, statusData }) => {
      const response = await apiClient.put(
        `/leads/settings/statuses/${statusId}`,
        statusData
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate statuses query to refetch updated statuses
      queryClient.invalidateQueries(["leadStatuses"]);
      // Invalidate leads query so all leads show updated status
      // This will cause leads to refetch with updated status data
      queryClient.invalidateQueries(["leads"]);
      // Invalidate individual lead queries
      queryClient.invalidateQueries({ queryKey: ["lead"] });
    },
  });
};

// Delete lead status
export const useDeleteLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statusId) => {
      const response = await apiClient.delete(
        `/leads/settings/statuses/${statusId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leadStatuses"]);
    },
  });
};

// Get all leads
export const useGetLeads = (params = {}) => {
  const {
    page = 1,
    limit = 15,
    search,
    status,
    owner,
    source,
    sortBy = "createdAt",
    sortOrder = "desc",
    filters,
  } = params;

  return useQuery({
    queryKey: [
      "leads",
      { page, limit, search, status, owner, source, sortBy, sortOrder, filters },
    ],
    queryFn: async () => {
      const response = await apiClient.get("/leads", {
        params: {
          page,
          limit,
          search,
          status,
          owner,
          source,
          sortBy,
          sortOrder,
          filters: filters ? JSON.stringify(filters) : undefined,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
  });
};

// Get lead by ID
export const useGetLeadById = (leadId) => {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const response = await apiClient.get(`/leads/${leadId}`);
      return response.data;
    },
    enabled: !!leadId,
  });
};

// Create lead
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData) => {
      const response = await apiClient.post("/leads", leadData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
    },
  });
};

// Bulk create leads
export const useBulkCreateLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadsData) => {
      const response = await apiClient.post("/leads/bulk", { leads: leadsData });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
    },
  });
};

// Update lead
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, leadData }) => {
      const response = await apiClient.put(`/leads/${leadId}`, leadData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["lead", variables.leadId]);
    },
  });
};

// Delete lead
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId) => {
      const response = await apiClient.delete(`/leads/${leadId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
    },
  });
};

// Add note to lead
export const useAddLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, noteData }) => {
      const response = await apiClient.post(`/leads/${leadId}/notes`, noteData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["lead", variables.leadId]);
      queryClient.invalidateQueries(["leadNotes", variables.leadId]);
    },
  });
};

// Get lead notes
export const useGetLeadNotes = (leadId) => {
  return useQuery({
    queryKey: ["leadNotes", leadId],
    queryFn: async () => {
      const response = await apiClient.get(`/leads/${leadId}/notes`);
      return response.data;
    },
    enabled: !!leadId,
  });
};

// Upload lead attachment
export const useUploadLeadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, file }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post(
        `/leads/${leadId}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["lead", variables.leadId]);
      queryClient.invalidateQueries(["leadAttachments", variables.leadId]);
    },
  });
};

// Get lead attachments
export const useGetLeadAttachments = (leadId) => {
  return useQuery({
    queryKey: ["leadAttachments", leadId],
    queryFn: async () => {
      const response = await apiClient.get(`/leads/${leadId}/attachments`);
      return response.data;
    },
    enabled: !!leadId,
  });
};

// Get lead activities
export const useGetLeadActivities = (leadId, params = {}) => {
  return useQuery({
    queryKey: ["leadActivities", leadId, params],
    queryFn: async () => {
      const response = await apiClient.get(`/leads/${leadId}/activities`, {
        params,
      });
      return response.data;
    },
    enabled: !!leadId,
  });
};

// Log lead activity manually
export const useLogLeadActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, type, title, description, metadata }) => {
      const response = await apiClient.post(`/leads/${leadId}/activities`, {
        type,
        title,
        description,
        metadata,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["lead", variables.leadId]);
      queryClient.invalidateQueries(["leadActivities", variables.leadId]);
    },
  });
};
