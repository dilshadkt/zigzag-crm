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
} from "date-fns";
import { IoArrowUpOutline } from "react-icons/io5";
import { useGetProjectsDueThisMonth } from "../../api/hooks";
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

// Default color for projects with undefined priority
const defaultColor = {
  bg: "bg-blue-50",
  text: "text-blue-800",
  border: "border-blue-200",
  dot: "bg-blue-500",
  progress: "bg-blue-400",
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: projectsData, isLoading } =
    useGetProjectsDueThisMonth(currentDate);
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

  const getProjectsForDate = (date) => {
    if (!date || !projectsData?.projects) return [];
    return projectsData.projects.filter((project) =>
      isSameDay(new Date(project.endDate), date)
    );
  };

  // Get appropriate styling based on project priority
  const getProjectStyle = (priority) => {
    return priorityColors[priority?.toLowerCase()] || defaultColor;
  };

  // Truncate text with ellipsis if longer than specified length
  const truncateText = (text, maxLength = 15) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Format date to display in a readable format
  const formatProjectDate = (dateString) => {
    return format(new Date(dateString), "MMM d");
  };

  // Day name headers for the calendar
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

              {/* Projects for this date */}
              {item?.fullDate && (
                <div className="mt-8 flex flex-col gap-1 pr-1">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded-md mb-1"></div>
                      <div className="h-6 bg-gray-200 rounded-md"></div>
                    </div>
                  ) : (
                    getProjectsForDate(item.fullDate).map((project, idx) => {
                      const colorStyle = getProjectStyle(project.priority);
                      const progress = project.progress || 0;

                      return (
                        <div
                          onClick={() => {
                            navigate(`/projects-analytics/${project?._id}`);
                          }}
                          key={idx}
                          className={`text-xs ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} border 
                          rounded-md px-2 py-1.5 cursor-pointer hover:shadow-sm transition-all 
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
                          <div className="flex items-center gap-1.5 relative z-10">
                            <span
                              className={`h-2 w-2 rounded-full ${colorStyle.dot} flex-shrink-0`}
                            ></span>
                            <span className="truncate">
                              {truncateText(project.name)}
                            </span>
                            <span className="text-xs font-semibold ml-auto">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Calendar;
