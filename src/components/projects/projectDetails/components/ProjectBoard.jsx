import React from "react";
import DraggableTask from "./DraggableTask";
import Droppable from "./Droppable";
import { statusConfig } from "../constants";

const ProjectBoard = ({
    tasksByStatus,
    handleTaskDrop,
    canUserDropInStatus,
    isCompany,
    handleNavigateTask,
    activeProject,
    canUserDragTask,
}) => {
    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 project-details-scroll">
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
                                    onClick={handleNavigateTask}
                                    projectId={activeProject?._id}
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

export default ProjectBoard;
