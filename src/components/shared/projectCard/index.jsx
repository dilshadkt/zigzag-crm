import React from "react";
import { IoArrowUpOutline } from "react-icons/io5";

const ProjectCard = ({ project, onClick }) => {
  return (
    <div
      key={project?._id}
      className="flex flex-col cursor-pointer   h-fit "
      onClick={onClick}
    >
      <div className="bg-white   rounded-3xl grid grid-cols-2">
        <div className="p-4  py-5 h-full flex gap-y-4 flex-col border-r border-[#E4E6E8] ">
          <div className="flexStart  gap-x-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden">
              <img
                src={project?.thumbImg}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col h-full">
              <span className="text-xs uppercase text-[#91929E]">
                {project?._id?.slice(0, 8)}
              </span>
              <h4 className=" font-medium text-gray-800">{project?.name}</h4>
            </div>
          </div>
          <div className="flexBetween">
            <div className="flexStart gap-x-2">
              <img src="/icons/calender2.svg" alt="" className="w-5" />
              <span className="text-xs text-[#7D8592]">
                Created Sep 12, 2020
              </span>
            </div>
            <div className="flexEnd text-[#FFBD21] text-xs gap-x-2 pr-2">
              <IoArrowUpOutline className="text-lg" />
              <span>{project?.status}</span>
            </div>
          </div>
        </div>
        <div className="px-8 flex flex-col  gap-y-3 justify-center items-center">
          <h5 className="font-medium w-full">Project Data</h5>
          <div className="w-full grid grid-cols-3 ">
            <div className="flex flex-col gap-y-2">
              <span className="text-[#91929E]/90 text-sm">All Tasks</span>
              <span className="font-semibold text-gray-800 text-lg">
                {project?.tasks?.length}
              </span>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="text-[#91929E]/90 text-sm">Active tasks</span>
              <span className="font-semibold text-gray-800 text-lg">
                {project?.tasks?.length}
              </span>
            </div>
            <div className="flex flex-col    gap-y-2">
              <span className="text-[#91929E]/90 text-sm">Assignees</span>
              <div className="font-semibold flexStart  text-gray-800 text-lg">
                {project?.teams?.map((team, index) => (
                  <div
                    key={index}
                    className=" w-7 h-7 rounded-full overflow-hidden  border-3 border-white  "
                  >
                    <img
                      src={team?.profileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
