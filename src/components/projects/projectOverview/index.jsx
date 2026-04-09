import React, { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState("kanban");
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
    const shareText = `Client Portal Credentials:\nUsername: ${clientCreds.username}\nPassword: ${clientCreds.password}\nPortal URL: ${window.location.origin}/portal/login`;

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
    <div className="col-span-4 md:overflow-hidden flex flex-col">
      <div className="flexBetween mb-3 border-b border-gray-100">
        <div className="flex gap-2">
          {[
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
      {!hasWorkDetailsForCurrentMonth() && currentProject?.workDetails && (
        <div className="mt-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-blue-800 mb-2">
                No Work Details for{" "}
                {selectedMonth
                  ? new Date(selectedMonth + "-01").toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )
                  : "Current Month"}
              </h4>
              <p className="text-blue-700 mb-3">
                This project doesn't have work details scheduled for the
                selected month. The project is scheduled for the following
                months:
              </p>
              <div className="flex flex-wrap gap-2">
                {getAvailableMonths().map((month) => (
                  <span
                    key={month}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {new Date(month + "-01").toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                ))}
              </div>
              <p className="text-blue-600 text-sm mt-3">
                Please select a month with work details from the month selector
                above to view tasks.
              </p>
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
