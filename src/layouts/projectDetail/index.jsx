import React, { useState } from "react";
import Navigator from "../../components/shared/navigator";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import SelectedProject from "../../components/projects/selectedProject";
import ProjectOverView from "../../components/projects/projectOverview";
import AddTask from "../../components/projects/addTask";
import { useProject } from "../../hooks/useProject";
import {
  useCreateTask,
  useProjectDetails,
  useProjectTasks,
} from "../../api/hooks";
import { Outlet, useParams, useOutletContext } from "react-router-dom";
import { processAttachments } from "../../lib/attachmentUtils";
import { uploadSingleFile } from "../../api/service";
import { useAuth } from "../../hooks/useAuth";
import MonthSelector from "../../components/shared/MonthSelector";
import { getCurrentMonthKey } from "../../lib/dateUtils";

const ProjectDetailLayout = () => {
  // const { activeProject } = useProject();
  const { projectId } = useParams();
  const [showModalTask, setShowModalTask] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const { data: projectData } = useProjectDetails(projectId, {
    enabled: !!projectId,
  });
  const { data: tasksData, refetch: refetchTasks } = useProjectTasks(
    projectData?._id,
    selectedMonth,
    {
      enabled: !!projectData?._id,
    }
  );
  const { mutate } = useCreateTask(() => {
    setShowModalTask(false);
    refetchTasks();
  }, projectData?._id);

  const { isCompany } = useAuth();

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const monthWorkDetails = projectData?.workDetails?.find(
    (wd) => wd.month === selectedMonth
  );

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const updatedValues = { ...values };

      // Handle assignee field mapping
      if (updatedValues.assignedTo) {
        updatedValues.assignedTo = [updatedValues.assignedTo];
      }

      // Process attachments
      const proccesedValue = await processAttachments(
        values?.attachments,
        uploadSingleFile
      );
      updatedValues.attachments = proccesedValue;

      mutate(updatedValues);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="flex flex-col h-full gap-y-1">
      <Navigator path={"/projects"} title={"Back to Projects"} />
      <div className="flexBetween   mb-2">
        <Header>{projectData?.name}</Header>
        <div className="flex items-center  gap-x-4">
          {projectData?.startDate && projectData?.endDate && (
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              activeProject={projectData}
            />
          )}
          <PrimaryButton
            disable={!isCompany}
            className={" px-5 text-white"}
            title={"Add Task"}
            icon={"/icons/add.svg"}
            onclick={() => setShowModalTask(true)}
          />
        </div>
      </div>
      <div className="w-full h-full  overflow-hidden gap-x-5  grid grid-cols-5">
        {/* current project section  */}
        <SelectedProject currentProject={projectData} />
        {/* project overview page  */}
        <Outlet
          context={{
            projectData: { ...projectData, tasks: tasksData || [] },
            selectedMonth,
            refetchTasks,
          }}
        />
        <AddTask
          isOpen={showModalTask}
          onSubmit={handleSubmit}
          setShowModalTask={setShowModalTask}
          selectedProject={projectData?._id}
          teams={projectData?.teams}
          monthWorkDetails={monthWorkDetails}
          projectData={projectData}
          selectedMonth={selectedMonth}
        />
      </div>
    </section>
  );
};

export default ProjectDetailLayout;
