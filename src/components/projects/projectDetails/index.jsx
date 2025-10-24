import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Task from "../../shared/task";
import NoTask from "../noTask";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import list from "../../../assets/icons/list.svg";
import board from "../../../assets/icons/board.svg";
import { updateTaskById } from "../../../api/service";
import { useUpdateTaskOrder } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";

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
      className={`transition-opacity duration-200 ease-out ${
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
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
      className={`h-2 transition-all duration-200 ease-out ${
        isOver && canDrop
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
      className={`flex-shrink-0 w-80 rounded-lg p-4 transition-all duration-200 ease-out
                  ${
                    isOver && canDrop
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
        className={`font-medium text-sm text-center sticky top-0 z-50 py-2 px-4 rounded-lg mb-4 ${
          config?.color || "bg-gray-200 text-gray-800"
        }`}
      >
        {title}
        {!canDrop && !isCompany && (
          <div className="text-xs mt-1 opacity-70">Admin only</div>
        )}
      </div>
      <div
        className="space-y-1 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2"
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

const ProjectDetails = ({
  setShowModalFilter,
  activeProject,
  activeTasks = [],
  progressTasks = [],
  completedTasks = [],
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isBoardView, setIsBoardView] = useState(true);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const { mutate: updateOrder } = useUpdateTaskOrder(activeProject?._id);
  const { isCompany, user } = useAuth();
  const { hasPermission } = usePermissions();

  const hasNoTasks = activeProject?.tasks?.length === 0;
  let projectName = activeProject?.name?.trim().split(" ")?.join("_");

  // Employee allowed statuses
  const employeeAllowedStatuses = [
    "todo",
    "in-progress",
    "completed",
    "on-review",
  ];

  // Filter function to hide subtasks if needed
  const filterSubtasks = (tasks) => {
    if (!showSubtasks) {
      return tasks.filter((task) => task?.itemType !== "subtask");
    }
    return tasks;
  };

  // Group tasks by status
  const tasksByStatus = {
    todo: filterSubtasks(activeTasks),
    "in-progress": filterSubtasks(progressTasks),
    "on-review": filterSubtasks(
      activeProject?.tasks?.filter((task) => task.status === "on-review") || []
    ),
    "on-hold": filterSubtasks(
      activeProject?.tasks?.filter((task) => task.status === "on-hold") || []
    ),
    "re-work": filterSubtasks(
      activeProject?.tasks?.filter((task) => task.status === "re-work") || []
    ),
    approved: filterSubtasks(
      activeProject?.tasks?.filter((task) => task.status === "approved") || []
    ),
    "client-approved": filterSubtasks(
      activeProject?.tasks?.filter(
        (task) => task.status === "client-approved"
      ) || []
    ),
    completed: filterSubtasks(completedTasks),
  };

  const handleNavigateTask = (task) => {
    // If it's a subtask, navigate to the parent task
    if (task?.itemType === "subtask" && task?.parentTask) {
      navigate(`/projects/${activeProject._id}/${task.parentTask._id}`);
    } else {
      // Regular task navigation
      navigate(`/projects/${activeProject._id}/${task?._id}`);
    }
  };

  const canUserDragTask = (task) => {
    if (isCompany) return true;

    // Check if user has edit permission for tasks
    if (hasPermission("tasks", "edit")) return true;

    // Check if user is assigned to this task
    return task.assignedTo?.some(
      (assignedUser) => assignedUser._id === user?.id
    );
  };

  const canUserDropInStatus = (status) => {
    if (isCompany) return true;

    // Check if user has edit permission for tasks
    if (hasPermission("tasks", "edit")) return true;

    // Employee can only drop in their allowed statuses
    return employeeAllowedStatuses.includes(status);
  };

  // Function to refresh project data
  const handleRefresh = () => {
    queryClient.invalidateQueries(["project", projectName]);
  };

  const handleTaskUpdate = async (taskId, newStatus, newOrder = null) => {
    try {
      const updateData = { status: newStatus };
      if (newOrder !== null) {
        updateData.order = newOrder;
      }

      await updateTaskById(taskId, updateData);
      // Invalidate and refetch the project data to update the UI
      queryClient.invalidateQueries(["project", projectName]);
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
    const task = activeProject?.tasks?.find((t) => t._id === taskId);
    if (!canUserDragTask(task)) {
      alert("You can only move tasks assigned to you.");
      return;
    }

    // Optimistically update the UI immediately with simplified logic
    queryClient.setQueryData(["project", projectName], (oldData) => {
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
      queryClient.invalidateQueries(["project", projectName]);
      alert("Failed to update task. Please try again.");
    }
  };

  const renderSection = (title, tasks) => (
    <>
      <div className="min-h-10 font-medium sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
        {title}
      </div>
      {tasks?.map((task, index) => (
        <Task
          onClick={handleNavigateTask}
          key={task._id || index}
          task={task}
          isBoardView={isBoardView}
          index={index}
        />
      ))}
    </>
  );

  return (
    <div className="col-span-4 h-full md:overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flexBetween">
        <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
        <div className="flex gap-2">
          <PrimaryButton
            icon={"/icons/refresh.svg"}
            className={"bg-white hover:bg-gray-50 transition-colors"}
            onclick={handleRefresh}
          />
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className={`p-2 rounded-lg border transition-colors ${
              showSubtasks
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
            icon={!isBoardView ? list : board}
            className={"bg-white hover:bg-gray-50 transition-colors"}
            onclick={() => setIsBoardView(!isBoardView)}
          />
        </div>
      </div>

      {/* Task Sections */}
      {hasNoTasks ? (
        <NoTask>
          There are no tasks in this project <br /> yet Let's add them
        </NoTask>
      ) : isBoardView ? (
        <div className="flex gap-4 h-full mt-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 project-details-scroll">
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
                      onClick={handleNavigateTask}
                      projectId={activeProject?._id}
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
      ) : (
        <div className="flex flex-col h-full gap-y-4 mt-4 rounded-xl overflow-hidden overflow-y-auto">
          {renderSection("Active Tasks", activeTasks)}
          {renderSection("Progress", progressTasks)}
          {renderSection("On Review", tasksByStatus["on-review"])}
          {renderSection("On Hold", tasksByStatus["on-hold"])}
          {renderSection("Re-work", tasksByStatus["re-work"])}
          {renderSection("Approved", tasksByStatus["approved"])}
          {renderSection("Client Approved", tasksByStatus["client-approved"])}
          {renderSection("Completed", completedTasks)}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
