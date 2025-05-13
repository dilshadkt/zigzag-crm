import React from "react";
import Header from "../../components/shared/header";
import { useCompanyProjects } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import ProjectCard from "../../components/shared/projectCard";
import { useNavigate } from "react-router-dom";

const ProjectsAnalytics = () => {
  const { companyId } = useAuth();
  const { data: projects, isLoading } = useCompanyProjects(companyId);
  const navigate = useNavigate();
  const handleProjectClick = (projectId) => {
    navigate(`/projects-analytics/${projectId}`);
  };

  return (
    <section className="flex flex-col">
      <Header>Projects ({projects?.length})</Header>
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
