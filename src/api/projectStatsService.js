import apiClient from "./client";

export const getProjectStats = async (projectId, month) => {
  try {
    const params = month ? { month } : {};
    const response = await apiClient.get(`/project-stats/${projectId}/stats`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching project stats:", error);
    throw error;
  }
};
