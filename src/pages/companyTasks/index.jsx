import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetCompanyTasksFiltered,
  useGetCompanyTodayTasks,
} from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { useTaskFilters } from "../../hooks/useTaskFilters";
import { useTaskData } from "../../hooks/useTaskData";
import { useOverdueTaskGroups, useCompletedTaskGroups } from "./useTaskGroups";
import { getFilterTitle, getFilterIcon, getFilterColor } from "./filterUtils";
import CompanyTasksHeader from "./CompanyTasksHeader";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import TaskQuickFilters from "../../components/tasks/TaskQuickFilters";
import TaskList from "../../components/tasks/TaskList";
import TaskGroup from "./TaskGroup";

const CompanyTasks = ({ filter: propFilter }) => {
  const { companyId } = useAuth();
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter");
  const filter = propFilter || urlFilter;
  const taskMonth = searchParams.get("taskMonth");

  // State for task visibility toggles
  const [showTasks, setShowTasks] = useState(true);
  const [showSubtasks, setShowSubtasks] = useState(true);

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

  // Get filtered tasks from the appropriate data source
  const { filteredTasks, getFilterOptions } = useTaskData(
    allTasksData,
    todayTasksData,
    filter
  );


  // Group tasks for special filters
  const overdueTaskGroups = useOverdueTaskGroups(filter, filteredTasks);
  const completedTaskGroups = useCompletedTaskGroups(filter, filteredTasks);




  const shouldGroupOverdue =
    filter === "overdue" && overdueTaskGroups.length > 0;
  const shouldGroupCompleted =
    filter === "completed" && completedTaskGroups.length > 0;

  // Get unique filter options from tasks
  const { users, projects } = getFilterOptions();

  // Get filter metadata
  const filterTitle = getFilterTitle(filter);
  const FilterIcon = getFilterIcon(filter);
  const filterColor = getFilterColor(filter);

  // Calculate the actual task count AFTER applying visibility filters
  // This is the fix for the count discrepancy issue
  const visibleTaskCount = useMemo(() => {
    return filteredTasks.filter((task) => {
      const isSubTask = task?.parentTask || task?.isSubTask;
      if (isSubTask && !showSubtasks) return false;
      if (!isSubTask && !showTasks) return false;
      return true;
    }).length;
  }, [filteredTasks, showSubtasks, showTasks]);

  // Show error message if there's an error
  if (isTodayFilter && todayTasksError) {
    return (
      <ErrorState
        title={filterTitle}
        FilterIcon={FilterIcon}
        getFilterColor={() => filterColor}
        error={todayTasksError}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <LoadingState
        title={filterTitle}
        FilterIcon={FilterIcon}
        getFilterColor={() => filterColor}
      />
    );
  }

  return (
    <div className="">
      <CompanyTasksHeader
        title={filterTitle}
        taskCount={visibleTaskCount}
        users={users}
        projects={projects}
        superFilters={superFilters}
        handleFilterChange={handleFilterChange}
        handleMultiSelectFilter={handleMultiSelectFilter}
        clearAllFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Quick Filters Bar */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <TaskQuickFilters
          superFilters={superFilters}
          onFilterChange={handleFilterChange}
          onMultiSelectFilter={handleMultiSelectFilter}
          users={users}
          projects={projects}
          showTasks={showTasks}
          showSubtasks={showSubtasks}
          onToggleTasks={() => setShowTasks((prev) => !prev)}
          onToggleSubtasks={() => setShowSubtasks((prev) => !prev)}
        />
      </div>

      {/* Task List or Grouped Tasks */}
      {shouldGroupOverdue ? (
        <div className="space-y-6">
          {overdueTaskGroups.map((group) => (
            <TaskGroup
              key={group.key}
              group={group}
              showSubtasks={showSubtasks}
              showTasks={showTasks}
              filter={filter}
            />
          ))}
        </div>
      ) : shouldGroupCompleted ? (
        <div className="space-y-6">
          {completedTaskGroups.map((group) => (
            <TaskGroup
              key={group.key}
              group={group}
              showSubtasks={showSubtasks}
              showTasks={showTasks}
              filter={filter}
            />
          ))}
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          showSubtasks={showSubtasks}
          showTasks={showTasks}
          filter={filter}
        />
      )}
    </div>
  );
};

export default CompanyTasks;
