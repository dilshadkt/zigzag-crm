import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/shared/header";
import UserProfile from "../../components/settings/profile";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import ProjectCard from "../../components/shared/projectCard";
import {
  useGetEmployee,
  useGetEmployeeProjects,
  useGetEmployeeTeams,
} from "../../api/hooks";
import Dropdown from "../../components/shared/dropdown";
import EmployeeCard from "../../components/shared/employeeCard";
import Progress from "../../components/shared/progress";
import LeaveCard from "../../components/shared/LeaveCard";

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const [activePage, setActivePage] = useState("Projects");
  const [selectedProject, setSelectedProject] = useState("");
  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetEmployee(employeeId);
  const { data: projectsData, isLoading: isLoadingProjects } =
    useGetEmployeeProjects(employeeId);
  const { data: teamsData, isLoading: isLoadingTeams } = useGetEmployeeTeams(
    employeeId,
    selectedProject
  );

  const employee = employeeData?.employee;
  const projects = projectsData?.projects || [];

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
          }}
          disableEdit={true}
        />
        <div className="flex-1 flex flex-col gap-y-5">
          <div className="flexBetween">
            <div className="flex bg-[#E6EDF5] rounded-full p-1">
              {["Projects", "Teams", "Vaccations"].map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActivePage(item)}
                  className={`${
                    activePage === item
                      ? `bg-[#3F8CFF] text-white`
                      : `bg-[#E6EDF5] text-[#0A1629]`
                  } text-sm py-2 px-8 
                  cursor-pointer rounded-full font-medium`}
                >
                  {item}
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
            {activePage === "Projects" && (
              <Projects projects={projects} isLoading={isLoadingProjects} />
            )}
            {activePage === "Teams" && <Teams teams={teamsData?.teams || []} />}
            {activePage === "Vaccations" && <Vaccations vaccations={[]} />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployeeDetails;

const Projects = ({ projects, isLoading }) => {
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        Loading projects...
      </div>
    );
  }

  if (projects?.length === 0) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        No projects found for this employee
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {projects?.map((project) => (
        <ProjectCard
          key={project?._id}
          project={project}
          onClick={() => navigate(`/projects/${project?.name}`)}
        />
      ))}
    </div>
  );
};

const Teams = ({ teams }) => {
  if (!teams || teams.length === 0) {
    return (
      <div
        className="text-center w-full h-full flex items-center 
      justify-center text-gray-500"
      >
        No teams found for this employee
      </div>
    );
  }
  return (
    <div className="w-full h-full grid grid-cols-4 gap-3 mt-3">
      {teams.map((team) => (
        <EmployeeCard
          key={team._id}
          employee={{
            name: `${team.firstName} ${team.lastName}`,
            email: team.email,
            profile: team.profileImage,
            position: team.position,
            level: team.level,
            progress_value: team.progressValue,
          }}
          className="bg-white h-fit"
        />
      ))}
    </div>
  );
};

const Vaccations = ({ vaccations }) => {
  if (!vaccations?.length === 0) {
    return (
      <div
        className="text-center w-full h-full flex items-center 
      justify-center text-gray-500"
      >
        No vaccations found for this employee
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="grid grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={12}
                target={16}
                DefaultPathColor="#15C0E6"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#15C0E6]"
              >
                12
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">Vacation</h4>
            <p className="text-xs text-gray-400 font-medium">
              12/16 days available
            </p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={6}
                target={12}
                DefaultPathColor="#F65160"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#F65160]"
              >
                6
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">
              Sick Leave
            </h4>
            <p className="text-xs text-gray-400 font-medium">
              6/12 days available
            </p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={42}
                target={50}
                DefaultPathColor="#6D5DD3"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#6D5DD3]"
              >
                42
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">
              Work Remotely
            </h4>
            <p className="text-xs text-gray-400 font-medium">
              42/50 days available
            </p>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-bold mt-5 text-gray-800">My Requests</h3>
      <div className="w-full h-full flex flex-col overflow-y-auto mt-3">
        <LeaveCard />
      </div>
    </div>
  );
};
