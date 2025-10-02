import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/shared/header";
import UserProfile from "../../components/settings/profile";
import {
  useGetEmployee,
  useGetEmployeeProjects,
  useGetEmployeeTeams,
  useGetEmployeeSubTasks,
} from "../../api/hooks";
import Dropdown from "../../components/shared/dropdown";
import { useAuth } from "../../hooks/useAuth";
import Tasks from "../../components/employee/Tasks";
import Overview from "../../components/employee/Overview";
import Projects from "../../components/employee/Projects";
import Teams from "../../components/employee/Teams";
import Vacations from "../../components/employee/Vacations";

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "company-admin";
  const [activePage, setActivePage] = useState(
    isAdmin ? "Overview" : "Projects"
  );
  const [selectedProject, setSelectedProject] = useState("");
  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetEmployee(employeeId);
  const { data: projectsData, isLoading: isLoadingProjects } =
    useGetEmployeeProjects(employeeId);
  const { data: teamsData, isLoading: isLoadingTeams } = useGetEmployeeTeams(
    employeeId,
    selectedProject
  );
  const { data: subTasksData } = useGetEmployeeSubTasks(employeeId);

  const employee = employeeData?.employee;
  const projects = projectsData?.projects || [];
  const subTasks = subTasksData?.subTasks || [];
  const subTasksCount = subTasks.length;

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]._id);
    }
  }, [projects, selectedProject]);

  const projectOptions = projects.map((project) => ({
    value: project._id,
    label: project.name,
  }));

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Employee not found</div>
      </div>
    );
  }

  return (
    <section className="flex flex-col h-full gap-y-3">
      <Header>Employee's Profile</Header>
      <div className="w-full h-full overflow-hidden gap-x-5 flex">
        <UserProfile
          user={{
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            profileImage: employee.profileImage,
            phoneNumber: employee.phoneNumber,
            position: employee.position,
            level: employee.level,
            gender: employee.gender,
            dob: employee.dob,
            firstName: employee.firstName,
          }}
          disableEdit={!isAdmin}
          employeeId={employeeId}
        />
        <div className="flex-1 flex flex-col gap-y-5">
          <div className="flexBetween">
            <div className="flex bg-[#E6EDF5] rounded-full p-1">
              {[
                ...(isAdmin ? ["Overview"] : []),
                "Projects",
                "Teams",
                "Tasks",
                "Vacations",
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActivePage(item)}
                  className={`${
                    activePage === item
                      ? `bg-[#3F8CFF] text-white`
                      : `bg-[#E6EDF5] text-[#0A1629]`
                  } text-sm py-2 px-8 
                  cursor-pointer flex  gap-x-1 rounded-full font-medium relative`}
                >
                  {item}
                  {item === "Tasks" && subTasksCount > 0 && (
                    <span
                      className=" -top-0 -right-2 bg-white text-gray-600
                     text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {subTasksCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {activePage === "Teams" && (
              <Dropdown
                options={projectOptions}
                value={selectedProject}
                onChange={setSelectedProject}
                placeholder="Select project"
                className="w-64 bg-[#E6EDF5] rounded-lg font-medium"
              />
            )}
          </div>
          <div className="w-full h-full overflow-y-auto">
            {activePage === "Overview" && isAdmin && (
              <Overview subTasks={subTasks} employeeId={employeeId} />
            )}
            {activePage === "Projects" && (
              <Projects projects={projects} isLoading={isLoadingProjects} />
            )}
            {activePage === "Teams" && <Teams teams={teamsData?.teams || []} />}
            {activePage === "Tasks" && <Tasks employeeId={employeeId} />}
            {activePage === "Vacations" && (
              <Vacations employeeId={employeeId} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployeeDetails;
