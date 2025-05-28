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
  useGetEmployeeVacations,
} from "../../api/hooks";
import Dropdown from "../../components/shared/dropdown";
import EmployeeCard from "../../components/shared/employeeCard";
import Progress from "../../components/shared/progress";
import LeaveCard from "../../components/shared/LeaveCard";
import { format } from "date-fns";

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
              {["Projects", "Teams", "Vacations"].map((item, index) => (
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

const Vacations = ({ employeeId }) => {
  const [currentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data, isLoading } = useGetEmployeeVacations(
    employeeId,
    currentMonth,
    currentYear
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#E6EBF5] border-t-[#3F8CFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        No vacation data found for this employee
      </div>
    );
  }

  const { summary, vacations } = data;

  // Calculate vacation limits - these would ideally come from a company policy setting
  const vacationLimit = 16;
  const sickLeaveLimit = 12;
  const remoteWorkLimit = 50;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="grid grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={vacationLimit - (summary?.vacation || 0)}
                target={vacationLimit}
                DefaultPathColor="#15C0E6"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#15C0E6]"
              >
                {vacationLimit - (summary?.vacation || 0)}
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">Vacation</h4>
            <p className="text-xs text-gray-400 font-medium">
              {vacationLimit - (summary?.vacation || 0)}/{vacationLimit} days
              available
            </p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={sickLeaveLimit - (summary?.sick_leave || 0)}
                target={sickLeaveLimit}
                DefaultPathColor="#F65160"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#F65160]"
              >
                {sickLeaveLimit - (summary?.sick_leave || 0)}
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">
              Sick Leave
            </h4>
            <p className="text-xs text-gray-400 font-medium">
              {sickLeaveLimit - (summary?.sick_leave || 0)}/{sickLeaveLimit}{" "}
              days available
            </p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white">
          <div className="flex flex-col">
            <div className="flex items-center w-fit relative justify-start">
              <Progress
                size={62}
                currentValue={remoteWorkLimit - (summary?.remote_work || 0)}
                target={remoteWorkLimit}
                DefaultPathColor="#6D5DD3"
              />
              <span
                className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0
               flexCenter text-2xl font-semibold text-[#6D5DD3]"
              >
                {remoteWorkLimit - (summary?.remote_work || 0)}
              </span>
            </div>
            <h4 className="mt-3 mb-1 font-semibold text-gray-800">
              Work Remotely
            </h4>
            <p className="text-xs text-gray-400 font-medium">
              {remoteWorkLimit - (summary?.remote_work || 0)}/{remoteWorkLimit}{" "}
              days available
            </p>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-bold mt-5 mb-3 text-gray-800">
        Vacation Requests
      </h3>
      <div className="w-full h-full overflow-y-auto">
        {vacations && vacations.length > 0 ? (
          vacations.map((vacation) => (
            <LeaveCard
              key={vacation._id}
              request={{
                id: vacation._id,
                type: vacation.type,
                status: vacation.status,
                startDate: vacation.startDate,
                endDate: vacation.endDate,
                duration: vacation.durationDays,
                reason: vacation.reason,
                project: vacation.project?.name,
                createdAt: vacation.createdAt,
                approvedBy: vacation.approvedBy
                  ? `${vacation.approvedBy.firstName} ${vacation.approvedBy.lastName}`
                  : null,
              }}
            />
          ))
        ) : (
          <div className="bg-white h-full flexCenter rounded-3xl p-6 text-center text-gray-500">
            No vacation requests found
          </div>
        )}
      </div>
    </div>
  );
};
