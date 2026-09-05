import React, { useMemo, useState } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setActiveProject } from "../../../store/slice/projectSlice";

const CurrentProject = ({
  projects,
  selectProject,
  onProjectSelect,
  className = "",
}) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) => {
      const name = project?.name?.toLowerCase() || "";
      const code = project?._id?.toLowerCase() || "";
      return name.includes(query) || code.includes(query);
    });
  }, [projects, searchTerm]);

  const handleSelect = (projectId) => {
    dispatch(setActiveProject(projectId));
    onProjectSelect?.();
  };

  return (
    <div
      className={`col-span-1 w-full min-w-0 md:bg-white md:overflow-hidden text-[#0A1629]
 rounded-2xl md:rounded-3xl flex-col h-full min-h-0 ${className || "flex"}`}
    >
      <div className="border-b flex items-center px-3 md:px-4 border-[#E4E6E8] gap-x-2 py-3 md:py-5 shrink-0">
        <label className="w-full text-sm text-[#91929E]">
          <span className="sr-only">Search projects</span>
          <div className="flex items-center gap-2 rounded-full bg-white md:bg-[#F5F7FA] px-3 py-2.5 md:py-2 border border-[#E4E6E8] md:border-0">
            <img src="/icons/search.svg" alt="" className="h-4 w-4 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects"
              className="w-full bg-transparent text-sm text-[#0A1629] placeholder:text-[#91929E] focus:outline-none"
            />
          </div>
        </label>
      </div>
      {/* projects  */}
      <div
        className="flex flex-col flex-1 my-2 md:pl-2
    gap-y-2 overflow-y-auto min-h-0"
      >
        {filteredProjects?.map((project, index) => (
          <div
            onClick={() => handleSelect(project?._id)}
            key={project?._id || index}
            className={`${
              selectProject === project?._id
                ? ` bg-white md:bg-[#F4F9FD]`
                : `bg-white md:bg-transparent`
            }  hover:bg-[#F4F9FD] shrink-0
         cursor-pointer  relative rounded-2xl px-4
          gap-y-1.5  group  md:mr-3 py-3 flex flex-col ${
            project?.status === "paused" ? "opacity-50" : ""
          }`}
          >
            <span className="text-xs uppercase text-[#91929E]">
              {project?._id?.slice(0, 9)}
            </span>
            <h4 className="font-medium text-gray-800 text-[13px] leading-snug">
              {project?.name}
            </h4>
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/projects/${project?._id}`}
                onClick={(e) => e.stopPropagation()}
                className="flexStart hover:underline w-fit cursor-pointer gap-x-1 text-[#3F8CFF]"
              >
                <span className="text-sm">View details</span>
                <MdOutlineKeyboardArrowRight className="translate-y-0.5" />
              </Link>
              <span className="md:hidden text-xs text-[#3F8CFF] font-medium flex items-center gap-0.5">
                Open
                <MdOutlineKeyboardArrowRight />
              </span>
            </div>
            {/* the side bar  */}
            <div
              className={`absolute w-1 top-0  left-0 md:left-auto md:-right-3
          h-0 ${
            selectProject === project?._id && `h-full`
          } group-hover:h-full transition-all duration-300  bg-[#3F8CFF] rounded-full `}
            ></div>
          </div>
        ))}
        {filteredProjects?.length === 0 && (
          <div className="text-center text-sm text-[#91929E] py-10">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentProject;
