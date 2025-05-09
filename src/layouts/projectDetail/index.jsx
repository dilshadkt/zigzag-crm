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
import { useAuth } from "../../hooks/useAuth";

const ProjectDetailLayout = () => {
  const { activeProject } = useProject();
  const { data } = useProjectDetails(activeProject);
  const [showModalTask, setShowModalTask] = useState(false);
  const { mutate } = useCreateTask(() => setShowModalTask(false), data?._id);
  const { isCompany } = useAuth();

  const handleSubmit = async (values) => {
  
    const updatedValues = { ...values };
    const { assignedTo, ...restValues } = updatedValues;
    updatedValues.assignee = assignedTo;
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
          disable={!isCompany}
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
        <AddTask
          isOpen={showModalTask}
          onSubmit={handleSubmit}
          setShowModalTask={setShowModalTask}
          selectedProject={data?._id}
          teams={data?.teams}
          projectData={data}
        />
      </div>
    </section>
  );
};

export default ProjectDetailLayout;
