import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/client";
import { format } from "date-fns";

// New consolidated calendar data hook
export const useGetCalendarData = (date = new Date()) => {
  // Ensure date is a proper Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // JavaScript months are 0-indexed

  return useQuery({
    queryKey: ["calendarData", format(dateObj, "yyyy-MM")],
    queryFn: () =>
      apiClient.get(`/calendar/data/${year}/${month}`).then((res) => res.data),
  });
};

export const useGetEmployeeBirthdays = (date = new Date()) => {
  // Ensure date is a proper Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // JavaScript months are 0-indexed

  return useQuery({
    queryKey: ["employeeBirthdays", format(dateObj, "yyyy-MM")],
    queryFn: () =>
      apiClient
        .get(`/employee/birthdays/${year}/${month}`)
        .then((res) => res.data),
  });
};

export const useGetTasksDueThisMonth = (date = new Date()) => {
  // Ensure date is a proper Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // JavaScript months are 0-indexed

  return useQuery({
    queryKey: ["tasksDueThisMonth", format(dateObj, "yyyy-MM")],
    queryFn: () =>
      apiClient.get(`/tasks/month/${year}/${month}`).then((res) => res.data),
  });
};

export const useGetProjectsDueThisMonth = (date = new Date()) => {
  // Ensure date is a proper Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  return useQuery({
    queryKey: ["projectsDueThisMonth", format(dateObj, "yyyy-MM")],
    queryFn: () =>
      apiClient
        .get(
          `/projects/due-this-month?date=${format(
            dateObj,
            "yyyy-MM-dd"
          )}&active=true`
        )
        .then((res) => res.data),
  });
};
