import React, { useState, useCallback, useEffect } from "react";
import { format, addDays, isToday } from "date-fns";
import { IoClose } from "react-icons/io5";
import { MdDragIndicator, MdCalendarToday, MdWarning, MdCheckCircle } from "react-icons/md";
import { FiCalendar, FiArrowRight, FiClock, FiAlertTriangle } from "react-icons/fi";
import { useTodayTasks } from "../../../api/hooks/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/client";

// Helper: Generate next N days
const getNextDays = (count = 14) => {
  return Array.from({ length: count }, (_, i) => addDays(new Date(), i + 1));
};

// Priority badge colors
const PRIORITY_STYLES = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const DraggableTaskCard = ({ task, onDragStart, onDragEnd, isHighlighted }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", task._id);
    e.dataTransfer.setData("taskType", task.type || "task");
    onDragStart(task);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
  };

  const priority = task.priority || "Medium";
  const priorityStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative flex items-start gap-3 p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing
        transition-all duration-200 select-none
        ${isDragging
          ? "opacity-50 scale-95 border-dashed border-blue-400 bg-blue-50 shadow-none"
          : isHighlighted
            ? "bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-200 ring-offset-1 z-10"
            : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md shadow-sm"
        }`}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 mt-0.5 text-gray-300 group-hover:text-blue-400 transition-colors">
        <MdDragIndicator className="text-xl" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Task title */}
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
          {task.title || task.name || "Unnamed Task"}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle}`}>
            {priority}
          </span>
          {task.dueDate && (
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <FiClock className="text-gray-400" />
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}
          {task.type === "subtask" && (
            <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
              Subtask
            </span>
          )}
        </div>
      </div>

      {/* Drag hint */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <FiArrowRight className="text-blue-400 text-sm" />
      </div>
    </div>
  );
};

// Capacity status helpers
const getCapacityStatus = (existing, limit) => {
  if (existing >= limit) return "full";
  if (existing >= limit - 1) return "near-full";
  return "available";
};

