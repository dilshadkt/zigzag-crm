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
  useGetEmployeeSubTasks,
} from "../../api/hooks";
import Dropdown from "../../components/shared/dropdown";
import EmployeeCard from "../../components/shared/employeeCard";
import Progress from "../../components/shared/progress";
import LeaveCard from "../../components/shared/LeaveCard";
import { format } from "date-fns";
import { useAuth } from "../../hooks/useAuth";
import {
  FiClock,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiFlag,
  FiPlay,
  FiPause,
  FiCheckCircle,
} from "react-icons/fi";

// SubTasks component definition
const Tasks = ({ employeeId }) => {
  const navigate = useNavigate();
  const { data: subTasksData, isLoading } = useGetEmployeeSubTasks(employeeId);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-review":
        return "bg-purple-100 text-purple-800";
      case "on-hold":
        return "bg-orange-100 text-orange-800";
      case "re-work":
        return "bg-red-100 text-red-800";
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleTaskClick = (subTask) => {
    // Navigate to project detail page with task and subtask IDs
    navigate(
      `/projects/${subTask.project._id}/${subTask.parentTask._id}?subTaskId=${subTask._id}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#E6EBF5] border-t-[#3F8CFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!subTasksData?.subTasks || subTasksData.subTasks.length === 0) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        <div>
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No subtasks assigned
          </h3>
          <p className="text-gray-500">
            This employee doesn't have any subtasks assigned yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="rounded-lg  ">
        <div className="divide-y flex flex-col  gap-y-2 divide-gray-200">
          {subTasksData.subTasks.map((subTask) => {
            const isOverdue = (() => {
              const dueDate = new Date(subTask.dueDate);
              const today = new Date();

              // Reset time to start of day for accurate date comparison
              const dueDateOnly = new Date(
                dueDate.getFullYear(),
                dueDate.getMonth(),
                dueDate.getDate()
              );
              const todayOnly = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );

              // Task is overdue if due date has passed AND task is not completed
              return dueDateOnly < todayOnly && subTask.status !== "completed";
            })();
            const daysOverdue = isOverdue ? getDaysOverdue(subTask.dueDate) : 0;

            return (
              <div
                key={subTask._id}
                onClick={() => handleTaskClick(subTask)}
                className="p-4 bg-white  hover:bg-gray-50 cursor-pointer
                rounded-xl border  border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {subTask.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            subTask.priority
                          )}`}
                        >
                          {subTask.priority}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            subTask.status
                          )}`}
                        >
                          {subTask.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    {subTask.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {subTask.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {subTask.project && (
                        <div className="flex items-center gap-1">
                          <FiFlag className="w-4 h-4" />
                          <span>{subTask.project.name}</span>
                        </div>
                      )}
                      {subTask.parentTask && (
                        <div className="flex items-center gap-1">
                          <FiUser className="w-4 h-4" />
                          <span>Parent: {subTask.parentTask.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Due {formatDate(subTask.dueDate)}</span>
                        {isOverdue && (
                          <span className="text-red-600 font-medium">
                            ({daysOverdue} day{daysOverdue > 1 ? "s" : ""}{" "}
                            overdue)
                          </span>
                        )}
                      </div>
                      {subTask.timeEstimate && (
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>{subTask.timeEstimate}h</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {subTask.assignedTo && subTask.assignedTo.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FiUser className="w-4 h-4" />
                        <span>{subTask.assignedTo.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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

  // Overview component for admin
  const Overview = ({ subTasks }) => {
    const navigate = useNavigate();
    const totalSubTasks = subTasks.length;
    const completedSubTasks = subTasks.filter(
      (subTask) => subTask.status === "completed"
    ).length;
    const inProgressSubTasks = subTasks.filter(
      (subTask) => subTask.status === "in-progress"
    ).length;
    const pendingSubTasks = subTasks.filter(
      (subTask) => subTask.status === "todo"
    ).length;
    const overdueSubTasks = subTasks.filter((subTask) => {
      const dueDate = new Date(subTask.dueDate);
      const today = new Date();

      // Reset time to start of day for accurate date comparison
      const dueDateOnly = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate()
      );
      const todayOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      // Task is overdue if due date has passed AND task is not completed
      return dueDateOnly < todayOnly && subTask.status !== "completed";
    }).length;
    const todaySubTasks = subTasks.filter((subTask) => {
      if (!subTask.dueDate) return false;
      const dueDate = new Date(subTask.dueDate);
      const today = new Date();
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      );
    }).length;
    const completionRate =
      totalSubTasks > 0
        ? Math.round((completedSubTasks / totalSubTasks) * 100)
        : 0;

    // Navigation handlers for stat cards
    const handleStatsClick = (statType) => {
      switch (statType) {
        case "total":
          navigate(`/employees/${employeeId}/subtasks`);
          break;
        case "completed":
          navigate(`/employees/${employeeId}/subtasks?filter=completed`);
          break;
        case "in-progress":
          navigate(`/employees/${employeeId}/subtasks?filter=in-progress`);
          break;
        case "pending":
          navigate(`/employees/${employeeId}/subtasks?filter=pending`);
          break;
        case "today":
          navigate(`/employees/${employeeId}/subtasks?filter=today`);
          break;
        case "overdue":
          navigate(`/employees/${employeeId}/subtasks?filter=overdue`);
          break;
        default:
          break;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flexBetween mb-4">
          <h4 className="font-semibold text-lg text-gray-800">Task Progress</h4>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">
              {completionRate}%
            </div>
            <div className="text-xs text-gray-500">Task Completion</div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Subtask Completion Rate</span>
            <span>
              {completedSubTasks} of {totalSubTasks} tasks completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
        {/* Subtask Statistics */}
        <div className="grid grid-cols-6 gap-4 flex-1">
          <StatCard
            title="Total task"
            value={totalSubTasks}
            color="blue"
            onClick={() => handleStatsClick("total")}
          />
          <StatCard
            title="Today's tasks"
            value={todaySubTasks}
            color="purple"
            onClick={() => handleStatsClick("today")}
          />
          <StatCard
            title="Completed"
            value={completedSubTasks}
            color="green"
            percent={
              totalSubTasks > 0
                ? Math.round((completedSubTasks / totalSubTasks) * 100)
                : 0
            }
            onClick={() => handleStatsClick("completed")}
          />
          <StatCard
            title="In Progress"
            value={inProgressSubTasks}
            color="yellow"
            percent={
              totalSubTasks > 0
                ? Math.round((inProgressSubTasks / totalSubTasks) * 100)
                : 0
            }
            onClick={() => handleStatsClick("in-progress")}
          />
          <StatCard
            title="Pending"
            value={pendingSubTasks}
            color="orange"
            percent={
              totalSubTasks > 0
                ? Math.round((pendingSubTasks / totalSubTasks) * 100)
                : 0
            }
            onClick={() => handleStatsClick("pending")}
          />
          <StatCard
            title="Overdue"
            value={overdueSubTasks}
            color="red"
            onClick={() => handleStatsClick("overdue")}
          />
        </div>
        {/* Overdue Subtasks Alert */}
        {overdueSubTasks > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-red-700">
                {overdueSubTasks} overdue subtask
                {overdueSubTasks > 1 ? "s" : ""} - Please review and update
                these subtasks
              </span>
            </div>
          </div>
        )}
        {/* No Subtasks Message */}
        {totalSubTasks === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">📊</div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No subtasks assigned yet
            </h3>
            <p className="text-gray-500 text-sm">
              Subtask statistics will appear here once subtasks are assigned.
            </p>
          </div>
        )}
      </div>
    );
  };

  // StatCard component for Overview
  const StatCard = ({ title, value, color, percent, onClick }) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
      },
      yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
      },
      red: {
        bg: "bg-red-50",
        text: "text-red-600",
      },
    };
    return (
      <div
        className={`${colorMap[color].bg} rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
        onClick={onClick}
      >
        <div className={`text-2xl font-bold ${colorMap[color].text}`}>
          {value}
        </div>
        <div className="text-sm text-gray-600">{title}</div>
        {typeof percent === "number" && (
          <div className="text-xs text-gray-400 mt-1">{percent}%</div>
        )}
      </div>
    );
  };

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
              <Overview subTasks={subTasks} />
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
