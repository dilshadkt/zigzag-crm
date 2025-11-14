// src/api/hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import apiClient from "./client";
import {
  addProject,
  createEmployee,
  createTask,
  createTaskFromBoard,
  getTaskById,
  updatedProfile,
  updateProject,
  updateTaskById,
  updateTaskOrder,
  deleteProject,
  pauseProject,
  resumeProject,
  createSubTask,
  getSubTasksByParentTask,
  getSubTaskById,
  updateSubTaskById,
  deleteSubTask,
  addSubTaskAttachments,
  removeSubTaskAttachment,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  uploadSingleFile,
  getTasksOnReview,
  getTasksOnPublish,
  getClientReviewTasks,
  getUnscheduledTasks,
  scheduleSubTask,
  // Sticky Notes imports
  createStickyNote,
  getUserStickyNotes,
  getStickyNoteById,
  updateStickyNote,
  deleteStickyNote,
  updateStickyNotePositions,
  toggleArchiveStickyNote,
  setStickyNoteReminder,
  clearStickyNoteReminder,
  getArchivedStickyNotes,
  getStickyNotesWithReminders,
  bulkDeleteStickyNotes,
  // Attendance imports
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getCurrentAttendanceStatus,
  getEmployeeAttendanceHistory,
  getDailyAttendanceReport,
  getAttendanceSummary,
  getAttendanceAnalytics,
  updateAttendanceRecord,
  approveAttendance,
  deleteAttendanceRecord,
  // Task Flow imports
  getTaskFlows,
  createTaskFlow,
  updateTaskFlow,
  deleteTaskFlow,
  restoreTaskFlow,
  deleteAllCompanyTasks,
  deleteAllCompanyProjects,
  deleteAllCompanyEmployees,
} from "./service";
import { format } from "date-fns";
import { useAuth } from "../hooks/useAuth";

// Task Flow hooks

export const useGetTaskFlows = (companyId) => {
  return useQuery({
    queryKey: ["taskFlows", companyId],
    queryFn: () => getTaskFlows(companyId),
    enabled: !!companyId,
    select: (data) => data?.taskFlows || [],
  });
};

export const useCreateTaskFlow = (companyId, onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskFlowData) => createTaskFlow(companyId, taskFlowData),
    onSuccess: (...args) => {
      queryClient.invalidateQueries(["taskFlows", companyId]);
      if (onSuccess) onSuccess(...args);
    },
  });
};

export const useUpdateTaskFlow = (companyId, onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskFlowId, taskFlowData }) =>
      updateTaskFlow(companyId, taskFlowId, taskFlowData),
    onSuccess: (...args) => {
      queryClient.invalidateQueries(["taskFlows", companyId]);
      if (onSuccess) onSuccess(...args);
    },
  });
};

export const useDeleteTaskFlow = (companyId, onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskFlowId) => deleteTaskFlow(companyId, taskFlowId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries(["taskFlows", companyId]);
      if (onSuccess) onSuccess(...args);
    },
  });
};

export const useRestoreTaskFlow = (companyId, onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskFlowId) => restoreTaskFlow(companyId, taskFlowId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries(["taskFlows", companyId]);
      if (onSuccess) onSuccess(...args);
    },
  });
};

// Customers
export const useCustomers = () =>
  useQuery({
    queryKey: ["customers"],
    queryFn: () => apiClient.get("/customers").then((res) => res.data),
  });

export const useCompanyProjects = (companyId, limit = 0, monthKey = null) => {
  return useQuery({
    queryKey: ["companyProjects", companyId, limit, monthKey],
    queryFn: () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (monthKey) params.append("monthKey", monthKey);
      params.append("active", "true");

      const queryString = params.toString();
      return apiClient
        .get(
          `/projects/company/${companyId}${
            queryString ? `?${queryString}` : ""
          }`
        )
        .then((res) => res.data?.projects);
    },
    enabled: !!companyId,
  });
};

export const useProjectDetails = (projectId, monthKey = null) => {
  return useQuery({
    queryKey: ["projectDetails", projectId, monthKey],
    queryFn: () => {
      const url = monthKey
        ? `/projects/${projectId}?monthKey=${monthKey}`
        : `/projects/${projectId}`;
      return apiClient.get(url).then((res) => res.data?.project);
    },
    enabled: !!projectId,
    // staleTime: 1000 * 60 * 2, // 2 minutes (Prevents frequent refetches)
    // cacheTime: 1000 * 60 * 10, // 10 minutes (Keeps it in cache)
    // refetchOnWindowFocus: false, // Prevents automatic refetch when window gains focus
    // refetchOnReconnect: false, // Prevents refetch when network reconnects
  });
};

// New hook for fetching project tasks separately
export const useProjectTasks = (projectId, monthKey = null) => {
  return useQuery({
    queryKey: ["projectTasks", projectId, monthKey],
    queryFn: () => {
      const url = monthKey
        ? `/projects/${projectId}/tasks?monthKey=${monthKey}`
        : `/projects/${projectId}/tasks`;
      return apiClient
        .get(url)
        .then((res) => [...res.data?.tasks, ...res.data?.subTasks] || []);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 1, // 1 minute (Tasks change more frequently)
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

//empoyee
export const useEmpoyees = (page = 1, filters = null) => {
  return useQuery({
    queryKey: ["employees", page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (filters) {
        params.append("filters", JSON.stringify(filters));
      }

      const response = await apiClient.get(`/employee?${params.toString()}`);
      return response.data;
    },
    keepPreviousData: true,
  });
};

// Hook to get all employees (for tasks without projects)
export const useGetAllEmployees = (enabled = true) => {
  return useQuery({
    queryKey: ["allEmployees"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "1000", // Large limit to get all employees
      });

      const response = await apiClient.get(`/employee?${params.toString()}`);
      return response.data;
    },
    enabled,
  });
};
// task

export const useCreateTask = (handleClose, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createTask"],
    mutationFn: (taskData) => createTask(taskData, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectTasks", projectId],
      });
      handleClose();
      // toast.success('Target set successfully!');
    },
  });
};

export const useCreateTaskFromBoard = (handleClose) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: ["createTaskFromBoard"],
    mutationFn: (taskData) => createTaskFromBoard(taskData),
    onSuccess: () => {
      // Invalidate relevant queries based on user role
      if (user?.role === "company-admin") {
        queryClient.invalidateQueries(["companyTasks", user?.company]);
      } else {
        queryClient.invalidateQueries(["employeeTasks", user?._id]);
      }
      handleClose();
      // toast.success('Task created successfully!');
    },
  });
};

