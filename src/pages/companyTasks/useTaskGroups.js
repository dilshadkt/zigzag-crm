import { useMemo } from "react";

/**
 * Custom hook to group tasks by their due date month
 * Used for overdue tasks to organize them by month
 */
export const useOverdueTaskGroups = (filter, tasks) => {
  return useMemo(() => {
    if (filter !== "overdue" || tasks.length === 0) {
      return [];
    }

    const groups = new Map();
    tasks.forEach((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const hasValidDate =
        dueDate instanceof Date && !Number.isNaN(dueDate.getTime());

      const groupKey = hasValidDate
        ? `${dueDate.getFullYear()}-${dueDate.getMonth()}`
        : "no-date";

      const label = hasValidDate
        ? dueDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
        : "No Due Date";

      const sortValue = hasValidDate
        ? new Date(dueDate.getFullYear(), dueDate.getMonth(), 1).getTime()
        : Number.MIN_SAFE_INTEGER;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label,
          sortValue,
          tasks: [],
        });
      }

      groups.get(groupKey).tasks.push(task);
    });

    return Array.from(groups.values()).sort(
      (a, b) => (b.sortValue || 0) - (a.sortValue || 0)
    );
  }, [filter, tasks]);
};

/**
 * Custom hook to group tasks by their completion date
 * Used for completed tasks to organize them by completion date
 */
export const useCompletedTaskGroups = (filter, tasks) => {
  return useMemo(() => {
    if (filter !== "completed" || tasks.length === 0) {
      return [];
    }

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const groups = new Map();

    tasks.forEach((task) => {
      // Use completedAt if available, otherwise fall back to updatedAt
      const dateToUse = task.completedAt || task.updatedAt;
      const completedAt = dateToUse ? new Date(dateToUse) : null;
      const hasValidCompletion =
        completedAt instanceof Date && !Number.isNaN(completedAt.getTime());

      const isToday =
        hasValidCompletion &&
        completedAt >= startOfToday &&
        completedAt < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

      const isYesterday =
        hasValidCompletion &&
        completedAt >= startOfYesterday &&
        completedAt < startOfToday;

      const groupKey = isToday
        ? "today"
        : isYesterday
          ? "yesterday"
          : hasValidCompletion
            ? completedAt.toDateString()
            : "no-date";

      let label = "No Date";
      if (isToday) label = "Today";
      else if (isYesterday) label = "Yesterday";
      else if (hasValidCompletion) {
        label = completedAt.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      const sortValue = hasValidCompletion
        ? completedAt.getTime()
        : Number.MIN_SAFE_INTEGER;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label,
          sortValue,
          tasks: [],
        });
      }

      groups.get(groupKey).tasks.push(task);
    });

    return Array.from(groups.values()).sort(
      (a, b) => (b.sortValue || 0) - (a.sortValue || 0)
    );
  }, [filter, tasks]);
};

/**
 * Custom hook to group tasks by their task month or start date month
 * Used for on-hold tasks to organize them by month
 */
export const useOnHoldTaskGroups = (filter, tasks) => {
  return useMemo(() => {
    if (filter !== "on-hold" || tasks.length === 0) {
      return [];
    }

    const groups = new Map();
    tasks.forEach((task) => {
      let date;
      let hasValidDate = false;

      // For subtasks (they usually have parentTask or isSubTask)
      if (task.parentTask || task.isSubTask) {
        date = task.startDate ? new Date(task.startDate) : null;
        hasValidDate = date instanceof Date && !Number.isNaN(date.getTime());
      } else if (task.taskMonth) {
        // For main tasks, use taskMonth
        const [year, month] = task.taskMonth.split("-");
        date = new Date(parseInt(year), parseInt(month) - 1, 1);
        hasValidDate = true;
      }

      const groupKey = hasValidDate
        ? `${date.getFullYear()}-${date.getMonth()}`
        : "no-date";

      const label = hasValidDate
        ? date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
        : "No Specified Month";

      const sortValue = hasValidDate
        ? new Date(date.getFullYear(), date.getMonth(), 1).getTime()
        : Number.MIN_SAFE_INTEGER;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label,
          sortValue,
          tasks: [],
        });
      }

      groups.get(groupKey).tasks.push(task);
    });

    return Array.from(groups.values()).sort(
      (a, b) => (b.sortValue || 0) - (a.sortValue || 0)
    );
  }, [filter, tasks]);
};
