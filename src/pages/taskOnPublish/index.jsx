import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiSearch,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetTasksOnPublish } from "../../api/hooks";
import Navigator from "../../components/shared/navigator";
import { useAuth } from "../../hooks/useAuth";
import socketService from "../../services/socketService";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Task from "../../components/shared/task";
import FilterMenu from "../../components/projects/FilterMenu";
import { assetPath } from "../../utils/assetPath";
import MoveToCampaignModal from "../../components/tasks/MoveToCampaignModal";
import TaskQuickFilters from "../../components/tasks/TaskQuickFilters";

const isSubTaskItem = (task) =>
  Boolean(task?.parentTask || task?.isSubTask || task?.type === "subtask");

const TaskOnPublish = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const taskMonth = searchParams.get("taskMonth") || getCurrentMonth();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: tasksOnPublishData,
    isLoading,
    refetch,
  } = useGetTasksOnPublish({
    page: 1,
    limit: 100,
    sortBy: "dueDate",
    sortOrder: "asc",
    taskMonth: taskMonth,
  });
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const handleTaskStatusChange = (data) => {
      if (data.newStatus === "client-approved" || data.oldStatus === "client-approved") {
        refetch();
      }
    };

    const handleNewNotification = (data) => {
      if (data.type === "task_client_approved" || data.type === "task_updated") {
        refetch();
        queryClient.invalidateQueries(["tasksOnPublish"]);
      }
    };

    socketService.onTaskStatusChange(handleTaskStatusChange);
    socketService.onNewNotification(handleNewNotification);

    return () => {
      socketService.offTaskStatusChange(handleTaskStatusChange);
      socketService.offNewNotification(handleNewNotification);
    };
  }, [queryClient, refetch, user?._id]);

  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [filters] = useState({
    search: "",
    priority: [],
    project: [],
    dateRange: {
      start: "",
      end: "",
    },
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  const [showTasks, setShowTasks] = useState(() => {
    const saved = localStorage.getItem("task_on_publish_showTasks_v2");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showSubtasks, setShowSubtasks] = useState(() => {
    const saved = localStorage.getItem("task_on_publish_showSubtasks_v2");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("task_on_publish_showTasks_v2", JSON.stringify(showTasks));
  }, [showTasks]);

  useEffect(() => {
    localStorage.setItem(
      "task_on_publish_showSubtasks_v2",
      JSON.stringify(showSubtasks)
    );
  }, [showSubtasks]);

  const [superFilters, setSuperFilters] = useState({ assignedTo: [], project: [] });

  const handleSuperFilterChange = (type, value) => {
    setSuperFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleMultiSelectFilter = (type, value) => {
    setSuperFilters((prev) => {
      const currentValues = prev[type] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [type]: newValues };
    });
  };

  const getFilterOptions = (tasks) => {
    const usersMap = new Map();
    const projectsMap = new Map();

    tasks.forEach((task) => {
      if (task.project?._id) {
        projectsMap.set(task.project._id, task.project);
      }
      if (task.assignedTo && Array.isArray(task.assignedTo)) {
        task.assignedTo.forEach((assignee) => {
          if (assignee?._id) {
            usersMap.set(assignee._id, assignee);
          }
        });
      }
    });

    return {
      users: Array.from(usersMap.values()),
      projects: Array.from(projectsMap.values()),
    };
  };

  const filterTasks = (tasks) => {
    const term = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const today = new Date();
      let passesUrlFilter = true;

      switch (filter) {
        case "overdue": {
          const dueDate = new Date(task.dueDate);
          passesUrlFilter = dueDate < today;
          break;
        }
        case "today": {
          const taskDueDate = new Date(task.dueDate);
          const todayStart = new Date(today);
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          passesUrlFilter =
            taskDueDate >= todayStart && taskDueDate <= todayEnd;
          break;
        }
        case "this-week": {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          const taskWeekDate = new Date(task.dueDate);
          passesUrlFilter =
            taskWeekDate >= weekStart && taskWeekDate <= weekEnd;
          break;
        }
        default:
          break;
      }

      if (!passesUrlFilter) return false;

      if (term) {
        const haystack = [
          task.title,
          task.project?.name,
          task.project?.displayName,
          task.parentTask?.title,
          task.taskCategory?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      if (activeFilters) {
        if (
          activeFilters.status.length > 0 &&
          !activeFilters.status.includes(task.status)
        ) {
          return false;
        }

        if (
          activeFilters.priority.length > 0 &&
          !activeFilters.priority.includes(task.priority)
        ) {
          return false;
        }

        if (
          activeFilters.dateRange.startDate &&
          activeFilters.dateRange.endDate
        ) {
          const taskDate = new Date(task.dueDate);
          const startDate = new Date(activeFilters.dateRange.startDate);
          const endDate = new Date(activeFilters.dateRange.endDate);
          if (taskDate < startDate || taskDate > endDate) {
            return false;
          }
        }
      }

      if (superFilters.assignedTo?.length > 0) {
        const taskAssigneeIds = task.assignedTo?.map((assignee) => assignee._id) || [];
        const hasAssignee = superFilters.assignedTo.some((id) =>
          taskAssigneeIds.includes(id)
        );
        if (!hasAssignee) return false;
      }

      if (superFilters.project?.length > 0) {
        const projectId = task.project?._id;
        if (!projectId || !superFilters.project.includes(projectId)) return false;
      }

      const isSubTask = isSubTaskItem(task);
      if (isSubTask && !showSubtasks) return false;
      if (!isSubTask && !showTasks) return false;

      return true;
    });
  };

  useEffect(() => {
    if (!tasksOnPublishData?.tasks) return;

    let nextTasks = filterTasks([...tasksOnPublishData.tasks]);

    nextTasks.sort((a, b) => {
      let aValue;
      let bValue;

      switch (filters.sortBy) {
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "priority": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority?.toLowerCase?.()] || 0;
          bValue = priorityOrder[b.priority?.toLowerCase?.()] || 0;
          break;
        }
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
      }

      if (filters.sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    setFilteredTasks(nextTasks);
  }, [
    tasksOnPublishData,
    filter,
    activeFilters,
    filters,
    superFilters,
    showTasks,
    showSubtasks,
    searchTerm,
  ]);

  const handleFilterChange = (nextFilters) => {
    setActiveFilters(nextFilters);
  };

  const typeCounts = useMemo(() => {
    const items = tasksOnPublishData?.tasks || [];
    const taskCount = items.filter((task) => !isSubTaskItem(task)).length;
    return {
      taskCount,
      subtaskCount: items.length - taskCount,
    };
  }, [tasksOnPublishData]);

  const summary = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    return {
      total: filteredTasks.length,
      overdue: filteredTasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) < todayStart
      ).length,
      today: filteredTasks.filter((task) => {
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        return due >= todayStart && due <= todayEnd;
      }).length,
      high: filteredTasks.filter(
        (task) => String(task.priority || "").toLowerCase() === "high"
      ).length,
    };
  }, [filteredTasks]);

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedTaskForCampaign, setSelectedTaskForCampaign] = useState(null);

  const handleMoreOptions = (task) => {
    setSelectedTaskForCampaign(task);
    setShowCampaignModal(true);
  };

  const handleTaskClick = (task) => {
    if (task.type === "subtask") {
      if (task.parentTask?._id) {
        navigate(`/tasks/${task.parentTask._id}?subtask=${task._id}`);
      } else if (task.project?._id) {
        navigate(`/projects/${task.project._id}?subtask=${task._id}`);
      }
    } else if (task.project?._id) {
      navigate(`/projects/${task.project._id}/${task._id}`);
    } else {
      navigate(`/tasks/${task._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flexCenter">
        <img src={assetPath("icons/loading.svg")} alt="" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="">
            {/* Header & Filters Row */}
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center mb-4 md:mb-6">
              <div className="flex items-center shrink-0">
                <Navigator />
              </div>

              {/* Search */}
              <label className="w-full md:w-64 shrink-0 text-sm text-[#91929E]">
                <span className="sr-only">Search tasks</span>
                <div className="flex items-center gap-2 rounded-full bg-white border border-[#E4E6E8] px-3 py-2.5">
                  <img src="/icons/search.svg" alt="" className="h-4 w-4 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by title, project..."
                    className="w-full bg-transparent text-sm text-[#0A1629] placeholder:text-[#91929E] focus:outline-none"
                  />
                </div>
              </label>

              {/* Quick Filters */}
              <div className="flex-1 min-w-0">
                <TaskQuickFilters
                  superFilters={superFilters}
                  onFilterChange={handleSuperFilterChange}
                  onMultiSelectFilter={handleMultiSelectFilter}
                  users={getFilterOptions(tasksOnPublishData?.tasks || []).users}
                  projects={getFilterOptions(tasksOnPublishData?.tasks || []).projects}
                  showTasks={showTasks}
                  showSubtasks={showSubtasks}
                  onToggleTasks={() => setShowTasks((prev) => !prev)}
                  onToggleSubtasks={() => setShowSubtasks((prev) => !prev)}
                  taskCount={typeCounts.taskCount}
                  subtaskCount={typeCounts.subtaskCount}
                  className="flex-wrap"
                />
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-purple-100 bg-purple-50/50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-purple-500">
                  Showing
                </p>
                <p className="mt-0.5 text-lg font-bold text-purple-700">{summary.total}</p>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50/50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">
                  Overdue
                </p>
                <p className="mt-0.5 text-lg font-bold text-red-600">{summary.overdue}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-400">
                  Due today
                </p>
                <p className="mt-0.5 text-lg font-bold text-blue-600">{summary.today}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-500">
                  High priority
                </p>
                <p className="mt-0.5 text-lg font-bold text-amber-600">{summary.high}</p>
              </div>
            </div>



            {/* Tasks List */}
            <div className="flex flex-col h-full pb-5 gap-y-2 rounded-xl overflow-hidden overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nothing waiting to publish
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No matching tasks for that search. Try another name or turn on Subtasks."
                      : "When a task only has Publishing & Scheduling left, it will show up here."}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <Task
                    key={task._id}
                    task={task}
                    onClick={handleTaskClick}
                    isBoardView={false}
                    index={index}
                    compact
                    isMoreOptions={true}
                    onMoreOptions={handleMoreOptions}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <FilterMenu
        isOpen={showFilter}
        setShowModalFilter={setShowFilter}
        onFilterChange={handleFilterChange}
      />

      {showCampaignModal && selectedTaskForCampaign && (
        <MoveToCampaignModal
          task={selectedTaskForCampaign}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedTaskForCampaign(null);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default TaskOnPublish;
