/**
 * Groups tasks by their completion date into categories like Today, Yesterday, This Week, etc.
 * @param {Array} tasks - Array of tasks/subtasks with completedAt timestamps
 * @returns {Array} Array of grouped tasks with labels
 */
export const groupTasksByCompletionDate = (tasks) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get start of this week (Sunday)
    const thisWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    thisWeekStart.setDate(today.getDate() - dayOfWeek);

    // Get start of last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // Get start of this month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get start of last month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const groups = {
        today: { label: "Today", tasks: [], sortOrder: 1 },
        yesterday: { label: "Yesterday", tasks: [], sortOrder: 2 },
        thisWeek: { label: "This Week", tasks: [], sortOrder: 3 },
        lastWeek: { label: "Last Week", tasks: [], sortOrder: 4 },
        thisMonth: { label: "This Month", tasks: [], sortOrder: 5 },
        lastMonth: { label: "Last Month", tasks: [], sortOrder: 6 },
        older: { label: "Older", tasks: [], sortOrder: 7 },
    };

    tasks.forEach((task) => {
        // Use completedAt if available, otherwise fall back to updatedAt
        const dateToUse = task.completedAt || task.updatedAt;

        if (!dateToUse) {
            // If neither date exists, skip this task
            return;
        }

        const completedDate = new Date(dateToUse);
        const completedDateOnly = new Date(
            completedDate.getFullYear(),
            completedDate.getMonth(),
            completedDate.getDate()
        );

        if (completedDateOnly.getTime() === today.getTime()) {
            groups.today.tasks.push(task);
        } else if (completedDateOnly.getTime() === yesterday.getTime()) {
            groups.yesterday.tasks.push(task);
        } else if (completedDateOnly >= thisWeekStart && completedDateOnly < today) {
            groups.thisWeek.tasks.push(task);
        } else if (completedDateOnly >= lastWeekStart && completedDateOnly < thisWeekStart) {
            groups.lastWeek.tasks.push(task);
        } else if (completedDateOnly >= thisMonthStart && completedDateOnly < thisWeekStart) {
            groups.thisMonth.tasks.push(task);
        } else if (completedDateOnly >= lastMonthStart && completedDateOnly <= lastMonthEnd) {
            groups.lastMonth.tasks.push(task);
        } else {
            groups.older.tasks.push(task);
        }
    });

    // Filter out empty groups and return as array
    return Object.values(groups)
        .filter((group) => group.tasks.length > 0)
        .sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * Formats a relative date label with count
 * @param {string} label - The group label (e.g., "Today", "Yesterday")
 * @param {number} count - Number of tasks in the group
 * @returns {string} Formatted label with count
 */
export const formatGroupLabel = (label, count) => {
    return `${label} (${count})`;
};
