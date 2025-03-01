import React, { useState } from "react";
import Navigator from "../../components/shared/navigator";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import SelectedProject from "../../components/projects/selectedProject";
import ProjectOverView from "../../components/projects/projectOverview";
import AddTask from "../../components/projects/addTask";
import { useProject } from "../../hooks/useProject";
import { useCreateTask, useProjectDetails } from "../../api/hooks";
import { Outlet } from "react-router-dom";
import { processAttachments } from "../../lib/attachmentUtils";
import { uploadSingleFile } from "../../api/service";

const ProjectDetailLayout = () => {
  const { activeProject } = useProject();
  const { data } = useProjectDetails(activeProject);
  const [showModalTask, setShowModalTask] = useState(false);
  const { mutate } = useCreateTask(() => setShowModalTask(false), data?._id);
  const handle = async (values) => {
    const assignee = values?.assignee;
    const assigneeId = data?.teams?.find(
      (item) => item?.firstName === assignee
    )._id;
    values.assignee = assigneeId;
    const updatedValues = { ...values };
    const proccesedValue = await processAttachments(
      values?.attachments,
      uploadSingleFile
    );
    updatedValues.attachments = proccesedValue;
    mutate(updatedValues);
  };
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
        <AddTask
          isOpen={showModalTask}
          onSubmit={handle}
          setShowModalTask={setShowModalTask}
          selectedProject={data?._id}
          assignee={data?.teams}
        />
      </div>
    </section>
  );
};

export default ProjectDetailLayout;
