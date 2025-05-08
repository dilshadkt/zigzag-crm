import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Task from "../../shared/task";
import NoTask from "../noTask";
import { useNavigate } from "react-router-dom";

const ProjectDetails = ({
  setShowModalFilter,
  activeProject,
  activeTasks,
  progressTasks,
  completedTasks,
}) => {
  const navigate = useNavigate();
  const hasNoTasks = activeProject?.tasks?.length === 0;
  let projectName = activeProject?.name?.trim().split(" ")?.join("_");

  const handleNavigateTask = (task) => {
    navigate(`/projects/${projectName}/${task?._id}`);
  };

  const renderSection = (title, tasks) => (
    <>
      <div className="min-h-10 font-medium sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
        {title}
      </div>
      {tasks?.map((task, index) => (
        <Task onClick={handleNavigateTask} key={index} task={task} />
      ))}
    </>
  );

  return (
    <div className="col-span-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flexBetween">
        <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
        {/* <PrimaryButton
          icon="/icons/filter.svg"
          onclick={() => setShowModalFilter(true)}
          className="bg-white"
        /> */}
      </div>

      {/* Task Sections */}
      <div className="flex flex-col h-full gap-y-4 mt-4 rounded-xl overflow-hidden overflow-y-auto">
        {hasNoTasks ? (
          <NoTask>
            There are no tasks in this project <br /> yet Let's add them
          </NoTask>
        ) : (
          <>
            {renderSection("Active Tasks", activeTasks)}
            {renderSection("Progress", progressTasks)}
            {renderSection("Completed", completedTasks)}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
