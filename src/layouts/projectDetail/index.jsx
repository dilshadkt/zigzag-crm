import React, { useEffect, useState } from "react";
import Navigator from "../../components/shared/navigator";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import SelectedProject from "../../components/projects/selectedProject";
import ProjectOverView from "../../components/projects/projectOverview";
import AddTask from "../../components/projects/addTask";
import AssetBankBucket from "../../components/projects/AssetBankBucket";
import { useProject } from "../../hooks/useProject";
import {
  useCreateTask,
  useProjectDetails,
  useProjectTasks,
} from "../../api/hooks";
import { Outlet, useParams, useOutletContext, useNavigate } from "react-router-dom";
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";
import { uploadSingleFile } from "../../api/service";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import MonthSelector from "../../components/shared/MonthSelector";
import { getCurrentMonthKey } from "../../lib/dateUtils";
import PageSuspense from "../../components/shared/PageSuspense";

const ProjectDetailLayout = () => {
  // const { activeProject } = useProject();
  const { projectId } = useParams();
  const [showModalTask, setShowModalTask] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  // Task search lives next to the month picker; the Kanban tab applies it
  const [taskSearch, setTaskSearch] = useState("");
  const [searchAvailable, setSearchAvailable] = useState(false);
  const { taskId } = useParams();

  useEffect(() => {
    setTaskSearch("");
  }, [projectId]);
  const { data: projectData, isLoading: projectLoading } = useProjectDetails(projectId, {
    monthKey: selectedMonth,
    enabled: !!projectId,
  });
  const { data: tasksData, refetch: refetchTasks, isLoading: tasksLoading } = useProjectTasks(
    projectData?._id,
    selectedMonth,
    {
      enabled: !!projectData?._id,
    }
  );
  const navigate = useNavigate();
  const { mutate, isPending: isCreatingTask } = useCreateTask((data) => {
    setShowModalTask(false);
    refetchTasks();
    if (data?.data?.task?._id) {
      navigate(`/projects/${projectId}/${data.data.task._id}`);
    }
  }, projectId);

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
            <Navigator />
          </div>

          <Header>{projectData?.name}</Header>
        </div>
        <div className="flex items-center  gap-x-4">
          {searchAvailable && !taskId && (
            <div className="relative min-w-0">
              <input
                type="text"
                placeholder="Search tasks..."
                aria-label="Search tasks"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="pl-9 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs w-32 md:w-44 lg:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z" />
                </svg>
              </div>
              {taskSearch && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setTaskSearch("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {projectData?.startDate && projectData?.endDate && !taskId && (
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              activeProject={projectData}
            />
          )}
          {canCreateTask && (
            <div className="hidden md:block">
              <PrimaryButton
                className={" px-5 text-white"}
                title={"Add Task"}
                icon={"/icons/add.svg"}
                onclick={() => setShowModalTask(true)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-full  gap-y-6 md:gap-y-0 overflow-y-auto md:overflow-hidden md:gap-x-3  grid grid-cols-1 md:grid-cols-5">
        {/* current project section  */}
        <SelectedProject
          currentProject={projectData}
          isLoading={projectLoading}
          selectedMonth={selectedMonth}
          className={taskId ? 'hidden md:block' : ''}
        />
        {/* project overview page  */}
        <PageSuspense
          fallback={
            <div className="md:col-span-4 h-full rounded-3xl bg-white animate-pulse" />
          }
        >
          <Outlet
            context={{
              projectData: { ...projectData, tasks: tasksData || [] },
              selectedMonth,
              refetchTasks,
              taskSearch,
              setSearchAvailable,
              isLoading: projectLoading || tasksLoading,
            }}
          />
        </PageSuspense>
        <AssetBankBucket projectId={projectData?._id} />
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
          isLoading={isCreatingTask}
        />
      </div>
    </section>
  );
};

export default ProjectDetailLayout;
