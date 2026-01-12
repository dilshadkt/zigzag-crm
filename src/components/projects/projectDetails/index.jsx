import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import NoTask from "../noTask";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import list from "../../../assets/icons/list.svg";
import board from "../../../assets/icons/board.svg";
import { updateTaskById } from "../../../api/service";
import { useUpdateTaskOrder } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import ProjectTimeline from "../projectTimeline";
import ProjectBoard from "./components/ProjectBoard";
import ProjectList from "./components/ProjectList";

const ProjectDetails = ({
  setShowModalFilter,
  activeProject,
  activeTasks = [],
  progressTasks = [],
  completedTasks = [],
  selectedMonth,
  isTimelineExpanded,
  setIsTimelineExpanded,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState("board"); // 'board', 'list', 'timeline'
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
      return tasks.filter((task) => !task?.parentTask); // Filter out subtasks (tasks with parentTask)
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
    // If it's a subtask (has parentTask), navigate to the parent task
    if (task?.parentTask) {
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

  return (
    <div className={`${isTimelineExpanded ? "col-span-5" : "col-span-4"} h-full md:overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="flexBetween">
        <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
        <div className="flex gap-2">
          <PrimaryButton
            icon={"/icons/refresh.svg"}
            className={"bg-white hover:bg-gray-50 transition-colors"}
            onclick={handleRefresh}
          />
          <PrimaryButton
            icon={"/icons/timeline.svg"}
            className={`transition-colors ${viewMode === "timeline" ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"}`}
            onclick={() => {
              if (viewMode === "timeline") {
                setViewMode("board");
                setIsTimelineExpanded(false);
              } else {
                setViewMode("timeline");
              }
            }}
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
            icon={viewMode === "list" ? board : list}
            className={"bg-white hover:bg-gray-50 transition-colors"}
            onclick={() => {
              setViewMode(viewMode === "list" ? "board" : "list");
              setIsTimelineExpanded(false);
            }}
          />
        </div>
      </div>

      {/* Task Sections */}
      {hasNoTasks ? (
        <NoTask>
          There are no tasks in this project <br /> yet Let's add them
        </NoTask>
      ) : viewMode === "timeline" ? (
        <ProjectTimeline
          tasks={activeProject?.tasks || []}
          currentMonth={selectedMonth}
          onTaskClick={handleNavigateTask}
          isExpanded={isTimelineExpanded}
          onToggleExpand={() => setIsTimelineExpanded(!isTimelineExpanded)}
        />
      ) : viewMode === "board" ? (
        <ProjectBoard
          tasksByStatus={tasksByStatus}
          handleTaskDrop={handleTaskDrop}
          canUserDropInStatus={canUserDropInStatus}
          isCompany={isCompany}
          handleNavigateTask={handleNavigateTask}
          activeProject={activeProject}
          canUserDragTask={canUserDragTask}
        />
      ) : (
        <ProjectList
          activeTasks={activeTasks}
          progressTasks={progressTasks}
          tasksByStatus={tasksByStatus}
          completedTasks={completedTasks}
          handleNavigateTask={handleNavigateTask}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
