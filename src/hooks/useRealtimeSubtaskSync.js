import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import socketService from "../services/socketService";
import { extractEntityId } from "../services/realtimeNotificationHandler";

/**
 * Refetch this task's subtask list when any of its subtasks change over the socket.
 * Used on the task details page so reviewer actions (Approve / Rework) appear
 * immediately when someone submits for review.
 */
export const useRealtimeSubtaskSync = (parentTaskId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const parentId = extractEntityId(parentTaskId);
    if (!parentId) return;

    const onChange = (data) => {
      if (!data) return;
      const isSubtask = Boolean(data.isSubtask || data.subTaskId);
      if (!isSubtask) return;

      const eventParent = extractEntityId(data.parentTaskId);
      const subTaskId = extractEntityId(data.subTaskId || data.taskId);

      if (eventParent && eventParent !== parentId) return;

      if (!eventParent && subTaskId) {
        const cached =
          queryClient.getQueryData(["subTasksByParentTask", parentTaskId]) ||
          queryClient.getQueryData(["subTasksByParentTask", parentId]);
        const list = Array.isArray(cached) ? cached : cached?.subTasks;
        const inList =
          Array.isArray(list) &&
          list.some((st) => extractEntityId(st._id) === subTaskId);
        if (list && !inList) return;
      }

      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "subTasksByParentTask" &&
          extractEntityId(query.queryKey[1]) === parentId,
        refetchType: "active",
      });
    };

    socketService.onTaskStatusChange(onChange);
    return () => socketService.offTaskStatusChange(onChange);
  }, [parentTaskId, queryClient]);
};
