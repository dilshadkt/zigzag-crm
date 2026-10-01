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

    // Filter out subtasks that are on-review
    const itemsWithoutOnReviewSubtasks = rawItems.filter((item) => {
      const isSubTask = Boolean(item.parentTask || item.isSubTask);
      if (isSubTask && item.status === "on-review") {
        return false;
      }
      return true;
    });

    setFilteredTasks(itemsWithoutOnReviewSubtasks);
  }, [allTasksData, todayTasksData, isTodayFilter]);

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
