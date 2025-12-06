import React from "react";
import Header from "../../shared/header";
import PrimaryButton from "../../shared/buttons/primaryButton";
import MonthSelector from "../../shared/MonthSelector";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";

const ProjectHeading = ({
  setShowModalProject,
  selectedMonth,
  onMonthChange,
  setShowModalTask,
  activeProject,
}) => {
  const { hasPermission } = usePermissions();
  return (
    <div className="flexBetween  ">
      <Header>Projects</Header>
      <div className="flex items-center gap-x-2">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          activeProject={activeProject}
        />
        <div className="md:flex hidden gap-x-2">
          <PrimaryButton
            disable={!hasPermission("projects", "create")}
            icon={"/icons/add.svg"}
            title={"Add Project"}
            onclick={() => setShowModalProject(true)}
            className={"text-white px-5"}
          />
          <PrimaryButton
            disable={!activeProject || !hasPermission("tasks", "create")}
            icon={"/icons/add.svg"}
            title={"Add Task"}
            onclick={() => setShowModalTask(true)}
            className={" text-white px-5"}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectHeading;
