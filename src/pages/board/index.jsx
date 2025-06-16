import React, { useState } from "react";
import { useGetEmployeeTasks } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { updateTaskById } from "../../api/service";
import { useUpdateTaskOrder } from "../../api/hooks";
import Task from "../../components/shared/task";
import Header from "../../components/shared/header";

// Status configuration
const statusConfig = {
  todo: {
    title: "Active Tasks",
    color: "bg-orange-100 text-orange-800",
  },
  "in-progress": {
    title: "In Progress",
    color: "bg-blue-100 text-blue-800",
  },
  completed: {
    title: "Completed",
    color: "bg-green-100 text-green-800",
  },
  "on-review": {
    title: "On Review",
    color: "bg-purple-100 text-purple-800",
  },
  "on-hold": {
    title: "On Hold",
    color: "bg-yellow-100 text-yellow-800",
  },
  "re-work": {
    title: "Re-work",
    color: "bg-red-100 text-red-800",
  },
  approved: {
    title: "Approved",
    color: "bg-emerald-100 text-emerald-800",
  },
};

const DraggableTask = ({ task, onClick, index }) => {
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
    e.currentTarget.style.opacity = "0.7";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setIsDragging(false);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="transition-opacity duration-200 ease-out cursor-grab active:cursor-grabbing"
      style={{
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <Task task={task} isBoardView={true} onClick={() => onClick(task)} />
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
      className={`flex-shrink-0 w-80 rounded-lg p-4 transition-all duration-200 ease-out
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
      <div
        className={`font-medium text-sm text-center sticky top-0 z-50 py-2 px-4 rounded-lg mb-4 ${
          config?.color || "bg-gray-200 text-gray-800"
        }`}
      >
        {title}
      </div>
      <div
        className="space-y-1 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2"
        data-droppable-id={id}
      >
        <DropZone
          onDrop={onDrop}
          position={0}
          status={id}
          isVisible={isOver && draggedTask?.sourceStatus !== id}
        />

        {childrenArray.map((child, index) => (
          <React.Fragment key={child.key || index}>
            {child}
            <DropZone
              onDrop={onDrop}
              position={index + 1}
              status={id}
              isVisible={isOver}
            />
          </React.Fragment>
        ))}

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

const Board = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: employeeTasksData, isLoading } = useGetEmployeeTasks(
    user?._id ? user._id : null
  );
  const { mutate: updateOrder } = useUpdateTaskOrder();

  const tasks = employeeTasksData?.tasks || [];

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    completed: tasks.filter((task) => task.status === "completed"),
    "on-review": tasks.filter((task) => task.status === "on-review"),
    "on-hold": tasks.filter((task) => task.status === "on-hold"),
    "re-work": tasks.filter((task) => task.status === "re-work"),
    approved: tasks.filter((task) => task.status === "approved"),
  };

  const handleTaskUpdate = async (taskId, newStatus, newOrder = null) => {
    try {
      const updateData = { status: newStatus };
      if (newOrder !== null) {
        updateData.order = newOrder;
      }

      await updateTaskById(taskId, updateData);
      queryClient.invalidateQueries(["employeeTasks", user?._id]);
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const handleTaskDrop = async (taskData, targetStatus, targetPosition) => {
    const { taskId, sourceStatus, sourceIndex } = taskData;

    // Optimistically update the UI
    queryClient.setQueryData(["employeeTasks", user?._id], (oldData) => {
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
      queryClient.invalidateQueries(["employeeTasks", user?._id]);
      alert("Failed to update task. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flexBetween">
        <Header>Task Board</Header>
        <div className="flex gap-2">
          <button
            onClick={() =>
              queryClient.invalidateQueries(["employeeTasks", user?._id])
            }
            className="p-2 bg-white hover:bg-gray-50 transition-colors rounded-lg"
          >
            <img src="/icons/refresh.svg" alt="Refresh" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Board View */}
      <div
        className="flex  h-[calc(100vh-180px)] mt-4 overflow-x-auto 
      pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
       project-details-scroll"
      >
        {Object.entries(statusConfig).map(([status, config]) => {
          const tasks = tasksByStatus[status] || [];

          return (
            <Droppable
              key={status}
              id={status}
              title={config.title}
              onDrop={handleTaskDrop}
              tasks={tasks}
            >
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <DraggableTask key={task._id} task={task} index={index} />
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
    </div>
  );
};

export default Board;
