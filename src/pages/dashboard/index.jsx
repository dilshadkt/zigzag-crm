import React, { lazy, Suspense, useState, useEffect } from "react";
import Header from "../../components/shared/header";
import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";
import WorkLoad from "../../components/dashboard/workload";
import PendingWork from "../../components/dashboard/workload/events";
import ActivityStream from "../../components/dashboard/activityStream";
import NearestEvents from "../../components/dashboard/nearestEvents";
// import EmployeeWorkDetails from "../../components/dashboard/employeeWorkDetails";
import { Link, useNavigate } from "react-router-dom";
import { useCompanyProjects, useGetEmployeeProjects } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import ProjectCard from "../../components/shared/projectCard";
import EmployeeProgressStats from "../../components/dashboard/employeeProgressStats";
import CompanyProgressStats from "../../components/dashboard/companyProgressStats";

// Lazy load the EmployeeWorkDetails component
const EmployeeWorkDetails = lazy(() =>
  import("../../components/dashboard/employeeWorkDetails")
);

const Dashboard = () => {
  const { companyId, user } = useAuth();
  const isEmployee = user?.role === "employee";
  const isCompanyAdmin = user?.role === "company-admin";

  // Get user-specific localStorage key
  const getStorageKey = (userId) => {
    return userId
      ? `dashboard-selected-date-${userId}`
      : "dashboard-selected-date";
  };

  // State for managing the selected month with persistence
  // Default to current date initially - will be updated when user loads
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
        // Validate that the date is valid
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      } else {
        // If no saved date for this user, default to current date
        setSelectedDate(new Date());
      }
    }
  }, [user?._id]); // Only run when user ID changes

  // Calculate taskMonth in YYYY-MM format
  const taskMonth = `${selectedDate.getFullYear()}-${(
    selectedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  // Fetch projects based on user role with month filter
  const { data: companyProjects } = useCompanyProjects(
    isEmployee ? null : companyId,
    3,
    taskMonth
  );
  const { data: employeeProjectsData } = useGetEmployeeProjects(
    isEmployee && user?._id ? user._id : null,
    taskMonth
  );

  // Determine which projects to show
  const projects = isEmployee
    ? employeeProjectsData?.projects?.slice(0, 3) || []
    : companyProjects || [];

  const navigate = useNavigate();

  // Persist the selected date whenever it changes (only if user is available)
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

  // Calculate date range for display (current month)
  const startOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  );

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
      <div className="flexBetween ">
        <div>
          <span className="text-sm md:text-base text-[#7D8592]">
            Welcome back,
            <span className="font-semibold text-gray-800 ml-2">
              {user?.firstName} !{/* <Header>Dashboard</Header> */}
            </span>
          </span>
        </div>
        <div
          className=" h-8 md:h-11 flexCenter text-sm gap-x-2 text-[#0A1629] px-3 md:px-5
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
              cursor-pointer hover:text-blue-600 transition-colors text-center flex-1 ${!isCurrentMonth ? "text-blue-600 font-medium" : ""
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

      {/* Progress Stats Section - Show different components based on user role */}
      <div className="w-full grid grid-cols-7 gap-x-6 mt-3">
        {isEmployee ? (
          <EmployeeProgressStats taskMonth={taskMonth} />
        ) : isCompanyAdmin ? (
          <CompanyProgressStats taskMonth={taskMonth} />
        ) : null}
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-6 mt-5">
        {/* work load section or employee work details */}
        {isEmployee ? (
          <Suspense fallback={<div>Loading Employee Work Details...</div>}>
            <EmployeeWorkDetails />
          </Suspense>
        ) : (
          <WorkLoad />
        )}

        {/* nearest event */}
        <PendingWork taskMonth={taskMonth} />
      </div>

      {/* Employee Progress Statistics - Only for employees */}

      <div
        className={`w-full grid gap-y-5 md:gap-x-6 mt-5 ${isEmployee ? "grid-cols-1" : " grid-cols-1  md:grid-cols-7"
          }`}
      >
        <div
          className={`md:px-4 md:h-[470px] pb-3 pt-5 flex flex-col rounded-3xl ${isEmployee ? "col-span-1" : " col-span-1 md:col-span-5"
            }`}
        >
          <div className="flexBetween w-full ">
            <h4 className="font-semibold text-lg text-gray-800">
              {isEmployee ? "My Projects" : "Projects"}
            </h4>
            <Link
              to={isEmployee ? "/my-projects" : "/projects-analytics"}
              className="text-[#3F8CFF] text-sm cursor-pointer flexStart gap-x-2"
            >
              <span>View all</span>
              <MdOutlineKeyboardArrowRight />
            </Link>
          </div>
          {/* project list section  */}
          <div className=" flex flex-col h-full gap-y-2 md:gap-y-3 mt-3">
            {projects?.length > 0 ? (
              projects.map((project, index) => (
                <ProjectCard
                  key={project?._id}
                  project={project}
                  onClick={() => {
                    if (user?.role === "employee") {
                      navigate(`/projects/${project?._id}`);
                    } else {
                      navigate(`/projects-analytics/${project?._id}`);
                    }
                  }}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  {isEmployee
                    ? "No projects assigned to you"
                    : "No projects available"}
                </p>
              </div>
            )}
          </div>
        </div>
        {/* activity stream and nearest events - only show for non-employees */}
        {!isEmployee && (
          <div className="flex flex-col gap-5 md:col-span-2">
            <ActivityStream />
            <NearestEvents selectedDate={selectedDate} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
