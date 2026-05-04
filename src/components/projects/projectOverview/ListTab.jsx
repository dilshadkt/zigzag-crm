import React from "react";
import Task from "../../shared/task";

export const ListTab = ({
  tasksByStatus,
  activeTasks,
  progressTasks,
  completedTasks,
  handleNavigateToTask,
  isBoardView,
}) => {
  const renderListSection = (title, tasks) => (
    <>
      <div
        className="min-h-10 font-medium sticky top-0 z-50
       text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter"
      >
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
    <div className="flex flex-col h-full pb-5 gap-y-4 rounded-xl overflow-hidden overflow-y-auto">
      {renderListSection("Active Tasks", activeTasks)}
      {renderListSection("Progress", progressTasks)}
      {renderListSection("On Review", tasksByStatus["on-review"])}
      {renderListSection("On Hold", tasksByStatus["on-hold"])}
      {renderListSection("Re-work", tasksByStatus["re-work"])}
      {renderListSection("Approved", tasksByStatus["approved"])}
      {renderListSection(
        "Client Approved",
        tasksByStatus["client-approved"]
      )}
      {renderListSection("Completed", completedTasks)}
    </div>
  );
};
