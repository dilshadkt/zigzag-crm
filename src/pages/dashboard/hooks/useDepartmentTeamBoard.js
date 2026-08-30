import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  useGetDepartmentDashboard,
  useCreateTaskFromBoard,
  useUpdateTaskOrder,
  useCompanyProjects,
} from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import apiClient from "../../../api/client";
import { updateTaskById, updateSubTaskById, uploadSingleFile } from "../../../api/service";
import { getCurrentMonthKey } from "../../../lib/dateUtils";
import { processAttachments, cleanTaskData } from "../../../lib/attachmentUtils";
import { statusConfig } from "../../board/components/StatusConfig";

const fetchEmployeeTasks = async (employeeId, taskMonth) => {
  const params = new URLSearchParams();
  if (taskMonth) params.append("taskMonth", taskMonth);
  const response = await apiClient.get(
    `/tasks/employee/${employeeId}?${params.toString()}`
  );
  return response.data;
};

const fetchEmployeeTodayTasks = async (employeeId) => {
  const response = await apiClient.get(`/tasks/employee/${employeeId}/today`);
  return response.data;
};

const flattenTodayTasks = (data) => {
  if (!data) return [];
  return [
    ...(data.tasks || []),
    ...(data.subTasks || []),
    ...(data.completedTasks || []),
    ...(data.completedSubTasks || []),
  ];
};