export const useUpdateProfile = (handleSuccess, employeeId = null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateProfile", employeeId],
    mutationFn: (updatedData) => updatedProfile(updatedData, employeeId),
    onSuccess: (data, variables) => {
      // Invalidate all employee-related queries
      queryClient.invalidateQueries(["employee"]);
      queryClient.invalidateQueries(["employees"]);

      // If we have the updated employee data, update the specific employee cache
      if (data?.employee?._id) {
        queryClient.setQueryData(["employee", data.employee._id], data);
        // Also invalidate the specific employee query to ensure fresh data
        queryClient.invalidateQueries(["employee", data.employee._id]);
      }

      // Invalidate auth-related queries that might contain user profile data
      queryClient.invalidateQueries(["auth"]);
      queryClient.invalidateQueries(["user"]);

      // Call the success handler if provided
      if (handleSuccess) {
        handleSuccess(data);
      }
    },
  });
};

// New hook for uploading profile images
export const useUploadProfileImage = (onSuccess, onError) => {
  return useMutation({
    mutationFn: (file) => uploadSingleFile(file),
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      if (onError) onError(error);
    },
  });
};

export const useGetTaskById = (taskId) => {
  return useQuery({
    queryKey: ["getTaskById", taskId],
    queryFn: () => getTaskById(taskId),
    select: (data) => data?.task,
  });
};

export const useUpdateTaskById = (taskId, handleClose) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updatedTaskById", taskId],
    mutationFn: (updatedData) => updateTaskById(taskId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["getTaskById", taskId]);
      handleClose();
    },
  });
};
export const useAddEmployee = (handleClose) => {
  return useMutation({
    mutationKey: ["addEmployee"],
    mutationFn: (data) => createEmployee(data),
  });
};

/////////////  PROJECT SECTION ⚠️⚠️⚠️⚠️⚠️ ////////////////////

// Add PROJECT
export const useAddProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addProject"],
    mutationFn: (projectDetails) => addProject(projectDetails),
    onSuccess: () => {
      queryClient.invalidateQueries(["companyProjects"]);
    },
  });
};

export const useUpdateProject = (projectId, handleSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateProject"],
    mutationFn: (updatedData) => updateProject(updatedData, projectId),
    onSuccess: () => {
      handleSuccess();
      queryClient.invalidateQueries(["projectDetails", projectId]);
    },
  });
};

// Time Log Hooks
export const useGetTaskTimeLogs = (taskId) => {
  return useQuery({
    queryKey: ["taskTimeLogs", taskId],
    queryFn: () =>
      apiClient.get(`/time-logs/task/${taskId}`).then((res) => res.data),
    enabled: !!taskId,
  });
};

export const useCreateTimeLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (timeLogData) =>
      apiClient.post("/time-logs", timeLogData).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["taskTimeLogs", variables.taskId]);
    },
  });
};

export const useUpdateTaskOrder = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, newOrder }) => updateTaskOrder(taskId, newOrder),
    onSuccess: () => {
      // Invalidate project details to refresh the task list
      queryClient.invalidateQueries(["projectDetails", projectId]);
    },
  });
};

export const useGetEmployeeProjects = (employeeId, monthKey = null) => {
  return useQuery({
    queryKey: ["employeeProjects", employeeId, monthKey],
    queryFn: () => {
      const params = new URLSearchParams();
      if (monthKey) params.append("monthKey", monthKey);
      params.append("active", "true");

      const queryString = params.toString();
      return apiClient
        .get(`/projects/employee/${employeeId}?${queryString}`)
        .then((res) => res.data)
        .catch((error) => {
          // Fallback data if endpoint doesn't exist or has errors
          console.warn("Employee projects endpoint not available:", error);
          return {
            projects: [
              // Sample project data for demonstration
              {
                _id: "sample-project-1",
                name: "Sample Employee Project",
                description: "A sample project assigned to the employee",
                status: "active",
                progress: 65,
                dueDate: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(), // 7 days from now
                teams: [],
                tasks: [],
              },
              {
                _id: "sample-project-2",
                name: "Mobile App Development",
                description: "Developing a mobile application for the company",
                status: "active",
                progress: 40,
                dueDate: new Date(
                  Date.now() + 14 * 24 * 60 * 60 * 1000
                ).toISOString(), // 14 days from now
                teams: [],
                tasks: [],
              },
              {
                _id: "sample-project-3",
                name: "Website Redesign",
                description: "Complete redesign of the company website",
                status: "active",
                progress: 80,
                dueDate: new Date(
                  Date.now() + 3 * 24 * 60 * 60 * 1000
                ).toISOString(), // 3 days from now
                teams: [],
                tasks: [],
              },
            ],
          };
        });
    },
    enabled: !!employeeId, // Only run if employeeId exists and is not null
  });
};

export const useGetEmployee = (employeeId) => {
  return useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () =>
      apiClient.get(`/employee/${employeeId}`).then((res) => res.data),
    enabled: !!employeeId,
  });
};

export const useGetEmployeeTeams = (employeeId, projectId) => {
  return useQuery({
    queryKey: ["employeeTeams", employeeId, projectId],
    queryFn: () =>
      apiClient
        .get(`/teams/employee/${employeeId}`, {
          params: { projectId },
        })
        .then((res) => res.data)
        .catch((error) => {
          console.warn("Employee teams endpoint not available:", error);
          return { teams: [] };
        }),
    enabled: !!employeeId && !!projectId,
  });
};

export const useGetProjectsDueThisMonth = (date = new Date()) => {
  return useQuery({
    queryKey: ["projectsDueThisMonth", format(date, "yyyy-MM")],
    queryFn: () =>
      apiClient
        .get(
          `/projects/due-this-month?date=${format(
            date,
            "yyyy-MM-dd"
          )}&active=true`
        )
        .then((res) => res.data),
  });
};

export const useGetTasksDueThisMonth = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed

  return useQuery({
    queryKey: ["tasksDueThisMonth", format(date, "yyyy-MM")],
    queryFn: () =>
      apiClient.get(`/tasks/month/${year}/${month}`).then((res) => res.data),
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteProject"],
    mutationFn: (projectId) =>
      apiClient.delete(`/projects/${projectId}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all project-related queries
      queryClient.invalidateQueries(["projectDetails"]);
      queryClient.invalidateQueries(["companyProjects"]);
    },
  });
};

export const usePauseProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["pauseProject"],
    mutationFn: (projectId) => pauseProject(projectId),
    onSuccess: () => {
      // Invalidate all project-related queries
      queryClient.invalidateQueries(["projectDetails"]);
      queryClient.invalidateQueries(["companyProjects"]);
    },
  });
};

export const useResumeProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["resumeProject"],
    mutationFn: (projectId) => resumeProject(projectId),
    onSuccess: () => {
      // Invalidate all project-related queries
      queryClient.invalidateQueries(["projectDetails"]);
      queryClient.invalidateQueries(["companyProjects"]);
    },
  });
};

// Position Management Hooks
export const useGetPositions = (companyId) => {
  return useQuery({
    queryKey: ["positions", companyId],
    queryFn: () =>
      apiClient
        .get(`/companies/${companyId}/positions`)
        .then((res) => res.data),
    enabled: !!companyId,
  });
};

export const useGetPosition = (companyId, positionId) => {
  return useQuery({
    queryKey: ["position", companyId, positionId],
    queryFn: () =>
      apiClient
        .get(`/companies/${companyId}/positions/${positionId}`)
        .then((res) => res.data),
    enabled: !!companyId && !!positionId,
  });
};

export const useCreatePosition = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createPosition"],
    mutationFn: (positionData) =>
      apiClient
        .post(`/companies/${companyId}/positions`, positionData)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["positions", companyId]);
    },
  });
};

export const useUpdatePosition = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updatePosition"],
    mutationFn: ({ id, ...positionData }) =>
      apiClient
        .put(`/companies/${companyId}/positions/${id}`, positionData)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["positions", companyId]);
    },
  });
};

export const useDeletePosition = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deletePosition"],
    mutationFn: (id) =>
      apiClient
        .delete(`/companies/${companyId}/positions/${id}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["positions", companyId]);
    },
  });
};

