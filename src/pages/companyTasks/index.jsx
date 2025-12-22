import React, { useMemo, useState } from "react";
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
  const urlFilter = searchParams.get("filter");
  const filter = propFilter || urlFilter;
  const taskMonth = searchParams.get("taskMonth");

  // Use custom hooks for filters
  const {
    superFilters,
    handleFilterChange,
    handleMultiSelectFilter,
    clearAllFilters,
    hasActiveFilters,
  } = useTaskFilters();

  // Determine which data to use based on filter
  const isTodayFilter = filter === "today";

  // ALWAYS call both hooks, but control them with 'enabled' option
  // This ensures hooks are called in the same order every render
  const { data: allTasksData, isLoading: allTasksLoading } =
    useGetCompanyTasksFiltered(companyId, taskMonth, {
      filter,
      superFilters,
      enabled: !isTodayFilter, // Only fetch when NOT today filter
    });

  const {
    data: todayTasksData,
    isLoading: todayTasksLoading,
    error: todayTasksError,
  } = useGetCompanyTodayTasks(taskMonth, {
    superFilters,
    enabled: isTodayFilter, // Only fetch when IS today filter
  });

  // Determine loading state based on active filter
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

  const FilterIcon = getFilterIcon();
  const [showSubtasks, setShowSubtasks] = useState(true);

  // Show error message if there's an error
  if (isTodayFilter && todayTasksError) {
    return (
      <>
        <Header />
        <Navigator />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FilterIcon className={getFilterColor()} />
              {getFilterTitle()}
            </h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">
              Error loading today's tasks
            </h3>
            <p className="text-red-600 mb-2">
              {todayTasksError?.response?.data?.message ||
                todayTasksError?.message ||
                "An error occurred"}
            </p>
            <p className="text-sm text-red-500">
              Status: {todayTasksError?.response?.status || "Unknown"}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <Navigator />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FilterIcon className={getFilterColor()} />
              {getFilterTitle()}
            </h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center ">
        <Header />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-between">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex  gap-x-2">
              <Navigator />

              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {/* <FilterIcon className={getFilterColor()} /> */}
                {getFilterTitle()}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {showSubtasks
                  ? filteredTasks.length
                  : filteredTasks.filter(
                      (task) => !task?.parentTask && !task?.isSubTask
                    ).length}{" "}
                tasks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <button
              onClick={() => setShowSubtasks((prev) => !prev)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            >
              {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
            </button>
            <SuperFilterPanel
              users={users}
              projects={projects}
              superFilters={superFilters}
              handleFilterChange={handleFilterChange}
              handleMultiSelectFilter={handleMultiSelectFilter}
              clearAllFilters={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>

        {shouldGroupOverdue ? (
          <div className="space-y-6">
            {overdueTaskGroups.map((group) => (
              <div key={group.key}>
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {group.label}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {group.tasks.length}{" "}
                    {group.tasks.length === 1 ? "task" : "tasks"}
                  </p>
                </div>
                <TaskList tasks={group.tasks} showSubtasks={showSubtasks} />
              </div>
            ))}
          </div>
        ) : (
          <TaskList tasks={filteredTasks} showSubtasks={showSubtasks} />
        )}
      </div>
    </>
  );
};

export default CompanyTasks;
