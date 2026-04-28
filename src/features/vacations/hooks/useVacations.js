import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployeeVacations,
  getCompanyVacations,
  getVacationsCalendar,
  updateVacationStatusApi,
  updateVacationRequestApi,
  createVacationRequestApi,
  checkAvailabilityApi,
} from "../api/vacationApi";

export const useGetEmployeeVacations = (employeeId, month, year) => {
  return useQuery({
    queryKey: ["employeeVacations", employeeId, month, year],
    queryFn: () => getEmployeeVacations(employeeId, month, year),
    enabled: !!employeeId,
  });
};

export const useGetCompanyVacations = (month, year) => {
  return useQuery({
    queryKey: ["companyVacations", month, year],
    queryFn: () => getCompanyVacations(month, year),
  });
};

export const useGetVacationsCalendar = (month, year) => {
  return useQuery({
    queryKey: ["vacationsCalendar", month, year],
    queryFn: () => getVacationsCalendar(month, year),
    enabled: !!month && !!year,
  });
};

export const useUpdateVacationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVacationStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      queryClient.invalidateQueries({ queryKey: ["myVacations"] });
      queryClient.invalidateQueries({ queryKey: ["vacationsCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["companyVacations"] });
      queryClient.invalidateQueries({ queryKey: ["employeeVacations"] });
    },
  });
};

export const useUpdateVacationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVacationRequestApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      queryClient.invalidateQueries({ queryKey: ["myVacations"] });
      queryClient.invalidateQueries({ queryKey: ["vacationsCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["companyVacations"] });
      queryClient.invalidateQueries({ queryKey: ["employeeVacations"] });
    },
  });
};

export const useCreateVacationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVacationRequestApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacations"] });
      queryClient.invalidateQueries({ queryKey: ["myVacations"] });
      queryClient.invalidateQueries({ queryKey: ["vacationsCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["companyVacations"] });
      queryClient.invalidateQueries({ queryKey: ["employeeVacations"] });
    },
  });
};

export const useCheckAvailability = () => {
  return useMutation({
    mutationFn: (checks) => checkAvailabilityApi(checks),
  });
};
