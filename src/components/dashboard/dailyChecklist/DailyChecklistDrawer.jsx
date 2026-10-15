import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateDailyChecklistStatus, getDailyChecklistSummary } from "../../../api/service";
import { format, addDays, subDays, isToday } from "date-fns";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { FiCheck } from "react-icons/fi";

const CircularProgress = ({ value, onClick, loading }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <button
            onClick={onClick}
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[50] group transition-transform hover:scale-105"
            aria-label="Daily checklist"
        >
            <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-[14px] shadow-sm">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 48 48">
                    <rect x="1.25" y="1.25" width="45.5" height="45.5" rx="13" pathLength="100" stroke="#E5E7EB" strokeWidth="2.5" fill="none" />
                    {!loading && (
                        <rect
                            x="1.25" y="1.25" width="45.5" height="45.5" rx="13" pathLength="100"
                            stroke="#111827"
                            strokeWidth="2.5"
                            fill="none"
                            strokeDasharray={`${value} 100`}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                        />
                    )}
                    {loading && (
                        <rect
                            x="1.25" y="1.25" width="45.5" height="45.5" rx="13" pathLength="100"
                            stroke="#111827"
                            strokeWidth="2.5"
                            fill="none"
                            strokeDasharray="25 75"
                            strokeLinecap="round"
                            className="animate-[dash-run_1.2s_linear_infinite]"
                        />
                    )}
                </svg>
                <FiCheck className="relative w-5 h-5 text-gray-600" strokeWidth={2} />
            </div>
        </button>
    );
};

