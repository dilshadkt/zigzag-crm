import { isSameDay } from "date-fns";
import { useGetCalendarData } from "../api";

export const useCalendarDataOptimized = (
  currentDate,
  eventFilters,
  assignerFilter,
  projectFilter
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
    const projectsForDate =
      eventFilters.projects && projects
        ? projects.filter((project) =>
            isSameDay(new Date(project.endDate), dateObj)
          )
        : [];

    // Filter tasks for this date
    let allTasks = [];
    if (tasks) {
      allTasks = tasks.filter((task) =>
        isSameDay(new Date(task.dueDate), dateObj)
      );

      // Apply assigner filter if selected
      if (assignerFilter) {
        allTasks = allTasks.filter((task) => {
          if (!task.assignedTo || !Array.isArray(task.assignedTo)) {
            return false;
          }
          return task.assignedTo.some(
            (assignee) => assignee._id === assignerFilter
          );
        });
      }

      // Apply project filter if selected
      if (projectFilter) {
        allTasks = allTasks.filter((task) => {
          if (!task.project || !task.project._id) {
            return false;
          }
          return task.project._id === projectFilter;
        });
      }
    }

    // Separate parent tasks and subtasks
    const parentTasks = eventFilters.tasks
      ? allTasks.filter((task) => !task.parentTask)
      : [];

    const subtasks = eventFilters.subtasks
      ? allTasks.filter((task) => task.parentTask)
      : [];

    // Filter birthdays for this date
    const birthdaysForDate =
      eventFilters.birthdays && birthdays
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
