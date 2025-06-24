import React, { lazy, Suspense } from "react";
import Header from "../../components/shared/header";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import WorkLoad from "../../components/dashboard/workload";
import NearestEvents from "../../components/dashboard/workload/events";
import ActivityStream from "../../components/dashboard/activityStream";
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

  // Fetch projects based on user role
  const { data: companyProjects } = useCompanyProjects(
    isEmployee ? null : companyId,
    3
  );
  const { data: employeeProjectsData } = useGetEmployeeProjects(
    isEmployee && user?._id ? user._id : null
  );

  // Determine which projects to show
  const projects = isEmployee
    ? employeeProjectsData?.projects?.slice(0, 3) || []
    : companyProjects || [];

  const navigate = useNavigate();

  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const dateRange = `${formatDate(lastMonth)} - ${formatDate(today)}`;

  return (
    <section className="flex flex-col">
      <span className="text-[#7D8592]">Welcome back, {user?.firstName} !</span>
      <div className="flexBetween ">
        <Header>Dashboard</Header>
        <div
          className="h-11 flexCenter text-sm gap-x-2 text-[#0A1629] px-5
         rounded-[14px] w-fit bg-[#E6EDF5]"
        >
          <img src="/icons/calender.svg" alt="" className="w-5" />
          <span>{dateRange}</span>
        </div>
      </div>

      {/* Progress Stats Section - Show different components based on user role */}
      <div className="w-full grid grid-cols-7 gap-x-6 mt-5">
        {isEmployee ? (
          <EmployeeProgressStats />
        ) : isCompanyAdmin ? (
          <CompanyProgressStats />
        ) : null}
      </div>

      <div className="w-full grid grid-cols-7 gap-x-6 mt-5">
        {/* work load section or employee work details */}
        {isEmployee ? (
          <Suspense fallback={<div>Loading Employee Work Details...</div>}>
            <EmployeeWorkDetails />
          </Suspense>
        ) : (
          <WorkLoad />
        )}

        {/* nearest event */}
        <NearestEvents />
      </div>

      {/* Employee Progress Statistics - Only for employees */}

      <div
        className={`w-full grid gap-x-6 mt-5 ${
          isEmployee ? "grid-cols-1" : "grid-cols-7"
        }`}
      >
        <div
          className={`px-4 h-[470px] pb-3 pt-5 flex flex-col rounded-3xl ${
            isEmployee ? "col-span-1" : "col-span-5"
          }`}
        >
          <div className="flexBetween">
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
          <div className=" flex flex-col h-full gap-y-3 mt-3">
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
        {/* activity stream - only show for non-employees */}
        {!isEmployee && <ActivityStream />}
      </div>
    </section>
  );
};

export default Dashboard;
