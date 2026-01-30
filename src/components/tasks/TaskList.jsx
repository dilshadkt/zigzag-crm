import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";

const TaskList = ({
  tasks,
  filter,
  scrollable = true,
  showSubtasks = true,
  showTasks = true,
}) => {
  const parentRef = useRef(null);

  const visibleTasks = tasks.filter((task) => {
    const isSubTask = task?.parentTask || task?.isSubTask;
    if (isSubTask && !showSubtasks) return false;
    if (!isSubTask && !showTasks) return false;
    return true;
  });

  const rowVirtualizer = useVirtualizer({
    count: visibleTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Increased estimate size for more complex TaskCard
    overscan: 10,
  });

  if (visibleTasks.length === 0) {
    return <EmptyState filter={filter} />;
  }

  const containerClassName = scrollable
    ? "h-full flex flex-col overflow-y-auto"
    : "flex flex-col";

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
                paddingBottom: "16px", // Increased padding for better separation in list view
              }}
            >
              <TaskCard task={task} filter={filter} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
