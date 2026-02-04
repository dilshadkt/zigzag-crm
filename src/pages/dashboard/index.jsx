import React, { lazy, Suspense, useState } from "react";
import Header from "../../components/shared/header";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import WorkLoad from "../../components/dashboard/workload";
import PendingWork from "../../components/dashboard/workload/events";
import NearestEvents from "../../components/dashboard/nearestEvents";
// import EmployeeWorkDetails from "../../components/dashboard/employeeWorkDetails";
import { useCompanyProjects, useGetEmployeeProjects } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import EmployeeProgressStats from "../../components/dashboard/employeeProgressStats";
import CompanyProgressStats from "../../components/dashboard/companyProgressStats";
import DashboardProjects from "../../components/dashboard/dashboardProjects";

// Lazy load the EmployeeWorkDetails component
const EmployeeWorkDetails = lazy(() =>
  import("../../components/dashboard/employeeWorkDetails")
);

import DailyChecklistDrawer from "../../components/dashboard/dailyChecklist/DailyChecklistDrawer";

const Dashboard = () => {
  const { companyId, user } = useAuth();
  const { hasPermission } = usePermissions();

  // Permission checks
  const canEditTasks = hasPermission("tasks", "edit");
  const canCreateTask = hasPermission("tasks", "create");
  // User is considered "privileged" if they can both create and edit tasks
  const isPrivilegedUser = canEditTasks && canCreateTask;
  // If user is employee but has task admin privileges, treat them as non-employee (admin-view) for dashboard
  const isEmployee = user?.role === "employee";
  const isEmployeeHasTaskAdmin = isEmployee && isPrivilegedUser;


  const isCompanyAdmin = user?.role === "company-admin";

  // Check if user has permission to view daily checklist
  const canViewDailyChecklist = hasPermission("dashboard", "viewDailyChecklist");

  // Check if user has permission to view campaign details
  const canViewCampaignDetails = hasPermission("dashboard", "viewCampaignDetails");
  // State for managing the selected month
  // Default to current date initially
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date();
  });

  // Calculate taskMonth in YYYY-MM format
  const taskMonth = `${selectedDate.getFullYear()}-${(
    selectedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  // Fetch projects based on user role with month filter
  const { data: companyProjects } = useCompanyProjects(
    isEmployee ? null : companyId,
    taskMonth
  );
  const { data: employeeProjectsData } = useGetEmployeeProjects(
    isEmployee && user?._id ? user._id : null,
    taskMonth
  );

  // Determine which projects to show - For Checklist using ALL projects not just sliced ones
  // We need a list of ALL active projects for the checklist, not just the top 3
  // However, useGetEmployeeProjects by default might return all or paginated.
  // The slice(0,3) is only for display on dashboard cards.
  // We should pass the FULL list to the drawer.
  const projectsForChecklist = isEmployee
    ? employeeProjectsData?.projects || []
    : companyProjects || []; // Admin sees company projects
  const projects = isEmployee
    ? employeeProjectsData?.projects?.slice(0, 3) || []
    : companyProjects || [];

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
          <img src="/icons/calender.svg" alt="" loading="lazy" className="w-4 md:w-5" />
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
        {isEmployee ? (
          <NearestEvents selectedDate={selectedDate} />
        ) : (
          <PendingWork taskMonth={taskMonth} />
        )}
      </div>

      {/* Employee Progress Statistics - Only for employees */}

      <DashboardProjects
        isEmployee={isEmployee}
        projects={projects}
        user={user}
        isCompanyAdmin={isCompanyAdmin}
        canViewCampaignDetails={canViewCampaignDetails}
        selectedDate={selectedDate}
      />

      {/* Daily Checklist Drawer - Passing projectsForChecklist to ensure all projects are considered, not just the sliced ones */}
      {canViewDailyChecklist && (
        <DailyChecklistDrawer projects={projectsForChecklist}

        />
      )}
    </section>
  );
};

export default Dashboard;
