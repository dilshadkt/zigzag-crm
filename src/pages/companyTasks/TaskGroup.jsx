import React, { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import TaskList from "../../components/tasks/TaskList";

const TaskGroup = ({ group, showSubtasks, showTasks, filter }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div>
            <div className="mb-3 pb-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <h2 className="text-[15px] font-semibold text-gray-900">
                        {group.label}
                    </h2>
                    <p className="text-xs text-gray-500">
                        {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                    </p>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-500 hover:text-gray-800 transition"
                    aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${group.label}`}
                >
                    {isCollapsed ? (
                        <FiChevronRight className="w-5 h-5" />
                    ) : (
                        <FiChevronDown className="w-5 h-5" />
                    )}
                </button>
            </div>
            {!isCollapsed && (
                <TaskList
                    tasks={group.tasks}
                    showSubtasks={showSubtasks}
                    showTasks={showTasks}
                    filter={filter}
                />
            )}
        </div>
    );
};

export default TaskGroup;
