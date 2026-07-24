import { isSameDay } from "date-fns";
import { useGetCalendarData } from "../api";

export const useCalendarDataOptimized = (
  currentDate,
  eventFilters,
  assignerFilter,
  projectFilter,
  publishPendingOnly
) => {
  const { data: calendarData, isLoading } = useGetCalendarData(currentDate);

  // Get items (projects, tasks, birthdays) for a specific date
  const getItemsForDate = (date) => {
    if (!date || !calendarData?.data) {
      return { projects: [], tasks: [], subtasks: [], birthdays: [] };
    }

    // Ensure date is a proper Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    const { projects, tasks, birthdays } = calendarData.data;

    // Filter projects for this date
    let projectsForDate =
      !publishPendingOnly && eventFilters.projects && projects
        ? projects.filter((project) =>
          isSameDay(new Date(project.endDate), dateObj)
        )
        : [];

    // Apply project filter to projects themselves if selected
    if (projectFilter && projectFilter.length > 0) {
      projectsForDate = projectsForDate.filter((project) =>
        projectFilter.includes(project._id || project.id)
      );
    }

    // Filter tasks for this date
    let allTasks = [];
    if (tasks) {
      allTasks = tasks.filter((task) =>
        isSameDay(new Date(task.dueDate), dateObj)
      );

      // Apply publishPendingOnly filter
      if (publishPendingOnly) {
        allTasks = allTasks.filter(task => task.isPublishPending === true);
      }

      // Apply assigner filter if selected
      if (assignerFilter && assignerFilter.length > 0) {
        allTasks = allTasks.filter((task) => {
          if (!task.assignedTo || !Array.isArray(task.assignedTo)) {
            return false;
          }
          return task.assignedTo.some((assignee) =>
            assignerFilter.includes(assignee._id)
          );
        });
      }

      // Apply project filter if selected
      if (projectFilter && projectFilter.length > 0) {
        allTasks = allTasks.filter((task) => {
          if (!task.project || (!task.project._id && !task.project.id)) {
            return false;
          }
          const taskId = task.project._id || task.project.id;
          return projectFilter.includes(taskId);
        });
      }
    }

    // Separate parent tasks and subtasks
    const parentTasks = eventFilters.tasks || publishPendingOnly
      ? allTasks.filter((task) => !task.parentTask)
      : [];

    const subtasks = (!publishPendingOnly && eventFilters.subtasks)
      ? allTasks.filter((task) => task.parentTask)
      : [];

    // Filter birthdays for this date
    const birthdaysForDate =
      !publishPendingOnly && eventFilters.birthdays && birthdays
        ? birthdays.filter((birthday) => {
            const dobDate = new Date(birthday.dob);
            return dobDate.getDate() === dateObj.getDate();
          })
        : [];

    return {
      projects: projectsForDate,
      tasks: parentTasks,
      subtasks,
      birthdays: birthdaysForDate,
    };
  };

  return {
    calendarData: {
      getItemsForDate,
      projectsData: calendarData?.data?.projects
        ? { projects: calendarData.data.projects }
        : null,
      tasksData: calendarData?.data?.tasks
        ? { tasks: calendarData.data.tasks }
        : null,
      birthdaysData: calendarData?.data?.birthdays
        ? { birthdays: calendarData.data.birthdays }
        : null,
    },
    isLoading,
  };
};
