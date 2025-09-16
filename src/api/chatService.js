import apiClient from "./client";
import { CHAT_ENDPOINTS } from "./enpoint";

// Get all conversations for the current user
export const getConversations = async () => {
  try {
    const response = await apiClient.get(`/${CHAT_ENDPOINTS.CONVERSATIONS}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to fetch conversations",
    };
  }
};

// Get detailed conversation information
export const getConversationDetails = async (conversationId) => {
  try {
    const response = await apiClient.get(
      `/${CHAT_ENDPOINTS.CONVERSATIONS}/conversation/${conversationId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to fetch conversation details",
    };
  }
};

// Get messages for a specific conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await apiClient.get(
      `/${CHAT_ENDPOINTS.MESSAGES}/${conversationId}?page=${page}&limit=${limit}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch messages",
    };
  }
};

// Send a new message
export const sendMessage = async (messageData) => {
  try {
    const response = await apiClient.post(
      `/${CHAT_ENDPOINTS.SEND_MESSAGE}`,
      messageData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to send message",
    };
  }
};

// Get project chat conversations
export const getProjectChats = async () => {
  try {
    const response = await apiClient.get(`/${CHAT_ENDPOINTS.PROJECT_CHAT}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to fetch project chats",
    };
  }
};

// Get all project group chats for messenger
export const getProjectGroupChats = async () => {
  try {
    const response = await apiClient.get(`/${CHAT_ENDPOINTS.PROJECT_GROUPS}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to fetch project group chats",
    };
  }
};

// Ensure all projects have group conversations
export const ensureProjectGroupChats = async () => {
  try {
    const response = await apiClient.post(
      `/${CHAT_ENDPOINTS.ENSURE_PROJECT_CHATS}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to ensure project group chats",
    };
  }
};

// Get direct message conversations
export const getDirectMessages = async () => {
  try {
    const response = await apiClient.get(`/${CHAT_ENDPOINTS.DIRECT_MESSAGES}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to fetch direct messages",
    };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId) => {
  try {
    const response = await apiClient.post(`/${CHAT_ENDPOINTS.MARK_READ}`, {
      conversationId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to mark messages as read",
    };
  }
};

// Get online users
export const getOnlineUsers = async () => {
  try {
    const response = await apiClient.get(`/${CHAT_ENDPOINTS.ONLINE_USERS}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch online users",
    };
  }
};

// Get company employees
export const getCompanyEmployees = async () => {
  try {
    const response = await apiClient.get(`/${CHAT_ENDPOINTS.EMPLOYEES}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to fetch company employees",
    };
  }
};

// Create a new direct conversation
export const createDirectConversation = async (userId) => {
  try {
    const response = await apiClient.post(`/${CHAT_ENDPOINTS.CREATE_DIRECT}`, {
      userId,
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to create conversation",
    };
  }
};

// Sync existing projects with conversations (admin only)
export const syncProjectConversations = async () => {
  try {
    const response = await apiClient.post(
      `/${CHAT_ENDPOINTS.CONVERSATIONS}/sync-projects`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to sync project conversations",
    };
  }
};

// Sync specific project conversation participants
export const syncSpecificProjectConversation = async (projectId) => {
  try {
    const response = await apiClient.post(
      `/${CHAT_ENDPOINTS.CONVERSATIONS}/sync-project/${projectId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message || "Failed to sync project conversation",
    };
  }
};

// Add team member to project conversation
export const addTeamMemberToConversation = async (projectId, userId) => {
  try {
    const response = await apiClient.post(
      `/${CHAT_ENDPOINTS.CONVERSATIONS}/add-member`,
      {
        projectId,
        userId,
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to add team member to conversation",
    };
  }
};

// Upload file for chat
export const uploadChatFile = async (file, conversationId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversationId);

    const response = await apiClient.post("/upload/chat", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to upload file",
    };
  }
};
