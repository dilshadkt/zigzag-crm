import { useState, useEffect } from "react";

export const useTaskData = (allTasksData, todayTasksData, filter) => {
  const [filteredTasks, setFilteredTasks] = useState([]);

  const isTodayFilter = filter === "today";

  useEffect(() => {
    if (isTodayFilter) {
      setFilteredTasks(todayTasksData?.filteredItems || []);
      return;
    }

    setFilteredTasks(allTasksData?.filteredItems || []);
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
