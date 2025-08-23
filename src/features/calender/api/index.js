import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/client";
import { format } from "date-fns";

// New consolidated calendar data hook
export const useGetCalendarData = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed

  return useQuery({
    queryKey: ["calendarData", format(date, "yyyy-MM")],
    queryFn: () =>
      apiClient.get(`/calendar/data/${year}/${month}`).then((res) => res.data),
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

export const useGetTasksDueThisMonth = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed

  return useQuery({
    queryKey: ["tasksDueThisMonth", format(date, "yyyy-MM")],
    queryFn: () =>
      apiClient.get(`/tasks/month/${year}/${month}`).then((res) => res.data),
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
