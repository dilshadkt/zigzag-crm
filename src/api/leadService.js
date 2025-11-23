import apiClient from "./client";

// Get form configuration
export const getLeadFormConfig = async () => {
  try {
    const response = await apiClient.get("/leads/settings/form-config");
    return response.data;
  } catch (error) {
    console.error("Error fetching lead form config:", error);
    throw error;
  }
};

// Update form configuration
export const updateLeadFormConfig = async (fields) => {
  try {
    const response = await apiClient.put("/leads/settings/form-config", {
      fields,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating lead form config:", error);
    throw error;
  }
};

// Get all lead statuses
export const getLeadStatuses = async () => {
  try {
    const response = await apiClient.get("/leads/settings/statuses");
    return response.data;
  } catch (error) {
    console.error("Error fetching lead statuses:", error);
    throw error;
  }
};

// Create lead status
export const createLeadStatus = async (statusData) => {
  try {
    const response = await apiClient.post("/leads/settings/statuses", statusData);
    return response.data;
  } catch (error) {
    console.error("Error creating lead status:", error);
    throw error;
  }
};

// Update lead status
export const updateLeadStatus = async (statusId, statusData) => {
  try {
    const response = await apiClient.put(
      `/leads/settings/statuses/${statusId}`,
      statusData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lead status:", error);
    throw error;
  }
};

// Delete lead status
export const deleteLeadStatus = async (statusId) => {
  try {
    const response = await apiClient.delete(
      `/leads/settings/statuses/${statusId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting lead status:", error);
    throw error;
  }
};

// Get all leads
export const getLeads = async (params = {}) => {
  try {
    const response = await apiClient.get("/leads", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

// Get lead by ID
export const getLeadById = async (leadId) => {
  try {
    const response = await apiClient.get(`/leads/${leadId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw error;
  }
};

// Create lead
export const createLead = async (leadData) => {
  try {
    const response = await apiClient.post("/leads", leadData);
    return response.data;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
};

// Update lead
export const updateLead = async (leadId, leadData) => {
  try {
    const response = await apiClient.put(`/leads/${leadId}`, leadData);
    return response.data;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
};

// Delete lead
export const deleteLead = async (leadId) => {
  try {
    const response = await apiClient.delete(`/leads/${leadId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

// Add note to lead
export const addLeadNote = async (leadId, noteData) => {
  try {
    const response = await apiClient.post(`/leads/${leadId}/notes`, noteData);
    return response.data;
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
};

// Get lead notes
export const getLeadNotes = async (leadId) => {
  try {
    const response = await apiClient.get(`/leads/${leadId}/notes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
};

// Upload lead attachment
export const uploadLeadAttachment = async (leadId, file) => {
  try {
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
  } catch (error) {
    console.error("Error uploading attachment:", error);
    throw error;
  }
};

// Get lead attachments
export const getLeadAttachments = async (leadId) => {
  try {
    const response = await apiClient.get(`/leads/${leadId}/attachments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attachments:", error);
    throw error;
  }
};

// Get lead activities
export const getLeadActivities = async (leadId, params = {}) => {
  try {
    const response = await apiClient.get(`/leads/${leadId}/activities`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

