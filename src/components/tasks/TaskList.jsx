import React from "react";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";

const TaskList = ({ tasks, filter, scrollable = true }) => {
  if (tasks.length === 0) {
    return <EmptyState filter={filter} />;
  }

  const containerClassName = scrollable
    ? "space-y-2 h-full flex flex-col overflow-y-auto"
    : "space-y-2 flex flex-col";

  return (
    <div className={containerClassName}>
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} filter={filter} />
      ))}
    </div>
  );
};

export default TaskList;
