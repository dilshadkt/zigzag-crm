import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "../../hooks/useAuth";
import { useProject } from "../../hooks/useProject";
import { usePermissions } from "../../hooks/usePermissions";
import { setActiveProject } from "../../store/slice/projectSlice";
import FilterMenu from "../../components/projects/FilterMenu";
import NoTask from "../../components/projects/noTask";
import ProjectsShimmer from "../../components/projects/ProjectsShimmer";
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";
import { uploadSingleFile } from "../../api/service";

const Prjects = () => {
  const { companyId, user } = useAuth();
  const { activeProject: selectProject } = useProject();
  const { hasPermission } = usePermissions();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Month selection state - default to current month
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  // Use different hooks based on user role
  const { data: companyProjects, isSuccess: isCompanySuccess, isLoading: isCompanyLoading } =
    useCompanyProjects(user?.role === "company-admin" ? companyId : null);
  const { data: employeeProjects, isSuccess: isEmployeeSuccess, isLoading: isEmployeeLoading } =
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
  // Add computed progress to tasks based on subtasks
  const enhancedTasks = (projectTasks || []).map(task => {
    if (task?.itemType === "subtask") return task;

    const subtasks = (projectTasks || []).filter(t =>
      t?.itemType === "subtask" &&
      (t.parentTask?._id === task._id || t.parentTask === task._id)
    );

    if (!subtasks || subtasks.length === 0) return task;

    const completedSubtasks = subtasks.filter(t =>
      ["completed", "approved", "client-approved"].includes(t.status?.toLowerCase())
    );

    const computedProgress = Math.round((completedSubtasks.length / subtasks.length) * 100);
    return { ...task, computedProgress };
  });

  // Combine project data with tasks
  const projectWithTasks = activeProject
    ? {
      ...activeProject,
      tasks: enhancedTasks,
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
      const response = await addProject.mutateAsync(values);
      setShowModalProject(false);
      resetForm();
      if (response?.project?._id) {
        navigate(`/projects/${response.project._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTask = async (values, { resetForm }) => {
    const updatedValues = cleanTaskData(values);
    updatedValues.creator = user?._id;

    // Process attachments
    const processedValue = await processAttachments(
      values?.attachments,
      uploadSingleFile
    );
    updatedValues.attachments = processedValue;

    try {
      const response = await createTask.mutateAsync(updatedValues);
      resetForm();
      if (response?.data?.task?._id) {
        navigate(`/projects/${selectProject}/${response.data.task._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess && projects?.length > 0 && !selectProject) {
      dispatch(setActiveProject(projects[0]?._id));
    }
  }, [isSuccess, projects, selectProject]);

  const [showModalProject, setShowModalProject] = useState(false);
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [showModalTask, setShowModalTask] = useState(false);

  const projectsLoading = user?.role === "company-admin" ? isCompanyLoading : isEmployeeLoading;
  const hasNoProject = isSuccess && (!projects || projects.length === 0);
  const isLoading = projectsLoading || projectLoading || tasksLoading;

  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

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
    <section className="flex flex-col h-full gap-y-2">
      <div
        className="w-full h-full overflow-y-auto gap-y-3 md:gap-y-0 
         md:overflow-hidden md:gap-x-3 grid grid-cols-1 md:grid-cols-5"
      >
        {/* current project section  */}
        {!isTimelineExpanded && !hasNoProject && (
          <CurrentProject projects={projects} selectProject={selectProject} />
        )}
        {/* project detail page  */}
        <ProjectDetails
          activeProject={projectWithTasks}
          activeTasks={activeTasks}
          completedTasks={completedTasks}
          progressTasks={progressTasks}
          setShowModalFilter={setShowModalFilter}
          setShowModalProject={setShowModalProject}
          setShowModalTask={setShowModalTask}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          isTimelineExpanded={isTimelineExpanded}
          setIsTimelineExpanded={setIsTimelineExpanded}
        />
      </div>

      {/* filter menu  */}
      <FilterMenu
        isOpen={showModalFilter}
        setShowModalFilter={setShowModalFilter}
      />

      {/* add task modal  */}
      {hasPermission("tasks", "create") && (
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
      )}

      {/* add project modal */}
      {hasPermission("projects", "create") && (
        <AddProject
          isOpen={showModalProject}
          setShowModalProject={setShowModalProject}
          onSubmit={handleAddProject}
        />
      )}
    </section>
  );
};

export default Prjects;
