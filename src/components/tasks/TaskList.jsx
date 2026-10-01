import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router-dom";
import Task from "../shared/task";
import EmptyState from "./EmptyState";

const TaskList = ({
  tasks,
  filter,
  scrollable = true,
  showSubtasks = true,
  showTasks = true,
}) => {
  const parentRef = useRef(null);
  const navigate = useNavigate();

  const visibleTasks = tasks.filter((task) => {
    const isSubTask = task?.parentTask || task?.isSubTask;
    if (isSubTask && !showSubtasks) return false;
    if (!isSubTask && !showTasks) return false;
    return true;
  });

  const rowVirtualizer = useVirtualizer({
    count: visibleTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Reduced estimate size for compact Task
    overscan: 10,
  });

  if (visibleTasks.length === 0) {
    return <EmptyState filter={filter} />;
  }

  const containerClassName = scrollable
    ? "h-full flex flex-col overflow-y-auto"
    : "flex flex-col";

  const handleTaskClick = (task) => {
    if (task.type === "subtask" || task.itemType === "subtask" || task.parentTask) {
      if (task.parentTask?._id) {
        navigate(`/projects/${task.project?._id || task.project}/${task.parentTask._id}`);
      } else if (task.project?._id) {
        navigate(`/projects/${task.project._id}/${task._id}`);
      }
    } else if (task.project?._id) {
      navigate(`/projects/${task.project._id}/${task._id}`);
    } else {
      navigate(`/tasks/${task._id}`);
    }
  };

  return (
    <div
      ref={parentRef}
      className={containerClassName}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const task = visibleTasks[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: "8px", // Reduced padding
              }}
            >
              <Task 
                task={task} 
                onClick={handleTaskClick} 
                compact={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
