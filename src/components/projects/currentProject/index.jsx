import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";
const CurrentProject = ({ projects, selectProject }) => {
  return (
    <div
      className="col-span-1 bg-white overflow-hidden text-[#0A1629]
 rounded-3xl  flex flex-col "
    >
      <div className="flexCenter border-b  border-[#E4E6E8] gap-x-2 py-5">
        <button className="flexCenter cursor-pointer">
          <span className="font-medium ">Current Projects</span>
          <img src="/icons/arrowDown.svg" alt="" />
        </button>
      </div>
      {/* projects  */}
      <div
        className="flex flex-col h-full my-2 pl-2    
    gap-y-2 overflow-y-auto"
      >
        {/* project card  */}
        {projects?.map((project, index) => (
          <div
            key={index}
            className={`${
              selectProject === project?._id && `bg-[#F4F9FD]`
            }  hover:bg-[#F4F9FD] 
         cursor-pointer relative rounded-2xl px-4
          gap-y-1.5  group  mr-3 py-3 flex flex-col`}
          >
            <span className="text-xs uppercase text-[#91929E]">
              {project?._id.slice(0, 9)}
            </span>
            <h4 className="font-medium text-gray-800 text-sm">
              {project?.name}
            </h4>
            <Link
              to={`/projects/${project?._id}`}
              className="flexStart hover:underline w-fit cursor-pointer gap-x-1 text-[#3F8CFF]"
            >
              <span className="text-sm"> View details</span>
              <MdOutlineKeyboardArrowRight className="translate-y-0.5" />
            </Link>
            {/* the side bar  */}
            <div
              className={`absolute w-1 top-0  -right-3
          h-0 ${
            selectProject === project?._id && `h-full`
          } group-hover:h-full transition-all duration-300  bg-[#3F8CFF] rounded-full `}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentProject;
