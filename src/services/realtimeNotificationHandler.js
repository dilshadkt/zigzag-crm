let audioContext = null;

export const unlockNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext) {
      audioContext = new AudioCtx();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
  } catch {
    // Ignore
  }
};

export const playNotificationSound = () => {
  try {
    unlockNotificationSound();
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.25);
  } catch {
    // Ignore audio playback errors
  }
};

export const extractEntityId = (value) => {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (value._id) return extractEntityId(value._id);
    if (value.$oid) return String(value.$oid);
    if (typeof value.toHexString === "function") return value.toHexString();
  }
  const asString = String(value);
  return asString === "[object Object]" ? "" : asString;
};

const patchSubtaskInList = (list, data) => {
  if (!Array.isArray(list)) return list;
  const subTaskId = extractEntityId(data.subTaskId || data.taskId);
  if (!subTaskId) return list;

  return list.map((st) => {
    if (extractEntityId(st._id) !== subTaskId) return st;
    return {
      ...st,
      status: data.newStatus ?? st.status,
      lastStartedAt:
        data.lastStartedAt !== undefined ? data.lastStartedAt : st.lastStartedAt,
      completedAt:
        data.completedAt !== undefined ? data.completedAt : st.completedAt,
      totalActualTime:
        data.totalActualTime !== undefined
          ? data.totalActualTime
          : st.totalActualTime,
    };
  });
};

const patchCachedSubtasks = (old, data) => {
  if (!old) return old;
  if (Array.isArray(old)) return patchSubtaskInList(old, data);
  if (old.subTasks) {
    return { ...old, subTasks: patchSubtaskInList(old.subTasks, data) };
  }
  if (old.task?.subTasks) {
    return {
      ...old,
      task: {
        ...old.task,
        subTasks: patchSubtaskInList(old.task.subTasks, data),
      },
    };
  }
  return old;
};

const queryKeyMatchesId = (queryKey, prefix, entityId) =>
  Array.isArray(queryKey) &&
  queryKey[0] === prefix &&
  extractEntityId(queryKey[1]) === entityId;

/**
 * Action alerts query the DB directly, so they can show a review before the
 * task-details React Query cache has caught up. Patch/refetch that cache.
 */
export const syncSubtaskReviewFromNudge = (queryClient, { taskId, subTaskId }) => {
  if (!queryClient) return;

  const parentTaskId = extractEntityId(taskId);
  const id = extractEntityId(subTaskId);
  const data = {
    isSubtask: Boolean(id),
    subTaskId: id,
    parentTaskId,
    taskId: parentTaskId,
    newStatus: "on-review",
  };

  if (id) {
    queryClient.setQueriesData(
      { queryKey: ["subTasksByParentTask"] },
      (old) => patchCachedSubtasks(old, data)
    );
  }

  if (parentTaskId) {
    queryClient.invalidateQueries({
      predicate: (query) => queryKeyMatchesId(query.queryKey, "subTasksByParentTask", parentTaskId),
      refetchType: "active",
    });
    queryClient.invalidateQueries({
      predicate: (query) => queryKeyMatchesId(query.queryKey, "getTaskById", parentTaskId),
      refetchType: "active",
    });
    return;
  }

  if (id) {
    queryClient.invalidateQueries({
      predicate: (query) => {
        if (query.queryKey[0] !== "subTasksByParentTask") return false;
        const cached = query.state.data;
        const list = Array.isArray(cached) ? cached : cached?.subTasks;
        return Array.isArray(list) && list.some((st) => extractEntityId(st._id) === id);
      },
      refetchType: "active",
    });
  }
};

export const handleTaskStatusChanged = (data, queryClient) => {
  if (!data) return;

  const parentTaskId = extractEntityId(data.parentTaskId);
  const isSubtask = Boolean(data.isSubtask || data.subTaskId);
  const subTaskId = isSubtask ? extractEntityId(data.subTaskId || data.taskId) : "";
  const taskId = isSubtask ? parentTaskId : extractEntityId(data.taskId);

  if (isSubtask && subTaskId) {
    queryClient.setQueriesData(
      { queryKey: ["subTasksByParentTask"] },
      (old) => patchCachedSubtasks(old, data)
    );

    if (parentTaskId) {
      queryClient.setQueriesData(
        { predicate: (query) => queryKeyMatchesId(query.queryKey, "getTaskById", parentTaskId) },
        (old) => patchCachedSubtasks(old, data)
      );
    }

    queryClient.invalidateQueries({
      predicate: (query) => {
        if (query.queryKey[0] !== "subTasksByParentTask") return false;
        if (parentTaskId && extractEntityId(query.queryKey[1]) === parentTaskId) {
          return true;
        }
        const cached = query.state.data;
        const list = Array.isArray(cached) ? cached : cached?.subTasks;
        return (
          Array.isArray(list) &&
          list.some((st) => extractEntityId(st._id) === subTaskId)
        );
      },
      refetchType: "active",
    });

    if (parentTaskId) {
      queryClient.invalidateQueries({
        predicate: (query) =>
          queryKeyMatchesId(query.queryKey, "getTaskById", parentTaskId),
        refetchType: "active",
      });
    }

    queryClient.invalidateQueries({
      predicate: (query) =>
        queryKeyMatchesId(query.queryKey, "getSubTaskById", subTaskId),
      refetchType: "active",
    });
  } else if (taskId) {
    queryClient.invalidateQueries({
      predicate: (query) => queryKeyMatchesId(query.queryKey, "getTaskById", taskId),
      refetchType: "active",
    });
  }

  queryClient.invalidateQueries({ queryKey: ["employeeSubTasksToday"] });
  queryClient.invalidateQueries({ queryKey: ["projectTasks"] });
  queryClient.invalidateQueries({ queryKey: ["employeeTasks"] });
  queryClient.invalidateQueries({ queryKey: ["companyTasks"] });
  queryClient.invalidateQueries({ queryKey: ["tasksOnReview"] });
};
