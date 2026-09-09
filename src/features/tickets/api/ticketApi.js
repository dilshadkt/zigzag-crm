import apiClient from "../../../api/client";

const qs = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.append(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const ticketApi = {
  getTickets: async (params = {}) => {
    const response = await apiClient.get(`/tickets${qs(params)}`);
    return response.data;
  },
  getTicketCounts: async () => {
    const response = await apiClient.get("/tickets/counts");
    return response.data;
  },
  getTicket: async (ticketId) => {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
  },
  createTicket: async (data) => {
    const response = await apiClient.post("/tickets", data);
    return response.data;
  },
  updateTicket: async (ticketId, data) => {
    const response = await apiClient.put(`/tickets/${ticketId}`, data);
    return response.data;
  },
  assignTicket: async (ticketId, assignedTo) => {
    const response = await apiClient.patch(`/tickets/${ticketId}/assign`, {
      assignedTo,
    });
    return response.data;
  },
  updateTicketStatus: async (ticketId, status) => {
    const response = await apiClient.patch(`/tickets/${ticketId}/status`, {
      status,
    });
    return response.data;
  },
  addComment: async (ticketId, message) => {
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, {
      message,
    });
    return response.data;
  },
  deleteTicket: async (ticketId) => {
    const response = await apiClient.delete(`/tickets/${ticketId}`);
    return response.data;
  },
};
