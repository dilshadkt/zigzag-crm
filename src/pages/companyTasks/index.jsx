import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetAllCompanyTasks,
  useGetCompanyTodayTasks,
} from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { useTaskFilters } from "../../hooks/useTaskFilters";
import { useTaskData } from "../../hooks/useTaskData";
import Header from "../../components/shared/header";
import Navigator from "../../components/shared/navigator";
import SuperFilterPanel from "../../components/tasks/SuperFilterPanel";
import TaskList from "../../components/tasks/TaskList";
import {
  FiAlertCircle,
  FiCalendar,
  FiFlag,
  FiPlay,
  FiPause,
  FiCheckCircle,
} from "react-icons/fi";

const CompanyTasks = ({ filter: propFilter }) => {
  const { companyId } = useAuth();
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter"); // Can be: 'overdue', 'in-progress', 'pending', 'completed'
  const filter = propFilter || urlFilter; // Use prop filter if provided, otherwise use URL filter
  const taskMonth = searchParams.get("taskMonth");

  // Get all company tasks and filter based on URL parameter
  const { data: allTasksData, isLoading: allTasksLoading } =
    useGetAllCompanyTasks(companyId, taskMonth);

  // Get today's tasks with smart logic (same as dashboard)
  const { data: todayTasksData, isLoading: todayTasksLoading } =
    useGetCompanyTodayTasks(taskMonth);

  // Determine which data to use based on filter
  const isTodayFilter = filter === "today";
  const isLoading = isTodayFilter ? todayTasksLoading : allTasksLoading;

  // Use custom hooks for filters and data processing
  const {
    superFilters,
    handleFilterChange,
    handleMultiSelectFilter,
    clearAllFilters,
    hasActiveFilters,
  } = useTaskFilters();

  const { filteredTasks, getFilterOptions } = useTaskData(
    allTasksData,
    todayTasksData,
    filter,
    superFilters
  );

  // Get unique filter options from tasks
  const { users, projects } = getFilterOptions();

  const getFilterTitle = () => {
    switch (filter) {
      case "overdue":
        return "Overdue Tasks";
      case "in-progress":
        return "In Progress Tasks";
      case "pending":
        return "Pending Tasks";
      case "completed":
        return "Completed Tasks";
      case "approved":
        return "Approved Tasks";
      case "re-work":
        return "Re-work Tasks";
      case "today":
        return "Today's Tasks";
      case "unscheduled":
        return "Unscheduled Tasks";
      case "upcoming":
        return "Upcoming 3 Days Tasks";
      default:
        return "All Tasks";
    }
  };

  const getFilterIcon = () => {
    switch (filter) {
      case "overdue":
        return FiAlertCircle;
      case "in-progress":
        return FiPlay;
      case "pending":
        return FiPause;
      case "completed":
        return FiCheckCircle;
      case "approved":
        return FiCheckCircle;
      case "re-work":
        return FiAlertCircle;
      case "unscheduled":
        return FiCalendar;
      case "upcoming":
        return FiCalendar;
      default:
        return FiFlag;
    }
  };

  const getFilterColor = () => {
    switch (filter) {
      case "overdue":
        return "text-red-600";
      case "in-progress":
        return "text-blue-600";
      case "pending":
        return "text-orange-600";
      case "completed":
        return "text-green-600";
      case "approved":
        return "text-teal-600";
      case "re-work":
        return "text-red-600";
      case "unscheduled":
        return "text-gray-600";
      case "upcoming":
        return "text-cyan-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <section className="flex flex-col">
        <Navigator path={"/"} title={"Back to Dashboard"} />
        <Header>{getFilterTitle()}</Header>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const FilterIcon = getFilterIcon();

  return (
    <section className="flex flex-col h-full overflow-hidden">
      <div className="flexBetween mb-3">
        <div className="flex items-center gap-x-3">
          <Navigator path={"/"} title={"Back to Dashboard"} />
          <Header>{getFilterTitle()}</Header>
        </div>
        <div className="flex items-center  gap-x-3">
          <div className={`flex items-center gap-2 ${getFilterColor()}`}>
            <FilterIcon className="w-5 h-5" />

            <span className="font-medium">{filteredTasks.length} tasks</span>
          </div>
          <SuperFilterPanel
            superFilters={superFilters}
            handleFilterChange={handleFilterChange}
            handleMultiSelectFilter={handleMultiSelectFilter}
            clearAllFilters={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
            users={users}
            projects={projects}
          />
        </div>
      </div>

      <TaskList tasks={filteredTasks} filter={filter} />
    </section>
  );
};

export default CompanyTasks;
