import React, { useState } from "react";
import Task from "../../shared/task";

export const DraggableTask = ({
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

export const DropZone = ({ onDrop, position, status, isVisible, canDrop }) => {
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

export const Droppable = ({
  id,
  title,
  children,
  onDrop,
  tasks,
  canDrop,
  isCompany,
  statusConfig,
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
        onDrop(taskData, id, tasks.length);
      } catch (error) {
        console.error("Error parsing task data:", error);
      }
    }
  };

  const childrenArray = React.Children.toArray(children);
  const config = statusConfig[id];

  return (
    <div
      className={`flex-shrink-0 w-80 rounded-lg px-2 pb-2 transition-all duration-200 ease-out
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
        className={`font-medium text-sm text-center py-2 px-4 rounded-lg mb-4 ${config?.color || "bg-gray-200 text-gray-800"
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
            <DropZone
              onDrop={onDrop}
              position={index + 1}
              status={id}
              isVisible={isOver}
              canDrop={canDrop}
            />
          </React.Fragment>
        ))}

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

export const KanbanTab = ({
  statusConfig,
  tasksByStatus,
  handleTaskDrop,
  canUserDropInStatus,
  isCompany,
  canUserDragTask,
  handleNavigateToTask,
  currentProject,
}) => {
  return (
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
            statusConfig={statusConfig}
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
  );
};
