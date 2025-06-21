import React from "react";
import ProjectOverView from "../../components/projects/projectOverview";
import { useOutletContext } from "react-router-dom";

const ProjectDetails = () => {
  // Get data passed from the layout via Outlet context
  const { projectData, selectedMonth, refetchTasks } = useOutletContext();

  return (
    <ProjectOverView
      currentProject={projectData}
      selectedMonth={selectedMonth}
      onRefresh={refetchTasks}
    />
  );
};

export default ProjectDetails;
