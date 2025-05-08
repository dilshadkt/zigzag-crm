import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Task from "../../shared/task";
import { useNavigate, useParams } from "react-router-dom";

const ProjectOverView = ({ currentProject }) => {
  const { projectName } = useParams();
  const navigate = useNavigate();

  // filter task based on the process
  const activeTasks = currentProject?.tasks?.filter(
    (task) => task?.status === "todo"
  );
  const progressTasks = currentProject?.tasks?.filter(
    (task) => task?.status === "in-progress"
  );
  const completedTasks = currentProject?.tasks?.filter(
    (task) => task?.status === "completed"
  );

  // function to navigate the task page
  const handleNavigateToTask = (task) => {
    navigate(`/projects/${projectName}/${task?._id}`);
  };

  const renderSection = (title, tasks) => (
    <>
      <div className="min-h-10 font-medium sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
        {title}
      </div>
      {tasks?.map((task, index) => (
        <Task onClick={handleNavigateToTask} key={index} task={task} />
      ))}
    </>
  );

  return (
    <div className="col-span-4 overflow-hidden   flex flex-col">
      <div className="flexBetween">
        <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
        <PrimaryButton icon={"/icons/filter.svg"} className={"bg-white"} />
      </div>

      <div className="flex flex-col h-full gap-y-4 mt-4  rounded-xl overflow-hidden   overflow-y-auto">
        {renderSection("Active Tasks", activeTasks)}
        {renderSection("Progress", progressTasks)}
        {renderSection("Completed", completedTasks)}
      </div>
    </div>
  );
};

export default ProjectOverView;