export const useDepartmentTeamBoard = () => {
  const { user, companyId } = useAuth();
  const effectiveCompanyId = companyId || user?.company;
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useGetDepartmentDashboard(effectiveCompanyId);

  const departments = dashboardData?.departments || [];
  const isDepartmentHead = !!dashboardData?.isDepartmentHead;

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    searchParams.get("department") || ""
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    searchParams.get("employee") || "all"
  );
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "today");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [selectedTypes, setSelectedTypes] = useState(["task", "subtask", "extra"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModalTask, setShowModalTask] = useState(false);

  const activeDepartmentId = useMemo(() => {
    if (
      selectedDepartmentId &&
      departments.some((dept) => dept._id === selectedDepartmentId)
    ) {
      return selectedDepartmentId;
    }
    return departments[0]?._id || "";
  }, [departments, selectedDepartmentId]);

  const activeDepartment = departments.find(
    (dept) => dept._id === activeDepartmentId
  );

  const teamEmployees = activeDepartment?.employees || [];

  const targetEmployeeIds = useMemo(() => {
    if (selectedEmployeeId && selectedEmployeeId !== "all") {
      return teamEmployees.some((emp) => emp._id === selectedEmployeeId)
        ? [selectedEmployeeId]
        : [];
    }
    return teamEmployees.map((emp) => emp._id);
  }, [selectedEmployeeId, teamEmployees]);

  useEffect(() => {
    if (!teamEmployees.length) return;

    if (
      selectedEmployeeId !== "all" &&
      !teamEmployees.some((emp) => emp._id === selectedEmployeeId)
    ) {
      setSelectedEmployeeId("all");
    }
  }, [teamEmployees, selectedEmployeeId]);

  useEffect(() => {
    const params = {};
    if (activeDepartmentId) params.department = activeDepartmentId;
    if (selectedEmployeeId && selectedEmployeeId !== "all") {
      params.employee = selectedEmployeeId;
    }
    if (viewMode !== "today") params.view = viewMode;
    setSearchParams(params, { replace: true });
  }, [activeDepartmentId, selectedEmployeeId, viewMode, setSearchParams]);

  const monthQueries = useQueries({
    queries: targetEmployeeIds.map((employeeId) => ({
      queryKey: ["employeeTasks", employeeId, { taskMonth: selectedMonth }],
      queryFn: () => fetchEmployeeTasks(employeeId, selectedMonth),
      enabled: viewMode === "month" && !!employeeId,
    })),
  });

  const todayQueries = useQueries({
    queries: targetEmployeeIds.map((employeeId) => ({
      queryKey: ["employeeTasksToday", employeeId],
      queryFn: () => fetchEmployeeTodayTasks(employeeId),
      enabled: viewMode === "today" && !!employeeId,
    })),
  });

  const activeQueries = viewMode === "today" ? todayQueries : monthQueries;

  const isLoadingTasks =
    isDashboardLoading ||
    (targetEmployeeIds.length > 0 &&
      activeQueries.some((query) => query.isLoading));

  const tasks = useMemo(() => {
    if (viewMode === "today") {
      return todayQueries.flatMap((query) => flattenTodayTasks(query.data));
    }

    return monthQueries.flatMap((query) => [
      ...(query.data?.tasks || []),
      ...(query.data?.subTasks || []),
    ]);
  }, [viewMode, todayQueries, monthQueries]);

  const { data: projectsData } = useCompanyProjects(
    isDepartmentHead || user?.role === "company-admin" ? effectiveCompanyId : null
  );

  const projects = projectsData || [];

  const canCreateTask =
    user?.role === "company-admin" ||
    hasPermission("tasks", "create") ||
    isDepartmentHead;

  const teams = useMemo(
    () =>
      teamEmployees.map((employee) => ({
        _id: employee._id,
        firstName: employee.name?.split(" ")[0] || employee.name,
        lastName: employee.name?.split(" ").slice(1).join(" ") || "",
        name: employee.name,
        profileImage: employee.profile,
        email: employee.email,
      })),
    [teamEmployees]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const isActive = task.active !== false;

      let projectMatch = false;
      if (selectedProject === "all") projectMatch = true;
      else if (selectedProject === "other") projectMatch = !task.project;
      else {
        projectMatch =
          task.project?._id === selectedProject ||
          task.project === selectedProject;
      }

      const priorityMatch =
        selectedPriority === "all" ||
        task.priority?.toLowerCase() === selectedPriority.toLowerCase();

      const monthMatch =
        viewMode === "today" ||
        !task.taskMonth ||
        task.taskMonth === selectedMonth;

      const isSubtask = !!task.parentTask;
      const isExtraTask = task.taskGroup === "extraTask";
      const isRegularTask = !isSubtask && !isExtraTask;

      const typeMatch =
        (selectedTypes.includes("task") && isRegularTask) ||
        (selectedTypes.includes("subtask") && isSubtask) ||
        (selectedTypes.includes("extra") && isExtraTask);

      const searchMatch =
        !searchQuery ||
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        isActive &&
        projectMatch &&
        priorityMatch &&
        monthMatch &&
        typeMatch &&
        searchMatch
      );
    });
  }, [
    tasks,
    selectedProject,
    selectedPriority,
    selectedMonth,
    selectedTypes,
    searchQuery,
    viewMode,
  ]);

  const tasksByStatus = useMemo(() => {
    const grouped = {};
    Object.keys(statusConfig).forEach((status) => {
      grouped[status] = filteredTasks.filter((task) => {
        const taskStatus = task.status === "pending" ? "todo" : task.status;
        return taskStatus === status;
      });
    });
    return grouped;
  }, [filteredTasks]);

  const invalidateTeamTasks = () => {
    targetEmployeeIds.forEach((employeeId) => {
      queryClient.invalidateQueries({ queryKey: ["employeeTasks", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employeeTasksToday", employeeId] });
    });
    queryClient.invalidateQueries({ queryKey: ["departmentDashboard", effectiveCompanyId] });
  };

  const { mutateAsync: createTask, isPending: isCreatingTask } =
    useCreateTaskFromBoard((data) => {
      setShowModalTask(false);
      invalidateTeamTasks();
      if (data?.data?.task?._id) {
        const task = data.data.task;
        if (task.project) {
          navigate(`/projects/${task.project}/${task._id}`);
        } else {
          navigate(`/tasks/${task._id}`);
        }
      }
    });

  const { mutate: updateOrder } = useUpdateTaskOrder();

  const handleRefresh = () => {
    invalidateTeamTasks();
  };

  const handleAddTask = async (values, { resetForm }) => {
    try {
      const updatedValues = cleanTaskData(values);
      updatedValues.creator = user?._id;

      if (
        selectedEmployeeId &&
        selectedEmployeeId !== "all" &&
        !updatedValues.assignedTo?.length
      ) {
        updatedValues.assignedTo = [selectedEmployeeId];
      }

      if (values?.attachments?.length > 0) {
        updatedValues.attachments = await processAttachments(
          values.attachments,
          uploadSingleFile
        );
      }

      if (values.project === "other" || !values.project) {
        updatedValues.project = null;
        delete updatedValues.taskGroup;
        delete updatedValues.extraTaskWorkType;
        delete updatedValues.taskFlow;
      }

      await createTask(updatedValues);
      resetForm();
    } catch (error) {
      console.error("Error processing task data:", error);
      alert("Failed to process task data. Please try again.");
    }
  };

  const handleTaskUpdate = async (taskId, newStatus, newOrder = null) => {
    try {
      const task = tasks.find((item) => item._id === taskId);
      const updateData = { status: newStatus };
      if (newOrder !== null) updateData.order = newOrder;

      if (task?.parentTask) await updateSubTaskById(taskId, updateData);
      else await updateTaskById(taskId, updateData);

      handleRefresh();
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const handleTaskDrop = async (taskData, targetStatus, targetPosition) => {
    const { taskId, sourceStatus, sourceIndex } = taskData;

    try {
      if (sourceStatus === targetStatus) {
        const targetTasks = tasksByStatus[targetStatus];
        const reorderedTasks = [...targetTasks];
        const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
        const adjustedPosition =
          targetPosition > sourceIndex ? targetPosition - 1 : targetPosition;
        reorderedTasks.splice(adjustedPosition, 0, movedTask);

        reorderedTasks.forEach((task, index) => {
          updateOrder({ taskId: task._id, newOrder: index });
        });
      } else {
        await handleTaskUpdate(taskId, targetStatus, targetPosition);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      handleRefresh();
      alert("Failed to update task. Please try again.");
    }
  };

  const addTaskInitialValues = useMemo(() => {
    if (selectedEmployeeId && selectedEmployeeId !== "all") {
      return { assignedTo: [selectedEmployeeId] };
    }
    return {};
  }, [selectedEmployeeId]);

  return {
    user,
    departments,
    activeDepartment,
    activeDepartmentId,
    setSelectedDepartmentId,
    teamEmployees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    viewMode,
    setViewMode,
    selectedProject,
    setSelectedProject,
    selectedPriority,
    setSelectedPriority,
    selectedMonth,
    setSelectedMonth,
    selectedTypes,
    setSelectedTypes,
    searchQuery,
    setSearchQuery,
    showModalTask,
    setShowModalTask,
    canCreateTask,
    isLoading: isLoadingTasks,
    tasksByStatus,
    projects,
    teams,
    isCreatingTask,
    handleRefresh,
    handleAddTask,
    handleTaskDrop,
    addTaskInitialValues,
    isDepartmentHead,
  };
};
