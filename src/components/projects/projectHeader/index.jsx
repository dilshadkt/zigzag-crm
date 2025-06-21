import React from "react";
import Header from "../../shared/header";
import PrimaryButton from "../../shared/buttons/primaryButton";
import MonthSelector from "../../shared/MonthSelector";
import { useAuth } from "../../../hooks/useAuth";

const ProjectHeading = ({
  setShowModalProject,
  selectedMonth,
  onMonthChange,
  setShowModalTask,
  activeProject,
}) => {
  const { isCompany } = useAuth();
  return (
    <div className="flexBetween ">
      <Header>Projects</Header>
      <div className="flexEnd gap-x-2">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          className="mt-3"
        />
        <PrimaryButton
          disable={!isCompany}
          icon={"/icons/add.svg"}
          title={"Add Project"}
          onclick={() => setShowModalProject(true)}
          className={"mt-3 text-white px-5"}
        />
        <PrimaryButton
          disable={!isCompany || !activeProject}
          icon={"/icons/add.svg"}
          title={"Add Task"}
          onclick={() => setShowModalTask(true)}
          className={"mt-3 text-white px-5"}
        />
      </div>
    </div>
  );
};

export default ProjectHeading;
