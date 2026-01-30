import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    useGetEmployeeTasks,
    useGetAllCompanyTasks,
    useCreateTaskFromBoard,
    useUpdateTaskOrder,
    useGetEmployeeProjects,
    useCompanyProjects,
} from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { updateTaskById, updateSubTaskById, uploadSingleFile } from "../../../api/service";
import socketService from "../../../services/socketService";
import { getCurrentMonthKey } from "../../../lib/dateUtils";
import { processAttachments, cleanTaskData } from "../../../lib/attachmentUtils";
import { statusConfig } from "../components/StatusConfig";

export const useBoard = () => {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const queryClient = useQueryClient();

    // Filter States
    const [selectedProject, setSelectedProject] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
    const [selectedAssignee, setSelectedAssignee] = useState("all");
    const [selectedTypes, setSelectedTypes] = useState(["task", "subtask", "extra"]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModalTask, setShowModalTask] = useState(false);

    // Permission check for creating tasks
    const canCreateTask = user?.role === "company-admin" || hasPermission("tasks", "create");

    // Data Fetching
    const { data: employeeTasksData, isLoading: isLoadingEmployeeTasks } =
        useGetEmployeeTasks(user?.role !== "company-admin" ? user?._id : null, { taskMonth: selectedMonth });

    const { data: companyTasksData, isLoading: isLoadingCompanyTasks } =
        useGetAllCompanyTasks(
            user?.role === "company-admin" ? user?.company : null,
            selectedMonth
        );

    const { data: projectsData } =
        user?.role === "company-admin"
            ? useCompanyProjects(user?.company)
            : useGetEmployeeProjects(user?._id);

    const { mutate: updateOrder } = useUpdateTaskOrder();
    const { mutate: createTask, isLoading: isCreatingTask } =
        useCreateTaskFromBoard(() => {
            setShowModalTask(false);
        });

    // Get tasks based on user role
    const tasks = useMemo(() => {
        return user?.role === "company-admin"
            ? companyTasksData?.tasks || []
            : [
                ...(employeeTasksData?.tasks || []),
                ...(employeeTasksData?.subTasks || []),
            ];
    }, [user?.role, companyTasksData, employeeTasksData]);

    // Real-time Updates
    useEffect(() => {
        const handleTaskStatusChange = (data) => {
            if (user?.role === "company-admin") {
                queryClient.invalidateQueries(["allCompanyTasks", user?.company, selectedMonth]);
            } else {
                queryClient.invalidateQueries(["employeeTasks", user?._id]);
            }

            if (data.newStatus === "on-review" || data.oldStatus === "on-review") {
                queryClient.invalidateQueries(["tasksOnReview"]);
            }

            if (data.updatedBy && data.updatedBy._id !== user?._id) {
                const notification = document.createElement("div");
                notification.className = "fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full";
                notification.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div>
              <div class="font-medium">Task Status Updated</div>
              <div class="text-sm opacity-90">"${data.taskTitle}" moved to ${data.newStatus} by ${data.updatedBy.name}</div>
            </div>
          </div>
        `;
                document.body.appendChild(notification);
                setTimeout(() => notification.classList.remove("translate-x-full"), 100);
                setTimeout(() => {
                    notification.classList.add("translate-x-full");
                    setTimeout(() => document.body.removeChild(notification), 300);
                }, 5000);
            }
        };

        const handleNewNotification = (data) => {
            if (data.type === "task_review" || data.type === "task_updated") {
                if (user?.role === "company-admin") {
                    queryClient.invalidateQueries(["allCompanyTasks", user?.company, selectedMonth]);
                } else {
                    queryClient.invalidateQueries(["employeeTasks", user?._id]);
                }
            }
        };

        socketService.onTaskStatusChange(handleTaskStatusChange);
        socketService.onNewNotification(handleNewNotification);

        return () => {
            socketService.offTaskStatusChange(handleTaskStatusChange);
            socketService.offNewNotification(handleNewNotification);
        };
    }, [queryClient, user?.role, user?.company, user?._id, selectedMonth]);

    const projects = user?.role === "company-admin" ? projectsData || [] : projectsData?.projects || [];

    const assignees = useMemo(() => {
        const users = {};
        tasks.forEach((task) => {
            (task.assignedTo || []).forEach((u) => {
                if (u && u._id) users[u._id] = u;
            });
        });
        return Object.values(users);
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const isActive = task.active !== false;

            let projectMatch = false;
            if (selectedProject === "all") projectMatch = true;
            else if (selectedProject === "other") projectMatch = !task.project;
            else projectMatch = task.project?._id === selectedProject;

            const priorityMatch = selectedPriority === "all" || task.priority?.toLowerCase() === selectedPriority.toLowerCase();
            const monthMatch = !task.taskMonth || task.taskMonth === selectedMonth;
            const assigneeMatch = selectedAssignee === "all" || (task.assignedTo && task.assignedTo.some((u) => u._id === selectedAssignee));

            const isSubtask = !!task.parentTask;
            const isExtraTask = task.taskGroup === "extraTask";
            const isRegularTask = !isSubtask && !isExtraTask;

            const typeMatch =
                (selectedTypes.includes("task") && isRegularTask) ||
                (selectedTypes.includes("subtask") && isSubtask) ||
                (selectedTypes.includes("extra") && isExtraTask);

            const searchMatch = !searchQuery ||
                task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());

            return isActive && projectMatch && priorityMatch && monthMatch && assigneeMatch && typeMatch && searchMatch;
        });
    }, [tasks, selectedProject, selectedPriority, selectedMonth, selectedAssignee, selectedTypes, searchQuery]);

    // Handlers
    const handleRefresh = () => {
        if (user?.role === "company-admin") {
            queryClient.invalidateQueries(["allCompanyTasks", user?.company, selectedMonth]);
        } else {
            queryClient.invalidateQueries(["employeeTasks", user?._id]);
        }
    };

    const handleAddTask = async (values, { resetForm }) => {
        try {
            const updatedValues = cleanTaskData(values);
            updatedValues.creator = user?._id;

            if (values?.attachments?.length > 0) {
                updatedValues.attachments = await processAttachments(values.attachments, uploadSingleFile);
            }

            if (values.project === "other" || !values.project) {
                updatedValues.project = null;
                delete updatedValues.taskGroup;
                delete updatedValues.extraTaskWorkType;
                delete updatedValues.taskFlow;
            }

            createTask(updatedValues, {
                onSuccess: () => resetForm(),
                onError: (error) => {
                    console.error("Failed to create task:", error);
                    alert("Failed to create task. Please try again.");
                },
            });
        } catch (error) {
            console.error("Error processing task data:", error);
            alert("Failed to process task data. Please try again.");
        }
    };

    const tasksByStatus = useMemo(() => {
        const grouped = {};
        Object.keys(statusConfig).forEach((status) => {
            grouped[status] = filteredTasks.filter((task) => task.status === status);
        });
        return grouped;
    }, [filteredTasks]);

    const handleTaskUpdate = async (taskId, newStatus, newOrder = null) => {
        try {
            const task = tasks.find((t) => t._id === taskId);
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
        const queryKey = user?.role === "company-admin"
            ? ["allCompanyTasks", user?.company, selectedMonth]
            : ["employeeTasks", user?._id];

        queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData) return oldData;
            const updateTaskStatus = (task) => task._id === taskId ? { ...task, status: targetStatus } : task;
            return {
                ...oldData,
                tasks: (oldData.tasks || []).map(updateTaskStatus),
                subTasks: (oldData.subTasks || []).map(updateTaskStatus),
            };
        });

        try {
            if (sourceStatus === targetStatus) {
                const targetTasks = tasksByStatus[targetStatus];
                const reorderedTasks = [...targetTasks];
                const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
                const adjustedPosition = targetPosition > sourceIndex ? targetPosition - 1 : targetPosition;
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

    return {
        user,
        selectedProject,
        setSelectedProject,
        selectedPriority,
        setSelectedPriority,
        selectedMonth,
        setSelectedMonth,
        selectedAssignee,
        setSelectedAssignee,
        selectedTypes,
        setSelectedTypes,
        searchQuery,
        setSearchQuery,
        showModalTask,
        setShowModalTask,
        canCreateTask,
        isLoading: isLoadingEmployeeTasks || isLoadingCompanyTasks,
        tasksByStatus,
        projects,
        assignees,
        isCreatingTask,
        handleRefresh,
        handleAddTask,
        handleTaskDrop,
    };
};
