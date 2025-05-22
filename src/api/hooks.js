// src/api/hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import {
  addProject,
  createEmployee,
  createTask,
  getTaskById,
  updatedProfile,
  updateProject,
  updateTaskById,
  updateTaskOrder,
  deleteProject,
} from "./service";
import { format } from "date-fns";

// Customers
export const useCustomers = () =>
  useQuery({
    queryKey: ["customers"],
    queryFn: () => apiClient.get("/customers").then((res) => res.data),
  });

export const useCompanyProjects = (companyId, limit = 0) => {
  return useQuery({
    queryKey: ["companyProjects", companyId, limit],
    queryFn: () =>
      apiClient
        .get(
          `/projects/company/${companyId}${
            limit ? `?limit=${limit}` : ""
          }?active=true`
        )
        .then((res) => res.data?.projects),
    enabled: !!companyId,
  });
};

export const useProjectDetails = (projectId) => {
  return useQuery({
    queryKey: ["projectDetails", projectId],
    queryFn: () =>
      apiClient
        .get(`/projects/${projectId}?active=true`)
        .then((res) => res.data?.project),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 5 minutes (Prevents frequent refetches)
    cacheTime: 1000 * 60 * 10, // 10 minutes (Keeps it in cache)
    refetchOnWindowFocus: false, // Prevents automatic refetch when window gains focus
    refetchOnReconnect: false, // Prevents refetch when network reconnects
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
// task

export const useCreateTask = (handleClose, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createTask"],
    mutationFn: (taskData) => createTask(taskData, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectDetails", projectId],
      });
      handleClose();
      // toast.success('Target set successfully!');
    },
  });
};

export const useUpdateProfile = (handleSuccess) => {
  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: (updatedData) => updatedProfile(updatedData),
    onSuccess: () => handleSuccess(),
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
export const useAddProject = () =>
  useMutation({
    mutationKey: ["addProject"],
    mutationFn: (projectDetails) => addProject(projectDetails),
  });

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

export const useGetEmployeeProjects = (employeeId) => {
  return useQuery({
    queryKey: ["employeeProjects", employeeId],
    queryFn: () =>
      apiClient
        .get(`/projects/employee/${employeeId}?active=true`)
        .then((res) => res.data),
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
        .then((res) => res.data),
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
