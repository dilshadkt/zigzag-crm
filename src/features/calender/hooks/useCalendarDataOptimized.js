import { useMemo } from "react";
import { useGetCalendarData } from "../api";

const dateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const emptyDay = () => ({
  projects: [],
  tasks: [],
  subtasks: [],
  birthdays: [],
});

export const useCalendarDataOptimized = (
  currentDate,
  eventFilters,
  assignerFilter,
  projectFilter,
  publishPendingOnly
) => {
  const { data: calendarData, isLoading } = useGetCalendarData(currentDate);

  const indexedDays = useMemo(() => {
    const days = new Map();
    const payload = calendarData?.data;
    if (!payload) return days;

    const ensure = (key) => {
      if (!days.has(key)) days.set(key, emptyDay());
      return days.get(key);
    };

    (payload.projects || []).forEach((project) => {
      if (!project?.endDate) return;
      ensure(dateKey(project.endDate)).projects.push(project);
    });

    (payload.tasks || []).forEach((task) => {
      if (!task?.dueDate) return;
      const bucket = ensure(dateKey(task.dueDate));
      if (task.parentTask || task.itemType === "subtask") {
        bucket.subtasks.push(task);
      } else {
        bucket.tasks.push(task);
      }
    });

    (payload.birthdays || []).forEach((birthday) => {
      const dob = birthday.dob ? new Date(birthday.dob) : null;
      if (!dob || Number.isNaN(dob.getTime())) return;
      const key = `${currentDate.getFullYear()}-${dob.getMonth() + 1}-${dob.getDate()}`;
      ensure(key).birthdays.push(birthday);
    });

    return days;
  }, [calendarData, currentDate]);

  const getItemsForDate = (date) => {
    if (!date) return emptyDay();
    const dateObj = date instanceof Date ? date : new Date(date);
    const bucket = indexedDays.get(dateKey(dateObj)) || emptyDay();

    let projects =
      !publishPendingOnly && eventFilters.projects ? [...bucket.projects] : [];
    if (projectFilter?.length) {
      projects = projects.filter((project) =>
        projectFilter.includes(project._id || project.id)
      );
    }

    let allTasks = [...bucket.tasks, ...bucket.subtasks];
    if (publishPendingOnly) {
      allTasks = allTasks.filter((task) => task.isPublishPending === true);
    }
    if (assignerFilter?.length) {
      allTasks = allTasks.filter((task) =>
        (task.assignedTo || []).some((assignee) =>
          assignerFilter.includes(assignee._id)
        )
      );
    }
    if (projectFilter?.length) {
      allTasks = allTasks.filter((task) => {
        const projectId = task.project?._id || task.project?.id;
        return projectId && projectFilter.includes(projectId);
      });
    }

    const tasks =
      eventFilters.tasks || publishPendingOnly
        ? allTasks.filter((task) => !task.parentTask && task.itemType !== "subtask")
        : [];
    const subtasks =
      !publishPendingOnly && eventFilters.subtasks
        ? allTasks.filter((task) => task.parentTask || task.itemType === "subtask")
        : [];
    const birthdays =
      !publishPendingOnly && eventFilters.birthdays ? [...bucket.birthdays] : [];

    return { projects, tasks, subtasks, birthdays };
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
      filterOptions: calendarData?.data?.filterOptions || {
        assigners: [],
        projects: [],
      },
    },
    isLoading,
  };
};
