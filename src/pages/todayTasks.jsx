import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployeeSubTasksToday } from "../api/hooks";
import { useAuth } from "../hooks/useAuth";
import { useTaskFilters } from "../hooks/useTaskFilters";
import Header from "../components/shared/header";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import LoadingState from "./companyTasks/LoadingState";
import TaskQuickFilters from "../components/tasks/TaskQuickFilters";
import TaskList from "../components/tasks/TaskList";

const TodayTasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: todayData, isLoading } = useGetEmployeeSubTasksToday(
    user?._id ? user._id : null
  );

  const {
    superFilters,
    handleFilterChange,
    handleMultiSelectFilter,
  } = useTaskFilters("employee_today_tasks_filters");



  // Get unique filter options from subtasks
  const combinedItems = useMemo(() => {
    if (!todayData) return [];
    const subTasks = [...(todayData.subTasks || []), ...(todayData.reworkSubTasks || [])];
    // Filter out on-review subtasks exactly like we do in CompanyTasks/useTaskData
    const validSubTasks = subTasks.filter(st => st.status !== 'on-review');
    return [
      ...validSubTasks.map((s) => ({ ...s, __type: "subtask" })),
    ];
  }, [todayData]);

  const getFilterOptions = () => {
    if (!combinedItems.length) return { projects: [] };
    const projects = [];
    const projectIds = new Set();

    combinedItems.forEach((item) => {
      if (item.project && !projectIds.has(item.project._id)) {
        projectIds.add(item.project._id);
        projects.push(item.project);
      }
    });

    return { projects };
  };

  const { projects } = getFilterOptions();

  const filteredItems = useMemo(() => {
    let filtered = combinedItems;

    if (superFilters.search) {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(superFilters.search.toLowerCase()) ||
          item.description?.toLowerCase().includes(superFilters.search.toLowerCase())
      );
    }

    if (superFilters.status && superFilters.status.length > 0) {
      filtered = filtered.filter((item) =>
        superFilters.status.includes(item.status)
      );
    }

    if (superFilters.priority && superFilters.priority.length > 0) {
      filtered = filtered.filter((item) =>
        superFilters.priority.includes(item.priority)
      );
    }

    if (superFilters.project && superFilters.project.length > 0) {
      filtered = filtered.filter(
        (item) => item.project && superFilters.project.includes(item.project._id)
      );
    }

    // Sort logic
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aVal = priorityOrder[a.priority?.toLowerCase()] || 0;
      const bVal = priorityOrder[b.priority?.toLowerCase()] || 0;
      return superFilters.sortOrder === "desc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [combinedItems, superFilters]);

  if (isLoading) {
    return <LoadingState title="Today's Tasks" />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0 bg-white shadow-sm"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <Header>Today's Tasks - ({filteredItems.length})</Header>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-3 md:p-4 border-b border-gray-100 space-y-3">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative min-w-0">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={superFilters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <TaskQuickFilters
                    superFilters={superFilters}
                    onFilterChange={handleFilterChange}
                    onMultiSelectFilter={handleMultiSelectFilter}
                    projects={projects}
                    users={[]}
                    hideTypeToggles={true}
                    hideAssignees={true}
                    className="flex-wrap"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/30 p-2 md:p-4">
              <TaskList
                tasks={filteredItems}
                filter="today"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayTasks;
