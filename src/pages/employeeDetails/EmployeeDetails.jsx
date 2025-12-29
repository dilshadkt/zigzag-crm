import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/shared/header";
import UserProfile from "../../components/settings/profile";
import {
  useGetEmployee,
  useGetEmployeeProjects,
  useGetEmployeeTeams,
  useGetEmployeeSubTasks,
  useGetEmployeeStatistics,
} from "../../api/hooks";
import Dropdown from "../../components/shared/dropdown";
import { useAuth } from "../../hooks/useAuth";
import Tasks from "../../components/employee/Tasks";
import Overview from "../../components/employee/Overview";
import Projects from "../../components/employee/Projects";
import Teams from "../../components/employee/Teams";
import Vacations from "../../components/employee/Vacations";
import { Loading } from "./Loading";
import { EmployeeHeader } from "./Header";

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "company-admin";
  const [activePage, setActivePage] = useState(
    isAdmin ? "Overview" : "Projects"
  );
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${now.getFullYear()}-${month}`;
  });
  const { data: employeeData, isLoading: isLoadingEmployee } =
    useGetEmployee(employeeId);
  const { data: projectsData, isLoading: isLoadingProjects } =
    useGetEmployeeProjects(employeeId);
  const { data: teamsData, isLoading: isLoadingTeams } = useGetEmployeeTeams(
    employeeId,
    selectedProject
  );
  const { data: subTasksData, isLoading: isLoadingSubTasks } =
    useGetEmployeeSubTasks(employeeId);
  const { data: statisticsData, isLoading: isLoadingStatistics } =
    useGetEmployeeStatistics(employeeId, selectedMonth);

  const employee = employeeData?.employee;
  const projects = projectsData?.projects || [];
  const subTasks = subTasksData?.subTasks || [];

  const filteredSubTasks = useMemo(() => {
    if (!selectedMonth) return subTasks;
    return subTasks.filter((subTask) => {
      if (!subTask?.dueDate) return false;
      const dueDate = new Date(subTask.dueDate);
      const month = String(dueDate.getMonth() + 1).padStart(2, "0");
      const monthKey = `${dueDate.getFullYear()}-${month}`;
      return monthKey === selectedMonth;
    });
  }, [subTasks, selectedMonth]);

  const subTasksCount = filteredSubTasks.length;

  // Count of today's subtasks (used for the Tasks tab badge)
  const todaySubTasksCount = useMemo(() => {
    if (!filteredSubTasks || filteredSubTasks.length === 0) return 0;

    const today = new Date();
    return filteredSubTasks.filter((subTask) => {
      if (!subTask?.dueDate) return false;
      const dueDate = new Date(subTask.dueDate);
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [filteredSubTasks]);

  useEffect(() => {
    if (!projects.length) {
      setSelectedProject("");
      return;
    }

    const hasSelectedProject = projects.some(
      (project) => project._id === selectedProject
    );

    if (!selectedProject || !hasSelectedProject) {
      setSelectedProject(projects[0]._id);
    }
  }, [projects, selectedProject]);

  const projectOptions = projects.map((project) => ({
    value: project._id,
    label: project.name,
  }));

  if (isLoadingEmployee) {
    return <Loading />;
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
            ...employee,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            profileImage: employee.profileImage,
            phoneNumber: employee.phoneNumber,
            position: employee.position,
            level: employee.level,
            gender: employee.gender,
            dob: employee.dob,
            company: employee.company,
            location: employee.location,
            progressValue: employee.progressValue,
            skype: employee.skype,
          }}
          disableEdit={!isAdmin}
          employeeId={employeeId}
        />
        <div className="flex-1 flex flex-col gap-y-5">
          <EmployeeHeader
            isAdmin={isAdmin}
            activePage={activePage}
            setActivePage={setActivePage}
            subTasksCount={subTasksCount}
            todaySubTasksCount={todaySubTasksCount}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            projectOptions={projectOptions}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
          <div className="w-full h-full overflow-y-auto">
            {activePage === "Overview" && isAdmin && (
              <Overview
                subTasks={filteredSubTasks}
                employeeId={employeeId}
                selectedMonth={selectedMonth}
                isLoading={isLoadingSubTasks || isLoadingStatistics}
                statistics={statisticsData?.statistics}
              />
            )}
            {activePage === "Projects" && (
              <Projects projects={projects} isLoading={isLoadingProjects} />
            )}
            {activePage === "Teams" && <Teams teams={teamsData?.teams || []} />}
            {activePage === "Tasks" && (
              <Tasks
                employeeId={employeeId}
                subTasks={filteredSubTasks}
                isLoading={isLoadingSubTasks}
                selectedMonth={selectedMonth}
              />
            )}
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
