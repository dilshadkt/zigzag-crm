import React, { useState } from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
} from "date-fns";
import { IoArrowUpOutline } from "react-icons/io5";
import { FaGift } from "react-icons/fa";
import {
  useGetProjectsDueThisMonth,
  useGetTasksDueThisMonth,
  useGetEmployeeBirthdays,
} from "../../api/hooks";
import { useNavigate } from "react-router-dom";
// Priority color mapping for visual distinction
const priorityColors = {
  low: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    progress: "bg-emerald-400",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
    progress: "bg-amber-400",
  },
  high: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
    progress: "bg-rose-400",
  },
};

// Status color mapping for tasks
const statusColors = {
  todo: {
    bg: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
    dot: "bg-gray-500",
  },
  "in-progress": {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    dot: "bg-green-500",
  },
};

// Colors for birthday items
const birthdayColors = {
  bg: "bg-purple-50",
  text: "text-purple-800",
  border: "border-purple-200",
  dot: "bg-purple-500",
};

// Default color for projects with undefined priority
const defaultColor = {
  bg: "bg-blue-50",
  text: "text-blue-800",
  border: "border-blue-200",
  dot: "bg-blue-500",
  progress: "bg-blue-400",
};

// Maximum number of items to display per day before showing a "more" indicator
const MAX_ITEMS_PER_DAY = 3;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDay, setExpandedDay] = useState(null);
  const { data: projectsData, isLoading: projectsLoading } =
    useGetProjectsDueThisMonth(currentDate);
  const { data: tasksData, isLoading: tasksLoading } =
    useGetTasksDueThisMonth(currentDate);
  const { data: birthdaysData, isLoading: birthdaysLoading } =
    useGetEmployeeBirthdays(currentDate);
  const navigate = useNavigate();

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Calculate day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Generate blank days to fill the calendar grid properly
  const blankDays = Array(firstDayOfWeek)
    .fill(null)
    .map((_, index) => ({ day: "", date: "", fullDate: null }));

  // Days in the current month
  const calendarDays = [
    ...blankDays,
    ...daysInMonth.map((date) => ({
      day: format(date, "EEE"),
      date: format(date, "d"),
      fullDate: date,
    })),
  ];

  // Determine if a date is today
  const isToday = (date) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  // Get items (projects, tasks, birthdays) for a specific date
  const getItemsForDate = (date) => {
    if (!date) return { projects: [], tasks: [], birthdays: [] };

    const projects = projectsData?.projects
      ? projectsData.projects.filter((project) =>
          isSameDay(new Date(project.endDate), date)
        )
      : [];

    const tasks = tasksData?.tasks
      ? tasksData.tasks.filter((task) =>
          isSameDay(new Date(task.dueDate), date)
        )
      : [];

    // Get employee birthdays for this date
    const birthdays = birthdaysData?.birthdays
      ? birthdaysData.birthdays.filter((birthday) => {
          const dobDate = new Date(birthday.dob);
          return dobDate.getDate() === date.getDate();
        })
      : [];

    return { projects, tasks, birthdays };
  };

  // Get appropriate styling based on priority
  const getProjectStyle = (priority) => {
    return priorityColors[priority?.toLowerCase()] || defaultColor;
  };

  // Get styling for tasks based on status
  const getTaskStyle = (task) => {
    // First try to get style by status
    const statusStyle = statusColors[task.status] || statusColors.todo;

    // If high priority, override with priority color
    if (task.priority?.toLowerCase() === "high") {
      return priorityColors.high;
    }

    return statusStyle;
  };

  // Truncate text with ellipsis if longer than specified length
  const truncateText = (text, maxLength = 15) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Toggle expanded view for a day
  const toggleExpandDay = (date) => {
    if (expandedDay && isSameDay(expandedDay, date)) {
      setExpandedDay(null);
    } else {
      setExpandedDay(date);
    }
  };

  // Day name headers for the calendar
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isLoading = projectsLoading || tasksLoading || birthdaysLoading;

  // Render a project item in the calendar
  const renderProjectItem = (project, idx) => {
    const colorStyle = getProjectStyle(project.priority);
    const progress = project.progress || 0;
    const hasThumb = project.thumbImg && project.thumbImg.trim() !== "";

    return (
      <div
        onClick={() => {
          navigate(`/projects-analytics/${project?._id}`);
        }}
        key={`project-${idx}`}
        className={`text-xs ${hasThumb ? "" : colorStyle.bg} ${
          colorStyle.text
        } ${colorStyle.border} border 
        rounded-md cursor-pointer hover:shadow-sm transition-all 
        duration-200 relative overflow-hidden`}
        title={`${project.name} (${
          project.priority || "medium"
        } priority) - ${progress}% complete`}
      >
        {/* Progress bar in background */}
        <div
          className={`absolute left-0 top-0 bottom-0 ${colorStyle.progress} opacity-30`}
          style={{ width: `${progress}%` }}
        ></div>

        {/* Content on top of progress bar */}
        {hasThumb ? (
          <div className="flex items-center relative z-10">
            <div className="w-6 h-6 flex-shrink-0">
              <img
                src={project.thumbImg}
                alt={project.name}
                className="w-full h-full rounded-l-md object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/icons/project-default.svg";
                }}
              />
            </div>
            <div className="flex-1 px-1.5 py-1 flex items-center justify-between">
              <span className="truncate">{truncateText(project.name)}</span>
              <span className="text-xs font-semibold ml-1">{progress}%</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 relative z-10 px-2 py-1.5">
            <span
              className={`h-2 w-2 rounded-full ${colorStyle.dot} flex-shrink-0`}
            ></span>
            <span className="truncate">{truncateText(project.name)}</span>
            <span className="text-xs font-semibold ml-auto">{progress}%</span>
          </div>
        )}
      </div>
    );
  };

  // Render a task item in the calendar
  const renderTaskItem = (task, idx) => {
    const colorStyle = getTaskStyle(task);
    const statusText =
      {
        todo: "To Do",
        "in-progress": "In Progress",
        completed: "Done",
      }[task.status] || "To Do";

    return (
      <div
        onClick={() => {
          navigate(`/projects/${task.project?.name}/${task?._id}`);
        }}
        key={`task-${idx}`}
        className={`text-xs ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} border 
        rounded-md px-2 py-1.5 cursor-pointer hover:shadow-sm transition-all 
        duration-200 relative overflow-hidden mt-1`}
        title={`Task: ${task.title} (${
          task.priority || "medium"
        } priority) - Status: ${statusText} - Project: ${task.project?.name}`}
      >
        <div className="flex items-center gap-1.5 relative z-10">
          <span
            className={`h-2 w-2 rounded-full ${colorStyle.dot} flex-shrink-0`}
          ></span>
          <span className="truncate flex-1">{truncateText(task.title)}</span>
          <span className="text-xs italic opacity-75 ml-auto">
            {statusText}
          </span>
        </div>
      </div>
    );
  };

  // Render a birthday item in the calendar
  const renderBirthdayItem = (employee, idx) => {
    // Get first letter of name for avatar fallback
    const firstLetter = employee.firstName
      ? employee.firstName.charAt(0).toUpperCase()
      : "U";

    return (
      <div
        key={`birthday-${idx}`}
        className={`text-xs ${birthdayColors.bg} ${birthdayColors.text} ${birthdayColors.border} border 
        rounded-md cursor-pointer hover:shadow-sm transition-all 
        duration-200 relative overflow-hidden mt-1`}
        title={`Happy ${employee.age}th Birthday to ${employee.firstName} ${
          employee.lastName || ""
        }!`}
      >
        <div className="flex items-center gap-1.5 p-1.5 relative z-10">
          <div className="flex-shrink-0 relative">
            {employee.profileImage ? (
              <img
                src={employee.profileImage}
                alt={`${employee.firstName}'s birthday`}
                className="w-5 h-5 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12" font-family="Arial" fill="white">${firstLetter}</text></svg>`;
                }}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                {firstLetter}
              </div>
            )}
            <FaGift className="absolute -bottom-1 -right-1 text-[10px] text-purple-500" />
          </div>
          <span className="truncate flex-1">
            {truncateText(`${employee.firstName}'s Birthday!`)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="flexBetween">
        <Header>Calendar</Header>
        <PrimaryButton
          icon={"/icons/add.svg"}
          title={"Add Event"}
          className={"mt-3 text-white"}
        />
      </div>
      <div className="w-full h-full flex flex-col mt-3 overflow-hidden bg-white rounded-3xl shadow-sm">
        {/* Calendar Header */}
        <div className="min-h-[72px] flexCenter border-b border-[#E6EBF5]">
          <div className="flexCenter gap-x-8">
            <button
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flexCenter transition-all duration-200"
              disabled={isLoading}
            >
              <IoArrowUpOutline className="-rotate-90 text-xl text-[#3F8CFF]" />
            </button>
            <span className="text-lg w-[200px] flexCenter font-medium">
              {format(firstDay, "MMMM yyyy")}
            </span>
            <button
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flexCenter transition-all duration-200"
              disabled={isLoading}
            >
              <IoArrowUpOutline className="rotate-90 text-xl text-[#3F8CFF]" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-[#E6EBF5]">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="h-10 flexCenter text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="w-full h-full overflow-y-auto grid grid-cols-7">
          {calendarDays.map((item, index) => (
            <div
              key={index}
              className={`min-h-[120px] border border-[#E6EBF5] relative p-1
                ${isToday(item.fullDate) ? "bg-blue-50" : ""}
                ${
                  expandedDay &&
                  item.fullDate &&
                  isSameDay(expandedDay, item.fullDate)
                    ? "z-10"
                    : ""
                }
              `}
            >
              {/* Date Number */}
              {item?.date && (
                <div
                  className={`w-6 h-6 rounded-full ${
                    isToday(item.fullDate)
                      ? "bg-blue-500 text-white"
                      : "text-gray-600"
                  } 
                  text-sm font-medium flexCenter absolute top-1 right-1`}
                >
                  {item.date}
                </div>
              )}

              {/* Projects, Tasks and Birthdays for this date */}
              {item?.fullDate && (
                <div className="mt-8 flex flex-col gap-1 pr-1">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded-md mb-1"></div>
                      <div className="h-6 bg-gray-200 rounded-md"></div>
                    </div>
                  ) : (
                    (() => {
                      // Get all items for this date
                      const { projects, tasks, birthdays } = getItemsForDate(
                        item.fullDate
                      );
                      const totalItems =
                        projects.length + tasks.length + birthdays.length;
                      const isExpanded =
                        expandedDay && isSameDay(expandedDay, item.fullDate);

                      // Determine which items to display
                      const itemsToShow = isExpanded
                        ? totalItems
                        : Math.min(totalItems, MAX_ITEMS_PER_DAY);
                      const hasMore =
                        totalItems > MAX_ITEMS_PER_DAY && !isExpanded;

                      // Combine and sort all items (showing birthdays first, then projects, then tasks)
                      const displayItems = [
                        ...birthdays.map((item, idx) => ({
                          type: "birthday",
                          data: item,
                          idx,
                        })),
                        ...projects.map((item, idx) => ({
                          type: "project",
                          data: item,
                          idx,
                        })),
                        ...tasks.map((item, idx) => ({
                          type: "task",
                          data: item,
                          idx,
                        })),
                      ].slice(0, itemsToShow);

                      return (
                        <>
                          {/* Display the combined list of birthdays, projects and tasks */}
                          {displayItems.map((item) => {
                            if (item.type === "project") {
                              return renderProjectItem(item.data, item.idx);
                            } else if (item.type === "task") {
                              return renderTaskItem(item.data, item.idx);
                            } else if (item.type === "birthday") {
                              return renderBirthdayItem(item.data, item.idx);
                            }
                            return null;
                          })}

                          {/* Show "more" indicator if needed */}
                          {hasMore && (
                            <div
                              onClick={() => toggleExpandDay(item.fullDate)}
                              className="text-xs bg-gray-100 text-gray-700 rounded-md px-2 py-1.5 mt-1 
                                        cursor-pointer hover:bg-gray-200 text-center font-medium"
                            >
                              +{totalItems - MAX_ITEMS_PER_DAY} more
                            </div>
                          )}

                          {/* Show "show less" if expanded */}
                          {isExpanded && (
                            <div
                              onClick={() => setExpandedDay(null)}
                              className="text-xs bg-gray-100 text-gray-700 rounded-md px-2 py-1 mt-1 
                                        cursor-pointer hover:bg-gray-200 text-center"
                            >
                              Show less
                            </div>
                          )}
                        </>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Day detail modal/popup could be added here if needed */}
    </section>
  );
};

export default Calendar;
