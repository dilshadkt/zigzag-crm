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
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";
import { uploadSingleFile } from "../../api/service";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import MonthSelector from "../../components/shared/MonthSelector";
import { getCurrentMonthKey } from "../../lib/dateUtils";

const ProjectDetailLayout = () => {
  // const { activeProject } = useProject();
  const { projectId } = useParams();
  const [showModalTask, setShowModalTask] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const { taskId } = useParams();
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
  const { hasPermission } = usePermissions();

  // Permission check for creating tasks
  const canCreateTask = isCompany || hasPermission("tasks", "create");

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const monthWorkDetails = projectData?.workDetails?.find(
    (wd) => wd.month === selectedMonth
  );

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const updatedValues = cleanTaskData(values);

      // Handle assignee field mapping
      // if (updatedValues.assignedTo) {
      //   updatedValues.assignedTo = [updatedValues.assignedTo];
      // }

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
    <section className="flex flex-col overflow-y-auto  h-full gap-y-1">
      <div className="flexBetween   mb-2">
        <div className="flex md:gap-x-2 items-center">
          <div
            className=" cursor-pointer w-5 md:w-10 h-5 md:h-10
           rounded-full translate-y-0.5 flex items-center
            justify-center hover:bg-white"
          >
            <Navigator to="/projects" />
          </div>

          <Header>{projectData?.name}</Header>
        </div>
        <div className="flex items-center  gap-x-4">
          {projectData?.startDate && projectData?.endDate && !taskId && (
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              activeProject={projectData}
            />
          )}
          <div className="hidden md:block">
            <PrimaryButton
              disable={!canCreateTask}
              className={" px-5 text-white"}
              title={"Add Task"}
              icon={"/icons/add.svg"}
              onclick={() => setShowModalTask(true)}
            />
          </div>
        </div>
      </div>
      <div className="w-full h-full  gap-y-6 md:gap-y-0 overflow-y-auto md:overflow-hidden md:gap-x-5  grid grid-cols-1 md:grid-cols-5">
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
          showProjectSelection={false}
        />
      </div>
    </section>
  );
};

export default ProjectDetailLayout;
