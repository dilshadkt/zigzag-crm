import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import {
  useAddProject,
  useCompanyProjects,
  useProjectDetails,
  useProjectTasks,
  useGetEmployeeProjects,
  useCreateTask,
} from "../../api/hooks";
import AddProject from "../../components/projects/addProject";
import AddTask from "../../components/projects/addTask";
import CurrentProject from "../../components/projects/currentProject";
import ProjectDetails from "../../components/projects/projectDetails";
import ProjectHeading from "../../components/projects/projectHeader";
import { useAuth } from "../../hooks/useAuth";
import { useProject } from "../../hooks/useProject";
import { setActiveProject } from "../../store/slice/projectSlice";
import FilterMenu from "../../components/projects/FilterMenu";
import NoTask from "../../components/projects/noTask";
import ProjectsShimmer from "../../components/projects/ProjectsShimmer";
import { processAttachments } from "../../lib/attachmentUtils";
import { uploadSingleFile } from "../../api/service";

const Prjects = () => {
  const { companyId, user } = useAuth();
  const { activeProject: selectProject } = useProject();
  const dispatch = useDispatch();

  // Month selection state - default to current month
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  // Use different hooks based on user role
  const { data: companyProjects, isSuccess: isCompanySuccess } =
    useCompanyProjects(user?.role === "company-admin" ? companyId : null);
  const { data: employeeProjects, isSuccess: isEmployeeSuccess } =
    useGetEmployeeProjects(user?.role !== "company-admin" ? user?._id : null);

  // Combine the results based on user role
  const projects =
    user?.role === "company-admin"
      ? companyProjects
      : employeeProjects?.projects;
  const isSuccess =
    user?.role === "company-admin" ? isCompanySuccess : isEmployeeSuccess;

  // Use separate hooks for project details and tasks
  const { data: activeProject, isLoading: projectLoading } =
    useProjectDetails(selectProject);
  const { data: projectTasks, isLoading: tasksLoading } = useProjectTasks(
    selectProject,
    selectedMonth
  );

  // Combine project data with tasks
  const projectWithTasks = activeProject
    ? {
        ...activeProject,
        tasks: projectTasks || [],
      }
    : null;

  // Mutation
  const addProject = useAddProject();
  const createTask = useCreateTask(
    () => setShowModalTask(false),
    selectProject
  );

  const handleAddProject = async (values, { resetForm }) => {
    try {
      await addProject.mutateAsync(values);
      setShowModalProject(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTask = async (values, { resetForm }) => {
    const updatedValues = { ...values };
    updatedValues.creator = user?._id;

    // Process attachments
    const processedValue = await processAttachments(
      values?.attachments,
      uploadSingleFile
    );
    updatedValues.attachments = processedValue;

    createTask.mutate(updatedValues, {
      onSuccess: () => {
        resetForm();
      },
    });
  };

  useEffect(() => {
    if (isSuccess && projects?.length > 0 && !selectProject) {
      dispatch(setActiveProject(projects[0]?._id));
    }
  }, [isSuccess, projects, selectProject]);

  const [showModalProject, setShowModalProject] = useState(false);
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [showModalTask, setShowModalTask] = useState(false);

  const hasNoProject = !projects || projects.length === 0;
  const isLoading = projectLoading || tasksLoading;

  if (isLoading) return <ProjectsShimmer />;

  const activeTasks = projectWithTasks?.tasks?.filter(
    (task) => task?.status === "todo"
  );
  const progressTasks = projectWithTasks?.tasks?.filter(
    (task) => task?.status === "in-progress"
  );
  const completedTasks = projectWithTasks?.tasks?.filter(
    (task) => task?.status === "completed"
  );

  return (
    <section className="flex flex-col h-full gap-y-3">
      <ProjectHeading
        setShowModalProject={setShowModalProject}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        setShowModalTask={setShowModalTask}
        activeProject={projectWithTasks}
      />
      {hasNoProject ? (
        <NoTask>There are no Projects</NoTask>
      ) : (
        <div className="w-full h-full overflow-hidden gap-x-5 grid grid-cols-5">
          {/* current project section  */}
          <CurrentProject projects={projects} selectProject={selectProject} />
          {/* project detail page  */}
          <ProjectDetails
            activeProject={projectWithTasks || projects}
            activeTasks={activeTasks}
            completedTasks={completedTasks}
            progressTasks={progressTasks}
            setShowModalFilter={setShowModalFilter}
          />
        </div>
      )}

      {/* filter menu  */}
      <FilterMenu
        isOpen={showModalFilter}
        setShowModalFilter={setShowModalFilter}
      />

      {/* add task modal  */}
      <AddTask
        isOpen={showModalTask}
        setShowModalTask={setShowModalTask}
        selectedProject={selectProject}
        assignee={activeProject?.teams}
        projectData={activeProject}
        teams={activeProject?.teams}
        monthWorkDetails={activeProject?.workDetails?.find(
          (wd) => wd.month === selectedMonth
        )}
        onSubmit={(values, helpers) => handleAddTask(values, helpers)}
        isLoading={createTask.isPending}
        selectedMonth={selectedMonth}
        showProjectSelection={false}
      />

      {/* add project modal */}
      <AddProject
        isOpen={showModalProject}
        setShowModalProject={setShowModalProject}
        onSubmit={handleAddProject}
      />
    </section>
  );
};

export default Prjects;
