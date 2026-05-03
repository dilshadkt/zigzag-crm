import React, { useState, useEffect } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Task from "../../shared/task";
import { useNavigate, useParams } from "react-router-dom";
import FilterMenu from "../FilterMenu";
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin, FaTwitter, FaGlobe } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import list from "../../../assets/icons/list.svg";
import board from "../../../assets/icons/board.svg";
import { updateTaskById, updateProjectPortalConfig, getProjectById, updateProjectLeadFormConfig } from "../../../api/service";
import { useUpdateTaskOrder, useProjectDetails } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { useGetCampaignsByCompany } from "../../../api/campaigns";
import { useGetAllLeadFormConfigs } from "../../../features/leads/api";
import LeadsFeature from "../../../features/leads";
import { toast } from "react-hot-toast";

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

const DraggableTask = ({
  task,
  isBoardView,
  onClick,
  projectId,
  index,
  canDrag,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        taskId: task._id,
        sourceStatus: task.status,
        sourceIndex: index,
      })
    );
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);

    // Minimal visual feedback
    e.currentTarget.style.opacity = "0.7";
  };

  const handleDragEnd = (e) => {
    // Reset visual feedback
    e.currentTarget.style.opacity = "1";
    setIsDragging(false);
  };

  return (
    <div
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`transition-opacity duration-200 ease-out ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        }`}
      style={{
        opacity: isDragging ? 0.7 : 1,
      }}
      title={!canDrag ? "You can only move tasks assigned to you" : ""}
    >
      <Task
        task={task}
        isBoardView={isBoardView}
        onClick={() => (onClick ? onClick(task) : null)}
        projectId={projectId}
        index={index}
      />
    </div>
  );
};

