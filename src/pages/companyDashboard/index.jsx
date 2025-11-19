import React, { useState, useEffect } from "react";
import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";
import CompanyProgressStats from "../../components/dashboard/companyProgressStats";
import WorkLoad from "../../components/dashboard/workload";
import NearestEvents from "../../components/dashboard/workload/events";
import ActivityStream from "../../components/dashboard/activityStream";
import { Link } from "react-router-dom";
import { useCompanyProjects } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import ProjectCard from "../../components/shared/projectCard";
import { useNavigate } from "react-router-dom";

const CompanyDashboard = () => {
  const { companyId, user } = useAuth();
  const navigate = useNavigate();

  // Debug: Log companyId to ensure it's available
  useEffect(() => {
    if (!companyId) {
      console.warn("CompanyDashboard: companyId is not available");
    }
  }, [companyId]);

  // Get user-specific localStorage key
  const getStorageKey = (userId) => {
    return userId
      ? `company-dashboard-selected-date-${userId}`
      : "company-dashboard-selected-date";
  };

  // State for managing the selected month with persistence
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date();
  });

  // Initialize selectedDate from localStorage when user is available
  useEffect(() => {
    if (user?._id) {
      const storageKey = getStorageKey(user._id);
      const savedDate = localStorage.getItem(storageKey);
      if (savedDate) {
        const parsedDate = new Date(savedDate);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      } else {
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

  // Fetch company projects - no limit for company dashboard to show all projects
  const {
    data: companyProjects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useCompanyProjects(
    companyId,
    0, // 0 means no limit - show all projects
    taskMonth
  );

  // Debug: Log projects data to help troubleshoot
  useEffect(() => {
    if (companyProjects !== undefined) {
      console.log("CompanyDashboard - Projects data:", {
        companyProjects,
        isArray: Array.isArray(companyProjects),
        length: Array.isArray(companyProjects) ? companyProjects.length : "N/A",
        companyId,
        taskMonth,
      });
    }
    if (projectsError) {
      console.error("CompanyDashboard - Projects error:", projectsError);
    }
  }, [companyProjects, projectsError, companyId, taskMonth]);

  // Ensure projects is always an array
  const projects = Array.isArray(companyProjects) ? companyProjects : [];

  // Persist the selected date whenever it changes
  useEffect(() => {
    if (user?._id) {
      const storageKey = getStorageKey(user._id);
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

  return (
    <section className="flex flex-col">
      <div className="flexBetween">
        <div>
          <span className="text-sm md:text-base text-[#7D8592]">
            Company Dashboard
            <span className="font-semibold text-gray-800 ml-2">
              {user?.firstName}!
            </span>
          </span>
        </div>
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

      {/* Company Progress Stats Section */}
      <div className="w-full grid grid-cols-7 gap-x-6 mt-3">
        <CompanyProgressStats taskMonth={taskMonth} />
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-6 mt-5">
        {/* Workload section */}
        <WorkLoad />

        {/* Nearest event */}
        <NearestEvents />
      </div>

      {/* Projects Section */}
      <div className="w-full grid gap-y-5 md:gap-x-6 mt-5 grid-cols-1 md:grid-cols-7">
        <div className="md:px-4 md:h-[470px] pb-3 pt-5 flex flex-col rounded-3xl col-span-1 md:col-span-5">
          <div className="flexBetween w-full">
            <h4 className="font-semibold text-lg text-gray-800">Projects</h4>
            <Link
              to="/projects-analytics"
              className="text-[#3F8CFF] text-sm cursor-pointer flexStart gap-x-2"
            >
              <span>View all</span>
              <MdOutlineKeyboardArrowRight />
            </Link>
          </div>
          {/* Project list section */}
          <div className="flex flex-col h-full gap-y-2 md:gap-y-3 mt-3">
            {isLoadingProjects ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard
                  key={project?._id}
                  project={project}
                  onClick={() => {
                    navigate(`/projects-analytics/${project?._id}`);
                  }}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  No projects available
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Activity stream */}
        <ActivityStream />
      </div>
    </section>
  );
};

export default CompanyDashboard;
