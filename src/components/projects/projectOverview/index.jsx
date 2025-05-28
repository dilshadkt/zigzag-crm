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

const DraggableTask = ({ task, isBoardView, onClick, projectId, index }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
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
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing transition-opacity duration-200 ease-out"
      style={{
        opacity: isDragging ? 0.7 : 1,
      }}
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

const DropZone = ({ onDrop, position, status, isVisible }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
        isOver ? "bg-blue-300 rounded-full mx-2" : "bg-transparent"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );
};

const Droppable = ({ id, title, children, onDrop, tasks }) => {
  const [isOver, setIsOver] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    const taskData = e.dataTransfer.types.includes("application/json");
    if (taskData) {
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

  return (
    <div
      className={`flex-1 min-w-[300px] rounded-lg p-4 transition-all duration-200 ease-out
                  ${
                    isOver
                      ? "bg-blue-50 border-2 border-blue-300"
                      : "bg-gray-50 border-2 border-transparent"
                  }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-droppable-id={id}
    >
      <div className="font-medium text-gray-800 mb-4 bg-gray-200 text-sm text-center font-medium sticky top-0 z-50 py-2 px-4 rounded-lg">
        {title}
      </div>
      <div className="space-y-1 min-h-[200px]" data-droppable-id={id}>
        {/* Drop zone at the beginning */}
        <DropZone
          onDrop={onDrop}
          position={0}
          status={id}
          isVisible={isOver && draggedTask?.sourceStatus !== id}
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
          />
        )}
      </div>
    </div>
  );
};

const ProjectOverView = ({ currentProject }) => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isBoardView, setIsBoardView] = useState(true);
  const { mutate: updateOrder } = useUpdateTaskOrder(currentProject?._id);

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

  const activeTasks =
    filterTasks(
      currentProject?.tasks?.filter((task) => task?.status === "todo")
    ) || [];

  const progressTasks =
    filterTasks(
      currentProject?.tasks?.filter((task) => task?.status === "in-progress")
    ) || [];

  const completedTasks =
    filterTasks(
      currentProject?.tasks?.filter((task) => task?.status === "completed")
    ) || [];

  const handleNavigateToTask = (task) => {
    navigate(`/projects/${projectName}/${task?._id}`);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
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

    // Get the target task list
    let targetTasks;
    switch (targetStatus) {
      case "todo":
        targetTasks = [...activeTasks];
        break;
      case "in-progress":
        targetTasks = [...progressTasks];
        break;
      case "completed":
        targetTasks = [...completedTasks];
        break;
      default:
        return;
    }

    // If moving within the same column, handle reordering
    if (sourceStatus === targetStatus) {
      // Remove from source position and insert at target position
      const [movedTask] = targetTasks.splice(sourceIndex, 1);
      const adjustedPosition =
        targetPosition > sourceIndex ? targetPosition - 1 : targetPosition;
      targetTasks.splice(adjustedPosition, 0, movedTask);

      // Update order for all affected tasks
      targetTasks.forEach((task, index) => {
        updateOrder({ taskId: task._id, newOrder: index });
      });
    } else {
      // Moving between columns
      // Update task status and position
      await handleTaskUpdate(taskId, targetStatus, targetPosition);

      // Update order for tasks in target column
      targetTasks.forEach((task, index) => {
        const newOrder = index >= targetPosition ? index + 1 : index;
        updateOrder({ taskId: task._id, newOrder });
      });

      // Set order for the moved task
      updateOrder({ taskId, newOrder: targetPosition });
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

      {isBoardView ? (
        <div className="flex gap-4 h-full mt-4 overflow-x-auto pb-4">
          <Droppable
            id="todo"
            title="Active Tasks"
            onDrop={handleTaskDrop}
            tasks={activeTasks}
          >
            {activeTasks.length > 0 ? (
              activeTasks.map((task, index) => (
                <DraggableTask
                  key={task._id}
                  task={task}
                  isBoardView={true}
                  onClick={handleNavigateToTask}
                  projectId={currentProject?._id}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No active tasks
              </div>
            )}
          </Droppable>

          <Droppable
            id="in-progress"
            title="In Progress"
            onDrop={handleTaskDrop}
            tasks={progressTasks}
          >
            {progressTasks.length > 0 ? (
              progressTasks.map((task, index) => (
                <DraggableTask
                  key={task._id}
                  task={task}
                  isBoardView={true}
                  onClick={handleNavigateToTask}
                  projectId={currentProject?._id}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No in-progress tasks
              </div>
            )}
          </Droppable>

          <Droppable
            id="completed"
            title="Completed"
            onDrop={handleTaskDrop}
            tasks={completedTasks}
          >
            {completedTasks.length > 0 ? (
              completedTasks.map((task, index) => (
                <DraggableTask
                  key={task._id}
                  task={task}
                  isBoardView={true}
                  onClick={handleNavigateToTask}
                  projectId={currentProject?._id}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No completed tasks
              </div>
            )}
          </Droppable>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-y-4 mt-4 rounded-xl overflow-hidden overflow-y-auto">
          {renderListSection("Active Tasks", activeTasks)}
          {renderListSection("Progress", progressTasks)}
          {renderListSection("Completed", completedTasks)}
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
