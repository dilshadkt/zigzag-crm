import React, { useState, useEffect } from "react";
import Header from "../../components/shared/header";
import { useCompanyProjects } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import ProjectCard from "../../components/shared/projectCard";
import { useNavigate } from "react-router-dom";
import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";

const ProjectsAnalytics = () => {
  const { companyId, user } = useAuth();
  const navigate = useNavigate();

  // State for managing the selected month - default to current date
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date();
  });

  // Initialize selectedDate from localStorage when user is available
  useEffect(() => {
    if (user?._id) {
      const storageKey = `projectAnalytics-selected-date-${user._id}`;
      const savedDate = localStorage.getItem(storageKey);
      if (savedDate) {
        const parsedDate = new Date(savedDate);
        // Validate that the date is valid
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      } else {
        // If no saved date for this user, default to current date
        setSelectedDate(new Date());
      }
    }
  }, [user?._id]);

  // Calculate taskMonth in YYYY-MM format
  const taskMonth = `${selectedDate.getFullYear()}-${(
    selectedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  // Fetch projects with month filter
  const { data: projects, isLoading } = useCompanyProjects(
    companyId,
    0,
    taskMonth
  );

  // Persist the selected date whenever it changes (only if user is available)
  useEffect(() => {
    if (user?._id) {
      const storageKey = `projectAnalytics-selected-date-${user._id}`;
      localStorage.setItem(storageKey, selectedDate.toISOString());
    }
  }, [selectedDate, user?._id]);

  // Navigation functions for month selection
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const resetToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  // Display only the month name and year
  const dateRange = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Check if the selected month is different from current month
  const isCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  const handleProjectClick = (projectId) => {
    navigate(`/projects-analytics/${projectId}`);
  };

  return (
    <section className="flex flex-col">
      <div className="flexBetween">
        <Header>Projects ({projects?.length || 0})</Header>
        <div
          className="h-8 md:h-11 flexCenter text-sm gap-x-2 text-[#0A1629] px-3 md:px-5
         rounded-md md:rounded-[14px] w-fit bg-[#E6EDF5]"
        >
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Previous month"
          >
            <MdOutlineKeyboardArrowLeft className="w-4 h-4" />
          </button>
          <img src="/icons/calender.svg" alt="" className="w-4 md:w-5" />
          <span
            className={`text-xs whitespace-nowrap md:text-base 
              cursor-pointer hover:text-blue-600 transition-colors text-center flex-1 ${
                !isCurrentMonth ? "text-blue-600 font-medium" : ""
              }`}
            onClick={resetToCurrentMonth}
            title={
              !isCurrentMonth
                ? "Click to reset to current month"
                : "Current month"
            }
          >
            {dateRange}
            {!isCurrentMonth && <span className="ml-1 text-xs">(Viewing)</span>}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Next month"
          >
            <MdOutlineKeyboardArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="mt-5">
        {isLoading ? (
          <div className="text-center">Loading projects...</div>
        ) : (
          <div className="flex flex-col gap-y-3">
            {projects?.map((project) => (
              <ProjectCard
                key={project?._id}
                project={project}
                viewMore
                onClick={() => handleProjectClick(project?._id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsAnalytics;
