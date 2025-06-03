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
    copyOfDescription: taskData?.copyOfDescription,
    project: `${projectId}`,
    attachments: taskData?.attachments,
    assignedTo: taskData?.assignee,
    priority: taskData?.periority,
    dueDate: taskData?.dueDate,
    startDate: taskData?.startDate,
    taskGroup: taskData?.taskGroup,
    extraTaskWorkType: taskData?.extraTaskWorkType,
    // Recurring task fields
    isRecurring: taskData?.isRecurring,
    recurringPattern: taskData?.recurringPattern,
    recurringInterval: taskData?.recurringInterval,
    recurringEndDate: taskData?.recurringEndDate,
    maxRecurrences: taskData?.maxRecurrences,
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

// SubTask API functions
export const createSubTask = async (subTaskData) => {
  try {
    const response = await apiClient.post("/subtasks", {
      title: subTaskData.title,
      description: subTaskData.description,
      parentTaskId: subTaskData.parentTaskId,
      assignedTo: subTaskData.assignedTo,
      priority: subTaskData.priority,
      startDate: subTaskData.startDate,
      dueDate: subTaskData.dueDate,
      timeEstimate: subTaskData.timeEstimate,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating subtask:", error);
    throw error;
  }
};

export const getSubTasksByParentTask = async (parentTaskId) => {
  try {
    const response = await apiClient.get(`/subtasks/parent/${parentTaskId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    throw error;
  }
};

export const getSubTaskById = async (subTaskId) => {
  try {
    const response = await apiClient.get(`/subtasks/${subTaskId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subtask:", error);
    throw error;
  }
};

export const updateSubTaskById = async (subTaskId, updateData) => {
  try {
    const response = await apiClient.put(`/subtasks/${subTaskId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating subtask:", error);
    throw error;
  }
};

export const deleteSubTask = async (subTaskId) => {
  try {
    const response = await apiClient.delete(`/subtasks/${subTaskId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subtask:", error);
    throw error;
  }
};
