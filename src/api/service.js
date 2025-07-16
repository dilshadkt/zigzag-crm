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
    assignedTo: taskData?.assignedTo,
    priority: taskData?.periority,
    dueDate: taskData?.dueDate,
    startDate: taskData?.startDate,
    taskGroup: taskData?.taskGroup,
    extraTaskWorkType: taskData?.extraTaskWorkType,
    taskMonth: taskData?.taskMonth,
    
    // taskFlow will be conditionally added below
    // Recurring task fields
    isRecurring: taskData?.isRecurring,
    recurringPattern: taskData?.recurringPattern,
    recurringInterval: taskData?.recurringInterval,
    recurringEndDate: taskData?.recurringEndDate,
    maxRecurrences: taskData?.maxRecurrences,
  };
  if (taskData?.taskFlow) {
    data.taskFlow = taskData.taskFlow; // Only add if present
  }
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

// SubTask Attachment API functions
export const addSubTaskAttachments = async (subTaskId, attachments) => {
  try {
    const formData = new FormData();
    attachments.forEach((file, index) => {
      formData.append(`attachments`, file);
    });

    const response = await apiClient.post(
      `/subtasks/${subTaskId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding subtask attachments:", error);
    throw error;
  }
};

export const removeSubTaskAttachment = async (subTaskId, attachmentId) => {
  try {
    const response = await apiClient.delete(
      `/subtasks/${subTaskId}/attachments/${attachmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing subtask attachment:", error);
    throw error;
  }
};

// Notification API functions
export const getUserNotifications = async (limit = 10) => {
  try {
    const response = await apiClient.get(`/notifications?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.patch("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await apiClient.get("/notifications/unread-count");
    return response.data;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    throw error;
  }
};

////////////  STICKY NOTES SERVICES ⚒️⚒️⚒️⚒️⚒️ ////////////////

// Create a new sticky note
export const createStickyNote = async (noteData) => {
  try {
    const response = await apiClient.post("/sticky-notes", noteData);
    return response.data;
  } catch (error) {
    console.error("Error creating sticky note:", error);
    throw error;
  }
};

// Get all user's sticky notes
export const getUserStickyNotes = async (options = {}) => {
  try {
    const params = new URLSearchParams();

    if (options.isArchived !== undefined)
      params.append("isArchived", options.isArchived);
    if (options.priority) params.append("priority", options.priority);
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);
    if (options.limit) params.append("limit", options.limit);
    if (options.skip) params.append("skip", options.skip);
    if (options.tags) {
      if (Array.isArray(options.tags)) {
        options.tags.forEach((tag) => params.append("tags", tag));
      } else {
        params.append("tags", options.tags);
      }
    }

    const response = await apiClient.get(`/sticky-notes?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sticky notes:", error);
    throw error;
  }
};

// Get a specific sticky note by ID
export const getStickyNoteById = async (noteId) => {
  try {
    const response = await apiClient.get(`/sticky-notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sticky note:", error);
    throw error;
  }
};

// Update a sticky note
export const updateStickyNote = async (noteId, updateData) => {
  try {
    const response = await apiClient.put(`/sticky-notes/${noteId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating sticky note:", error);
    throw error;
  }
};

// Delete a sticky note
export const deleteStickyNote = async (noteId) => {
  try {
    const response = await apiClient.delete(`/sticky-notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting sticky note:", error);
    throw error;
  }
};

// Update sticky note positions (for drag and drop)
export const updateStickyNotePositions = async (noteIds) => {
  try {
    const response = await apiClient.put("/sticky-notes/positions", {
      noteIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating sticky note positions:", error);
    throw error;
  }
};

// Archive/Unarchive a sticky note
export const toggleArchiveStickyNote = async (noteId) => {
  try {
    const response = await apiClient.put(`/sticky-notes/${noteId}/archive`);
    return response.data;
  } catch (error) {
    console.error("Error toggling sticky note archive:", error);
    throw error;
  }
};

// Set reminder for a sticky note
export const setStickyNoteReminder = async (noteId, reminderDate) => {
  try {
    const response = await apiClient.put(`/sticky-notes/${noteId}/reminder`, {
      reminderDate,
    });
    return response.data;
  } catch (error) {
    console.error("Error setting sticky note reminder:", error);
    throw error;
  }
};

// Clear reminder for a sticky note
export const clearStickyNoteReminder = async (noteId) => {
  try {
    const response = await apiClient.delete(`/sticky-notes/${noteId}/reminder`);
    return response.data;
  } catch (error) {
    console.error("Error clearing sticky note reminder:", error);
    throw error;
  }
};

// Get archived sticky notes
export const getArchivedStickyNotes = async (options = {}) => {
  try {
    const params = new URLSearchParams();

    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.sortOrder) params.append("sortOrder", options.sortOrder);
    if (options.limit) params.append("limit", options.limit);
    if (options.skip) params.append("skip", options.skip);

    const response = await apiClient.get(
      `/sticky-notes/archived?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching archived sticky notes:", error);
    throw error;
  }
};

// Get sticky notes with active reminders
export const getStickyNotesWithReminders = async () => {
  try {
    const response = await apiClient.get("/sticky-notes/reminders");
    return response.data;
  } catch (error) {
    console.error("Error fetching sticky notes with reminders:", error);
    throw error;
  }
};

// Bulk delete sticky notes
export const bulkDeleteStickyNotes = async (noteIds) => {
  try {
    const response = await apiClient.delete("/sticky-notes/bulk", {
      data: { noteIds },
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk deleting sticky notes:", error);
    throw error;
  }
};

////////////  ATTENDANCE SERVICES ⚒️⚒️⚒️⚒️⚒️ ////////////////

// Clock in - Start attendance
export const clockIn = async (attendanceData) => {
  try {
    const response = await apiClient.post(
      "/attendance/clock-in",
      attendanceData
    );
    return response.data;
  } catch (error) {
    console.error("Error clocking in:", error);
    throw error;
  }
};

// Clock out - End attendance
export const clockOut = async (clockOutData) => {
  try {
    const response = await apiClient.post(
      "/attendance/clock-out",
      clockOutData
    );
    return response.data;
  } catch (error) {
    console.error("Error clocking out:", error);
    throw error;
  }
};

// Start break
export const startBreak = async (breakData = {}) => {
  try {
    const response = await apiClient.post("/attendance/break/start", breakData);
    return response.data;
  } catch (error) {
    console.error("Error starting break:", error);
    throw error;
  }
};

// End break
export const endBreak = async () => {
  try {
    const response = await apiClient.post("/attendance/break/end");
    return response.data;
  } catch (error) {
    console.error("Error ending break:", error);
    throw error;
  }
};

// Get current attendance status
export const getCurrentAttendanceStatus = async () => {
  try {
    const response = await apiClient.get("/attendance/status");
    return response.data;
  } catch (error) {
    console.error("Error getting attendance status:", error);
    throw error;
  }
};

// Get employee attendance history
export const getEmployeeAttendanceHistory = async (
  employeeId,
  queryParams = {}
) => {
  try {
    const params = new URLSearchParams();

    // Add query parameters
    if (queryParams.page) params.append("page", queryParams.page);
    if (queryParams.limit) params.append("limit", queryParams.limit);
    if (queryParams.startDate)
      params.append("startDate", queryParams.startDate);
    if (queryParams.endDate) params.append("endDate", queryParams.endDate);

    const response = await apiClient.get(
      `/attendance/employee/${employeeId}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attendance history:", error);
    throw error;
  }
};

// Get daily attendance report (Admin only)
export const getDailyAttendanceReport = async (date = null) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append("date", date);

    const response = await apiClient.get(
      `/attendance/daily-report?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting daily report:", error);
    throw error;
  }
};

// Get attendance summary (Admin only)
export const getAttendanceSummary = async (queryParams) => {
  try {
    const params = new URLSearchParams();

    if (queryParams.startDate)
      params.append("startDate", queryParams.startDate);
    if (queryParams.endDate) params.append("endDate", queryParams.endDate);
    if (queryParams.employeeId)
      params.append("employeeId", queryParams.employeeId);

    const response = await apiClient.get(
      `/attendance/summary?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attendance summary:", error);
    throw error;
  }
};

// Get attendance analytics (Admin only)
export const getAttendanceAnalytics = async (period = "month") => {
  try {
    const response = await apiClient.get(
      `/attendance/analytics?period=${period}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attendance analytics:", error);
    throw error;
  }
};

// Update attendance record (Admin only)
export const updateAttendanceRecord = async (attendanceId, updateData) => {
  try {
    const response = await apiClient.put(
      `/attendance/${attendanceId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

// Approve/Reject attendance (Admin only)
export const approveAttendance = async (attendanceId, approvalData) => {
  try {
    const response = await apiClient.put(
      `/attendance/${attendanceId}/approve`,
      approvalData
    );
    return response.data;
  } catch (error) {
    console.error("Error approving attendance:", error);
    throw error;
  }
};

// Delete attendance record (Admin only)
export const deleteAttendanceRecord = async (attendanceId) => {
  try {
    const response = await apiClient.delete(`/attendance/${attendanceId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting attendance:", error);
    throw error;
  }
};

////////////  TASK FLOW SERVICES ⚒️⚒️⚒️⚒️⚒️ ////////////////

// Get all task flows for a company
export const getTaskFlows = async (companyId) => {
  try {
    const response = await apiClient.get(`/companies/${companyId}/task-flows`);
    return response.data;
  } catch (error) {
    console.error("Error fetching task flows:", error);
    throw error;
  }
};

// Create a new task flow
export const createTaskFlow = async (companyId, taskFlowData) => {
  try {
    const response = await apiClient.post(`/companies/${companyId}/task-flows`, taskFlowData);
    return response.data;
  } catch (error) {
    console.error("Error creating task flow:", error);
    throw error;
  }
};

// Update a task flow
export const updateTaskFlow = async (companyId, taskFlowId, taskFlowData) => {
  try {
    const response = await apiClient.put(`/companies/${companyId}/task-flows/${taskFlowId}`, taskFlowData);
    return response.data;
  } catch (error) {
    console.error("Error updating task flow:", error);
    throw error;
  }
};

// Delete a task flow (soft delete)
export const deleteTaskFlow = async (companyId, taskFlowId) => {
  try {
    const response = await apiClient.delete(`/companies/${companyId}/task-flows/${taskFlowId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting task flow:", error);
    throw error;
  }
};

// Restore a task flow
export const restoreTaskFlow = async (companyId, taskFlowId) => {
  try {
    const response = await apiClient.patch(`/companies/${companyId}/task-flows/${taskFlowId}/restore`);
    return response.data;
  } catch (error) {
    console.error("Error restoring task flow:", error);
    throw error;
  }
};
