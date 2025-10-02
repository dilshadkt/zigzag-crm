import React from "react";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";

const TaskList = ({ tasks, filter }) => {
  if (tasks.length === 0) {
    return <EmptyState filter={filter} />;
  }

  return (
    <div className="space-y-2 h-full flex flex-col overflow-y-auto">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} filter={filter} />
      ))}
    </div>
  );
};

export default TaskList;
