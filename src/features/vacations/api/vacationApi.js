import apiClient from "../../../api/client";

export const getEmployeeVacations = (employeeId, month, year) => {
  const queryParams = new URLSearchParams();
  if (month) queryParams.append("month", month);
  if (year) queryParams.append("year", year);

  return apiClient
    .get(`/vacations/employee/${employeeId}?${queryParams.toString()}`)
    .then((res) => res.data);
};

export const getCompanyVacations = (month, year) => {
  const queryParams = new URLSearchParams();
  if (month) queryParams.append("month", month);
  if (year) queryParams.append("year", year);

  return apiClient
    .get(`/vacations/company?${queryParams.toString()}`)
    .then((res) => res.data);
};

export const getVacationsCalendar = (month, year) => {
  return apiClient
    .get(`/vacations/calendar?month=${month}&year=${year}`)
    .then((res) => res.data);
};

export const updateVacationStatusApi = ({ vacationId, status, notes }) => {
  return apiClient
    .patch(`/vacations/${vacationId}/status`, { status, notes })
    .then((res) => res.data);
};

export const updateVacationRequestApi = ({ vacationId, data }) => {
  return apiClient.put(`/vacations/${vacationId}`, data).then((res) => res.data);
};

export const createVacationRequestApi = (data) => {
  return apiClient.post("/vacations", data).then((res) => res.data);
};
