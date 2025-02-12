import React from "react";
import ProjectOverView from "../../components/projects/projectOverview";
import SelectedProject from "../../components/projects/selectedProject";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Header from "../../components/shared/header";
import Navigator from "../../components/shared/navigator";

const ProjectDetails = () => {
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
        <ProjectOverView />
      </div>
    </section>
  );
};

export default ProjectDetails;
