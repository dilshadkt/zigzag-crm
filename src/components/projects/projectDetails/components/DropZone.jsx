import React, { useState } from "react";

const DropZone = ({ onDrop, position, status, isVisible, canDrop }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canDrop) {
            e.dataTransfer.dropEffect = "none";
            return;
        }

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

        if (!canDrop) return;

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
            className={`h-2 transition-all duration-200 ease-out ${isOver && canDrop
                ? "bg-blue-300 rounded-full mx-2"
                : canDrop
                    ? "bg-transparent"
                    : "bg-red-200 rounded-full mx-2"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        />
    );
};

export default DropZone;
