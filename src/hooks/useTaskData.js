import { useState, useEffect } from "react";

export const useTaskData = (
  allTasksData,
  todayTasksData,
  filter,
  superFilters
) => {
  const [filteredTasks, setFilteredTasks] = useState([]);

  const isTodayFilter = filter === "today";

  const getFilterOptions = () => {
    if (!allTasksData?.tasks) return { users: [], projects: [] };

    const users = [];
    const projects = [];
    const userIds = new Set();
    const projectIds = new Set();

    allTasksData.tasks.forEach((task) => {
      task.assignedTo?.forEach((user) => {
        if (!userIds.has(user._id)) {
          userIds.add(user._id);
          users.push(user);
        }
      });

      if (task.project && !projectIds.has(task.project._id)) {
        projectIds.add(task.project._id);
        projects.push(task.project);
      }
    });

    return { users, projects };
  };

  useEffect(() => {
    // Use today's tasks data if filter is "today", otherwise use all tasks data
    const dataSource = isTodayFilter ? todayTasksData : allTasksData;

    if (dataSource?.tasks || (isTodayFilter && dataSource?.subTasks)) {
      let filtered = [];

      if (isTodayFilter) {
        // For today filter, combine tasks and subtasks from the smart API
        const todayTasks = dataSource.tasks || [];
        const todaySubTasks = dataSource.subTasks || [];

        // Convert subtasks to task-like format for consistent rendering
        const convertedSubTasks = todaySubTasks.map((subTask) => ({
          ...subTask,
          _id: subTask._id,
          title: subTask.title,
          description: subTask.description,
          priority: subTask.priority,
          status: subTask.status,
          dueDate: subTask.dueDate,
          assignedTo: subTask.assignedTo,
          creator: subTask.creator,
          project: subTask.project,
          parentTask: subTask.parentTask,
          isSubTask: true, // Flag to identify subtasks
        }));

        filtered = [...todayTasks, ...convertedSubTasks];
      } else {
        // For other filters, use the regular all tasks data
        filtered = [...(dataSource.tasks || [])];

        // Apply URL-based filter first
        const today = new Date();
        switch (filter) {
          case "overdue":
            filtered = filtered.filter((task) => {
              const dueDate = new Date(task.dueDate);
              // Set due date to start of day for comparison
              const dueDateStart = new Date(
                dueDate.getFullYear(),
                dueDate.getMonth(),
                dueDate.getDate()
              );
              const todayStart = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );
              return (
                dueDateStart < todayStart &&
                task.status !== "approved" &&
                task.status !== "completed" &&
                task.status !== "client-approved"
              );
            });
            break;
          case "in-progress":
            filtered = filtered.filter((task) => task.status === "in-progress");
            break;
          case "pending":
            filtered = filtered.filter((task) => task.status === "todo");
            break;
          case "completed":
            filtered = filtered.filter((task) => task.status === "completed");
            break;
          case "approved":
            filtered = filtered.filter((task) => task.status === "approved");
            break;
          case "re-work":
            filtered = filtered.filter((task) => task.status === "re-work");
            break;
          case "unscheduled":
            // Filter for tasks that have no startDate and no dueDate
            filtered = dataSource?.unscheduledSubTasks || [];
            break;
          case "upcoming":
            // Filter for tasks due in the next 3 days (today + 2 more days)
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 2); // Add 2 days to today

            filtered = filtered.filter((task) => {
              const dueDate = new Date(task.dueDate);
              const dueDateStart = new Date(
                dueDate.getFullYear(),
                dueDate.getMonth(),
                dueDate.getDate()
              );
              const todayStart = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );
              const threeDaysFromNowStart = new Date(
                threeDaysFromNow.getFullYear(),
                threeDaysFromNow.getMonth(),
                threeDaysFromNow.getDate()
              );
              return (
                dueDateStart >= todayStart &&
                dueDateStart <= threeDaysFromNowStart &&
                task.status !== "approved" &&
                task.status !== "completed" &&
                task.status !== "client-approved"
              );
            });
            break;
          // No default case - show all tasks for 'all' or no filter
        }
      }

      // Apply super filters
      if (superFilters.search) {
        filtered = filtered.filter(
          (task) =>
            task.title
              .toLowerCase()
              .includes(superFilters.search.toLowerCase()) ||
            task.description
              ?.toLowerCase()
              .includes(superFilters.search.toLowerCase())
        );
      }

      if (superFilters.status.length > 0) {
        filtered = filtered.filter((task) =>
          superFilters.status.includes(task.status)
        );
      }

      if (superFilters.priority.length > 0) {
        filtered = filtered.filter((task) =>
          superFilters.priority.includes(task.priority)
        );
      }

      if (superFilters.assignedTo.length > 0) {
        filtered = filtered.filter((task) =>
          task.assignedTo?.some((user) =>
            superFilters.assignedTo.includes(user._id)
          )
        );
      }

      if (superFilters.project.length > 0) {
        filtered = filtered.filter(
          (task) =>
            task.project && superFilters.project.includes(task.project._id)
        );
      }

      if (superFilters.dateRange.start) {
        const startDate = new Date(superFilters.dateRange.start);
        filtered = filtered.filter((task) => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= startDate;
        });
      }

      if (superFilters.dateRange.end) {
        const endDate = new Date(superFilters.dateRange.end);
        filtered = filtered.filter((task) => {
          const taskDate = new Date(task.dueDate);
          return taskDate <= endDate;
        });
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (superFilters.sortBy) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "priority":
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            aValue = priorityOrder[a.priority] || 0;
            bValue = priorityOrder[b.priority] || 0;
            break;
          case "status":
            const statusOrder = {
              todo: 1,
              "in-progress": 2,
              "on-review": 3,
              approved: 4,
              "re-work": 5,
              completed: 6,
            };
            aValue = statusOrder[a.status] || 0;
            bValue = statusOrder[b.status] || 0;
            break;
          case "createdAt":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default: // dueDate
            aValue = new Date(a.dueDate);
            bValue = new Date(b.dueDate);
        }

        if (superFilters.sortOrder === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });

      setFilteredTasks(filtered);
    }
  }, [allTasksData, todayTasksData, filter, superFilters, isTodayFilter]);

  return {
    filteredTasks,
    getFilterOptions,
  };
};
