import React, { useMemo } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { IoArrowUpOutline } from "react-icons/io5";
import { FaGift, FaProjectDiagram, FaTasks } from "react-icons/fa";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";
import {
  useGetProjectsDueThisMonth,
  useGetTasksDueThisMonth,
  useGetEmployeeBirthdays,
} from "../../../api/hooks";

const NearestEvents = ({ selectedDate }) => {
  const currentDate = selectedDate || new Date();

  const { data: projectsData, isLoading: projectsLoading } =
    useGetProjectsDueThisMonth(currentDate);
  const { data: tasksData, isLoading: tasksLoading } =
    useGetTasksDueThisMonth(currentDate);
  const { data: birthdaysData, isLoading: birthdaysLoading } =
    useGetEmployeeBirthdays(currentDate);

  const isLoading = projectsLoading || tasksLoading || birthdaysLoading;

  // Combine all events and sort by date
  const getAllEvents = () => {
    const events = [];

    // Add projects
    if (projectsData?.projects) {
      projectsData.projects.forEach((project) => {
        events.push({
          type: "project",
          title: project.name,
          date: new Date(project.endDate),
          priority: project.priority,
          progress: project.progress || 0,
          id: project._id,
          data: project,
        });
      });
    }

    // Add tasks
    if (tasksData?.tasks) {
      tasksData.tasks.forEach((task) => {
        events.push({
          type: "task",
          title: task.title,
          date: new Date(task.dueDate),
          priority: task.priority,
          status: task.status,
          id: task._id,
          projectId: task.project?._id,
          projectName: task.project?.name,
          data: task,
        });
      });
    }

    // Add birthdays
    if (birthdaysData?.birthdays) {
      birthdaysData.birthdays.forEach((employee) => {
        const dobDate = new Date(employee.dob);
        const currentYear = new Date().getFullYear();
        const birthdayThisYear = new Date(
          currentYear,
          dobDate.getMonth(),
          dobDate.getDate()
        );

        events.push({
          type: "birthday",
          title: `${employee.firstName}'s Birthday`,
          date: birthdayThisYear,
          id: employee._id,
          data: employee,
        });
      });
    }

    // Sort by date (nearest first)
    return events.sort((a, b) => a.date - b.date).slice(0, 5); // Show only 5 nearest events
  };

  const getDateText = (date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE"); // Day name
    return format(date, "MMM dd"); // Month day
  };

  const getTimeText = (date) => {
    return format(date, "h:mm a");
  };

  const getEventIcon = (event) => {
    switch (event.type) {
      case "project":
        return <FaProjectDiagram className="text-xl text-[#3F8CFF]" />;
      case "task":
        return <FaTasks className="text-xl text-[#FFBD21]" />;
      case "birthday":
        return <FaGift className="text-xl text-[#FF6B9D]" />;
      default:
        return <IoArrowUpOutline className="text-xl text-[#FFBD21]" />;
    }
  };

  const getEventColor = (event) => {
    switch (event.type) {
      case "project":
        return "#3F8CFF";
      case "task":
        return "#FFBD21";
      case "birthday":
        return "#FF6B9D";
      default:
        return "#3F8CFF";
    }
  };

  const getEventSubtitle = (event) => {
    switch (event.type) {
      case "project":
        return `Project Deadline • ${event.progress}% Complete`;
      case "task":
        return `Task ${
          event.status ? `• ${event.status.replace("-", " ")}` : ""
        }${event.projectName ? ` • ${event.projectName}` : ""}`;
      case "birthday":
        return "Birthday Celebration";
      default:
        return "";
    }
  };

  const events = getAllEvents();

  if (isLoading) {
    return (
      <div className="flex h-[470px] w-full flex-col bg-white py-5 px-4 rounded-3xl">
        <div className="flexBetween">
          <h4 className="font-semibold text-lg text-gray-800">
            Nearest Events
          </h4>
          <Link
            to={"/calender"}
            className="text-[#3F8CFF] text-sm cursor-pointer flexStart gap-x-2"
          >
            <span>View all</span>
            <MdOutlineKeyboardArrowRight />
          </Link>
        </div>
        <div className="w-full h-full overflow-y-auto mt-3 gap-y-8 flex flex-col pt-2">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[470px]  md:col-span-2 flex-col bg-white py-5 px-4 rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-lg text-gray-800">Nearest Events</h4>
        <Link
          to={"/calender"}
          className="text-[#3F8CFF] text-sm cursor-pointer flexStart gap-x-2"
        >
          <span>View all</span>
          <MdOutlineKeyboardArrowRight />
        </Link>
      </div>
      <div className="w-full h-full overflow-y-auto mt-3 gap-y-6 flex flex-col pt-2">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-sm">No upcoming events this month</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={`${event.type}-${event.id}-${index}`}
              className="flex relative justify-between h-auto pl-3 flex-col gap-y-2 w-full cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => {
                if (event.type === "project") {
                  window.location.href = `/projects-analytics/${event.id}`;
                } else if (event.type === "task") {
                  window.location.href = `/projects/${event.projectId}/${event.id}`;
                }
              }}
            >
              <div className="flexBetween w-full">
                <p className="w-[80%] font-medium text-gray-800 truncate">
                  {event.title}
                </p>
                {getEventIcon(event)}
              </div>
              <div className="flexBetween w-full">
                <div className="flex flex-col w-[80%]">
                  <p className="text-xs text-[#91929E]">
                    {getDateText(event.date)} | {getTimeText(event.date)}
                  </p>
                  <p className="text-xs text-[#91929E] mt-1">
                    {getEventSubtitle(event)}
                  </p>
                </div>
                {event.type === "project" && (
                  <div className="h-8 bg-[#F4F9FD] px-3 gap-x-1 text-[#7D8592] flexStart rounded-lg">
                    <span className="text-xs">{event.progress}%</span>
                  </div>
                )}
                {event.type === "task" && (
                  <div className="h-8 bg-[#F4F9FD] px-3 gap-x-1 text-[#7D8592] flexStart rounded-lg">
                    <img src="/icons/clock.svg" alt="" />
                    <span className="text-xs">Due</span>
                  </div>
                )}
                {event.type === "birthday" && (
                  <div className="h-8 bg-[#FFF0F5] px-3 gap-x-1 text-[#FF6B9D] flexStart rounded-lg">
                    <FaGift className="text-xs" />
                    <span className="text-xs">🎉</span>
                  </div>
                )}
              </div>
              <div
                className="w-1 rounded-full h-full absolute left-0"
                style={{ backgroundColor: getEventColor(event) }}
              ></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NearestEvents;
