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
import MyWorkBoard from "../components/tasks/MyWorkBoard";

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

  // Overdue and in-progress work sit beside "due today"; the page shows all three.
  const overdueItems = useMemo(
    () => (todayData?.overdue || []).map((s) => ({ ...s, __type: "subtask" })),
    [todayData]
  );
  const inProgressItems = useMemo(
    () => (todayData?.inProgress || []).map((s) => ({ ...s, __type: "subtask" })),
    [todayData]
  );

  const upcomingItems = useMemo(
    () => (todayData?.upcoming || []).map((s) => ({ ...s, __type: "subtask" })),
    [todayData]
  );

  // Board (pipeline) or the plain list; remembered per browser
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("myWorkView") === "list" ? "list" : "board";
    } catch {
      return "board";
    }
  });
  const changeView = (next) => {
    setView(next);
    try {
      localStorage.setItem("myWorkView", next);
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
  };

  const getFilterOptions = () => {
    if (!combinedItems.length && !overdueItems.length && !inProgressItems.length) {
      return { projects: [] };
    }
    const projects = [];
    const projectIds = new Set();

    [...combinedItems, ...overdueItems, ...inProgressItems, ...upcomingItems].forEach((item) => {
      if (item.project && !projectIds.has(item.project._id)) {
        projectIds.add(item.project._id);
        projects.push(item.project);
      }
    });

    return { projects };
  };

  const { projects } = getFilterOptions();

  const applyFilters = (items) => {
    let filtered = [...items];

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
  };

  const filteredItems = useMemo(() => applyFilters(combinedItems), [combinedItems, superFilters]);
  const filteredOverdue = useMemo(() => applyFilters(overdueItems), [overdueItems, superFilters]);
  const filteredInProgress = useMemo(
    () => applyFilters(inProgressItems),
    [inProgressItems, superFilters]
  );
  const filteredUpcoming = useMemo(() => applyFilters(upcomingItems), [upcomingItems, superFilters]);
  const totalCount =filteredItems.length + filteredOverdue.length + filteredInProgress.length;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50/50">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0 bg-white shadow-sm"
              aria-label="Go back"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="flex flex-col md:flex-row gap-2 items-center w-full sm:w-auto">
            <div className="h-10 w-full md:w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Task List Skeleton */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-2 md:p-0">
                <div className="flex flex-col gap-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="p-4 bg-white rounded-lg border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 animate-pulse"
                    >
                      <div className="flex-1 w-full space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="flex gap-3 mt-2">
                          <div className="h-5 w-16 bg-gray-100 rounded-full"></div>
                          <div className="h-5 w-20 bg-gray-100 rounded-full"></div>
                        </div>
                        <div className="flex gap-4 mt-3">
                          <div className="h-4 w-24 bg-gray-100 rounded"></div>
                          <div className="h-4 w-24 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center justify-end gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                        <div className="h-6 w-20 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0 bg-white shadow-sm"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <Header>My Work - ({totalCount})</Header>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full md:w-auto min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={superFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <div className="flex shrink-0 rounded-lg border border-gray-200 bg-white p-0.5 text-xs font-semibold">
            {["board", "list"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => changeView(mode)}
                className={`rounded-md px-3 py-1.5 capitalize transition-colors ${
                  view === mode ? "bg-[#3F8CFF] text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <TaskQuickFilters
              superFilters={superFilters}
              onFilterChange={handleFilterChange}
              onMultiSelectFilter={handleMultiSelectFilter}
              projects={projects}
              users={[]}
              hideTypeToggles={true}
              hideAssignees={true}
              className="flex-nowrap"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className={`min-h-0 flex-1 p-2 md:p-0 ${view === "board" ? "overflow-hidden" : "overflow-y-auto"}`}>
              {view === "board" && (
                <MyWorkBoard
                  items={{
                    overdue: filteredOverdue,
                    today: filteredItems,
                    inProgress: filteredInProgress,
                    upcoming: filteredUpcoming,
                  }}
                />
              )}
              {view === "list" && [
                { key: "today", label: "Due today", dot: "bg-blue-500", items: filteredItems },
                { key: "overdue", label: "Overdue · reason needed to end shift", dot: "bg-red-500", items: filteredOverdue },
                { key: "in-progress", label: "In progress · due later", dot: "bg-sky-400", items: filteredInProgress },
              ]
                .filter((group) => group.items.length > 0)
                .map((group) => (
                  <section key={group.key} className="mb-5">
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className={`h-2 w-2 rounded-full ${group.dot}`} />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {group.label}
                      </h3>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                        {group.items.length}
                      </span>
                    </div>
                    <TaskList tasks={group.items} filter="today" />
                  </section>
                ))}
              {view === "list" && totalCount === 0 && (
                <p className="py-10 text-center text-sm text-gray-500">
                  You&apos;re all caught up for today!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayTasks;
