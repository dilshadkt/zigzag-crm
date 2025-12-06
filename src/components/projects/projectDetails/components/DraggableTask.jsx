import React, { useState } from "react";
import Task from "../../../shared/task";

const DraggableTask = ({
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

export default DraggableTask;
