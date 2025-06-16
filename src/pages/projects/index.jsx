import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  useAddProject,
  useCompanyProjects,
  useProjectDetails,
  useGetEmployeeProjects,
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

const Prjects = () => {
  const { companyId, user } = useAuth();
  const { activeProject: selectProject } = useProject();
  const dispatch = useDispatch();

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

  const { data: activeProject, isLoading } = useProjectDetails(selectProject);

  // Mutation
  const addProject = useAddProject();

  const handleAddProject = async (values, { resetForm }) => {
    try {
      await addProject.mutateAsync(values);
      setShowModalProject(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess && projects?.length > 0) {
      dispatch(setActiveProject(projects[0]?._id));
    }
  }, [isSuccess, projects]);

  const [showModalProject, setShowModalProject] = useState(false);
  const [showModalFilter, setShowModalFilter] = useState(false);
  const [showModalTask, setShowModalTask] = useState(false);

  const hasNoProject = !projects || projects.length === 0;

  if (isLoading) return <ProjectsShimmer />;

  const activeTasks = activeProject?.tasks?.filter(
    (task) => task?.status === "todo"
  );
  const progressTasks = activeProject?.tasks?.filter(
    (task) => task?.status === "in-progress"
  );
  const completedTasks = activeProject?.tasks?.filter(
    (task) => task?.status === "completed"
  );

  return (
    <section className="flex flex-col h-full gap-y-3">
      <ProjectHeading setShowModalProject={setShowModalProject} />
      {hasNoProject ? (
        <NoTask>There are no Projects</NoTask>
      ) : (
        <div className="w-full h-full overflow-hidden gap-x-5 grid grid-cols-5">
          {/* current project section  */}
          <CurrentProject projects={projects} selectProject={selectProject} />
          {/* project detail page  */}
          <ProjectDetails
            activeProject={activeProject || projects}
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