const TaskItem = ({ project, task, isCompleted, onToggle, completedBy, completedAt, disabled }) => {
    const [loading, setLoading] = useState(false);
    const handleToggle = async () => {
        if (disabled) return;
        setLoading(true);
        // Optimistic update handled by parent, but we keep local loading for safety
        onToggle(project._id, task.title, !isCompleted);
        // We don't await the mutation here to keep UI snappy, 
        // rely on parent prop update for 'isCompleted'
        setTimeout(() => setLoading(false), 300); // minimal debounce
    };

    const getUserInitials = (user) => {
        if (!user) return "?";
        const first = user.firstName?.[0] || "";
        const last = user.lastName?.[0] || "";
        return (first + last).toUpperCase() || "?";
    };

    const getUserFullName = (user) => {
        if (!user) return "Unknown User";
        return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User";
    };

    return (
        <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div className="relative flex items-center mt-0.5">
                <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={handleToggle}
                    disabled={loading || disabled}
                    className={`peer h-5 w-5 rounded-md border border-gray-300 transition-all checked:border-blue-500 checked:bg-blue-500 hover:shadow-sm ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
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
            <div className="flex-1 flex items-center justify-between">
                <div>
                    <p className={`text-xs uppercase font-medium ${isCompleted ? "text-gray-400 line-through" : "text-gray-700"}`}>
                        {task.title}
                    </p>
                    {task.assignedTo && (
                        <span className="text-[10px] text-gray-400 block mt-0.5 select-none">
                            Assigned: {
                                typeof task.assignedTo === "object"
                                    ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim()
                                    : "Team Member"
                            }
                        </span>
                    )}
                </div>

                {/* Show avatar and time when completed */}
                {isCompleted && (completedBy || completedAt) && (
                    <div className="flex items-center gap-2">
                        {completedAt && (
                            <span className="text-[10px] text-gray-400 font-medium tabular-nums">
                                {format(new Date(completedAt), "hh:mm a")}
                            </span>
                        )}
                        {completedBy && (
                            <div className="relative group">
                                {completedBy.profileImage ? (
                                    <img
                                        src={completedBy.profileImage}
                                        alt={getUserFullName(completedBy)}
                                        className="w-6 h-6 rounded-full border border-blue-100 object-cover"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border border-blue-100 bg-blue-500 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white">
                                            {getUserInitials(completedBy)}
                                        </span>
                                    </div>
                                )}
                                {/* Tooltip */}
                                <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10 whitespace-nowrap">
                                    <div className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg">
                                        {getUserFullName(completedBy)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const DrawerSkeleton = () => (
    <div className="space-y-4" aria-busy="true" aria-label="Loading checklist">
        {[3, 2, 3].map((rows, i) => (
            <div key={i} className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gray-200" />
                    <div className="h-3 w-32 rounded bg-gray-200" />
                </div>
                <div className="p-2 space-y-1">
                    {Array.from({ length: rows }).map((_, r) => (
                        <div key={r} className="flex items-start gap-3 p-2">
                            <div className="h-5 w-5 rounded-md bg-gray-200" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-3/4 rounded bg-gray-200" />
                                <div className="h-2 w-1/3 rounded bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const DailyChecklistDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const queryClient = useQueryClient();

    const currentDate = format(selectedDate, "yyyy-MM-dd");
    const queryKey = ["dailyChecklistSummary", currentDate];

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey,
        queryFn: () => getDailyChecklistSummary(currentDate),
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
    });

    const allTasks = useMemo(() => data?.tasks || [], [data]);
    const completedCount = allTasks.filter((t) => t.completed).length;
    const progress = allTasks.length > 0 ? (completedCount / allTasks.length) * 100 : 0;

    const mutation = useMutation({
        mutationFn: ({ projectId, taskTitle, completed }) =>
            updateDailyChecklistStatus(projectId, { date: currentDate, taskTitle, completed }),
        onMutate: async ({ projectId, taskTitle, completed }) => {
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (old) =>
                old
                    ? {
                        ...old,
                        tasks: old.tasks.map((t) =>
                            t.projectId === projectId && t.title === taskTitle
                                ? {
                                    ...t,
                                    completed,
                                    completedAt: completed ? new Date().toISOString() : null,
                                    completedBy: completed ? t.completedBy : null,
                                }
                                : t
                        ),
                    }
                    : old
            );
            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
        },
        onSettled: () => {
            // Refresh to pick up who completed it / the exact time.
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const handleTaskToggle = (projectId, taskTitle, completed) => {
        mutation.mutate({ projectId, taskTitle, completed });
    };

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    // Group tasks by project for display
    const tasksByProject = useMemo(() => {
        const groups = {};
        allTasks.forEach(item => {
            if (!groups[item.projectId]) {
                groups[item.projectId] = {
                    project: { _id: item.projectId, name: item.projectName, emoji: item.emoji },
                    tasks: [],
                };
            }
            groups[item.projectId].tasks.push(item);
        });
        return Object.values(groups);
    }, [allTasks]);
    return (
        <>
            <CircularProgress value={progress} loading={isLoading} onClick={() => setIsOpen(true)} />

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
                        <div className="w-full  flex items-start flex-col ">
                            <div className="flex items-center w-full justify-between">

                                <h2 className="text-lg font-bold text-gray-800">Daily Checklist</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800 hover:shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
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

                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoading ? (
                            <DrawerSkeleton />
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <p>Could not load the checklist.</p>
                                <button
                                    onClick={() => refetch()}
                                    className="mt-3 text-xs font-medium text-blue-600 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : tasksByProject.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <p>No daily tasks defined.</p>
                                <p className="text-xs mt-2">Tasks added in Project Settings will appear here.</p>
                            </div>
                        ) : (
                            tasksByProject.map(({ project, tasks }) => (
                                <div key={project._id} className="animate-fade-in bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-2">
                                        <span className="text-lg">{project.emoji || "📁"}</span>
                                        <h3 className="font-bold text-xs text-gray-800 truncate">
                                            {project.name}
                                        </h3>
                                    </div>
                                    <div className="p-2 ">
                                        {tasks.map((item, idx) => (
                                            <TaskItem
                                                key={`${project._id}-${idx}`}
                                                project={project}
                                                task={item}
                                                isCompleted={item.completed}
                                                completedBy={item.completedBy}
                                                completedAt={item.completedAt}
                                                onToggle={handleTaskToggle}
                                                disabled={!isToday(selectedDate)}
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
