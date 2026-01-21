import React, { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Task from "../../../shared/task";

const ProjectList = ({
    activeTasks,
    progressTasks,
    tasksByStatus,
    completedTasks,
    handleNavigateTask,
}) => {
    const parentRef = useRef(null);

    // Flatten tasks and headers into a single list for virtualization
    const flatItems = useMemo(() => {
        const items = [];
        const sections = [
            { title: "Active Tasks", tasks: activeTasks },
            { title: "Progress", tasks: progressTasks },
            { title: "On Review", tasks: tasksByStatus["on-review"] },
            { title: "On Hold", tasks: tasksByStatus["on-hold"] },
            { title: "Re-work", tasks: tasksByStatus["re-work"] },
            { title: "Approved", tasks: tasksByStatus["approved"] },
            { title: "Client Approved", tasks: tasksByStatus["client-approved"] },
            { title: "Completed", tasks: completedTasks },
        ];

        sections.forEach((section) => {
            if (section.tasks && section.tasks.length > 0) {
                items.push({ type: "header", title: section.title });
                section.tasks.forEach((task) => {
                    items.push({ type: "task", task });
                });
            }
        });

        return items;
    }, [activeTasks, progressTasks, tasksByStatus, completedTasks]);

    const rowVirtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => (flatItems[index].type === "header" ? 40 : 80),
        overscan: 10,
    });

    return (
        <div
            ref={parentRef}
            className="flex flex-col h-full gap-y-4 mt-4 rounded-xl overflow-hidden overflow-y-auto"
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const item = flatItems[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            {item.type === "header" ? (
                                <div className="min-h-10 font-medium sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter mx-2">
                                    {item.title}
                                </div>
                            ) : (
                                <Task
                                    onClick={handleNavigateTask}
                                    task={item.task}
                                    isBoardView={false}
                                    index={virtualRow.index}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectList;
