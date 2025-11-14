import React from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../shared/projectCard";

const Projects = ({ projects, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        Loading projects...
      </div>
    );
  }

  if (projects?.length === 0) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        No projects found for this employee
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {projects?.map((project) => (
        <ProjectCard
          key={project?._id}
          project={project}
          onClick={() => navigate(`/projects/${project?._id}`)}
        />
      ))}
    </div>
  );
};

export default Projects;