const DropZone = ({ onDrop, position, status, isVisible, canDrop }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canDrop) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    if (!canDrop) return;

    const taskDataString = e.dataTransfer.getData("application/json");
    if (taskDataString) {
      try {
        const taskData = JSON.parse(taskDataString);
        onDrop(taskData, status, position);
      } catch (error) {
        console.error("Error parsing task data:", error);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`h-2 transition-all duration-200 ease-out ${isOver && canDrop
        ? "bg-blue-300 rounded-full mx-2"
        : canDrop
          ? "bg-transparent"
          : "bg-red-200 rounded-full mx-2"
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );
};

const Droppable = ({
  id,
  title,
  children,
  onDrop,
  tasks,
  canDrop,
  isCompany,
}) => {
  const [isOver, setIsOver] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    const taskData = e.dataTransfer.types.includes("application/json");
    if (taskData) {
      if (!canDrop) {
        e.dataTransfer.dropEffect = "none";
        return;
      }

      e.dataTransfer.dropEffect = "move";
      setIsOver(true);

      // Get dragged task data for positioning
      try {
        const taskDataString = e.dataTransfer.getData("application/json");
        if (taskDataString) {
          setDraggedTask(JSON.parse(taskDataString));
        }
      } catch (error) {
        // Ignore parsing errors during drag over
      }
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only set isOver to false if we're actually leaving the droppable area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOver(false);
      setDraggedTask(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    setDraggedTask(null);

    if (!canDrop) return;

    const taskDataString = e.dataTransfer.getData("application/json");
    if (taskDataString) {
      try {
        const taskData = JSON.parse(taskDataString);
        // Drop at the end if dropped on the container itself
        onDrop(taskData, id, tasks.length);
      } catch (error) {
        console.error("Error parsing task data:", error);
      }
    }
  };

  // Convert children to array if it's not already
  const childrenArray = React.Children.toArray(children);

  const config = statusConfig[id];

  return (
    <div
      className={`flex-shrink-0 w-80 rounded-lg px-2 pb-2  transition-all
         duration-200 ease-out
                  ${isOver && canDrop
          ? "bg-blue-50 border-2 border-blue-300"
          : isOver && !canDrop
            ? "bg-red-50 border-2 border-red-300"
            : "bg-gray-50 border-2 border-transparent"
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-droppable-id={id}
    >
      <div
        className={`font-medium text-sm text-center  py-2 px-4 rounded-lg mb-4 ${config?.color || "bg-gray-200 text-gray-800"
          }`}
      >
        {title}
        {!canDrop && !isCompany && (
          <div className="text-xs mt-1 opacity-70">Admin only</div>
        )}
      </div>
      <div
        className="space-y-1 min-h-[200px] pb-6 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2"
        data-droppable-id={id}
      >
        {/* Drop zone at the beginning */}
        <DropZone
          onDrop={onDrop}
          position={0}
          status={id}
          isVisible={isOver && draggedTask?.sourceStatus !== id}
          canDrop={canDrop}
        />

        {childrenArray.map((child, index) => (
          <React.Fragment key={child.key || index}>
            {child}
            {/* Drop zone after each task */}
            <DropZone
              onDrop={onDrop}
              position={index + 1}
              status={id}
              isVisible={isOver}
              canDrop={canDrop}
            />
          </React.Fragment>
        ))}

        {/* Show drop zone at end if no tasks */}
        {childrenArray.length === 0 && (
          <DropZone
            onDrop={onDrop}
            position={0}
            status={id}
            isVisible={isOver}
            canDrop={canDrop}
          />
        )}
      </div>
    </div>
  );
};

import { ProjectOverViewShimmer } from "../ProjectDetailShimmer";

const ProjectOverView = ({ currentProject, selectedMonth, onRefresh, isLoading }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const isBoardView = activeTab === "kanban";
  const [showSubtasks, setShowSubtasks] = useState(true);
  const { mutate: updateOrder } = useUpdateTaskOrder(currentProject?._id);
  const { isCompany, user } = useAuth();
  const [clientCreds, setClientCreds] = useState({
    username: "",
    password: "",
  });

  const { data: campaignData, isLoading: isCampaignsLoading } = useGetCampaignsByCompany(
    currentProject?.company,
    { limit: 100, projectId: projectId }
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
          // Changed: fetch from project instead of company for isolated access
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

  // If loading, show shimmer
  if (isLoading) {
    return <ProjectOverViewShimmer isBoardView={isBoardView} />;
  }

  // Check if current month has work details
  const hasWorkDetailsForCurrentMonth = () => {
    if (!currentProject?.workDetails || !selectedMonth) return false;
    return currentProject.workDetails.some((wd) => wd.month === selectedMonth);
  };

  // Get available months for this project
  const getAvailableMonths = () => {
    if (!currentProject?.workDetails) return [];
    return currentProject.workDetails.map((wd) => wd.month).sort();
  };

  // Employee allowed statuses
  const employeeAllowedStatuses = [
    "todo",
    "in-progress",
    "completed",
    "on-review",
  ];

  // Filter task based on the process and active filters
  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      // Filter by subtask visibility (global toggle)
      if (!showSubtasks && task?.itemType === "subtask") {
        return false;
      }

      // Apply additional filters if activeFilters is set
      if (activeFilters) {
        // Filter by subtask visibility from filter menu
        if (
          activeFilters.showSubtasks === false &&
          task?.itemType === "subtask"
        ) {
          return false;
        }

        // Filter by status
        if (
          activeFilters.status.length > 0 &&
          !activeFilters.status.includes(task.status)
        ) {
          return false;
        }

        // Filter by priority
        if (
          activeFilters.priority.length > 0 &&
          !activeFilters.priority.includes(task.priority)
        ) {
          return false;
        }

        // Filter by date range
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
  // Enhance tasks with computedProgress
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

  // Group tasks by status with filtering applied
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

  // Legacy task arrays for backward compatibility
  const activeTasks = tasksByStatus.todo;
  const progressTasks = tasksByStatus["in-progress"];
  const completedTasks = tasksByStatus.completed;

  const handleNavigateToTask = (task) => {
    // If it's a subtask, navigate to the parent task
    if (task?.itemType === "subtask" && task?.parentTask) {
      navigate(`/projects/${projectId}/${task.parentTask._id}`);
    } else {
      // Regular task navigation
      navigate(`/projects/${projectId}/${task?._id}`);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const canUserDragTask = (task) => {
    if (isCompany) return true;

    // Check if user is assigned to this task
    return task.assignedTo?.some(
      (assignedUser) => assignedUser._id === user?.id
    );
  };

  const canUserDropInStatus = (status) => {
    if (isCompany) return true;

    // Employee can only drop in their allowed statuses
    return employeeAllowedStatuses.includes(status);
  };

  // Function to refresh project data
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
        // Fallback to copy on cancel/fail
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
      console.log(`Task ${taskId} status updated to ${newStatus}`);

      // Invalidate and refetch the project data to update the UI
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      // Provide feedback to the user
      alert("Failed to update task status. Please try again.");
    }
  };

  const handleTaskDrop = async (taskData, targetStatus, targetPosition) => {
    const { taskId, sourceStatus, sourceIndex } = taskData;

    // Check if user can drop in target status
    if (!canUserDropInStatus(targetStatus)) {
      alert("You don't have permission to move tasks to this status.");
      return;
    }

    // Check if user can drag the task
    const task = currentProject?.tasks?.find((t) => t._id === taskId);
    if (!canUserDragTask(task)) {
      alert("You can only move tasks assigned to you.");
      return;
    }

    // Optimistically update the UI immediately with simplified logic
    queryClient.setQueryData(["project", projectId], (oldData) => {
      if (!oldData || !oldData.tasks) return oldData;

      // Create a new tasks array with the updated task
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

    // Background API call
    try {
      if (sourceStatus === targetStatus) {
        // Same column reordering
        const targetTasks = tasksByStatus[targetStatus];

        const reorderedTasks = [...targetTasks];
        const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
        const adjustedPosition =
          targetPosition > sourceIndex ? targetPosition - 1 : targetPosition;
        reorderedTasks.splice(adjustedPosition, 0, movedTask);

        // Update order for affected tasks
        reorderedTasks.forEach((task, index) => {
          updateOrder({ taskId: task._id, newOrder: index });
        });
      } else {
        // Different column - update status
        await handleTaskUpdate(taskId, targetStatus, targetPosition);
      }
    } catch (error) {
      console.error("Failed to update task:", error);

      // Revert optimistic update
      if (onRefresh) {
        onRefresh();
      }
      alert("Failed to update task. Please try again.");
    }
  };

  const SocialIcon = ({ platform }) => {
    const iconClass = "text-xl";
    switch (platform.toLowerCase()) {
      case "instagram": return <FaInstagram className={`text-pink-600 ${iconClass}`} />;
      case "facebook": return <FaFacebook className={`text-blue-700 ${iconClass}`} />;
      case "youtube": return <FaYoutube className={`text-red-600 ${iconClass}`} />;
      case "linkedin": return <FaLinkedin className={`text-blue-800 ${iconClass}`} />;
      case "twitter": return <FaTwitter className={`text-sky-500 ${iconClass}`} />;
      default: return <FaGlobe className={`text-gray-500 ${iconClass}`} />;
    }
  };

  const getSocialUrl = (platform, handle) => {
    if (!handle) return null;
    if (handle.startsWith("http")) return handle;
    const h = handle.startsWith("@") ? handle.slice(1) : handle;
    switch (platform.toLowerCase()) {
      case "instagram": return `https://www.instagram.com/${h}`;
      case "facebook": return `https://www.facebook.com/${h}`;
      case "youtube": return `https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}`;
      case "twitter": return `https://www.twitter.com/${h}`;
      case "linkedin": return `https://www.linkedin.com/company/${h}`;
      default: return null;
    }
  };

  const managedSocials = Object.entries(currentProject?.socialMedia || {})
    .filter(([k, v]) => k !== 'other' && k !== '_id' && k !== '__v' && v?.manage);
  const managedOthers = currentProject?.socialMedia?.other?.filter(v => v.manage) || [];
  const hasSocialMedia = managedSocials.length > 0 || managedOthers.length > 0;

  const renderListSection = (title, tasks) => (
    <>
      <div
        className="min-h-10 font-medium sticky top-0 z-50
       text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter"
      >
        {title}
      </div>
      {tasks?.map((task, index) => (
        <Task
          onClick={handleNavigateToTask}
          key={task._id}
          task={task}
          isBoardView={isBoardView}
          index={index}
        />
      ))}
    </>
  );

  return (
    <div className="col-span-4 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flexBetween mb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex gap-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "kanban", label: "Task Kanban" },
            { id: "list", label: "Task List" },
            { id: "lead", label: "Lead" },
            { id: "campaign", label: "Campaign" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg  transition-all ${activeTab === tab.id
                ? "bg-white/30 shadow-sm  text-blue-600"
                : "bg-white  text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
                // Eye icon when showing
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                // Eye-off icon when hiding
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

      {/* Show message if current month has no work details */}
      {activeTab === "overview" && (
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-4 pb-24 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {/* Section 1: Stats Summary (Top) - COMPACT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl text-white shadow-sm">
              <span className="text-[9px] uppercase font-bold opacity-80 tracking-widest">Overall Progress</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xl font-bold">{currentProject?.progress || 0}%</span>
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${currentProject?.progress || 0}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Active Tasks</span>
              <div className="text-xl font-bold text-gray-800">{currentProject?.tasks?.filter(t => t.status !== 'completed' && t.status !== 'approved').length || 0}</div>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Team Capacity</span>
              <div className="text-xl font-bold text-gray-800">{currentProject?.teams?.length || 0} Members</div>
            </div>
          </div>

          {/* Section 2: Project Information */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Core Project Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</span>
                <p className="text-xs text-gray-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-gray-100">
                  {currentProject?.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Priority</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${currentProject?.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                      currentProject?.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                      {currentProject?.priority || 'low'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Deadline</span>
                    <span className="text-xs font-bold text-gray-700 block mt-1">
                      {currentProject?.endDate ? new Date(currentProject.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : '-'}
                    </span>
                  </div>
                </div>

                {currentProject?.teams?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Assigned Team</span>
                    <div className="flex flex-wrap gap-2">
                      {currentProject.teams.map((member) => (
                        <div key={member._id} className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-100">
                          <div className="w-5 h-5 rounded-full bg-blue-100 flexCenter text-[9px] font-bold text-blue-600 overflow-hidden border border-white">
                            {member.profileImage ? <img src={member.profileImage} alt="" className="w-full h-full object-cover" /> : member.firstName?.charAt(0)}
                          </div>
                          <span className="text-[10px] font-semibold text-gray-700">{member.firstName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Additional Details & Custom Fields */}
          {currentProject?.customFields && Object.keys(currentProject.customFields).length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                Custom Properties & Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentProject.customFields).map(([key, value]) => {
                  if (value === undefined || value === null || value === "") return null;
                  return (
                    <div key={key} className="flex flex-col gap-1.5 p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 transition-colors">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                      <div className="text-xs font-semibold text-gray-700">
                        {typeof value === 'boolean' ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {value ? 'Yes' : 'No'}
                          </span>
                        ) : Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {value.map((item, i) => {
                              if (!item) return null;

                              // Handle non-objects or arrays of simple values
                              if (typeof item !== "object" || Array.isArray(item)) {
                                const displayValue = Array.isArray(item) ? item.join(" ") : item.toString();
                                return (
                                  <span key={i} className="bg-white text-indigo-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100 transition-all hover:bg-indigo-50">
                                    {displayValue}
                                  </span>
                                );
                              }

                              // Handle real objects (like Competitors with sub-fields)
                              const entries = Object.entries(item).filter(([_, v]) => v);
                              if (entries.length === 0) return null;

                              // Check if this is an "indexed string" object (like {0: 'M', 1: 'O', ...})
                              const isIndexedString = entries.every(([k]) => !isNaN(k)) &&
                                entries.every(([_, v]) => typeof v === 'string' && v.length === 1);

                              if (isIndexedString) {
                                return (
                                  <span key={i} className="bg-white text-indigo-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100">
                                    {entries.map(([_, v]) => v).join("")}
                                  </span>
                                );
                              }

                              // Ultra-Compact Object Display
                              return (
                                <div key={i} className="px-2 py-1 bg-white border border-gray-100 rounded-lg flex flex-wrap gap-x-3 gap-y-1 items-center hover:border-indigo-200 transition-colors">
                                  {entries.map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-1.5 border-r border-gray-50 last:border-0 pr-3 last:pr-0">
                                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                                        {k.replace(/_/g, " ")}:
                                      </span>
                                      <span className="text-[10px] font-bold text-gray-700">
                                        {v.toString().match(/^https?:\/\//) || v.toString().startsWith('www.') ? (
                                          <a
                                            href={v.toString().startsWith('www.') ? `https://${v}` : v}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-500 hover:underline flex items-center gap-0.5"
                                          >
                                            Link
                                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                          </a>
                                        ) : (
                                          v.toString()
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        ) : value.toString().match(/^https?:\/\//) || value.toString().startsWith('www.') ? (
                          <a href={value.toString().startsWith('www.') ? `https://${value}` : value} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 truncate max-w-full">
                            <span className="truncate">{value}</span>
                            <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        ) : (
                          <span className="break-words line-clamp-2" title={value.toString()}>{value.toString()}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Social Media Links */}
          {hasSocialMedia && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                Social Media & Digital Presence
              </h3>
              <div className="flex flex-wrap gap-4">
                {managedSocials.map(([platform, data]) => {
                  const url = getSocialUrl(platform, data.handle);
                  return url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 hover:border-pink-200 transition-all hover:scale-[1.02] group"
                    >
                      <SocialIcon platform={platform} />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{platform}</span>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-pink-600">{data.handle}</span>
                      </div>
                    </a>
                  ) : null;
                })}
                {managedOthers.map((item, i) => {
                  if (!item?.link) return null;
                  return (
                    <a
                      key={i}
                      href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 hover:border-pink-200 transition-all hover:scale-[1.02] group"
                    >
                      <FaGlobe className="text-xl text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.name || 'Website'}</span>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-pink-600 truncate max-w-[150px]">{item.link}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Work History Table */}
          <div className="bg-white rounded-2xl border border-gray-100 ">
            <div className="p-5 border-b border-gray-100 bg-[#F8FAFC]">
              <h3 className="text-sm font-bold text-gray-800">Monthly Performance & Target Metrics</h3>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter font-semibold">Complete project timeline and work history</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Month</th>
                    <th className="px-4 py-4 text-center">Reels</th>
                    <th className="px-4 py-4 text-center">Posters</th>
                    <th className="px-4 py-4 text-center">Motion</th>
                    <th className="px-4 py-4 text-center">Shoot</th>
                    <th className="px-4 py-4 text-center">Graphics</th>
                    <th className="px-6 py-4 text-right">Other Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentProject?.workDetails?.map((wd) => (
                    <tr key={wd._id} className={`hover:bg-gray-50/50 transition-colors ${wd.month === selectedMonth ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 whitespace-nowrap uppercase tracking-wider">
                            {new Date(wd.month + "-01").toLocaleDateString("en-US", { month: "long" })}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 tabular-nums">{wd.year}</span>
                        </div>
                      </td>
                      {[wd.reels, wd.poster, wd.motionPoster, wd.shooting, wd.motionGraphics].map((metric, idx) => {
                        const completed = (metric?.total || 0) - (metric?.count || 0);
                        const total = metric?.total || 0;
                        return (
                          <td key={idx} className="px-4 py-4">
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-bold text-gray-800 tabular-nums">{completed}/{total}</span>
                              <div className="w-10 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden border border-gray-50">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${completed >= total && total > 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                  style={{ width: `${Math.min(100, (completed / (total || 1)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {wd.other && wd.other.length > 0 ? (
                            wd.other.map((o, i) => {
                              const oCompleted = (o?.total || 0) - (o?.count || 0);
                              return (
                                <span key={i} className="text-[9px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg leading-none whitespace-nowrap">
                                  {o.name}: {oCompleted}/{o.total}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-gray-300">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Show message if current month has no work details - ONLY on Task tabs */}
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
        <div
          className="flex gap-4 h-full overflow-x-auto pb-2 
         scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 project-details-scroll"
        >
          {Object.entries(statusConfig).map(([status, config]) => {
            const canDrop = canUserDropInStatus(status);
            const tasks = tasksByStatus[status] || [];

            return (
              <Droppable
                key={status}
                id={status}
                title={config.title}
                onDrop={handleTaskDrop}
                tasks={tasks}
                canDrop={canDrop}
                isCompany={isCompany}
              >
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <DraggableTask
                      key={task._id}
                      task={task}
                      isBoardView={true}
                      onClick={handleNavigateToTask}
                      projectId={currentProject?._id}
                      index={index}
                      canDrag={canUserDragTask(task)}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4 text-sm">
                    No {config.title.toLowerCase()}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      )}

      {activeTab === "list" && (
        <div className="flex flex-col h-full pb-5 gap-y-4 rounded-xl overflow-hidden overflow-y-auto">
          {renderListSection("Active Tasks", activeTasks)}
          {renderListSection("Progress", progressTasks)}
          {renderListSection("On Review", tasksByStatus["on-review"])}
          {renderListSection("On Hold", tasksByStatus["on-hold"])}
          {renderListSection("Re-work", tasksByStatus["re-work"])}
          {renderListSection("Approved", tasksByStatus["approved"])}
          {renderListSection(
            "Client Approved",
            tasksByStatus["client-approved"]
          )}
          {renderListSection("Completed", completedTasks)}
        </div>
      )}

      {activeTab === "lead" && (
        <div className="flex flex-col h-full">
          <LeadsFeature
            projectId={projectId}
            onSelectLead={(lead) => navigate(`/leads/${lead._id || lead.id}`)}
            onOpenSettings={() => setActiveTab("settings")}
          />
        </div>
      )}

      {activeTab === "campaign" && (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 p-6  overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Project Campaigns</h3>
              <p className="text-xs text-gray-500 mt-1">Marketing and engagement campaigns linked to this client.</p>
            </div>
          </div>

          {isCampaignsLoading ? (
            <div className="flexCenter py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : projectCampaigns.length === 0 ? (
            <div className="flexCenter flex-col py-20 text-gray-400">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <p className="text-sm font-medium">No campaigns found for this client</p>
              <p className="text-xs">Active campaigns will appear here after sync.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-wider">
                    <th className="pb-3 pr-4">Campaign Name</th>
                    <th className="pb-3 px-4">Platform</th>
                    <th className="pb-3 px-4 text-center">Status</th>
                    <th className="pb-3 px-4 text-right">Budget</th>
                    <th className="pb-3 px-4 text-right">Spent</th>
                    <th className="pb-3 px-4 text-right">Results</th>
                    <th className="pb-3 px-4 text-right">CPR</th>
                    <th className="pb-3 pl-4 text-right">Reach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projectCampaigns.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-gray-900 text-xs truncate max-w-[200px]" title={campaign.name}>
                          {campaign.name}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]" title={campaign.description}>
                          {campaign.description}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${campaign.platform === 'Facebook' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                          campaign.platform === 'Instagram' ? 'bg-pink-50 border-pink-100 text-pink-700' :
                            'bg-gray-50 border-gray-100 text-gray-700'
                          }`}>
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                          <span className={`w-1 h-1 rounded-full mr-1 ${campaign.status === 'active' ? 'bg-green-500' :
                            campaign.status === 'paused' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`}></span>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right tabular-nums text-xs font-medium text-gray-700">
                        ₹{(campaign.budget || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right tabular-nums text-xs font-medium text-gray-700">
                        ₹{(campaign.amountSpent || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right tabular-nums text-xs font-bold text-blue-600">
                        {campaign.totalResults || 0}
                      </td>
                      <td className="py-4 px-4 text-right tabular-nums text-xs font-medium text-gray-700">
                        ₹{(campaign.cpr || 0).toFixed(2)}
                      </td>
                      <td className="py-4 pl-4 text-right tabular-nums text-xs font-medium text-gray-700">
                        {(campaign.reach || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 p-6 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Client Settings</h3>
              <p className="text-xs text-gray-500 mt-1">Configure external access and platform credentials for this client.</p>
            </div>
          </div>

          <div className="max-w-xl space-y-5">
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Client Authentication</h4>
                  <p className="text-[11px] text-gray-600 italic">Set credentials so the client can log in to view their leads</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Client Username / Email
                  </label>
                  <input
                    type="text"
                    placeholder="Enter client username"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs outline-none"
                    value={clientCreds.username}
                    onChange={(e) => setClientCreds({ ...clientCreds, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Client Password
                  </label>
                  <input
                    type="text"
                    placeholder="Create a secure password"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs outline-none font-mono"
                    value={clientCreds.password}
                    onChange={(e) => setClientCreds({ ...clientCreds, password: e.target.value })}
                  />
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={handleUpdateClientCreds}
                    disabled={!clientCreds.username || !clientCreds.password}
                    className="flex-1 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-blue-200/50"
                  >
                    Save Credentials
                  </button>
                  <button
                    onClick={handleShareCreds}
                    disabled={!clientCreds.username || !clientCreds.password}
                    className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-all"
                    title="Share credentials"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </div>
                  </button>
                  <button
                    onClick={handleCopyPortalLink}
                    disabled={!clientCreds.username || !clientCreds.password}
                    className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-all"
                    title="Copy direct portal link with credentials prefilled"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/30">
              <h4 className="text-sm font-semibold text-gray-900 mb-0.5">Lead Capture & Forms</h4>
              <p className="text-[11px] text-gray-500 mb-3">Choose which lead form template this client should use.</p>
              <div className="space-y-3">
                <select
                  value={selectedLeadForm}
                  onChange={(e) => setSelectedLeadForm(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs outline-none"
                >
                  <option value="">System Default</option>
                  {leadFormConfigs.map((config) => (
                    <option key={config._id} value={config._id}>
                      {config.name} {config.isActive ? "(Default)" : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUpdateLeadForm}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Apply Template
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/30">
              <h4 className="text-sm font-semibold text-gray-900 mb-0.5">Access Permissions</h4>
              <p className="text-[11px] text-gray-500 mb-3">Control what the client can see after logging in.</p>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">View Assigned Leads</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group opacity-50">
                  <input type="checkbox" disabled className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <span className="text-xs text-gray-700">Download Lead Reports (Admin Only)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
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
