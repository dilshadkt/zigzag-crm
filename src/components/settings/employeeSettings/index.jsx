import React, { useState } from "react";
import ProjectCard from "../../shared/projectCard";
import {
  useGetEmployeeProjects,
  useGetEmployeeTeams,
  useGetEmployeeVacations,
  useGetEmployeeTasks,
} from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import Dropdown from "../../shared/dropdown";
import EmployeeCard from "../../shared/employeeCard";
import Progress from "../../shared/progress";
import LeaveCard from "../../shared/LeaveCard";
import { useNavigate } from "react-router-dom";
import EmployeeProgressStats from "../../dashboard/employeeProgressStats";

const EmployeeSettings = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState("Overview");
  const [selectedProject, setSelectedProject] = useState("");
  const navigate = useNavigate();

  const { data: projectsData, isLoading: isLoadingProjects } =
    useGetEmployeeProjects(user?._id);
  const { data: teamsData, isLoading: isLoadingTeams } = useGetEmployeeTeams(
    user?._id,
    selectedProject
  );
  const { data: tasksData } = useGetEmployeeTasks(user?._id);

  const projects = projectsData?.projects || [];
  const tasks = tasksData?.tasks || [];

  React.useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]._id);
    }
  }, [projects, selectedProject]);

  const projectOptions = projects.map((project) => ({
    value: project._id,
    label: project.name,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flexBetween mb-5">
        <div className="flex bg-[#E6EDF5] rounded-full p-1">
          {["Overview", "Projects", "Teams", "Vacations"].map((item, index) => (
            <button
              key={index}
              onClick={() => setActivePage(item)}
              className={`${
                activePage === item
                  ? `bg-[#3F8CFF] text-white`
                  : `bg-[#E6EDF5] text-[#0A1629]`
              } text-sm py-2 px-6 
              cursor-pointer rounded-full font-medium transition-all duration-200`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {activePage === "Teams" && (
        <div className="mb-4">
          <Dropdown
            options={projectOptions}
            value={selectedProject}
            onChange={setSelectedProject}
            placeholder="Select project"
            className="w-64 bg-[#E6EDF5] rounded-lg font-medium"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {activePage === "Overview" && (
          <Overview projects={projects} tasks={tasks} user={user} />
        )}
        {activePage === "Projects" && (
          <Projects projects={projects} isLoading={isLoadingProjects} />
        )}
        {activePage === "Teams" && <Teams teams={teamsData?.teams || []} />}
        {activePage === "Vacations" && <Vacations employeeId={user?._id} />}
      </div>
    </div>
  );
};

const Overview = ({ projects, tasks, user }) => {
  const navigate = useNavigate();

  // Calculate quick stats
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalProjects}
          </div>
          <div className="text-sm text-gray-600">Active Projects</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {completedTasks}
          </div>
          <div className="text-sm text-gray-600">Completed Tasks</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {pendingTasks}
          </div>
          <div className="text-sm text-gray-600">Pending Tasks</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalTasks}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flexBetween mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Projects
          </h3>
          <button
            onClick={() => navigate("/projects")}
            className="text-[#3F8CFF] text-sm hover:underline"
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onClick={() => navigate(`/projects/${project.name}`)}
            />
          ))}
          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No projects assigned yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
        No projects found for you
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        No team members found for the selected project
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-3 gap-4">
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
        No vacation data found
      </div>
    );
  }

  const { summary, vacations } = data;

  // Calculate vacation limits
  const vacationLimit = 16;
  const sickLeaveLimit = 12;
  const remoteWorkLimit = 50;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto space-y-6">
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
              <span className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0 flexCenter text-2xl font-semibold text-[#15C0E6]">
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
              <span className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0 flexCenter text-2xl font-semibold text-[#F65160]">
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
              <span className="absolute w-fit h-fit m-auto top-0 left-0 right-0 bottom-0 flexCenter text-2xl font-semibold text-[#6D5DD3]">
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

      <div>
        <h3 className="text-lg font-bold mb-3 text-gray-800">
          My Vacation Requests
        </h3>
        <div className="space-y-3">
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
            <div className="bg-white h-32 flexCenter rounded-3xl p-6 text-center text-gray-500">
              No vacation requests found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;
