import { isSameDay } from "date-fns";
import {
  useGetProjectsDueThisMonth,
  useGetTasksDueThisMonth,
  useGetEmployeeBirthdays,
} from "../api";

export const useCalendarData = (
  currentDate,
  eventFilters,
  assignerFilter,
  projectFilter
) => {
  const { data: projectsData, isLoading: projectsLoading } =
    useGetProjectsDueThisMonth(currentDate);
  const { data: tasksData, isLoading: tasksLoading } =
    useGetTasksDueThisMonth(currentDate);
  const { data: birthdaysData, isLoading: birthdaysLoading } =
    useGetEmployeeBirthdays(currentDate);

  const isLoading = projectsLoading || tasksLoading || birthdaysLoading;

  // Get items (projects, tasks, birthdays) for a specific date
  const getItemsForDate = (date) => {
    if (!date) return { projects: [], tasks: [], subtasks: [], birthdays: [] };

    // Ensure date is a proper Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    const projects =
      eventFilters.projects && projectsData?.projects
        ? projectsData.projects.filter((project) =>
            isSameDay(new Date(project.endDate), dateObj)
          )
        : [];

    // Filter tasks based on subtask filter, assigner filter, and project filter
    let allTasks = [];
    if (tasksData?.tasks) {
      allTasks = tasksData.tasks.filter((task) =>
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

    // Get employee birthdays for this date
    const birthdays =
      eventFilters.birthdays && birthdaysData?.birthdays
        ? birthdaysData.birthdays.filter((birthday) => {
            const dobDate = new Date(birthday.dob);
            return dobDate.getDate() === dateObj.getDate();
          })
        : [];

    return { projects, tasks: parentTasks, subtasks, birthdays };
  };

  return {
    calendarData: {
      getItemsForDate,
      projectsData,
      tasksData,
      birthdaysData,
    },
    isLoading,
  };
};
