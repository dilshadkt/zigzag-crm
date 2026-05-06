import React, { useState, useEffect, useMemo } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Task from "../../shared/task";
import { useNavigate, useParams } from "react-router-dom";
import FilterMenu from "../FilterMenu";
import { useQueryClient } from "@tanstack/react-query";
import list from "../../../assets/icons/list.svg";
import board from "../../../assets/icons/board.svg";
import { updateTaskById, updateProjectPortalConfig, getProjectById, updateProjectLeadFormConfig } from "../../../api/service";
import { useUpdateTaskOrder, useProjectDetails } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useGetCampaignsByCompany } from "../../../api/campaigns";
import { useGetAllLeadFormConfigs } from "../../../features/leads/api";
import LeadsFeature from "../../../features/leads";
import { toast } from "react-hot-toast";

import { OverviewTab } from "./OverviewTab";
import { KanbanTab } from "./KanbanTab";
import { ListTab } from "./ListTab";
import { CampaignTab } from "./CampaignTab";
import { SettingsTab } from "./SettingsTab";
import { ProjectOverViewShimmer } from "../ProjectDetailShimmer";

// Status configuration
const statusConfig = {
  todo: {
    title: "Active Tasks",
    color: "bg-orange-100 text-orange-800",
    allowedForAll: true,
  },
  "in-progress": {
    title: "In Progress",
    color: "bg-blue-100 text-blue-800",
    allowedForAll: true,
  },
  "on-review": {
    title: "On Review",
    color: "bg-purple-100 text-purple-800",
    allowedForAll: true,
  },
  "on-hold": {
    title: "On Hold",
    color: "bg-yellow-100 text-yellow-800",
    allowedForAll: false,
  },
  "re-work": {
    title: "Re-work",
    color: "bg-red-100 text-red-800",
    allowedForAll: false,
  },
  approved: {
    title: "Approved",
    color: "bg-emerald-100 text-emerald-800",
    allowedForAll: false,
  },
  "client-approved": {
    title: "Client Approved",
    color: "bg-teal-100 text-teal-800",
    allowedForAll: false,
  },
  completed: {
    title: "Completed",
    color: "bg-green-100 text-green-800",
    allowedForAll: true,
  },
};

