import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import ProjectCard from "../../shared/projectCard";
import DashboardCampaigns from "../campaigns";
import ActivityStream from "../activityStream";
import NearestEvents from "../nearestEvents";

const DashboardProjects = ({
  isEmployee,
  projects,
  user,
  isCompanyAdmin,
  canViewCampaignDetails,
  selectedDate,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`w-full grid gap-y-5 md:gap-x-6 mt-5 ${
        isEmployee ? "grid-cols-1" : " grid-cols-1  md:grid-cols-7"
      }`}
    >
      <div
        className={` md:h-[470px] pb-3 pt-5 flex flex-col rounded-3xl ${
          isEmployee ? "col-span-1" : " col-span-1 md:col-span-5"
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
            projects.slice(0, 3).map((project, index) => (
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
        {/* Campaigns Section */}
        {(isCompanyAdmin || canViewCampaignDetails) && <DashboardCampaigns />}
      </div>
      {/* activity stream and nearest events - only show for non-employees */}
      {!isEmployee && (
        <div className="flex flex-col gap-5 md:col-span-2">
          <ActivityStream />
          <NearestEvents selectedDate={selectedDate} />
        </div>
      )}
    </div>
  );
};

export default DashboardProjects;
