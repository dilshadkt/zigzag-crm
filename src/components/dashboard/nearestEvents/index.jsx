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

  const getEventAvatar = (event) => {
    const config = {
      project: { Icon: FaProjectDiagram, color: "#3F8CFF", bg: "bg-blue-50", img: event.data?.thumbImg },
      task: { Icon: FaTasks, color: "#FFBD21", bg: "bg-amber-50", img: event.data?.project?.thumbImg },
      birthday: { Icon: FaGift, color: "#FF6B9D", bg: "bg-pink-50", img: event.data?.profileImage },
    }[event.type] || { Icon: IoArrowUpOutline, color: "#FFBD21", bg: "bg-amber-50", img: null };
    const { Icon, color, bg, img } = config;

    return (
      <div className={`relative w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${bg}`}>
        <Icon className="text-base" style={{ color }} />
        {img && (
          <img
            src={img}
            alt={event.title}
            className="absolute inset-0 w-full h-full rounded-full object-cover bg-white z-10"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>
    );
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
      <div className="flex min-h-[320px] md:h-[470px] w-full flex-col bg-white py-4 md:py-5 px-3 md:px-4 rounded-[24px]">
        <div className="flexBetween">
          <h4 className="font-semibold text-base text-[#0A1629]">
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
    <div className="flex min-h-[320px] md:h-[470px] flex-col bg-white py-4 md:py-5 px-3 md:px-4 rounded-[24px]">
      <div className="flexBetween">
        <h4 className="font-semibold text-base text-[#0A1629]">Nearest Events</h4>
        <Link
          to={"/calender"}
          className="text-[#3F8CFF] text-xs cursor-pointer flexStart gap-x-2"
        >
          <span>View all</span>
          <MdOutlineKeyboardArrowRight />
        </Link>
      </div>
      <div className="w-full h-full overflow-y-auto mt-4 gap-y-2.5 flex flex-col pr-1">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-xs">No upcoming events this month</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={`${event.type}-${event.id}-${index}`}
              className="flex items-center gap-3 w-full cursor-pointer rounded-2xl bg-[#F4F6F8] hover:bg-[#EBEFF3] px-3 py-3 transition-colors"
              onClick={() => {
                if (event.type === "project") {
                  window.location.href = `/projects-analytics/${event.id}`;
                } else if (event.type === "task") {
                  window.location.href = `/projects/${event.projectId}/${event.id}`;
                }
              }}
            >
              {getEventAvatar(event)}
              <div className="flex flex-col min-w-0 flex-1">
                <p className="font-semibold text-sm text-[#0A1629] truncate">
                  {event.title}
                </p>
                <p className="text-xs text-[#7D8592] mt-0.5 truncate capitalize">
                  {getEventSubtitle(event)}
                </p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <p className="text-sm font-semibold text-[#0A1629]">
                  {getDateText(event.date)}
                </p>
                <p className="text-xs text-[#7D8592] mt-0.5">
                  {getTimeText(event.date)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NearestEvents;