const ProjectOverView = ({ currentProject, selectedMonth, onRefresh, isLoading }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (projectId) {
      const saved = localStorage.getItem(`activeTab_${projectId}`);
      if (saved) return saved;
    }
    return "overview";
  });

  useEffect(() => {
    if (activeTab && projectId) {
      localStorage.setItem(`activeTab_${projectId}`, activeTab);
    }
  }, [activeTab, projectId]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const isBoardView = activeTab === "kanban";
  const [showSubtasks, setShowSubtasks] = useState(true);
  const { mutate: updateOrder } = useUpdateTaskOrder(currentProject?._id);
  const { isCompany, user } = useAuth();
  const { hasPermission } = usePermissions();

  const availableTabs = useMemo(() => {
    return [
      { id: "overview", label: "Overview", visible: hasPermission("tasks", "viewOverview") },
      { id: "kanban", label: "Task Kanban", visible: true },
      { id: "list", label: "Task List", visible: true },
      { id: "lead", label: "Lead", visible: hasPermission("tasks", "viewLead") },
      { id: "campaign", label: "Campaign", visible: hasPermission("tasks", "viewCampaign") },
      { id: "settings", label: "Settings", visible: hasPermission("tasks", "viewSettings") },
    ].filter(tab => tab.visible);
  }, [hasPermission]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  const [clientCreds, setClientCreds] = useState({
    username: "",
    password: "",
  });

  const { data: campaignData, isLoading: isCampaignsLoading } = useGetCampaignsByCompany(
    currentProject?.company,
    {
      limit: 100,
      projectId: projectId,
      facebookAdAccountId: currentProject?.facebookAdAccountId
    }
  );
  const projectCampaigns = campaignData?.data || [];

  const { data: leadFormConfigsData } = useGetAllLeadFormConfigs();
  const leadFormConfigs = leadFormConfigsData?.data || [];
  const [selectedLeadForm, setSelectedLeadForm] = useState(
    typeof currentProject?.activeLeadFormConfig === 'object'
      ? currentProject.activeLeadFormConfig?._id
      : (currentProject?.activeLeadFormConfig || "")
  );

  useEffect(() => {
    if (currentProject?.activeLeadFormConfig) {
      const configId = typeof currentProject.activeLeadFormConfig === 'object'
        ? currentProject.activeLeadFormConfig._id
        : currentProject.activeLeadFormConfig;
      setSelectedLeadForm(configId);
    } else {
      setSelectedLeadForm("");
    }
  }, [currentProject?.activeLeadFormConfig]);

  useEffect(() => {
    if (activeTab === "settings" && projectId) {
      const fetchPortalConfig = async () => {
        try {
          const response = await getProjectById(projectId);
          if (response?.project?.portalConfig) {
            setClientCreds({
              username: response.project.portalConfig.username || "",
              password: response.project.portalConfig.password || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch portal config:", error);
        }
      };
      fetchPortalConfig();
    }
  }, [activeTab, projectId]);

  if (isLoading) {
    return <ProjectOverViewShimmer isBoardView={isBoardView} />;
  }

  const hasWorkDetailsForCurrentMonth = () => {
    if (!currentProject?.workDetails || !selectedMonth) return false;
    return currentProject.workDetails.some((wd) => wd.month === selectedMonth);
  };

  const getAvailableMonths = () => {
    if (!currentProject?.workDetails) return [];
    return currentProject.workDetails.map((wd) => wd.month).sort();
  };

  const employeeAllowedStatuses = [
    "todo",
    "in-progress",
    "completed",
    "on-review",
  ];

  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      if (!showSubtasks && task?.itemType === "subtask") {
        return false;
      }
      if (activeFilters) {
        if (
          activeFilters.showSubtasks === false &&
          task?.itemType === "subtask"
        ) {
          return false;
        }
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
      return true;
    });
  };

  const enhancedTasks = (currentProject?.tasks || []).map((task) => {
    if (task?.itemType === "subtask") return task;

    const subtasks = (currentProject?.tasks || []).filter(
      (t) =>
        t?.itemType === "subtask" &&
        (t.parentTask?._id === task._id || t.parentTask === task._id)
    );

    if (!subtasks || subtasks.length === 0) return task;

    const completedSubtasks = subtasks.filter((t) =>
      ["completed", "approved", "client-approved"].includes(
        t.status?.toLowerCase()
      )
    );

    const computedProgress = Math.round(
      (completedSubtasks.length / subtasks.length) * 100
    );
    return { ...task, computedProgress };
  });

  const tasksByStatus = {
    todo:
      filterTasks(enhancedTasks.filter((task) => task?.status === "todo")) ||
      [],
    "in-progress":
      filterTasks(
        enhancedTasks.filter((task) => task?.status === "in-progress")
      ) || [],
    "on-review":
      filterTasks(
        enhancedTasks.filter((task) => task?.status === "on-review")
      ) || [],
    "on-hold":
      filterTasks(
        enhancedTasks.filter((task) => task?.status === "on-hold")
      ) || [],
    "re-work":
      filterTasks(
        enhancedTasks.filter((task) => task?.status === "re-work")
      ) || [],
    approved:
      filterTasks(
        enhancedTasks.filter((task) => task?.status === "approved")
      ) || [],
    "client-approved":
      filterTasks(
        enhancedTasks.filter((task) => task?.status === "client-approved")
      ) || [],
    completed:
      filterTasks(
        enhancedTasks.filter((task) => task?.status === "completed")
      ) || [],
  };

  const activeTasks = tasksByStatus.todo;
  const progressTasks = tasksByStatus["in-progress"];
  const completedTasks = tasksByStatus.completed;

  const handleNavigateToTask = (task) => {
    if (task?.itemType === "subtask" && task?.parentTask) {
      navigate(`/projects/${projectId}/${task.parentTask._id}`);
    } else {
      navigate(`/projects/${projectId}/${task?._id}`);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const canUserDragTask = (task) => {
    if (isCompany) return true;
    return task.assignedTo?.some(
      (assignedUser) => assignedUser._id === user?.id
    );
  };

  const canUserDropInStatus = (status) => {
    if (isCompany) return true;
    return employeeAllowedStatuses.includes(status);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleUpdateLeadForm = async () => {
    try {
      await updateProjectLeadFormConfig(projectId, selectedLeadForm);
      toast.success("Lead form template updated for this client");
      queryClient.invalidateQueries(["projectDetails", projectId]);
    } catch (error) {
      toast.error("Failed to update lead form template");
    }
  };

  const handleUpdateClientCreds = async () => {
    if (!projectId) {
      toast.error("No project associated with this view.");
      return;
    }
    try {
      await updateProjectPortalConfig(projectId, {
        ...clientCreds,
        isActive: true,
      });
      toast.success("Client authentication activated and updated successfully!");
    } catch (error) {
      console.error("Failed to update credentials:", error);
      toast.error("Failed to update credentials. Please try again.");
    }
  };

  const handleShareCreds = async () => {
    const portalLink = `${window.location.origin}/portal/login?username=${encodeURIComponent(clientCreds.username)}&password=${encodeURIComponent(clientCreds.password)}`;
    const shareText = `Client Portal Credentials:\nUsername: ${clientCreds.username}\nPassword: ${clientCreds.password}\nPortal URL: ${portalLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Client Credentials",
          text: shareText,
        });
      } catch (err) {
        console.error("Share failed:", err);
        navigator.clipboard.writeText(shareText);
        toast.success("Credentials copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Credentials copied to clipboard!");
    }
  };

  const handleCopyPortalLink = () => {
    const portalLink = `${window.location.origin}/portal/login?username=${encodeURIComponent(clientCreds.username)}&password=${encodeURIComponent(clientCreds.password)}`;
    navigator.clipboard.writeText(portalLink);
    toast.success("Portal link copied to clipboard!");
  };

  const handleTaskUpdate = async (taskId, newStatus, newOrder = null) => {
    try {
      const updateData = { status: newStatus };
      if (newOrder !== null) {
        updateData.order = newOrder;
      }
      await updateTaskById(taskId, updateData);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const handleTaskDrop = async (taskData, targetStatus, targetPosition) => {
    const { taskId, sourceStatus, sourceIndex } = taskData;
    if (!canUserDropInStatus(targetStatus)) {
      alert("You don't have permission to move tasks to this status.");
      return;
    }
    const task = currentProject?.tasks?.find((t) => t._id === taskId);
    if (!canUserDragTask(task)) {
      alert("You can only move tasks assigned to you.");
      return;
    }
    queryClient.setQueryData(["project", projectId], (oldData) => {
      if (!oldData || !oldData.tasks) return oldData;
      const updatedTasks = oldData.tasks.map((task) => {
        if (task._id === taskId) {
          return {
            ...task,
            status: targetStatus,
          };
        }
        return task;
      });
      return {
        ...oldData,
        tasks: updatedTasks,
      };
    });

    try {
      if (sourceStatus === targetStatus) {
        const targetTasks = tasksByStatus[targetStatus];
        const reorderedTasks = [...targetTasks];
        const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
        const adjustedPosition =
          targetPosition > sourceIndex ? targetPosition - 1 : targetPosition;
        reorderedTasks.splice(adjustedPosition, 0, movedTask);
        reorderedTasks.forEach((task, index) => {
          updateOrder({ taskId: task._id, newOrder: index });
        });
      } else {
        await handleTaskUpdate(taskId, targetStatus, targetPosition);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      if (onRefresh) {
        onRefresh();
      }
      alert("Failed to update task. Please try again.");
    }
  };

  return (
    <div className="col-span-4 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flexBetween mb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex gap-2">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                ? "bg-white/30 shadow-sm text-blue-600"
                : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <PrimaryButton
            icon={"/icons/refresh.svg"}
            className={"bg-white hover:bg-gray-50 transition-colors"}
            onclick={handleRefresh}
          />
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className={`p-2 rounded-lg border transition-colors ${showSubtasks
              ? "bg-blue-50 border-blue-300 text-blue-600"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            title={showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showSubtasks ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01-1.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              )}
            </svg>
          </button>
          <PrimaryButton
            icon={"/icons/filter.svg"}
            className={"bg-white hover:bg-gray-50 transition-colors"}
            onclick={() => setShowFilter(true)}
          />
        </div>
      </div>

      {activeTab === "overview" && (
        <OverviewTab currentProject={currentProject} selectedMonth={selectedMonth} />
      )}

      {(activeTab === "kanban" || activeTab === "list") && !hasWorkDetailsForCurrentMonth() && currentProject?.workDetails && (
        <div className="mt-4 p-6 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in zoom-in duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-blue-800 mb-2">
                No Work Details for {selectedMonth ? new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Current Month"}
              </h4>
              <p className="text-blue-700 mb-3">
                This project doesn't have work details scheduled for the selected month. The project is scheduled for:
              </p>
              <div className="flex flex-wrap gap-2">
                {getAvailableMonths().map((month) => (
                  <span key={month} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "kanban" && (
        <KanbanTab
          statusConfig={statusConfig}
          tasksByStatus={tasksByStatus}
          handleTaskDrop={handleTaskDrop}
          canUserDropInStatus={canUserDropInStatus}
          isCompany={isCompany}
          canUserDragTask={canUserDragTask}
          handleNavigateToTask={handleNavigateToTask}
          currentProject={currentProject}
        />
      )}

      {activeTab === "list" && (
        <ListTab
          tasksByStatus={tasksByStatus}
          activeTasks={activeTasks}
          progressTasks={progressTasks}
          completedTasks={completedTasks}
          handleNavigateToTask={handleNavigateToTask}
          isBoardView={isBoardView}
        />
      )}

      {(activeTab === "lead" || activeTab === "campaign") && currentProject?.customFields?.branches?.length > 0 && (
        <div className="flex justify-end items-center gap-2 mb-3 bg-white p-3 border border-gray-100 rounded-xl animate-in fade-in duration-300">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Branch/Brand:</span>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-w-[160px] cursor-pointer bg-white"
          >
            <option value="">All Branches</option>
            {currentProject.customFields.branches.map((b) => (
              <option key={b.id || b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeTab === "lead" && (
        <div className="flex flex-col overflow-hidden h-full">
          <LeadsFeature
            projectId={projectId}
            onSelectLead={(lead) => navigate(`/leads/${lead._id || lead.id}`, { state: { from: window.location.pathname } })}
            onOpenSettings={() => setActiveTab("settings")}
            branchFilter={selectedBranchId}
            branches={currentProject?.customFields?.branches}
          />
        </div>
      )}

      {activeTab === "campaign" && (
        <CampaignTab
          isCampaignsLoading={isCampaignsLoading}
          projectCampaigns={projectCampaigns}
          branchFilter={selectedBranchId}
          currentProject={currentProject}
          onRefresh={handleRefresh}
        />
      )}

      {activeTab === "settings" && (
        <SettingsTab
          clientCreds={clientCreds}
          setClientCreds={setClientCreds}
          handleUpdateClientCreds={handleUpdateClientCreds}
          handleShareCreds={handleShareCreds}
          handleCopyPortalLink={handleCopyPortalLink}
          selectedLeadForm={selectedLeadForm}
          setSelectedLeadForm={setSelectedLeadForm}
          leadFormConfigs={leadFormConfigs}
          handleUpdateLeadForm={handleUpdateLeadForm}
          currentProject={currentProject}
          onRefresh={onRefresh}
        />
      )}

      <FilterMenu
        isOpen={showFilter}
        setShowModalFilter={setShowFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default ProjectOverView;
