import React, { useState } from "react";
import Task from "../../../components/shared/task";

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

export default DraggableTask;
