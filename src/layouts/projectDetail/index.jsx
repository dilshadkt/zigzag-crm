import React, { useState } from "react";
import Navigator from "../../components/shared/navigator";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import SelectedProject from "../../components/projects/selectedProject";
import ProjectOverView from "../../components/projects/projectOverview";
import AddTask from "../../components/projects/addTask";
import { useProject } from "../../hooks/useProject";
import { useProjectDetails } from "../../api/hooks";
import { Outlet } from "react-router-dom";

const ProjectDetailLayout = () => {
  const { activeProject } = useProject();
  const { data } = useProjectDetails(activeProject);
  const [showModalTask, setShowModalTask] = useState(false);
  return (
    <section className="flex flex-col h-full gap-y-1">
      <Navigator path={"/projects"} title={"Back to Projects"} />
      <div className="flexBetween   mb-2">
        <Header>{data?.name}</Header>
        <PrimaryButton
          className={"mt-3 px-5 text-white"}
          title={"Add Task"}
          icon={"/icons/add.svg"}
          onclick={() => setShowModalTask(true)}
        />
      </div>
      <div className="w-full h-full  overflow-hidden gap-x-5  grid grid-cols-5">
        {/* current project section  */}
        <SelectedProject currentProject={data} />
        {/* project overview page  */}
        <Outlet />
        {/* <ProjectOverView currentProject={data} /> */}
        {showModalTask && (
          <AddTask
            setShowModalTask={setShowModalTask}
            selectedProject={data?._id}
            assignee={data?.teams}
          />
        )}
      </div>
    </section>
  );
};

export default ProjectDetailLayout;
