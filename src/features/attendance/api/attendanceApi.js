import apiClient from "../../../api/client";

export const attendanceApi = {
  // Get attendance analytics
  getAttendanceAnalytics: async (period = "month") => {
    const response = await apiClient.get(
      `/attendance/analytics?period=${period}`
    );
    return response.data;
  },

  // Get daily report
  getDailyReport: async (date, page = 1, limit = 50) => {
    const response = await apiClient.get(
      `/attendance/daily-report?date=${date}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get attendance by date range
  getAttendanceByDateRange: async (
    startDate,
    endDate,
    page = 1,
    limit = 50
  ) => {
    const response = await apiClient.get(
      `/attendance/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get attendance summary
  getAttendanceSummary: async (startDate, endDate) => {
    const response = await apiClient.get(
      `/attendance/summary?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Get employee attendance
  getEmployeeAttendance: async (employeeId, startDate, endDate, page = 1, limit = 30) => {
    const response = await apiClient.get(
      `/attendance/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Clock in
  clockIn: async (data) => {
    const response = await apiClient.post("/attendance/clock-in", data);
    return response.data;
  },

  // Clock out
  clockOut: async (data) => {
    const response = await apiClient.post("/attendance/clock-out", data);
    return response.data;
  },

  // Start break
  startBreak: async (data) => {
    const response = await apiClient.post("/attendance/break/start", data);
    return response.data;
  },

  // End break
  endBreak: async (data) => {
    const response = await apiClient.post("/attendance/break/end", data);
    return response.data;
  },

  // Get current status
  getCurrentStatus: async () => {
    const response = await apiClient.get("/attendance/status");
    return response.data;
  },

  // Update attendance
  updateAttendance: async (attendanceId, data) => {
    const response = await apiClient.put(`/attendance/${attendanceId}`, data);
    return response.data;
  },

  // Approve attendance
  approveAttendance: async (attendanceId) => {
    const response = await apiClient.put(`/attendance/${attendanceId}/approve`);
    return response.data;
  },

  // Delete attendance
  deleteAttendance: async (attendanceId) => {
    const response = await apiClient.delete(`/attendance/${attendanceId}`);
    return response.data;
  },
};
