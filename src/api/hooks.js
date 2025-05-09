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
} from "./service";
// Customers
export const useCustomers = () =>
  useQuery({
    queryKey: ["customers"],
    queryFn: () => apiClient.get("/customers").then((res) => res.data),
  });

export const useCompanyProjects = (companyId) => {
  return useQuery({
    queryKey: ["companyProjects", companyId],
    queryFn: () =>
      apiClient
        .get(`/projects/company/${companyId}`)
        .then((res) => res.data?.projects),

    enabled: !!companyId,
  });
};

export const useProjectDetails = (projectId) => {
  return useQuery({
    queryKey: ["projectDetails", projectId],
    queryFn: () =>
      apiClient.get(`/projects/${projectId}`).then((res) => res.data?.project),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 5 minutes (Prevents frequent refetches)
    cacheTime: 1000 * 60 * 10, // 10 minutes (Keeps it in cache)
    refetchOnWindowFocus: false, // Prevents automatic refetch when window gains focus
    refetchOnReconnect: false, // Prevents refetch when network reconnects
  });
};
//empoyee
export const useEmpoyees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () =>
      apiClient.get("/employee").then((res) => res.data?.employees),
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
    queryFn: () => apiClient.get(`/time-logs/task/${taskId}`).then((res) => res.data),
    enabled: !!taskId,
  });
};

export const useCreateTimeLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (timeLogData) => apiClient.post("/time-logs", timeLogData).then((res) => res.data),
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
