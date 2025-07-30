import {
  useGetProjectsDueThisMonth,
  useGetTasksDueThisMonth,
  useGetEmployeeBirthdays,
} from "../api/hooks";
import { isSameDay } from "date-fns";

export const useCalendarData = (currentDate, eventFilters, assignerFilter) => {
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

    const projects =
      eventFilters.projects && projectsData?.projects
        ? projectsData.projects.filter((project) =>
            isSameDay(new Date(project.endDate), date)
          )
        : [];

    // Filter tasks based on subtask filter and assigner filter
    let allTasks = [];
    if (tasksData?.tasks) {
      allTasks = tasksData.tasks.filter((task) =>
        isSameDay(new Date(task.dueDate), date)
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
            return dobDate.getDate() === date.getDate();
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
