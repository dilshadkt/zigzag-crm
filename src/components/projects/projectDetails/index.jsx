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
import ActionButton from "./components/ActionButton";

const ProjectDetails = ({
  setShowModalFilter,
  setShowModalProject,
  setShowModalTask,
  activeProject,
  hasNoProject = false,
  activeTasks = [],
  progressTasks = [],
  completedTasks = [],
  selectedMonth,
  onMonthChange,
  isTimelineExpanded,
  setIsTimelineExpanded,
  onMobileBack,
  className = "",
  isLoading = false,
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
    <div
      className={`${
        isTimelineExpanded || hasNoProject
          ? "col-span-1 md:col-span-5"
          : "col-span-1 md:col-span-4"
      } h-full min-w-0 w-full md:overflow-hidden flex-col ${className || "flex"}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between w-full shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onMobileBack && (
            <button
              type="button"
              onClick={onMobileBack}
              className="md:hidden shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700"
              aria-label="Back to projects"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h3 className="text-base md:text-lg font-bold text-gray-700 truncate">
            {activeProject?.name || "Tasks"}
          </h3>
        </div>
        <ActionButton
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          activeProject={activeProject}
          setShowModalProject={setShowModalProject}
          setShowModalTask={setShowModalTask}
          handleRefresh={handleRefresh}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isTimelineExpanded={isTimelineExpanded}
          setIsTimelineExpanded={setIsTimelineExpanded}
          showSubtasks={showSubtasks}
          setShowSubtasks={setShowSubtasks}
        />
      </div>

      {/* Task Sections */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading project…</span>
          </div>
        </div>
      ) : hasNoProject ? (
        <NoTask>There are no Projects</NoTask>
      ) : !activeProject ? (
        <NoTask>Select a project to view tasks</NoTask>
      ) : hasNoTasks ? (
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
