import { useState, useEffect } from "react";

export const useTaskData = (allTasksData, todayTasksData, filter) => {
  const [filteredTasks, setFilteredTasks] = useState([]);

  const isTodayFilter = filter === "today";

  useEffect(() => {
    let rawItems = [];

    if (isTodayFilter) {
      rawItems = todayTasksData?.filteredItems || [];
    } else {
      rawItems = allTasksData?.filteredItems || [];
    }

    // Filter out on-review subtasks only in the unfiltered "Total Tasks" view.
    // Specific filters (overdue, monthly-rework, ...) match dashboard counts that include them.
    const itemsWithoutOnReviewSubtasks = rawItems.filter((item) => {
      const isSubTask = Boolean(item.parentTask || item.isSubTask);
      if (isSubTask && item.status === "on-review" && (!filter || filter === "today")) {
        return false;
      }
      return true;
    });

    // Hide completed tasks/subtasks only in the unfiltered "Total Tasks" view;
    // specific filters (completed, monthly-rework, ...) match their dashboard counts
    const visibleItems = filter
      ? itemsWithoutOnReviewSubtasks
      : itemsWithoutOnReviewSubtasks.filter(
          (item) => item.status !== "completed"
        );

    setFilteredTasks(visibleItems);
  }, [allTasksData, todayTasksData, isTodayFilter, filter]);

  const getFilterOptions = () => {
    if (isTodayFilter && todayTasksData?.filterOptions) {
      return todayTasksData.filterOptions;
    }

    return allTasksData?.filterOptions || { users: [], projects: [] };
  };

  return {
    filteredTasks,
    getFilterOptions,
  };
};