export const useRestorePosition = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["restorePosition"],
    mutationFn: (id) =>
      apiClient
        .patch(`/companies/${companyId}/positions/${id}/restore`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["positions", companyId]);
    },
  });
};

// Get position permissions
export const useGetPermissions = (companyId, positionId) => {
  return useQuery({
    queryKey: ["permissions", companyId, positionId],
    queryFn: () =>
      apiClient
        .get(`/companies/${companyId}/positions/${positionId}/permissions`)
        .then((res) => res.data),
    enabled: !!companyId && !!positionId,
  });
};

// Update position permissions
export const useUpdatePermissions = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updatePermissions"],
    mutationFn: ({ positionId, permissions }) =>
      apiClient
        .put(`/companies/${companyId}/positions/${positionId}/permissions`, {
          permissions,
        })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["positions", companyId]);
      queryClient.invalidateQueries(["permissions"]);
    },
  });
};

export const useDeleteTask = (projectId, onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteTask"],
    mutationFn: (taskId) =>
      apiClient.delete(`/tasks/${taskId}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate both task and project queries to refresh the data
      queryClient.invalidateQueries(["projectDetails"]);
      if (onSuccess) onSuccess();
    },
  });
};

export const useGetEmployeeBirthdays = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed

  return useQuery({
    queryKey: ["employeeBirthdays", format(date, "yyyy-MM")],
    queryFn: () =>
      apiClient
        .get(`/employee/birthdays/${year}/${month}`)
        .then((res) => res.data),
  });
};

// Vacation hooks
export const useCreateVacationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vacationData) =>
      apiClient.post("/vacations", vacationData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["myVacations"]);
      queryClient.invalidateQueries(["vacationsCalendar"]);
      queryClient.invalidateQueries(["companyVacations"]);
    },
  });
};

export const useGetMyVacations = () => {
  return useQuery({
    queryKey: ["myVacations"],
    queryFn: () =>
      apiClient.get("/vacations/my-vacations").then((res) => res.data),
  });
};

export const useGetEmployeeVacations = (employeeId, month, year) => {
  const queryParams = new URLSearchParams();
  if (month) queryParams.append("month", month);
  if (year) queryParams.append("year", year);

  return useQuery({
    queryKey: ["employeeVacations", employeeId, month, year],
    queryFn: () =>
      apiClient
        .get(`/vacations/employee/${employeeId}?${queryParams.toString()}`)
        .then((res) => res.data),
    enabled: !!employeeId,
  });
};

export const useGetCompanyVacations = (month, year) => {
  const queryParams = new URLSearchParams();
  if (month) queryParams.append("month", month);
  if (year) queryParams.append("year", year);

  return useQuery({
    queryKey: ["companyVacations", month, year],
    queryFn: () =>
      apiClient
        .get(`/vacations/company?${queryParams.toString()}`)
        .then((res) => res.data),
  });
};

export const useGetVacationsCalendar = (month, year) => {
  return useQuery({
    queryKey: ["vacationsCalendar", month, year],
    queryFn: () =>
      apiClient
        .get(`/vacations/calendar?month=${month}&year=${year}`)
        .then((res) => res.data),
    enabled: !!month && !!year,
  });
};

export const useUpdateVacationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vacationId, status, notes }) =>
      apiClient
        .patch(`/vacations/${vacationId}/status`, { status, notes })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["myVacations"]);
      queryClient.invalidateQueries(["vacationsCalendar"]);
      queryClient.invalidateQueries(["companyVacations"]);
    },
  });
};

export const useUpdateVacationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vacationId, data }) =>
      apiClient.put(`/vacations/${vacationId}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["myVacations"]);
      queryClient.invalidateQueries(["vacationsCalendar"]);
      queryClient.invalidateQueries(["companyVacations"]);
    },
  });
};

// Recent Activities Hook
export const useGetRecentActivities = (limit = 10, type = "all") => {
  return useQuery({
    queryKey: ["recentActivities", limit, type],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (type && type !== "all") {
        params.append("type", type);
      }

      return apiClient
        .get(`/time-logs/recent-activities?${params.toString()}`)
        .then((res) => res.data);
    },
    staleTime: 1000 * 60 * 1, // 1 minute (reduced for more frequent updates)
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes (more frequent)
    refetchOnWindowFocus: true, // Refetch when window gains focus (tab switching)
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchOnMount: true, // Refetch when component mounts
  });
};

// Employee Tasks Hooks
export const useGetEmployeeTasks = (employeeId, filters = {}) => {
  return useQuery({
    queryKey: ["employeeTasks", employeeId, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.dueDate) params.append("dueDate", filters.dueDate);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.projectId) params.append("projectId", filters.projectId);
      if (filters.taskMonth) params.append("taskMonth", filters.taskMonth);

      return apiClient
        .get(`/tasks/employee/${employeeId}?${params.toString()}`)
        .then((res) => res.data)
        .catch((error) => {
          // Fallback data if endpoint doesn't exist
          console.warn("Employee tasks endpoint not available:", error);
          return { tasks: [] };
        });
    },
    enabled: !!employeeId && employeeId !== null && employeeId !== "null", // Only run if employeeId exists and is valid
  });
};

