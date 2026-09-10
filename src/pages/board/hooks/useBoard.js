import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateTaskFromBoard, useUpdateTaskOrder } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { updateTaskById, updateSubTaskById, uploadSingleFile } from "../../../api/service";
import socketService from "../../../services/socketService";
import { getCurrentMonthKey } from "../../../lib/dateUtils";
import { processAttachments, cleanTaskData } from "../../../lib/attachmentUtils";
import { statusConfig } from "../components/StatusConfig";
import {
    BOARD_QUERY_KEY,
    BOARD_META_KEY,
    useBoardMeta,
    getBoardColumnKey,
    getBoardMetaKey,
} from "./useBoardQueries";

const flattenColumnItems = (data) =>
    data?.pages?.flatMap((page) => page.items || []) || [];

const findTaskInBoardCache = (queryClient, filters, taskId) => {
    for (const status of Object.keys(statusConfig)) {
        const items = flattenColumnItems(
            queryClient.getQueryData(getBoardColumnKey(status, filters))
        );
        const task = items.find((item) => item._id === taskId);
        if (task) return { task, status };
    }
    return null;
};

const mapColumnPages = (oldData, mapper) => {
    if (!oldData?.pages) return oldData;
    return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
            ...page,
            items: mapper(page.items || [], page),
        })),
    };
};

export const useBoard = () => {
    const { user, companyId } = useAuth();
    const { hasPermission } = usePermissions();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [selectedProject, setSelectedProject] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
    const [selectedAssignee, setSelectedAssignee] = useState("all");
    const [selectedTypes, setSelectedTypes] = useState(["task", "subtask", "extra"]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [showModalTask, setShowModalTask] = useState(false);

    const canCreateTask = user?.role === "company-admin" || hasPermission("tasks", "create");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const boardFilters = useMemo(
        () => ({
            taskMonth: selectedMonth,
            project: selectedProject,
            assignee: selectedAssignee,
            priority: selectedPriority,
            types: [...selectedTypes].sort().join(","),
            search: debouncedSearch,
        }),
        [
            selectedMonth,
            selectedProject,
            selectedAssignee,
            selectedPriority,
            selectedTypes,
            debouncedSearch,
        ]
    );

    const columnsEnabled = !!companyId && !!selectedMonth;

    const { data: meta } = useBoardMeta(
        boardFilters,
        columnsEnabled
    );

    const { mutate: updateOrder } = useUpdateTaskOrder();
    const { mutateAsync: createTask, isPending: isCreatingTask } =
        useCreateTaskFromBoard((data) => {
            setShowModalTask(false);
            if (data?.data?.task?._id) {
                const t = data.data.task;
                if (t.project) {
                    navigate(`/projects/${t.project}/${t._id}`);
                } else {
                    navigate(`/tasks/${t._id}`);
                }
            }
        });

    useEffect(() => {
        const invalidateBoard = () => {
            queryClient.invalidateQueries({ queryKey: [BOARD_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [BOARD_META_KEY] });
        };

        const handleTaskStatusChange = (data) => {
            invalidateBoard();

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
                invalidateBoard();
            }
        };

        socketService.onTaskStatusChange(handleTaskStatusChange);
        socketService.onNewNotification(handleNewNotification);

        return () => {
            socketService.offTaskStatusChange(handleTaskStatusChange);
            socketService.offNewNotification(handleNewNotification);
        };
    }, [queryClient, user?._id]);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: [BOARD_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [BOARD_META_KEY] });
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

            await createTask(updatedValues);
            resetForm();
        } catch (error) {
            console.error("Error processing task data:", error);
            alert("Failed to process task data. Please try again.");
        }
    };

    const handleTaskUpdate = async (task, newStatus, newOrder = null) => {
        const updateData = { status: newStatus };
        if (newOrder !== null) updateData.order = newOrder;

        const isSubtask = !!task?.parentTask || task?.itemType === "subtask";
        if (isSubtask) await updateSubTaskById(task._id, updateData);
        else await updateTaskById(task._id, updateData);
    };

    const adjustMetaCount = (sourceStatus, targetStatus) => {
        if (sourceStatus === targetStatus) return;
        queryClient.setQueryData(getBoardMetaKey(boardFilters), (oldData) => {
            if (!oldData?.counts) return oldData;
            return {
                ...oldData,
                counts: {
                    ...oldData.counts,
                    [sourceStatus]: Math.max(0, (oldData.counts[sourceStatus] || 0) - 1),
                    [targetStatus]: (oldData.counts[targetStatus] || 0) + 1,
                },
            };
        });
    };

    const handleTaskDrop = async (taskData, targetStatus, targetPosition) => {
        const { taskId, sourceStatus, sourceIndex } = taskData;
        const found = findTaskInBoardCache(queryClient, boardFilters, taskId);
        const movedTask = found?.task;
        if (!movedTask) {
            handleRefresh();
            return;
        }

        const sourceKey = getBoardColumnKey(sourceStatus, boardFilters);
        const targetKey = getBoardColumnKey(targetStatus, boardFilters);

        if (sourceStatus === targetStatus) {
            queryClient.setQueryData(sourceKey, (oldData) => {
                if (!oldData?.pages) return oldData;
                const items = flattenColumnItems(oldData);
                const from = items.findIndex((item) => item._id === taskId);
                if (from < 0) return oldData;
                const reordered = [...items];
                const [task] = reordered.splice(from, 1);
                const adjustedPosition = targetPosition > sourceIndex ? targetPosition - 1 : targetPosition;
                reordered.splice(adjustedPosition, 0, task);

                let offset = 0;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        const nextItems = reordered.slice(offset, offset + page.items.length);
                        offset += page.items.length;
                        return { ...page, items: nextItems };
                    }),
                };
            });

            try {
                const targetItems = flattenColumnItems(
                    queryClient.getQueryData(sourceKey)
                );
                targetItems.forEach((task, index) => {
                    updateOrder({ taskId: task._id, newOrder: index });
                });
            } catch (error) {
                console.error("Failed to reorder task:", error);
                handleRefresh();
            }
            return;
        }

        queryClient.setQueryData(sourceKey, (oldData) =>
            mapColumnPages(oldData, (items) =>
                items.filter((item) => item._id !== taskId)
            )
        );
        queryClient.setQueryData(targetKey, (oldData) => {
            const updatedTask = { ...movedTask, status: targetStatus };
            if (!oldData?.pages?.length) {
                return {
                    pages: [{ items: [updatedTask], page: 1, hasMore: false }],
                    pageParams: [1],
                };
            }
            return {
                ...oldData,
                pages: oldData.pages.map((page, index) =>
                    index === 0
                        ? { ...page, items: [updatedTask, ...page.items] }
                        : page
                ),
            };
        });
        adjustMetaCount(sourceStatus, targetStatus);

        try {
            await handleTaskUpdate(movedTask, targetStatus, targetPosition);
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
        boardFilters,
        columnsEnabled,
        counts: meta?.counts || {},
        projects: meta?.projects || [],
        assignees: meta?.assignees || [],
        isCreatingTask,
        handleRefresh,
        handleAddTask,
        handleTaskDrop,
    };
};
