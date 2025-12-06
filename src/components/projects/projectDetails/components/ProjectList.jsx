import React from "react";
import Task from "../../../shared/task";

const ProjectList = ({
    activeTasks,
    progressTasks,
    tasksByStatus,
    completedTasks,
    handleNavigateTask,
}) => {
    const renderSection = (title, tasks) => (
        <>
            <div className="min-h-10 font-medium sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
                {title}
            </div>
            {tasks?.map((task, index) => (
                <Task
                    onClick={handleNavigateTask}
                    key={task._id || index}
                    task={task}
                    isBoardView={false}
                    index={index}
                />
            ))}
        </>
    );

    return (
        <div className="flex flex-col h-full gap-y-4 mt-4 rounded-xl overflow-hidden overflow-y-auto">
            {renderSection("Active Tasks", activeTasks)}
            {renderSection("Progress", progressTasks)}
            {renderSection("On Review", tasksByStatus["on-review"])}
            {renderSection("On Hold", tasksByStatus["on-hold"])}
            {renderSection("Re-work", tasksByStatus["re-work"])}
            {renderSection("Approved", tasksByStatus["approved"])}
            {renderSection("Client Approved", tasksByStatus["client-approved"])}
            {renderSection("Completed", completedTasks)}
        </div>
    );
};

export default ProjectList;
