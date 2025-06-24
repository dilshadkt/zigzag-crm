import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Task from "../../shared/task";
import { useNavigate, useParams } from "react-router-dom";
import FilterMenu from "../FilterMenu";
import { useQueryClient } from "@tanstack/react-query";
import list from "../../../assets/icons/list.svg";
import board from "../../../assets/icons/board.svg";
import { updateTaskById } from "../../../api/service";
import { useUpdateTaskOrder } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

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
  completed: {
    title: "Completed",
    color: "bg-green-100 text-green-800",
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
      className={`flex-shrink-0 w-80 rounded-lg p-4  transition-all
         duration-200 ease-out
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
        className={`font-medium text-sm text-center  py-2 px-4 rounded-lg mb-4 ${
          config?.color || "bg-gray-200 text-gray-800"
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

const ProjectOverView = ({ currentProject, selectedMonth, onRefresh }) => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isBoardView, setIsBoardView] = useState(true);
  const { mutate: updateOrder } = useUpdateTaskOrder(currentProject?._id);
  const { isCompany, user } = useAuth();

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
    if (!activeFilters) return tasks;

    return tasks.filter((task) => {
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

      return true;
    });
  };

  // Group tasks by status with filtering applied
  const tasksByStatus = {
    todo:
      filterTasks(
        currentProject?.tasks?.filter((task) => task?.status === "todo")
      ) || [],
    "in-progress":
      filterTasks(
        currentProject?.tasks?.filter((task) => task?.status === "in-progress")
      ) || [],
    completed:
      filterTasks(
        currentProject?.tasks?.filter((task) => task?.status === "completed")
      ) || [],
    "on-review":
      filterTasks(
        currentProject?.tasks?.filter((task) => task?.status === "on-review")
      ) || [],
    "on-hold":
      filterTasks(
        currentProject?.tasks?.filter((task) => task?.status === "on-hold")
      ) || [],
    "re-work":
      filterTasks(
        currentProject?.tasks?.filter((task) => task?.status === "re-work")
      ) || [],
    approved:
      filterTasks(
        currentProject?.tasks?.filter((task) => task?.status === "approved")
      ) || [],
  };

  // Legacy task arrays for backward compatibility
  const activeTasks = tasksByStatus.todo;
  const progressTasks = tasksByStatus["in-progress"];
  const completedTasks = tasksByStatus.completed;

  const handleNavigateToTask = (task) => {
    navigate(`/projects/${projectName}/${task?._id}`);
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

  const handleTaskUpdate = async (taskId, newStatus, newOrder = null) => {
    try {
      const updateData = { status: newStatus };
      if (newOrder !== null) {
        updateData.order = newOrder;
      }

      await updateTaskById(taskId, updateData);
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
      if (onRefresh) {
        onRefresh();
      }
      alert("Failed to update task. Please try again.");
    }
  };

  const renderListSection = (title, tasks) => (
    <>
      <div className="min-h-10 font-medium sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
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
    <div className="col-span-4 overflow-hidden flex flex-col">
      <div className="flexBetween">
        <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
        <div className="flex gap-2">
          <PrimaryButton
            icon={"/icons/refresh.svg"}
            className={"bg-white hover:bg-gray-50 transition-colors"}
            onclick={handleRefresh}
          />
          <PrimaryButton
            icon={!isBoardView ? list : board}
            className={"bg-white hover:bg-gray-50 transition-colors"}
            onclick={() => setIsBoardView(!isBoardView)}
          />
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

      {isBoardView ? (
        <div
          className="flex gap-4     h-full mt-4 overflow-x-auto pb-2
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
      ) : (
        <div className="flex flex-col h-full pb-5 gap-y-4 mt-4 rounded-xl overflow-hidden overflow-y-auto">
          {renderListSection("Active Tasks", activeTasks)}
          {renderListSection("Progress", progressTasks)}
          {renderListSection("Completed", completedTasks)}
          {renderListSection("On Review", tasksByStatus["on-review"])}
          {renderListSection("On Hold", tasksByStatus["on-hold"])}
          {renderListSection("Re-work", tasksByStatus["re-work"])}
          {renderListSection("Approved", tasksByStatus["approved"])}
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
