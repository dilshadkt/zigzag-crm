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
        return event.data?.thumbImg ? (
          <div className="relative w-6 h-6 flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 rounded">
              <FaProjectDiagram className="text-lg text-[#3F8CFF]" />
            </div>
            <img 
              src={event.data.thumbImg} 
              alt={event.title} 
              className="w-full h-full rounded object-cover absolute inset-0 z-10 bg-white" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <FaProjectDiagram className="text-lg text-[#3F8CFF] flex-shrink-0" />
        );
      case "task":
        return event.data?.project?.thumbImg ? (
          <div className="relative w-6 h-6 flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center bg-amber-50 rounded">
              <FaTasks className="text-lg text-[#FFBD21]" />
            </div>
            <img 
              src={event.data.project.thumbImg} 
              alt={event.projectName} 
              className="w-full h-full rounded object-cover absolute inset-0 z-10 bg-white" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <FaTasks className="text-lg text-[#FFBD21] flex-shrink-0" />
        );
      case "birthday":
        return event.data?.profileImage ? (
          <div className="relative w-6 h-6 flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center bg-pink-50 rounded-full">
              <FaGift className="text-lg text-[#FF6B9D]" />
            </div>
            <img 
              src={event.data.profileImage} 
              alt={event.title} 
              className="w-full h-full rounded-full object-cover absolute inset-0 z-10 bg-white" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <FaGift className="text-lg text-[#FF6B9D] flex-shrink-0" />
        );
      default:
        return <IoArrowUpOutline className="text-lg text-[#FFBD21] flex-shrink-0" />;
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
        return `Task ${event.status ? `• ${event.status.replace("-", " ")}` : ""
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
      <div className="flex min-h-[320px] md:h-[470px] w-full flex-col bg-white py-4 md:py-5 px-3 md:px-4 rounded-2xl md:rounded-3xl">
        <div className="flexBetween">
          <h4 className="font-semibold text-sm md:text-base text-gray-800">
            Nearest Events
          </h4>
          <Link
            to={"/calender"}
            className="text-[#3F8CFF] text-xs cursor-pointer flexStart gap-x-2"
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
    <div className="flex min-h-[320px] md:h-[470px] flex-col bg-white py-4 md:py-5 px-3 md:px-4 rounded-2xl md:rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-sm md:text-base text-gray-800">Nearest Events</h4>
        <Link
          to={"/calender"}
          className="text-[#3F8CFF] text-xs cursor-pointer flexStart gap-x-2"
        >
          <span>View all</span>
          <MdOutlineKeyboardArrowRight />
        </Link>
      </div>
      <div className="w-full h-full overflow-y-auto mt-3 gap-y-6 flex flex-col pt-2">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-xs">No upcoming events this month</p>
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
                <p className="w-[80%] font-medium text-sm text-gray-800 truncate">
                  {event.title}
                </p>
                {getEventIcon(event)}
              </div>
              <div className="flexBetween w-full">
                <div className="flex flex-col w-[80%]">
                  <p className="text-[11px] text-[#91929E]">
                    {getDateText(event.date)} | {getTimeText(event.date)}
                  </p>
                  <p className="text-[11px] text-[#91929E] mt-1">
                    {getEventSubtitle(event)}
                  </p>
                </div>
                {event.type === "project" && (
                  <div className="h-7 bg-[#F4F9FD] px-2 gap-x-1 text-[#7D8592] flexStart rounded-lg">
                    <span className="text-[10px]">{event.progress}%</span>
                  </div>
                )}
                {event.type === "task" && (
                  <div className="h-7 bg-[#F4F9FD] px-2 gap-x-1 text-[#7D8592] flexStart rounded-lg">
                    <img src="/icons/clock.svg" alt="" className="w-3" />
                    <span className="text-[10px]">Due</span>
                  </div>
                )}
                {event.type === "birthday" && (
                  <div className="h-7 bg-[#FFF0F5] px-2 gap-x-1 text-[#FF6B9D] flexStart rounded-lg">
                    <FaGift className="text-[10px]" />
                    <span className="text-[10px]">🎉</span>
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
