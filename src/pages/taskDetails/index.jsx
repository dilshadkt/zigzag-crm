import React from "react";
import Navigator from "../../components/shared/navigator";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import SelectedProject from "../../components/projects/selectedProject";
import ProjectOverView from "../../components/projects/projectOverview";
import TaskOverView from "../TaskOverView";

const TaskDetails = () => {
  return (
    <section className="flex flex-col h-full gap-y-1">
      <Navigator path={"/projects"} title={"Back to Projects"} />
      <div className="flexBetween   mb-2">
        <Header>Medical App (iOS native)</Header>
        <PrimaryButton
          className={"mt-3 px-5 text-white"}
          title={"Add Task"}
          icon={"/icons/add.svg"}
        />
      </div>
      <div className="w-full h-full  overflow-hidden gap-x-5  grid grid-cols-5">
        {/* current project section  */}
        <SelectedProject />
        {/* project overview page  */}
        <TaskOverView />
      </div>
    </section>
  );
};

export default TaskDetails;
