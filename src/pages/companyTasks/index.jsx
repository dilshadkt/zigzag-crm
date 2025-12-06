import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetCompanyTasksFiltered,
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

  // Use custom hooks for filters and data processing
  const {
    superFilters,
    handleFilterChange,
    handleMultiSelectFilter,
    clearAllFilters,
    hasActiveFilters,
  } = useTaskFilters();

  // Determine which data to use based on filter
  const isTodayFilter = filter === "today";
  const shouldFetchAllTasks = !isTodayFilter;

  // Get all company tasks and filter based on URL parameter
  const { data: allTasksData, isLoading: allTasksLoading } =
    useGetCompanyTasksFiltered(companyId, taskMonth, {
      filter,
      superFilters,
      enabled: shouldFetchAllTasks,
    });

  // Get today's tasks with smart logic (same as dashboard)
  const {
    data: todayTasksData,
    isLoading: todayTasksLoading,
    error: todayTasksError,
  } = useGetCompanyTodayTasks(taskMonth, {
    superFilters,
    enabled: isTodayFilter,
  });
  const isLoading = isTodayFilter ? todayTasksLoading : allTasksLoading;
  const { filteredTasks, getFilterOptions } = useTaskData(
    allTasksData,
    todayTasksData,
    filter
  );

  const overdueTaskGroups = useMemo(() => {
    if (filter !== "overdue" || filteredTasks.length === 0) {
      return [];
    }

    const groups = new Map();

    filteredTasks.forEach((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const hasValidDate =
        dueDate instanceof Date && !Number.isNaN(dueDate.getTime());
      const groupKey = hasValidDate
        ? `${dueDate.getFullYear()}-${dueDate.getMonth()}`
        : "no-date";
      const label = hasValidDate
        ? dueDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "No Due Date";
      const sortValue = hasValidDate
        ? new Date(dueDate.getFullYear(), dueDate.getMonth(), 1).getTime()
        : Number.MIN_SAFE_INTEGER;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label,
          sortValue,
          tasks: [],
        });
      }
      groups.get(groupKey).tasks.push(task);
    });

    return Array.from(groups.values()).sort(
      (a, b) => (b.sortValue || 0) - (a.sortValue || 0)
    );
  }, [filter, filteredTasks]);

  const shouldGroupOverdue =
    filter === "overdue" && overdueTaskGroups.length > 0;

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

  // Show error message if there's an error
  if (isTodayFilter && todayTasksError) {
    return (
      <section className="flex flex-col">
        <Navigator path={"/"} title={"Back to Dashboard"} />
        <Header>{getFilterTitle()}</Header>
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 font-medium">
            Error loading today's tasks
          </p>
          <p className="text-red-600 text-sm mt-1">
            {todayTasksError?.response?.data?.message ||
              todayTasksError?.message ||
              "An error occurred"}
          </p>
          <p className="text-red-500 text-xs mt-2">
            Status: {todayTasksError?.response?.status || "Unknown"}
          </p>
        </div>
      </section>
    );
  }

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

      <div className="flex-1 overflow-hidden">
        {shouldGroupOverdue ? (
          <div className="flex h-full flex-col gap-6 overflow-y-auto pr-1">
            {overdueTaskGroups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="font-semibold">{group.label}</span>
                  <span className="text-xs text-gray-400">
                    {group.tasks.length}{" "}
                    {group.tasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <TaskList
                  tasks={group.tasks}
                  filter={filter}
                  scrollable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <TaskList tasks={filteredTasks} filter={filter} />
        )}
      </div>
    </section>
  );
};

export default CompanyTasks;
