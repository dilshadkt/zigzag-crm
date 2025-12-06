import React, { useMemo, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { format, getDaysInMonth, startOfMonth, endOfMonth, addDays, differenceInDays, getDate, isToday, parseISO } from "date-fns";

export default function ProjectTimeline({ tasks = [], currentMonth, onTaskClick, isExpanded, onToggleExpand }) {
    const todayRef = useRef(null);

    // Parse the current month string (YYYY-MM)
    const currentDate = useMemo(() => {
        return currentMonth ? parseISO(`${currentMonth}-01`) : new Date();
    }, [currentMonth]);

    const daysInMonth = getDaysInMonth(currentDate);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const columnWidth = 140; // Reduced width for compact view

    // Generate array of dates for the header
    const dates = useMemo(() => {
        return Array.from({ length: daysInMonth }, (_, i) => {
            const date = addDays(monthStart, i);
            return {
                date,
                label: format(date, "d MMM"),
                day: format(date, "d"),
                isToday: isToday(date)
            };
        });
    }, [daysInMonth, monthStart]);

    // Scroll to today on mount or when dates change
    useEffect(() => {
        if (todayRef.current) {
            // Small timeout to ensure rendering is complete
            setTimeout(() => {
                todayRef.current?.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest"
                });
            }, 100);
        }
    }, [dates, currentMonth]);

    // Process tasks for the timeline
    const processedTasks = useMemo(() => {
        return tasks
            .filter(task => task.itemType !== "subtask")
            .map(task => {
                const startDate = task.startDate ? parseISO(task.startDate) : monthStart;
                const endDate = task.dueDate ? parseISO(task.dueDate) : (task.endDate ? parseISO(task.endDate) : startDate);

                let startDay = getDate(startDate);
                let endDay = getDate(endDate);

                // Adjust for month boundaries
                if (startDate < monthStart) startDay = 1;
                if (endDate > monthEnd) endDay = daysInMonth;

                // Calculate span based on visible days in this month
                let gridColumnStart = startDay;
                let gridColumnSpan = Math.min(daysInMonth - startDay + 1, differenceInDays(endDate, startDate < monthStart ? monthStart : startDate) + 1);

                // Ensure valid grid values
                if (gridColumnStart < 1) gridColumnStart = 1;
                if (gridColumnSpan < 1) gridColumnSpan = 1;

                return {
                    ...task,
                    gridColumnStart,
                    gridColumnSpan,
                    formattedStartDate: format(startDate, "d MMM"),
                    formattedEndDate: format(endDate, "d MMM"),
                };
            }).sort((a, b) => a.gridColumnStart - b.gridColumnStart);
    }, [tasks, monthStart, monthEnd, daysInMonth]);

    // Calculate rows to avoid overlap
    const tasksWithRows = useMemo(() => {
        const rows = [];
        return processedTasks.map(task => {
            let rowIndex = 0;
            let placed = false;
            while (!placed) {
                if (!rows[rowIndex]) rows[rowIndex] = [];
                const hasCollision = rows[rowIndex].some(existingTask => {
                    const existingStart = existingTask.gridColumnStart;
                    const existingEnd = existingTask.gridColumnStart + existingTask.gridColumnSpan;
                    const currentStart = task.gridColumnStart;
                    const currentEnd = task.gridColumnStart + task.gridColumnSpan;
                    return (currentStart < existingEnd && currentEnd > existingStart);
                });
                if (!hasCollision) {
                    rows[rowIndex].push(task);
                    placed = true;
                } else {
                    rowIndex++;
                }
            }
            return { ...task, gridRow: rowIndex + 1 };
        });
    }, [processedTasks]);

    // Helper to get status color
    const getStatusColor = (status) => {
        const colors = {
            "todo": "border-l-orange-400",
            "in-progress": "border-l-blue-500",
            "on-review": "border-l-purple-500",
            "completed": "border-l-green-500",
            "approved": "border-l-emerald-500",
            "on-hold": "border-l-yellow-400",
            "re-work": "border-l-red-500",
            "client-approved": "border-l-teal-500"
        };
        return colors[status] || "border-l-gray-400";
    };

    // Helper for tag colors
    const getTagColor = (text) => {
        const colors = {
            "High": "bg-red-100 text-red-700",
            "Medium": "bg-orange-100 text-orange-700",
            "Low": "bg-emerald-100 text-emerald-700",
            "Design": "bg-pink-100 text-pink-700",
            "Development": "bg-orange-100 text-orange-700",
            "Marketing": "bg-yellow-100 text-yellow-700",
            "QA": "bg-emerald-100 text-emerald-700",
            "Research": "bg-blue-100 text-blue-700",
            "Content": "bg-purple-100 text-purple-700"
        };
        return colors[text] || "bg-gray-100 text-gray-700";
    };

    // Helper for status badge colors
    const getStatusBadgeColor = (status) => {
        const colors = {
            "todo": "bg-orange-100 text-orange-700",
            "in-progress": "bg-blue-100 text-blue-700",
            "on-review": "bg-purple-100 text-purple-700",
            "completed": "bg-green-100 text-green-700",
            "approved": "bg-emerald-100 text-emerald-700",
            "on-hold": "bg-yellow-100 text-yellow-700",
            "re-work": "bg-red-100 text-red-700",
            "client-approved": "bg-teal-100 text-teal-700"
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    // Helper for task group colors
    const getTaskGroupColor = (group) => {
        if (!group) return "bg-gray-100 text-gray-700";
        const normalizedGroup = group.toLowerCase();

        if (normalizedGroup.includes("reels")) return "bg-pink-100 text-pink-700";
        if (normalizedGroup.includes("poster")) return "bg-purple-100 text-purple-700";
        if (normalizedGroup.includes("shooting")) return "bg-cyan-100 text-cyan-700";
        if (normalizedGroup.includes("motion")) return "bg-indigo-100 text-indigo-700";

        return "bg-slate-100 text-slate-700";
    };

    return (
        <div className="flex-1 h-full mt-3 overflow-hidden flex flex-col relative">
            {/* Expand/Collapse Button */}
            <button
                onClick={onToggleExpand}
                className="absolute top-3 right-3 cursor-pointer hover:scale-110
                transition-all duration-200 z-50 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 "
                title={isExpanded ? "Collapse Timeline" : "Expand Timeline"}
            >
                {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                        <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                        <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                        <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M15 3h6v6" />
                        <path d="M9 21H3v-6" />
                        <path d="M21 3l-7 7" />
                        <path d="M3 21l7-7" />
                    </svg>
                )}
            </button>

            <div className="bg-white p-3 flex flex-col h-full rounded-2xl">
                <div className="bg-[#f4f9fd] rounded-lg  
             flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 w-full">
                        <div
                            className="relative p-4"
                            style={{ width: `${daysInMonth * columnWidth}px` }}
                        >
                            {/* Vertical Line for Current Date */}
                            {dates.some(d => d.isToday) && (
                                <div
                                    ref={todayRef}
                                    className="absolute  top-4 bottom-4 w-0.5 bg-blue-500/50 z-0 flex flex-col items-center pointer-events-none"
                                    style={{
                                        left: `${(getDate(new Date()) - 1) * columnWidth + (columnWidth / 2) + 16}px`
                                    }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-blue-500 -mt-0.5" />
                                    <div className="w-2 h-2 rounded-full bg-blue-500 absolute bottom-0" />
                                </div>
                            )}

                            {/* Header Dates */}
                            <div
                                className="grid mb-4 sticky top-0 z-30 bg-[#f4f9fd] py-2"
                                style={{ gridTemplateColumns: `repeat(${daysInMonth}, ${columnWidth}px)` }}
                            >
                                {dates.map((dateObj, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "text-center text-[12px] font-medium text-gray-600 py-1",
                                            dateObj.isToday && "text-blue-600 font-semibold"
                                        )}
                                    >
                                        {dateObj.day}
                                    </div>
                                ))}
                            </div>

                            {/* Tasks Grid */}
                            <div
                                className="grid gap-y-2 relative z-10"
                                style={{
                                    gridTemplateColumns: `repeat(${daysInMonth}, ${columnWidth}px)`,
                                    gridTemplateRows: `repeat(${Math.max(...tasksWithRows.map(t => t.gridRow), 5)}, minmax(80px, auto))`
                                }}
                            >
                                {tasksWithRows.map((task) => (
                                    <div
                                        key={task._id}
                                        className="relative group px-1"
                                        style={{
                                            gridColumnStart: task.gridColumnStart,
                                            gridColumnEnd: `span ${task.gridColumnSpan}`,
                                            gridRowStart: task.gridRow,
                                        }}
                                    >
                                        {/* Card */}
                                        <div
                                            onClick={() => onTaskClick && onTaskClick(task)}
                                            className={cn(
                                                "bg-white p-2 rounded-md border hover:shadow-md transition-all h-full flex flex-col justify-between cursor-pointer",
                                                "border-l-[3px] border-gray-200",
                                                getStatusColor(task.status)
                                            )}>
                                            <div>
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <h3 className="text-[12px] font-semibold text-gray-800 leading-tight line-clamp-1 pr-1" title={task.title}>
                                                        {task.title}
                                                    </h3>
                                                </div>

                                                <div className="text-[9px] text-gray-500 font-medium mb-1.5">
                                                    {task.formattedStartDate} - {task.formattedEndDate}
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between">
                                                <div className="flex gap-1 flex-wrap">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn("text-[9px] px-1 py-0 h-4 font-medium rounded", getTagColor(task.priority))}
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn("text-[9px] px-1 py-0 h-4 font-medium rounded", getStatusBadgeColor(task.status))}
                                                    >
                                                        {task.status}
                                                    </Badge>
                                                    {task.taskGroup && (
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn("text-[9px] px-1 py-0 h-4 font-medium rounded uppercase", getTaskGroupColor(task.taskGroup))}
                                                        >
                                                            {task.taskGroup}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {task.assignedTo && task.assignedTo.length > 0 && (
                                                        <div className="flex -space-x-1.5">
                                                            {task.assignedTo.map((assignee, i) => (
                                                                <Avatar key={i} className="h-5 w-5 border border-white ring-1 ring-gray-100">
                                                                    <AvatarImage src={assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee.name || assignee.email}`} />
                                                                    <AvatarFallback className="text-[7px] bg-gray-100 text-gray-600 font-medium">
                                                                        {assignee.name?.[0] || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty state if no tasks */}
                                {tasksWithRows.length === 0 && (
                                    <div className="col-span-full row-span-full flex items-center justify-center text-muted-foreground min-h-[100px] text-xs">
                                        No tasks for this month
                                    </div>
                                )}
                            </div>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
