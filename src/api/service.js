import apiClient from "./client";

export const register = async (data) => {
  try {
    const response = await apiClient.post("/auth/register", data);
    if (response?.data) {
      return { success: true };
    }
  } catch (error) {
    console.error("Login error", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Login failed",
    };
  }
};

export const signIn = async (data) => {
  try {
    const response = await apiClient.post("/auth/login", data);
    if (response?.data?.token) {
      localStorage.setItem("token", response.data.token); // Store token for authentication
      return { success: true, user: response.data.user };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
      user: null,
    };
  }
};

export const validateSession = async () => {
  try {
    const response = await apiClient.post("/auth/me");
    return { success: true, user: response.data.user };
  } catch (error) {
    throw new Error("User not found");
  }
};

export const uploadSingleFile = async (file) => {
  try {
    const { data } = await apiClient.post("/upload/single", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, ...data };
  } catch (error) {
    return { success: false, message: "Failed to upload" };
  }
};

export const updateProject = async (updatedData, projectId) => {
  const { data } = await apiClient.patch(`/projects/${projectId}`, updatedData);
  return data;
};

export const updatedProfile = async (updatedData) => {
  const headers = {
    "Content-Type":
      updatedData instanceof FormData
        ? "multipart/form-data"
        : "application/json",
  };
  const { data } = await apiClient.patch("/employee/profile", updatedData, {
    headers,
  });
  return data;
};
export const createTask = async (taskData, projectId) => {
  // api formated data
  const data = {
    title: taskData?.title,
    description: taskData?.description,
    project: `${projectId}`,
    attachments: taskData?.attachments,
    assignedTo: taskData?.assignee,
    priority: taskData?.periority,
    dueDate: taskData?.dueDate,
    startDate: taskData?.startDate,
    taskGroup: taskData?.taskGroup,
  };
  const response = await apiClient.post("/tasks", data);
  return response;
};

export const getTaskById = async (taskId) => {
  const { data } = await apiClient.get(`/tasks/${taskId}`);
  return data;
};

export const updateTaskById = async (taskId, updatedData) => {
  const { data } = await apiClient.put(`/tasks/${taskId}`, updatedData);
  return data;
};
