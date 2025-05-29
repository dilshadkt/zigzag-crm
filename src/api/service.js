import apiClient from "./client";
import { POST_PROJECT } from "./enpoint";

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
    return {
      success: false,
      message: error || "Login failed",
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

export const updatedProfile = async (updatedData, employeeId = null) => {
  // If employeeId is provided, add it to the data
  if (employeeId) {
    if (updatedData instanceof FormData) {
      updatedData.append("employeeId", employeeId);
    } else {
      updatedData = { ...updatedData, employeeId };
    }
  }

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

export const createEmployee = async (employeeData) => {
  const { data } = await apiClient.post("/employee", employeeData);
  return data;
};

////////////  PROJECT SERVICES ⚒️⚒️⚒️⚒️⚒️ ////////////////
export const addProject = (projectDetails) => {
  return apiClient.post(POST_PROJECT, projectDetails).then((res) => res.data);
};

export const updateTaskOrder = async (taskId, newOrder) => {
  return apiClient
    .put(`/tasks/${taskId}/order`, { newOrder })
    .then((res) => res.data);
};

export const deleteProject = async (projectId) => {
  const response = await apiClient.delete(`/projects/${projectId}`);
  return response.data;
};
