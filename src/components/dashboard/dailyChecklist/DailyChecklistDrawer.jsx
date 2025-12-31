import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDailyChecklistStatus } from "../../../api/service";
import { format, addDays, subDays, isToday } from "date-fns";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const CircularProgress = ({ value, onClick }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 z-[50] group transition-transform hover:scale-105"
            title="Daily Tasks Progress"
        >
            <div className="relative flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg border border-blue-100">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                    {/* Background circle */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="#E5E7EB"
                        strokeWidth="5"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke={value === 100 ? "#10B981" : "#3B82F6"}
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-xs font-bold ${value === 100 ? "text-green-600" : "text-blue-600"}`}>
                        {Math.round(value)}%
                    </span>
                </div>
            </div>
            <div className="absolute -top-10 items-center justify-center w-full hidden group-hover:flex">
                <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Daily Tasks</span>
            </div>
        </button>
    );
};

const TaskItem = ({ project, task, isCompleted, onToggle }) => {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        // Optimistic update handled by parent, but we keep local loading for safety
        onToggle(project._id, task.title, !isCompleted);
        // We don't await the mutation here to keep UI snappy, 
        // rely on parent prop update for 'isCompleted'
        setTimeout(() => setLoading(false), 300); // minimal debounce
    };

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div className="relative flex items-center mt-0.5">
                <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={handleToggle}
                    disabled={loading}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-500 checked:bg-blue-500 hover:shadow-sm"
                />
                <svg
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <div className="flex-1">
                <p className={`text-sm font-medium ${isCompleted ? "text-gray-400 line-through" : "text-gray-700"}`}>
                    {task.title}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">{project.name}</p>
            </div>
        </div>
    );
};

const DailyChecklistDrawer = ({ projects = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [optimisticUpdates, setOptimisticUpdates] = useState({});
    const queryClient = useQueryClient();

    // Derived date string for API and Keys
    const currentDate = format(selectedDate, "yyyy-MM-dd");

    const todayTasks = useMemo(() => {
        let allTasks = [];
        let completedCount = 0;

        projects.forEach((project) => {
            // Only consider active tasks from definitions
            const definitions = project.dailyChecklist?.filter(t => t.active) || [];

            if (definitions.length > 0) {
                const historyForToday = project.dailyChecklistHistory?.find(h => h.date === currentDate);

                definitions.forEach(def => {
                    // Include date in the key to separate updates for different days
                    const key = `${currentDate}-${project._id}-${def.title}`;

                    // Determine completion status: Check optimistic state first, then history
                    let isCompleted;
                    if (Object.prototype.hasOwnProperty.call(optimisticUpdates, key)) {
                        isCompleted = optimisticUpdates[key];
                    } else {
                        isCompleted = historyForToday?.tasks?.find(t => t.title === def.title)?.completed || false;
                    }

                    if (isCompleted) completedCount++;
                    allTasks.push({
                        project,
                        definition: def,
                        isCompleted
                    });
                });
            }
        });

        return { allTasks, completedCount, total: allTasks.length };
    }, [projects, currentDate, optimisticUpdates]);

    const progress = todayTasks.total > 0
        ? (todayTasks.completedCount / todayTasks.total) * 100
        : 0;

    const mutation = useMutation({
        mutationFn: ({ projectId, taskTitle, completed }) =>
            updateDailyChecklistStatus(projectId, { date: currentDate, taskTitle, completed }),
        onSuccess: () => {
            // Invalidate queries to refresh the projects list and thus the progress
            queryClient.invalidateQueries(["employeeProjects"]);
            queryClient.invalidateQueries(["companyProjects"]);
        }
    });

    const handleTaskToggle = (projectId, taskTitle, completed) => {
        const key = `${currentDate}-${projectId}-${taskTitle}`;
        // Update optimistic state immediately
        setOptimisticUpdates(prev => ({ ...prev, [key]: completed }));

        // Trigger API call
        mutation.mutate({ projectId, taskTitle, completed });
    };

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    // Group tasks by project for display
    const tasksByProject = useMemo(() => {
        const groups = {};
        todayTasks.allTasks.forEach(item => {
            if (!groups[item.project._id]) {
                groups[item.project._id] = {
                    project: item.project,
                    tasks: [] // Now storing item object which includes isCompleted
                };
            }
            groups[item.project._id].tasks.push(item);
        });
        return Object.values(groups);
    }, [todayTasks.allTasks]);

    return (
        <>
            <CircularProgress value={progress} onClick={() => setIsOpen(true)} />

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Daily Checklist</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={handlePrevDay}
                                    className="p-1 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
                                    title="Previous Day"
                                >
                                    <MdChevronLeft className="w-5 h-5" />
                                </button>
                                <p className="text-xs font-medium text-gray-600 min-w-[140px] text-center">
                                    {isToday(selectedDate) ? "Today, " : ""}{format(selectedDate, "MMMM do, yyyy")}
                                </p>
                                <button
                                    onClick={handleNextDay}
                                    disabled={isToday(selectedDate)}
                                    className={`p-1 rounded-full transition-colors ${isToday(selectedDate)
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'hover:bg-blue-100 text-blue-600'
                                        }`}
                                    title="Next Day"
                                >
                                    <MdChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800 hover:shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {tasksByProject.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <p>No daily tasks defined.</p>
                                <p className="text-xs mt-2">Tasks added in Project Settings will appear here.</p>
                            </div>
                        ) : (
                            tasksByProject.map(({ project, tasks }) => (
                                <div key={project._id} className="animate-fade-in">
                                    <h3 className="font-semibold text-gray-700 mb-3 px-1 border-l-4 border-blue-400 pl-2">
                                        {project.name}
                                    </h3>
                                    <div className="space-y-1">
                                        {tasks.map((item, idx) => (
                                            <TaskItem
                                                key={`${project._id}-${idx}`}
                                                project={project}
                                                task={item.definition}
                                                isCompleted={item.isCompleted}
                                                onToggle={handleTaskToggle}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">
                                {isToday(selectedDate) ? "Total Progress" : `Progress (${format(selectedDate, "MMM do")})`}
                            </span>
                            <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DailyChecklistDrawer;
