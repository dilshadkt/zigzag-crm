import React from "react";
import { useProjectDetails } from "../../api/hooks";
import ProjectOverView from "../../components/projects/projectOverview";
import { useProject } from "../../hooks/useProject";
import { useAuth } from "../../hooks/useAuth";

const ProjectDetails = () => {
  const { activeProject } = useProject();
  const { data } = useProjectDetails(activeProject);

  return <ProjectOverView currentProject={data} />;
};

export default ProjectDetails;
