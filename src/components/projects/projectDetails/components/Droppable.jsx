import React, { useState } from "react";
import DropZone from "./DropZone";
import { statusConfig } from "../constants";

const Droppable = ({
    id,
    title,
    children,
    onDrop,
    tasks,
    canDrop,
    isCompany,
}) => {
    const [isOver, setIsOver] = useState(false);
    const [draggedTask, setDraggedTask] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        const taskData = e.dataTransfer.types.includes("application/json");
        if (taskData) {
            if (!canDrop) {
                e.dataTransfer.dropEffect = "none";
                return;
            }

            e.dataTransfer.dropEffect = "move";
            setIsOver(true);

            // Get dragged task data for positioning
            try {
                const taskDataString = e.dataTransfer.getData("application/json");
                if (taskDataString) {
                    setDraggedTask(JSON.parse(taskDataString));
                }
            } catch (error) {
                // Ignore parsing errors during drag over
            }
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        // Only set isOver to false if we're actually leaving the droppable area
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsOver(false);
            setDraggedTask(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsOver(false);
        setDraggedTask(null);

        if (!canDrop) return;

        const taskDataString = e.dataTransfer.getData("application/json");
        if (taskDataString) {
            try {
                const taskData = JSON.parse(taskDataString);
                // Drop at the end if dropped on the container itself
                onDrop(taskData, id, tasks.length);
            } catch (error) {
                console.error("Error parsing task data:", error);
            }
        }
    };

    // Convert children to array if it's not already
    const childrenArray = React.Children.toArray(children);

    const config = statusConfig[id];

    return (
        <div
            className={`flex-shrink-0 w-80 rounded-lg p-4 transition-all duration-200 ease-out
                  ${isOver && canDrop
                    ? "bg-blue-50 border-2 border-blue-300"
                    : isOver && !canDrop
                        ? "bg-red-50 border-2 border-red-300"
                        : "bg-gray-50 border-2 border-transparent"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-droppable-id={id}
        >
            <div
                className={`font-medium text-sm text-center sticky top-0 z-50 py-2 px-4 rounded-lg mb-4 ${config?.color || "bg-gray-200 text-gray-800"
                    }`}
            >
                {title}
                {!canDrop && !isCompany && (
                    <div className="text-xs mt-1 opacity-70">Admin only</div>
                )}
            </div>
            <div
                className="space-y-1 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2"
                data-droppable-id={id}
            >
                {/* Drop zone at the beginning */}
                <DropZone
                    onDrop={onDrop}
                    position={0}
                    status={id}
                    isVisible={isOver && draggedTask?.sourceStatus !== id}
                    canDrop={canDrop}
                />

                {childrenArray.map((child, index) => (
                    <React.Fragment key={child.key || index}>
                        {child}
                        {/* Drop zone after each task */}
                        <DropZone
                            onDrop={onDrop}
                            position={index + 1}
                            status={id}
                            isVisible={isOver}
                            canDrop={canDrop}
                        />
                    </React.Fragment>
                ))}

                {/* Show drop zone at end if no tasks */}
                {childrenArray.length === 0 && (
                    <DropZone
                        onDrop={onDrop}
                        position={0}
                        status={id}
                        isVisible={isOver}
                        canDrop={canDrop}
                    />
                )}
            </div>
        </div>
    );
};

export default Droppable;
