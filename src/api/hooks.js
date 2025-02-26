// src/api/hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import {
  createTask,
  getTaskById,
  updatedProfile,
  updateProject,
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
      apiClient.get("/employee").then((res) => res.data?.employess),
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

export const useGetTaskById = (taskId) => {
  return useQuery({
    queryKey: ["getTaskById", taskId],
    queryFn: () => getTaskById(taskId),
    select: (data) => data?.tasks,
  });
};
