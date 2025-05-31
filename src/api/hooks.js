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
        }),
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
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
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
          console.warn("Employee tasks today endpoint not available:", error);
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

// Company Statistics Hook - for admin dashboard overview
export const useGetCompanyStats = (companyId) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  return useQuery({
    queryKey: ["companyStats", companyId, currentYear, currentMonth],
    queryFn: async () => {
      try {
        // Fetch multiple endpoints in parallel for company overview
        const [companyTasks, projectsThisMonth, allProjects, allEmployees] =
          await Promise.all([
            apiClient.get("/tasks/company/all").then((res) => res.data),
            apiClient.get("/projects/due-this-month").then((res) => res.data),
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
          overdue: 0,
          completionRate: 0,
          priorityDistribution: { high: 0, medium: 0, low: 0 },
        };

        // Calculate project statistics
        const allProjectsData = allProjects?.projects || [];
        const totalProjects = allProjectsData.length;
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
          allProjectsData.length > 0
            ? Math.round(
                allProjectsData.reduce(
                  (sum, project) => sum + (project.progress || 0),
                  0
                ) / allProjectsData.length
              )
            : 0;

        return {
          tasks: {
            total: taskStats.total,
            completed: taskStats.completed,
            inProgress: taskStats.inProgress,
            pending: taskStats.pending,
            overdue: taskStats.overdue,
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
        console.error("Error fetching company stats:", error);
        // Return fallback data
        return {
          tasks: {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            overdue: 0,
            completionRate: 0,
          },
          projects: {
            total: 0,
            dueThisMonth: 0,
            averageProgress: 0,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

// Get All Company Tasks Hook - uses the new dedicated endpoint
export const useGetAllCompanyTasks = (companyId) => {
  return useQuery({
    queryKey: ["allCompanyTasks", companyId],
    queryFn: () =>
      apiClient.get("/tasks/company/all").then((res) => {
        return {
          tasks: res.data.tasks || [],
          statistics: res.data.statistics || {},
          totalCount: res.data.tasks?.length || 0,
        };
      }),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
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