// Get tasks assigned to an employee that are due today
export const useGetEmployeeTasksToday = (employeeId) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  return useQuery({
    queryKey: ["employeeTasksToday", employeeId, today],
    queryFn: () =>
      apiClient
        .get(`/tasks/employee/${employeeId}/today`)
        .then((res) => res.data)
        .catch((error) => {
          // Fallback data if endpoint doesn't exist
          return {
            tasks: [
              // Sample task data for demonstration
              {
                _id: "sample-1",
                title: "Review project requirements",
                description:
                  "Go through the project specifications and prepare feedback",
                priority: "high",
                status: "pending",
                dueDate: new Date().toISOString(),
                estimatedHours: 2,
                project: {
                  _id: "sample-project-1",
                  name: "Sample-Project",
                  displayName: "Sample Project",
                },
              },
              {
                _id: "sample-2",
                title: "Update documentation",
                description: "Update the API documentation with recent changes",
                priority: "medium",
                status: "in-progress",
                dueDate: new Date().toISOString(),
                estimatedHours: 1.5,
                project: {
                  _id: "sample-project-2",
                  name: "Documentation-Project",
                  displayName: "Documentation Project",
                },
              },
              {
                _id: "sample-3",
                title: "Fix login bug",
                description:
                  "Resolve the authentication issue reported by users",
                priority: "high",
                status: "pending",
                dueDate: new Date(
                  Date.now() + 2 * 60 * 60 * 1000
                ).toISOString(), // 2 hours from now
                estimatedHours: 3,
                project: {
                  _id: "sample-project-3",
                  name: "Bug-Fixes",
                  displayName: "Bug Fixes",
                },
              },
              {
                _id: "sample-4",
                title: "Code review",
                description: "Review pull requests from team members",
                priority: "low",
                status: "completed",
                dueDate: new Date(
                  Date.now() - 1 * 60 * 60 * 1000
                ).toISOString(), // 1 hour ago
                estimatedHours: 1,
                project: {
                  _id: "sample-project-1",
                  name: "Sample-Project",
                  displayName: "Sample Project",
                },
              },
            ],
          };
        }),
    enabled: !!employeeId && employeeId !== null && employeeId !== "null", // Only run if employeeId exists and is valid
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

// Get all subtasks assigned to a specific employee
export const useGetEmployeeSubTasks = (employeeId, filters = {}) => {
  return useQuery({
    queryKey: ["employeeSubTasks", employeeId, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.dueDate) params.append("dueDate", filters.dueDate);
      if (filters.priority) params.append("priority", filters.priority);

      return apiClient
        .get(`/subtasks/employee/${employeeId}?${params.toString()}`)
        .then((res) => res.data)
        .catch((error) => {
          // Fallback data if endpoint doesn't exist
          console.warn("Employee subtasks endpoint not available:", error);
          return { subTasks: [] };
        });
    },
    enabled: !!employeeId && employeeId !== null && employeeId !== "null", // Only run if employeeId exists and is valid
  });
};

// Get subtasks assigned to an employee that are due today
export const useGetEmployeeSubTasksToday = (employeeId) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  return useQuery({
    queryKey: ["employeeSubTasksToday", employeeId, today],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("dueDate", today);

      return apiClient
        .get(`/subtasks/employee/${employeeId}?${params.toString()}`)
        .then((res) => res.data)
        .catch((error) => {
          // Fallback data if endpoint doesn't exist
          console.warn(
            "Employee subtasks today endpoint not available:",
            error
          );
          return {
            subTasks: [
              // Sample subtask data for demonstration
              {
                _id: "sample-subtask-1",
                title: "Review subtask requirements",
                description:
                  "Go through the subtask specifications and prepare feedback",
                priority: "High",
                status: "todo",
                dueDate: new Date().toISOString(),
                timeEstimate: 2,
                project: {
                  _id: "sample-project-1",
                  name: "Sample-Project",
                  displayName: "Sample Project",
                },
                parentTask: {
                  _id: "sample-task-1",
                  title: "Sample Parent Task",
                },
              },
              {
                _id: "sample-subtask-2",
                title: "Update subtask documentation",
                description:
                  "Update the subtask documentation with recent changes",
                priority: "Medium",
                status: "in-progress",
                dueDate: new Date().toISOString(),
                timeEstimate: 1.5,
                project: {
                  _id: "sample-project-2",
                  name: "Documentation-Project",
                  displayName: "Documentation Project",
                },
                parentTask: {
                  _id: "sample-task-2",
                  title: "Documentation Task",
                },
              },
              {
                _id: "sample-subtask-3",
                title: "Fix subtask bug",
                description: "Resolve the subtask issue reported by users",
                priority: "High",
                status: "todo",
                dueDate: new Date(
                  Date.now() + 2 * 60 * 60 * 1000
                ).toISOString(), // 2 hours from now
                timeEstimate: 3,
                project: {
                  _id: "sample-project-3",
                  name: "Bug-Fixes",
                  displayName: "Bug Fixes",
                },
                parentTask: {
                  _id: "sample-task-3",
                  title: "Bug Fix Task",
                },
              },
              {
                _id: "sample-subtask-4",
                title: "Subtask code review",
                description: "Review subtask pull requests from team members",
                priority: "Low",
                status: "completed",
                dueDate: new Date(
                  Date.now() - 1 * 60 * 60 * 1000
                ).toISOString(), // 1 hour ago
                timeEstimate: 1,
                project: {
                  _id: "sample-project-1",
                  name: "Sample-Project",
                  displayName: "Sample Project",
                },
                parentTask: {
                  _id: "sample-task-1",
                  title: "Sample Parent Task",
                },
              },
            ],
          };
        });
    },
    enabled: !!employeeId && employeeId !== null && employeeId !== "null", // Only run if employeeId exists and is valid
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

export const useGetCompanyTodayTasks = (taskMonth) => {
  return useQuery({
    queryKey: ["companyTodayTasks", taskMonth],
    queryFn: () => {
      const params = new URLSearchParams();
      if (taskMonth) {
        params.append("taskMonth", taskMonth);
      }

      return apiClient
        .get(`/tasks/company/today?${params.toString()}`)
        .then((res) => res.data)
        .catch((error) => {
          console.warn("Company today tasks endpoint not available:", error);
          return {
            tasks: [],
            subTasks: [],
            totalTodayTasks: 0,
          };
        });
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

// Company Statistics Hook - for admin dashboard overview
export const useGetCompanyStats = (companyId, taskMonth) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  return useQuery({
    queryKey: ["companyStats", companyId, taskMonth],
    queryFn: async () => {
      try {
        // Fetch multiple endpoints in parallel for company overview
        const [companyTasks, projectsThisMonth, allProjects, allEmployees] =
          await Promise.all([
            apiClient
              .get(`/tasks/company/all?taskMonth=${taskMonth}`)
              .then((res) => res.data),
            apiClient
              .get(
                `/projects/due-this-month?date=${format(
                  new Date(),
                  "yyyy-MM-dd"
                )}&active=true`
              )
              .then((res) => res.data),
            apiClient
              .get(`/projects/company/${companyId}`)
              .then((res) => res.data),
            apiClient.get("/employee").then((res) => res.data),
          ]);
        // Get task statistics from the new endpoint
        const taskStats = companyTasks?.statistics || {
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          onReview: 0,
          approved: 0,
          overdue: 0,
          today: 0,
          completionRate: 0,
          priorityDistribution: { high: 0, medium: 0, low: 0 },
        };

        // Calculate project statistics
        const allProjectsData = allProjects?.projects || [];
        const activeProjects = allProjectsData.filter(
          (project) => project.active !== false
        );
        const totalProjects = activeProjects.length;
        const projectsThisMonthData = projectsThisMonth?.projects || [];
        const projectsDueThisMonth = projectsThisMonthData.length;

        // Calculate employee statistics
        const employeesData = allEmployees?.employees || [];
        const totalEmployees = employeesData.length;
        const activeEmployees = employeesData.filter(
          (emp) => emp.active !== false
        ).length;

        // Calculate project progress average
        const projectProgressAvg =
          activeProjects.length > 0
            ? Math.round(
                activeProjects.reduce(
                  (sum, project) => sum + (project.progress || 0),
                  0
                ) / activeProjects.length
              )
            : 0;

        return {
          tasks: {
            total: taskStats.total,
            completed: taskStats.completed,
            inProgress: taskStats.inProgress,
            pending: taskStats.pending,
            onReview: taskStats.onReview,
            approved: taskStats.approved,
            overdue: taskStats.overdue,
            today: taskStats.today,
            completionRate: taskStats.completionRate,
          },
          projects: {
            total: totalProjects,
            dueThisMonth: projectsDueThisMonth,
            averageProgress: projectProgressAvg,
          },
          employees: {
            total: totalEmployees,
            active: activeEmployees,
          },
          overview: {
            taskCompletionRate: taskStats.completionRate,
            projectProgressAvg,
            workloadDistribution: taskStats.priorityDistribution,
          },
        };
      } catch (error) {
        // Return fallback data
        return {
          tasks: {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            onReview: 0,
            approved: 0,
            overdue: 0,
            completionRate: 0,
          },
          projects: {
            total: 0,
            dueThisMonth: 0,
            averageProgress: 0,
            active: 0,
          },
          employees: {
            total: 0,
            active: 0,
          },
          overview: {
            taskCompletionRate: 0,
            projectProgressAvg: 0,
            workloadDistribution: {
              high: 0,
              medium: 0,
              low: 0,
            },
          },
        };
      }
    },
    enabled: !!companyId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

// Get All Company Tasks Hook - uses the new dedicated endpoint
export const useGetAllCompanyTasks = (companyId, taskMonth) => {
  return useQuery({
    queryKey: ["allCompanyTasks", companyId, taskMonth],
    queryFn: () =>
      apiClient.get("/tasks/company/all?taskMonth=" + taskMonth).then((res) => {
        return {
          tasks: [...res.data.tasks, ...res.data.subTasks] || [],
          unscheduledSubTasks: res.data.unscheduledSubTasks || [],
          statistics: res.data.statistics || {},
          totalCount: res.data.tasks?.length || 0,
        };
      }),
    enabled: !!companyId && !!taskMonth,
  });
};

// Get Tasks On Review Hook - for the task-on-review page
export const useGetTasksOnReview = (filters = {}) => {
  return useQuery({
    queryKey: ["tasksOnReview", filters],
    queryFn: () => getTasksOnReview(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes (frequent updates for real-time)
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    select: (data) => ({
      tasks: data?.tasks || [],
      pagination: data?.pagination || {},
      statistics: data?.statistics || {},
    }),
  });
};

// Get Tasks On Publish Hook - for the task-on-publish page
export const useGetTasksOnPublish = (filters = {}) => {
  return useQuery({
    queryKey: ["tasksOnPublish", filters],
    queryFn: () => getTasksOnPublish(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes (frequent updates for real-time)
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    select: (data) => ({
      tasks: data?.tasks || [],
      pagination: data?.pagination || {},
      statistics: data?.statistics || {},
    }),
  });
};

// Get Client Review Tasks Hook - for the client-review page
export const useGetClientReviewTasks = (filters = {}) => {
  return useQuery({
    queryKey: ["clientReviewTasks", filters],
    queryFn: () => getClientReviewTasks(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes (frequent updates for real-time)
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    select: (data) => ({
      tasks: data?.tasks || [],
      pagination: data?.pagination || {},
      statistics: data?.statistics || {},
    }),
  });
};

// Get Unscheduled Tasks Hook - for subtasks without startDate and dueDate
export const useGetUnscheduledTasks = (filters = {}) => {
  return useQuery({
    queryKey: ["unscheduledTasks", filters],
    queryFn: () => getUnscheduledTasks(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    select: (data) => ({
      subTasks: data?.subTasks || [],
      pagination: data?.pagination || {},
      statistics: data?.statistics || {},
    }),
  });
};

// Schedule SubTask Hook - for scheduling unscheduled subtasks
export const useScheduleSubTask = (onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subTaskId, startDate, dueDate }) =>
      scheduleSubTask(subTaskId, startDate, dueDate),
    onSuccess: (data, variables) => {
      // Invalidate unscheduled tasks query to refresh the list
      queryClient.invalidateQueries(["unscheduledTasks"]);
      // Invalidate calendar data to refresh calendar view
      queryClient.invalidateQueries(["calendarData"]);
      // Invalidate any subtask-specific queries
      queryClient.invalidateQueries(["subtasks"]);
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (error) => {
      console.error("Failed to schedule subtask:", error);
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteEmployee"],
    mutationFn: (employeeId) =>
      apiClient.delete(`/employee/${employeeId}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all employee-related queries
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["employee"]);
      queryClient.invalidateQueries(["employeeProjects"]);
      queryClient.invalidateQueries(["employeeTeams"]);
      queryClient.invalidateQueries(["employeeVacations"]);
      queryClient.invalidateQueries(["employeeTasks"]);
      queryClient.invalidateQueries(["employeeTasksToday"]);
      queryClient.invalidateQueries(["employeeBirthdays"]);
      // Also invalidate project queries as team members might have changed
      queryClient.invalidateQueries(["projectDetails"]);
      queryClient.invalidateQueries(["companyProjects"]);
    },
  });
};

// SubTask Hooks
export const useCreateSubTask = (parentTaskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createSubTask"],
    mutationFn: (subTaskData) => createSubTask(subTaskData),
    onSuccess: () => {
      queryClient.invalidateQueries(["subTasksByParentTask", parentTaskId]);
      queryClient.invalidateQueries(["getTaskById", parentTaskId]);
    },
  });
};

export const useGetSubTasksByParentTask = (parentTaskId) => {
  return useQuery({
    queryKey: ["subTasksByParentTask", parentTaskId],
    queryFn: () => getSubTasksByParentTask(parentTaskId),
    select: (data) => data?.subTasks || [],
    enabled: !!parentTaskId,
  });
};

export const useGetSubTaskById = (subTaskId) => {
  return useQuery({
    queryKey: ["getSubTaskById", subTaskId],
    queryFn: () => getSubTaskById(subTaskId),
    select: (data) => data?.subTask,
    enabled: !!subTaskId,
  });
};

export const useUpdateSubTaskById = (subTaskId, parentTaskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateSubTaskById", subTaskId],
    mutationFn: (updateData) => updateSubTaskById(subTaskId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(["getSubTaskById", subTaskId]);
      queryClient.invalidateQueries(["subTasksByParentTask", parentTaskId]);
      queryClient.invalidateQueries(["getTaskById", parentTaskId]);
    },
  });
};

export const useDeleteSubTask = (parentTaskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteSubTask"],
    mutationFn: (subTaskId) => deleteSubTask(subTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries(["subTasksByParentTask", parentTaskId]);
      queryClient.invalidateQueries(["getTaskById", parentTaskId]);
    },
  });
};

export const useAddSubTaskAttachments = (subTaskId, parentTaskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addSubTaskAttachments", subTaskId],
    mutationFn: (attachments) => addSubTaskAttachments(subTaskId, attachments),
    onSuccess: () => {
      queryClient.invalidateQueries(["getSubTaskById", subTaskId]);
      queryClient.invalidateQueries(["subTasksByParentTask", parentTaskId]);
    },
  });
};

export const useRemoveSubTaskAttachment = (subTaskId, parentTaskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["removeSubTaskAttachment", subTaskId],
    mutationFn: (attachmentId) =>
      removeSubTaskAttachment(subTaskId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["getSubTaskById", subTaskId]);
      queryClient.invalidateQueries(["subTasksByParentTask", parentTaskId]);
    },
  });
};

// Notification Hooks
export const useGetNotifications = (limit = 10) => {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => {
      // Fallback data while API is being developed
      const mockNotifications = [
        {
          _id: "1",
          type: "task_assigned",
          title: "New Task Assigned",
          message:
            "You have been assigned to 'Review project requirements' in Mobile App Development",
          data: {
            taskId: "task_1",
            taskTitle: "Review project requirements",
            projectName: "Mobile App Development",
            assignedBy: {
              name: "John Smith",
              profileImage: "/image/photo.png",
            },
          },
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          _id: "2",
          type: "message",
          title: "New Message",
          message: "Emily Tyler sent you a message in Research project",
          data: {
            senderId: "emp_1",
            senderName: "Emily Tyler",
            senderImage: "/image/photo.png",
            conversationId: "conv_1",
            messagePreview:
              "Can we schedule a meeting to discuss the project timeline?",
          },
          read: false,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        },
        {
          _id: "3",
          type: "task_updated",
          title: "Task Status Updated",
          message: "Task 'Update documentation' has been marked as completed",
          data: {
            taskId: "task_2",
            taskTitle: "Update documentation",
            projectName: "Documentation Project",
            updatedBy: {
              name: "Sarah Wilson",
              profileImage: "/image/photo.png",
            },
            oldStatus: "in-progress",
            newStatus: "completed",
          },
          read: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        },
        {
          _id: "4",
          type: "deadline_reminder",
          title: "Deadline Reminder",
          message: "Task 'Fix login bug' is due in 2 hours",
          data: {
            taskId: "task_3",
            taskTitle: "Fix login bug",
            projectName: "Bug Fixes",
            dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          },
          read: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        },
        {
          _id: "5",
          type: "project_update",
          title: "Project Status Update",
          message: "Website Redesign project progress updated to 85%",
          data: {
            projectId: "proj_1",
            projectName: "Website Redesign",
            oldProgress: 80,
            newProgress: 85,
            updatedBy: {
              name: "Mike Johnson",
              profileImage: "/image/photo.png",
            },
          },
          read: true,
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 day ago
        },
        {
          _id: "6",
          type: "comment",
          title: "New Comment",
          message: "Alex Brown commented on your task 'Code review'",
          data: {
            taskId: "task_4",
            taskTitle: "Code review",
            projectName: "Sample Project",
            commentBy: {
              name: "Alex Brown",
              profileImage: "/image/photo.png",
            },
            commentPreview:
              "Great work on the implementation! Just a few minor suggestions...",
          },
          read: true,
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(), // 2 days ago
        },
      ];

      return getUserNotifications(limit).catch(() => ({
        notifications: mockNotifications.slice(0, limit),
        totalCount: mockNotifications.length,
        unreadCount: mockNotifications.filter((n) => !n.read).length,
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

export const useGetUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: () => {
      return getUnreadNotificationCount().catch(() => ({ count: 3 }));
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["markNotificationAsRead"],
    mutationFn: (notificationId) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["unreadNotificationCount"]);
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["markAllNotificationsAsRead"],
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["unreadNotificationCount"]);
    },
  });
};

////////////  STICKY NOTES HOOKS ⚠️⚠️⚠️⚠️⚠️ ////////////////////

// Get all sticky notes for the current user
export const useGetStickyNotes = (options = {}) => {
  return useQuery({
    queryKey: ["stickyNotes", options],
    queryFn: () => getUserStickyNotes(options),
    select: (data) => data?.stickyNotes || [],
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Create a new sticky note
export const useCreateStickyNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createStickyNote"],
    mutationFn: (noteData) => createStickyNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries(["stickyNotes"]);
    },
  });
};

// Get a specific sticky note by ID
export const useGetStickyNoteById = (noteId) => {
  return useQuery({
    queryKey: ["stickyNote", noteId],
    queryFn: () => getStickyNoteById(noteId),
    select: (data) => data?.stickyNote,
    enabled: !!noteId,
  });
};

// Update a sticky note
export const useUpdateStickyNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateStickyNote"],
    mutationFn: ({ noteId, updateData }) =>
      updateStickyNote(noteId, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["stickyNotes"]);
      queryClient.invalidateQueries(["stickyNote", variables.noteId]);
    },
  });
};

// Delete a sticky note
export const useDeleteStickyNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteStickyNote"],
    mutationFn: (noteId) => deleteStickyNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries(["stickyNotes"]);
    },
  });
};

// Update sticky note positions (for drag and drop)
export const useUpdateStickyNotePositions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateStickyNotePositions"],
    mutationFn: (noteIds) => updateStickyNotePositions(noteIds),
    onSuccess: () => {
      queryClient.invalidateQueries(["stickyNotes"]);
    },
  });
};

// Archive/Unarchive a sticky note
export const useToggleArchiveStickyNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["toggleArchiveStickyNote"],
    mutationFn: (noteId) => toggleArchiveStickyNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries(["stickyNotes"]);
      queryClient.invalidateQueries(["archivedStickyNotes"]);
    },
  });
};

// Set reminder for a sticky note
export const useSetStickyNoteReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["setStickyNoteReminder"],
    mutationFn: ({ noteId, reminderDate }) =>
      setStickyNoteReminder(noteId, reminderDate),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["stickyNotes"]);
      queryClient.invalidateQueries(["stickyNote", variables.noteId]);
      queryClient.invalidateQueries(["stickyNotesWithReminders"]);
    },
  });
};

// Clear reminder for a sticky note
export const useClearStickyNoteReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["clearStickyNoteReminder"],
    mutationFn: (noteId) => clearStickyNoteReminder(noteId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["stickyNotes"]);
      queryClient.invalidateQueries(["stickyNote", variables]);
      queryClient.invalidateQueries(["stickyNotesWithReminders"]);
    },
  });
};

// Get archived sticky notes
export const useGetArchivedStickyNotes = (options = {}) => {
  return useQuery({
    queryKey: ["archivedStickyNotes", options],
    queryFn: () => getArchivedStickyNotes(options),
    select: (data) => data?.stickyNotes || [],
  });
};

// Get sticky notes with active reminders
export const useGetStickyNotesWithReminders = () => {
  return useQuery({
    queryKey: ["stickyNotesWithReminders"],
    queryFn: () => getStickyNotesWithReminders(),
    select: (data) => data?.stickyNotes || [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

// Bulk delete sticky notes
export const useBulkDeleteStickyNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["bulkDeleteStickyNotes"],
    mutationFn: (noteIds) => bulkDeleteStickyNotes(noteIds),
    onSuccess: () => {
      queryClient.invalidateQueries(["stickyNotes"]);
    },
  });
};

////////////  ATTENDANCE HOOKS ⚠️⚠️⚠️⚠️⚠️ ////////////////////

// Clock in - Start attendance
export const useClockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["clockIn"],
    mutationFn: (attendanceData) => clockIn(attendanceData),
    retry: (failureCount, error) => {
      // Don't retry on 400 errors (client errors like "already clocked in")
      if (error?.response?.status === 400) {
        return false;
      }
      // Retry other errors up to 1 time
      return failureCount < 1;
    },
    retryDelay: 1000,
    onSuccess: () => {
      queryClient.invalidateQueries(["attendanceStatus"]);
      queryClient.invalidateQueries(["employeeAttendanceHistory"]);
      queryClient.invalidateQueries(["dailyAttendanceReport"]);
    },
  });
};

// Clock out - End attendance
export const useClockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["clockOut"],
    mutationFn: (clockOutData) => clockOut(clockOutData),
    retry: (failureCount, error) => {
      // Don't retry on 400 errors (client errors like "no active attendance")
      if (error?.response?.status === 400) {
        return false;
      }
      // Retry other errors up to 1 time
      return failureCount < 1;
    },
    retryDelay: 1000,
    onSuccess: () => {
      queryClient.invalidateQueries(["attendanceStatus"]);
      queryClient.invalidateQueries(["employeeAttendanceHistory"]);
      queryClient.invalidateQueries(["dailyAttendanceReport"]);
    },
  });
};

// Start break
export const useStartBreak = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["startBreak"],
    mutationFn: (breakData) => startBreak(breakData),
    retry: (failureCount, error) => {
      // Don't retry on 400 errors (client errors)
      if (error?.response?.status === 400) {
        return false;
      }
      // Retry other errors up to 1 time
      return failureCount < 1;
    },
    retryDelay: 1000,
    onSuccess: () => {
      queryClient.invalidateQueries(["attendanceStatus"]);
    },
  });
};

// End break
export const useEndBreak = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["endBreak"],
    mutationFn: () => endBreak(),
    retry: (failureCount, error) => {
      // Don't retry on 400 errors (client errors)
      if (error?.response?.status === 400) {
        return false;
      }
      // Retry other errors up to 1 time
      return failureCount < 1;
    },
    retryDelay: 1000,
    onSuccess: () => {
      queryClient.invalidateQueries(["attendanceStatus"]);
    },
  });
};

// Get current attendance status
export const useGetCurrentAttendanceStatus = () => {
  return useQuery({
    queryKey: ["attendanceStatus"],
    queryFn: () => getCurrentAttendanceStatus(),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus to prevent multiple calls on scroll
    refetchOnMount: false, // Only refetch if data is stale
  });
};

// Get employee attendance history
export const useGetEmployeeAttendanceHistory = (
  employeeId,
  queryParams = {}
) => {
  return useQuery({
    queryKey: ["employeeAttendanceHistory", employeeId, queryParams],
    queryFn: () => getEmployeeAttendanceHistory(employeeId, queryParams),
    enabled: !!employeeId,
    keepPreviousData: true,
  });
};

// Get daily attendance report (Admin only)
export const useGetDailyAttendanceReport = (date = null) => {
  return useQuery({
    queryKey: ["dailyAttendanceReport", date],
    queryFn: () => getDailyAttendanceReport(date),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

// Get attendance summary (Admin only)
export const useGetAttendanceSummary = (queryParams, enabled = true) => {
  return useQuery({
    queryKey: ["attendanceSummary", queryParams],
    queryFn: () => getAttendanceSummary(queryParams),
    enabled: enabled && !!queryParams?.startDate && !!queryParams?.endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get attendance analytics (Admin only)
export const useGetAttendanceAnalytics = (period = "month") => {
  return useQuery({
    queryKey: ["attendanceAnalytics", period],
    queryFn: () => getAttendanceAnalytics(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
  });
};

// Update attendance record (Admin only)
export const useUpdateAttendanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateAttendanceRecord"],
    mutationFn: ({ attendanceId, updateData }) =>
      updateAttendanceRecord(attendanceId, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["employeeAttendanceHistory"]);
      queryClient.invalidateQueries(["dailyAttendanceReport"]);
      queryClient.invalidateQueries(["attendanceSummary"]);
      queryClient.invalidateQueries(["attendanceAnalytics"]);

      // If this is today's attendance, also update current status
      const today = new Date().toDateString();
      const recordDate = new Date(data.attendance?.date).toDateString();
      if (today === recordDate) {
        queryClient.invalidateQueries(["attendanceStatus"]);
      }
    },
  });
};

// Approve/Reject attendance (Admin only)
export const useApproveAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["approveAttendance"],
    mutationFn: ({ attendanceId, approvalData }) =>
      approveAttendance(attendanceId, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries(["employeeAttendanceHistory"]);
      queryClient.invalidateQueries(["dailyAttendanceReport"]);
      queryClient.invalidateQueries(["attendanceSummary"]);
      queryClient.invalidateQueries(["attendanceAnalytics"]);
    },
  });
};

// Delete attendance record (Admin only)
export const useDeleteAttendanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteAttendanceRecord"],
    mutationFn: (attendanceId) => deleteAttendanceRecord(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries(["employeeAttendanceHistory"]);
      queryClient.invalidateQueries(["dailyAttendanceReport"]);
      queryClient.invalidateQueries(["attendanceSummary"]);
      queryClient.invalidateQueries(["attendanceAnalytics"]);
      queryClient.invalidateQueries(["attendanceStatus"]);
    },
  });
};

// Company-wide delete hooks
export const useDeleteAllCompanyTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteAllCompanyTasks"],
    mutationFn: () => deleteAllCompanyTasks(),
    onSuccess: () => {
      // Invalidate all task-related queries
      queryClient.invalidateQueries(["projectDetails"]);
      queryClient.invalidateQueries(["companyProjects"]);
      queryClient.invalidateQueries(["employeeTasks"]);
      queryClient.invalidateQueries(["employeeTasksToday"]);
      queryClient.invalidateQueries(["tasksDueInMonth"]);
      queryClient.invalidateQueries(["companyTasks"]);
    },
  });
};

export const useDeleteAllCompanyProjects = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteAllCompanyProjects"],
    mutationFn: () => deleteAllCompanyProjects(),
    onSuccess: () => {
      // Invalidate all project-related queries
      queryClient.invalidateQueries(["projectDetails"]);
      queryClient.invalidateQueries(["companyProjects"]);
      queryClient.invalidateQueries(["employeeProjects"]);
      queryClient.invalidateQueries(["projectAnalytics"]);
    },
  });
};

export const useDeleteAllCompanyEmployees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteAllCompanyEmployees"],
    mutationFn: () => deleteAllCompanyEmployees(),
    onSuccess: () => {
      // Invalidate all employee-related queries
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["employee"]);
      queryClient.invalidateQueries(["employeeProjects"]);
      queryClient.invalidateQueries(["employeeTeams"]);
      queryClient.invalidateQueries(["employeeVacations"]);
      queryClient.invalidateQueries(["employeeTasks"]);
      queryClient.invalidateQueries(["employeeTasksToday"]);
      queryClient.invalidateQueries(["employeeBirthdays"]);
      // Also invalidate project queries as team members might have changed
      queryClient.invalidateQueries(["projectDetails"]);
      queryClient.invalidateQueries(["companyProjects"]);
    },
  });
};

// Custom hook for managing attendance state
export const useAttendanceManager = () => {
  const { data: currentStatus, isLoading: statusLoading } =
    useGetCurrentAttendanceStatus();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const startBreakMutation = useStartBreak();
  const endBreakMutation = useEndBreak();

  // Use refs to prevent concurrent calls (faster than isPending check)
  const isClockInInProgress = useRef(false);
  const isClockOutInProgress = useRef(false);
  const isStartBreakInProgress = useRef(false);
  const isEndBreakInProgress = useRef(false);

  const isShiftActive =
    currentStatus?.attendance?.status === "checked-in" ||
    currentStatus?.attendance?.status === "break";

  const isOnBreak = currentStatus?.attendance?.status === "break";

  const shiftStartTime = currentStatus?.attendance?.clockInTime
    ? new Date(currentStatus.attendance.clockInTime)
    : null;

  const handleClockIn = async (locationData = {}, deviceInfo = {}) => {
    // Prevent multiple simultaneous calls using ref (immediate check)
    if (isClockInInProgress.current || clockInMutation.isPending) {
      console.log("Clock in already in progress, ignoring request");
      return { success: false, message: "Clock in already in progress" };
    }

    // Set flag immediately to prevent concurrent calls
    isClockInInProgress.current = true;

    try {
      const attendanceData = {
        location: locationData,
        deviceInfo: {
          browser: navigator.userAgent,
          device: "Web",
          ...deviceInfo,
        },
      };

      console.log("Executing clock in mutation with data:", attendanceData);
      const result = await clockInMutation.mutateAsync(attendanceData);
      console.log("Clock in mutation result:", result);
      return result;
    } catch (error) {
      console.error("Failed to clock in:", error);
      throw error;
    } finally {
      // Reset flag after completion (success or error)
      isClockInInProgress.current = false;
    }
  };

  const handleClockOut = async (locationData = {}, workDescription = "") => {
    // Prevent multiple simultaneous calls using ref (immediate check)
    if (isClockOutInProgress.current || clockOutMutation.isPending) {
      console.log("Clock out already in progress, ignoring request");
      return { success: false, message: "Clock out already in progress" };
    }

    // Set flag immediately to prevent concurrent calls
    isClockOutInProgress.current = true;

    try {
      const clockOutData = {
        location: locationData,
        workDescription,
      };

      console.log("Executing clock out mutation with data:", clockOutData);
      const result = await clockOutMutation.mutateAsync(clockOutData);
      console.log("Clock out mutation result:", result);
      return result;
    } catch (error) {
      console.error("Failed to clock out:", error);
      throw error;
    } finally {
      // Reset flag after completion (success or error)
      isClockOutInProgress.current = false;
    }
  };

  const handleStartBreak = async (reason = "") => {
    // Prevent multiple simultaneous calls using ref (immediate check)
    if (isStartBreakInProgress.current || startBreakMutation.isPending) {
      console.log("Start break already in progress, ignoring request");
      return { success: false, message: "Start break already in progress" };
    }

    // Set flag immediately to prevent concurrent calls
    isStartBreakInProgress.current = true;

    try {
      const result = await startBreakMutation.mutateAsync({ reason });
      return result;
    } catch (error) {
      console.error("Failed to start break:", error);
      throw error;
    } finally {
      // Reset flag after completion (success or error)
      isStartBreakInProgress.current = false;
    }
  };

  const handleEndBreak = async () => {
    // Prevent multiple simultaneous calls using ref (immediate check)
    if (isEndBreakInProgress.current || endBreakMutation.isPending) {
      console.log("End break already in progress, ignoring request");
      return { success: false, message: "End break already in progress" };
    }

    // Set flag immediately to prevent concurrent calls
    isEndBreakInProgress.current = true;

    try {
      const result = await endBreakMutation.mutateAsync();
      return result;
    } catch (error) {
      console.error("Failed to end break:", error);
      throw error;
    } finally {
      // Reset flag after completion (success or error)
      isEndBreakInProgress.current = false;
    }
  };

  return {
    // Status data
    currentStatus: currentStatus?.attendance,
    isShiftActive,
    isOnBreak,
    shiftStartTime,
    statusLoading,

    // Actions
    handleClockIn,
    handleClockOut,
    handleStartBreak,
    handleEndBreak,

    // Loading states
    isClockingIn: clockInMutation.isPending,
    isClockingOut: clockOutMutation.isPending,
    isStartingBreak: startBreakMutation.isPending,
    isEndingBreak: endBreakMutation.isPending,

    // Error states
    clockInError: clockInMutation.error,
    clockOutError: clockOutMutation.error,
    startBreakError: startBreakMutation.error,
    endBreakError: endBreakMutation.error,
  };
};

// Get project social media details
export const useGetProjectSocialMedia = (projectId) => {
  return useQuery({
    queryKey: ["projectSocialMedia", projectId],
    queryFn: () =>
      apiClient
        .get(`/projects/${projectId}/social-media`)
        .then((res) => res.data),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};
