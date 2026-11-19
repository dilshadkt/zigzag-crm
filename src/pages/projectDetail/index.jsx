import React from "react";
import ProjectOverView from "../../components/projects/projectOverview";
import { useOutletContext } from "react-router-dom";

const ProjectDetails = () => {
  // Get data passed from the layout via Outlet context
  const { projectData, selectedMonth, refetchTasks, isLoading, taskSearch, setSearchAvailable } =
    useOutletContext();

  return (
    <ProjectOverView
      currentProject={projectData}
      selectedMonth={selectedMonth}
      onRefresh={refetchTasks}
      isLoading={isLoading}
      searchQuery={taskSearch}
      onSearchAvailableChange={setSearchAvailable}
    />
  );
};

export default ProjectDetails;