const CalendarDropZone = ({ date, onDrop, rescheduledTasks = [], existingTasks = [], dailyLimit = 10, dropError = null, draggingTask }) => {
  const [dragOver, setDragOver] = useState(false);

  const existingCount = existingTasks.length;
  // Combine existing + already-rescheduled-to-this-date
  const effectiveCount = existingCount + rescheduledTasks.length;

  const capacity = getCapacityStatus(effectiveCount, dailyLimit);
  const isFull = capacity === "full";
  const isNearFull = capacity === "near-full";
  const slotsLeft = Math.max(0, dailyLimit - effectiveCount);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = isFull ? "none" : "move";
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (isFull) return; // Block drop on full dates
    const taskId = e.dataTransfer.getData("taskId");
    const taskType = e.dataTransfer.getData("taskType");
    if (taskId) {
      onDrop(taskId, taskType, date);
    }
  };

  const hasRescheduled = rescheduledTasks.length > 0;

  // Style logic
  let containerClass = "relative rounded-xl border-2 transition-all duration-200 min-h-[72px] p-2.5 ";
  if (isFull) {
    containerClass += "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70";
  } else if (dragOver) {
    containerClass += "border-blue-400 bg-blue-50 shadow-lg shadow-blue-100 scale-[1.02] cursor-copy";
  } else if (hasRescheduled) {
    containerClass += "border-emerald-300 bg-emerald-50 cursor-pointer";
  } else if (isNearFull) {
    containerClass += "border-amber-200 bg-amber-50/40 cursor-pointer hover:border-amber-300";
  } else {
    containerClass += "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer";
  }

  const dateColor = isFull ? "text-gray-400" : dragOver ? "text-blue-600" : hasRescheduled ? "text-emerald-700" : "text-gray-500";
  const numColor = isFull ? "text-gray-400" : dragOver ? "text-blue-700" : hasRescheduled ? "text-emerald-800" : "text-gray-800";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={containerClass}
      title={isFull ? `This day is full (${effectiveCount}/${dailyLimit} tasks)` : `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} available`}
    >
      {/* Date header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold ${dateColor}`}>{format(date, "EEE")}</span>
          <span className={`text-sm font-extrabold ${numColor}`}>{format(date, "d")}</span>
          <span className={`text-[10px] ${isFull ? "text-gray-400" : hasRescheduled ? "text-emerald-600" : "text-gray-400"}`}>
            {format(date, "MMM")}
          </span>
        </div>

        {/* Right badge: capacity or rescheduled count */}
        <div className="flex items-center gap-1">
          {hasRescheduled && (
            <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full">
              +{rescheduledTasks.length}
            </span>
          )}
          {/* Capacity pill */}
          {isFull ? (
            <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              🔒 Full
            </span>
          ) : isNearFull ? (
            <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
              {slotsLeft} left
            </span>
          ) : existingCount > 0 ? (
            <span className="text-[9px] bg-blue-50 text-blue-500 font-medium px-1.5 py-0.5 rounded-full">
              {effectiveCount}/{dailyLimit}
            </span>
          ) : null}
        </div>
      </div>

      {/* Body content */}
      <div className="flex-1 flex flex-col justify-end">
        {isFull ? (
          <div className="flex items-center justify-center py-1.5 border border-dashed border-gray-300 rounded-lg bg-gray-100/60 mt-1">
            <span className="text-[10px] text-gray-400 font-semibold">At capacity</span>
          </div>
        ) : dragOver ? (
          <div className="flex items-center justify-center py-1.5 border-2 border-dashed border-blue-300 rounded-lg bg-blue-100/60 mt-1">
            <span className="text-xs text-blue-600 font-semibold">Drop here ✓</span>
          </div>
        ) : hasRescheduled ? (
          <div className="space-y-1 mt-1">
            {rescheduledTasks.map((task, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-emerald-100 rounded-lg px-2 py-1">
                <MdCheckCircle className="text-emerald-500 text-xs flex-shrink-0" />
                <span className="text-[10px] text-emerald-800 font-medium truncate">{task.title || "Task"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-1 mt-1">
            <span className={`text-[10px] font-medium ${isNearFull ? "text-amber-400" : "text-gray-300"}`}>
              {isNearFull ? "Almost full — 1 slot" : "Drag task here"}
            </span>
          </div>
        )}

        {/* Existing tasks as small squares */}
        {!isFull && !dragOver && !hasRescheduled && existingCount > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {existingTasks.map((task, i) => {
              const projectId = typeof task.project === "object" ? task.project?._id : task.project;
              const parentId = typeof task.parentTask === "object" ? task.parentTask?._id : task.parentTask;
              const handleClick = (e) => {
                e.stopPropagation();
                if (projectId && parentId) {
                  window.open(`/projects/${projectId}/${parentId}?subTaskId=${task._id}`, "_blank");
                }
              };
              
              const draggedParentId = draggingTask?.parentTask ? (typeof draggingTask.parentTask === 'object' ? draggingTask.parentTask._id : draggingTask.parentTask) : null;
              const isSibling = draggedParentId && parentId && draggedParentId === parentId;
              const isSubsequent = isSibling && draggingTask && (task.order || 0) > (draggingTask.order || 0);

              // Priority colors
              let colorClass = "bg-gray-300";
              if (task.priority === "High") colorClass = "bg-red-400";
              else if (task.priority === "Medium") colorClass = "bg-amber-400";
              else if (task.priority === "Low") colorClass = "bg-emerald-400";
              
              if (isSubsequent) {
                colorClass = "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)] animate-pulse border-2 border-amber-500";
              }

              return (
                <div
                  key={task._id || i}
                  onClick={handleClick}
                  title={task.title || "Task"}
                  className={`w-3 h-3 rounded-[3px] cursor-pointer hover:opacity-80 transition-all ${colorClass}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const OverloadRescheduleDrawer = ({ isOpen, onClose, employee, dailyLimit }) => {
  const queryClient = useQueryClient();
  const [draggingTask, setDraggingTask] = useState(null);
  const [rescheduledMap, setRescheduledMap] = useState({}); // { dateStr: [task] }
  const [removedTaskIds, setRemovedTaskIds] = useState(new Set());
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [dropError, setDropError] = useState(null);
  const [dateCapacity, setDateCapacity] = useState({});
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [pendingDrop, setPendingDrop] = useState(null);
  const futureDays = getNextDays(14);

  // Fetch upcoming subtask counts for the next 14 days when drawer opens
  useEffect(() => {
    if (!isOpen || !employee?._id) return;
    const fetchCapacity = async () => {
      setCapacityLoading(true);
      try {
        const startStr = format(futureDays[0], "yyyy-MM-dd");
        const endStr = format(futureDays[futureDays.length - 1], "yyyy-MM-dd");
        // Fetch all upcoming subtasks for this employee in the next 14 days
        const res = await apiClient.get(
          `/subtasks/employee/${employee._id}?dueDateRangeStart=${startStr}&dueDateRangeEnd=${endStr}&limit=500`
        );
        const upcoming = res.data?.subTasks || res.data?.subtasks || [];
        // Group by dueDate
        const grouped = {};
        upcoming.forEach((task) => {
          if (!task.dueDate) return;
          const dateKey = task.dueDate.split("T")[0]; // YYYY-MM-DD
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(task);
        });
        setDateCapacity(grouped);
      } catch (err) {
        console.warn("Could not fetch capacity data:", err);
      } finally {
        setCapacityLoading(false);
      }
    };
    fetchCapacity();
  }, [isOpen, employee?._id]);

  const { data: todayTasksData, isLoading } = useTodayTasks(
    isOpen ? employee?._id : null
  );

  // Only show subtasks — matches the workload card's today_task_count which is subtask-based
  const allTodayItems = React.useMemo(() => {
    const subtasks = (todayTasksData?.subTasks || []).map(s => ({ ...s, type: "subtask" }));
    const reworkSubtasks = (todayTasksData?.reworkSubTasks || []).map(s => ({ ...s, type: "subtask", isRework: true }));
    return [...subtasks, ...reworkSubtasks];
  }, [todayTasksData]);

  // Filter out already rescheduled items
  const availableTasks = allTodayItems.filter(t => !removedTaskIds.has(t._id));
  const todayCount = availableTasks.length;
  const isStillOverloaded = todayCount > dailyLimit;

  const executeReschedule = async (taskId, targetDate, shiftSubsequent = false) => {
    const task = availableTasks.find(t => t._id === taskId);
    if (!task) return;

    const dateStr = format(targetDate, "yyyy-MM-dd");
    setIsRescheduling(true);
    setPendingDrop(null);

    try {
      const updatePayload = {
        startDate: dateStr,
        dueDate: dateStr,
        shiftSubsequent
      };

      await apiClient.put(`/subtasks/${taskId}/schedule`, updatePayload);

      // Update local state
      setRemovedTaskIds(prev => new Set([...prev, taskId]));
      setRescheduledMap(prev => {
        const existing = prev[dateStr] || [];
        return { ...prev, [dateStr]: [...existing, task] };
      });
      setSuccessCount(prev => prev + 1);
      // Optimistically update the target date's task array
      setDateCapacity(prev => {
        const existingArr = prev[dateStr] || [];
        return {
          ...prev,
          [dateStr]: [...existingArr, task],
        };
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["todayTasks", employee._id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["calendarData"] });
      queryClient.invalidateQueries({ queryKey: ["employeesTodayStatus"] });
    } catch (err) {
      console.error("Failed to reschedule task:", err);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleDrop = useCallback(async (taskId, taskType, targetDate) => {
    const dateStr = format(targetDate, "yyyy-MM-dd");
    
    // Check for reschedule impact
    try {
      const res = await apiClient.get(`/subtasks/${taskId}/reschedule-impact?newDueDate=${dateStr}`);
      const impact = res.data;
      if (impact.success && impact.affectedSubTasks && impact.affectedSubTasks.length > 0) {
        setPendingDrop({ taskId, targetDate, impact });
        return;
      }
    } catch (err) {
      console.warn("Failed to check reschedule impact:", err);
    }

    // Proceed if no impact
    executeReschedule(taskId, targetDate, false);
  }, [availableTasks, employee?._id, queryClient]);


  // Reset state when closed
  const handleClose = () => {
    setRemovedTaskIds(new Set());
    setRescheduledMap({});
    setSuccessCount(0);
    setDropError(null);
    setDateCapacity({});
    setDraggingTask(null);
    onClose();
  };

  if (!isOpen) return null;

  const employeeName = employee?.name ||
    `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() ||
    "Employee";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-[61] flex flex-col bg-white shadow-2xl
          w-full max-w-3xl transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

          <div className="relative p-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FiAlertTriangle className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">
                    Overload Reschedule
                  </h2>
                  <p className="text-white/80 text-xs mt-0.5">
                    {employeeName} · {todayCount} tasks today · Limit: {dailyLimit}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center
                  text-white transition-colors backdrop-blur-sm"
              >
                <IoClose className="text-lg" />
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <MdWarning className="text-yellow-300 text-sm" />
                <span className="text-white text-xs font-semibold">
                  {todayCount > dailyLimit ? `${todayCount - dailyLimit} over limit` : "Within limit ✓"}
                </span>
              </div>
              {successCount > 0 && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <MdCheckCircle className="text-emerald-300 text-sm" />
                  <span className="text-white text-xs font-semibold">
                    {successCount} rescheduled
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instruction banner */}
        <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-5 py-2.5 flex items-center gap-2">
          <MdDragIndicator className="text-amber-500 text-base flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Drag tasks from the left panel and drop them onto a future date to reschedule
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Today's tasks */}
          <div className="w-[42%] flex-shrink-0 flex flex-col border-r border-gray-100 overflow-hidden">
            <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-gray-500 text-sm" />
                <span className="text-sm font-bold text-gray-700">Today's Tasks</span>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full
                  ${isStillOverloaded ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {todayCount} / {dailyLimit}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : availableTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <MdCheckCircle className="text-4xl text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-emerald-600">All tasks rescheduled!</p>
                  <p className="text-xs text-gray-500 mt-1">Workload is now manageable</p>
                </div>
              ) : (
                availableTasks.map((task) => {
                  const draggedParentId = draggingTask?.parentTask ? (typeof draggingTask.parentTask === 'object' ? draggingTask.parentTask._id : draggingTask.parentTask) : null;
                  const taskParentId = task.parentTask ? (typeof task.parentTask === 'object' ? task.parentTask._id : task.parentTask) : null;
                  const isSibling = draggedParentId && taskParentId && draggedParentId === taskParentId;
                  const isSubsequent = isSibling && (task.order || 0) > (draggingTask.order || 0);

                  return (
                    <DraggableTaskCard
                      key={task._id}
                      task={task}
                      onDragStart={setDraggingTask}
                      onDragEnd={() => setDraggingTask(null)}
                      isHighlighted={isSubsequent}
                    />
                  );
                })
              )}
            </div>

            {/* Overload indicator */}
            {isStillOverloaded && (
              <div className="flex-shrink-0 p-3 bg-red-50 border-t border-red-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="text-xs font-bold text-red-700">Still Overloaded</p>
                    <p className="text-[10px] text-red-500">
                      Drag {todayCount - dailyLimit} more task{todayCount - dailyLimit !== 1 ? "s" : ""} to future dates
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Calendar drop zones */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MdCalendarToday className="text-gray-500 text-sm" />
                <span className="text-sm font-bold text-gray-700">Reschedule To</span>
                <span className="ml-auto text-xs text-gray-400 font-medium">Next 14 days</span>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Available
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />1 slot left
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Full
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2">
                {futureDays.map((date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  return (
                    <CalendarDropZone
                      key={dateStr}
                      date={date}
                      onDrop={handleDrop}
                      rescheduledTasks={rescheduledMap[dateStr] || []}
                      existingTasks={dateCapacity[dateStr] || []}
                      dailyLimit={dailyLimit}
                      draggingTask={draggingTask}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 px-5 py-3 bg-white flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {successCount > 0
              ? `✅ Successfully rescheduled ${successCount} task${successCount !== 1 ? "s" : ""}`
              : "Drag tasks to future dates to reduce today's workload"}
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl
              transition-colors shadow-sm"
          >
            Done
          </button>
        </div>

      {/* Loading overlay */}
        {isRescheduling && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-gray-700">Rescheduling...</span>
            </div>
          </div>
        )}
      </div>

      {/* Impact Modal */}
      {pendingDrop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
                  <FiAlertTriangle className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-xl">Task Sequence Impact</h3>
                  <p className="text-white/90 text-sm font-medium mt-0.5">This task is part of a larger workflow</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh]">
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                <div className="mt-0.5"><MdWarning className="text-amber-500 text-lg" /></div>
                <p className="text-sm font-medium leading-relaxed">
                  You are moving a subtask by <span className="font-bold bg-amber-200 px-1.5 py-0.5 rounded text-amber-900">{pendingDrop.impact.shiftDays} days</span>. 
                  To maintain the correct order of work, the following subsequent tasks should also be shifted forward.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Subsequent Tasks Affected</h4>
                <div className="space-y-3">
                  {pendingDrop.impact.affectedSubTasks.map(st => (
                    <div key={st._id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-amber-300 transition-colors">
                      <p className="font-bold text-gray-800 text-sm mb-2 truncate" title={st.title}>{st.title}</p>
                      
                      <div className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-lg">
                        <div className="flex-1 flex items-center gap-2">
                          <FiClock className="text-gray-400" />
                          <span className="text-sm text-gray-500 font-medium line-through decoration-gray-400">
                            {format(new Date(st.oldDueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                        
                        <div className="w-8 flex justify-center">
                          <FiArrowRight className="text-amber-500 text-lg" />
                        </div>
                        
                        <div className="flex-1 flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-md text-amber-800">
                          <MdCalendarToday className="text-amber-600" />
                          <span className="text-sm font-bold">
                            {format(new Date(st.newDueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {pendingDrop.impact.parentTaskImpact && (
                <div className="mt-2 bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-rose-600 font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-800 mb-1">Parent Task Extension</h4>
                    <p className="text-xs text-rose-700 leading-relaxed mb-2">
                      Because these subtasks are being pushed so far forward, the overall Project Task's deadline will also be automatically extended.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                      <span className="line-through opacity-70">{format(new Date(pendingDrop.impact.parentTaskImpact.oldDueDate), "MMM d")}</span>
                      <FiArrowRight />
                      <span className="bg-rose-200 px-2 py-0.5 rounded">{format(new Date(pendingDrop.impact.parentTaskImpact.newDueDate), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => setPendingDrop(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel Move
              </button>
              <button
                onClick={() => executeReschedule(pendingDrop.taskId, pendingDrop.targetDate, false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-700 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Move Only This Task
              </button>
              <button
                onClick={() => executeReschedule(pendingDrop.taskId, pendingDrop.targetDate, true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300 flex items-center justify-center gap-2"
              >
                Shift Entire Sequence <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OverloadRescheduleDrawer;
