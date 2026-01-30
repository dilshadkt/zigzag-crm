import React, { useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import DropZone from "./DropZone";
import { statusConfig } from "./StatusConfig";

const DroppableColumn = ({ id, title, children, onDrop, tasks }) => {
    const [isOver, setIsOver] = useState(false);
    const [draggedTask, setDraggedTask] = useState(null);
    const parentRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        const taskData = e.dataTransfer.types.includes("application/json");
        if (taskData) {
            e.dataTransfer.dropEffect = "move";
            setIsOver(true);

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

        const taskDataString = e.dataTransfer.getData("application/json");
        if (taskDataString) {
            try {
                const taskData = JSON.parse(taskDataString);
                onDrop(taskData, id, tasks.length);
            } catch (error) {
                console.error("Error parsing task data:", error);
            }
        }
    };

    const childrenArray = React.Children.toArray(children);

    const rowVirtualizer = useVirtualizer({
        count: childrenArray.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 160, // Increased height to prevent overlap
        overscan: 5,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    const config = statusConfig[id];

    return (
        <div
            className={`flex-shrink-0 w-80  rounded-lg p-4 transition-all duration-200 ease-out
                  ${isOver
                    ? "bg-blue-50 border-2 border-blue-300"
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
            </div>
            <div
                ref={parentRef}
                className="min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2"
                data-droppable-id={id}
            >
                <DropZone
                    onDrop={onDrop}
                    position={0}
                    status={id}
                    isVisible={isOver && draggedTask?.sourceStatus !== id}
                />

                <div
                    style={{
                        height: `${totalSize}px`,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {virtualRows.map((virtualRow) => (
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
                                paddingBottom: "8px", // gap-y-2 (8px)
                            }}
                        >
                            {childrenArray[virtualRow.index]}
                            <DropZone
                                onDrop={onDrop}
                                position={virtualRow.index + 1}
                                status={id}
                                isVisible={isOver}
                            />
                        </div>
                    ))}
                </div>

                {childrenArray.length === 0 && (
                    <DropZone
                        onDrop={onDrop}
                        position={0}
                        status={id}
                        isVisible={isOver}
                    />
                )}
            </div>
        </div>
    );
};

export default DroppableColumn;
