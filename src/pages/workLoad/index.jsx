import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navigator from "../../components/shared/navigator";
import Modal from "../../components/shared/modal";
import { useGetAllEmployees } from "../../api/hooks";
import { useTodayTasks } from "../../api/hooks/dashboard";
import apiClient from "../../api/client";
import {
  format,
  addDays,
  startOfToday,
  isSameDay,
  isAfter,
  isBefore,
} from "date-fns";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaProjectDiagram,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";
import { useQueryClient, useQuery } from "@tanstack/react-query";

// ─── Day Tasks Panel ────────────────────────────────────────────────
const DayTasksPanel = ({
  isOpen,
  onClose,
  employee,
  date,
  onMoveTask,
}) => {
  const { data, isLoading } = useTodayTasks(employee?._id, date);

  const tasks = data?.tasks || [];
  const subTasks = data?.subTasks || [];
  const reworkTasks = data?.reworkTasks || [];
  const reworkSubTasks = data?.reworkSubTasks || [];
  const completedTasks = data?.completedTasks || [];
  const completedSubTasks = data?.completedSubTasks || [];

  const pendingList = [...subTasks, ...reworkSubTasks].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );
  const completedList = [...completedSubTasks];

  const allItems = [...pendingList, ...completedList];

  if (!isOpen) return null;

  const employeeName =
    employee?.name ||
    `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() ||
    "Unknown";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${employeeName} — ${format(date, "MMM d, yyyy")}`}
      maxWidth="sm:max-w-2xl"
    >
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <FaCheckCircle className="text-3xl mb-3 opacity-40" />
          <p className="text-sm font-medium">No tasks for this day</p>
        </div>
      ) : (
        <div className="space-y-2 pb-2">
          {/* Pending */}
          {pendingList.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FaClock className="text-[10px]" /> Pending (
                {pendingList.length})
              </h4>
              <div className="space-y-1.5">
                {pendingList.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onMove={() => onMoveTask(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedList.length > 0 && (
            <div className="mt-4">
              <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FaCheckCircle className="text-[10px]" /> Completed (
                {completedList.length})
              </h4>
              <div className="space-y-1.5">
                {completedList.map((task) => (
                  <TaskRow key={task._id} task={task} isCompleted />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

// ─── Task Row ────────────────────────────────────────────────────────
const TaskRow = ({ task, onMove, isCompleted = false }) => {
  const isSubtask = !!task.parentTask;
  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
        isCompleted
          ? "bg-emerald-50/50 border-emerald-100"
          : "bg-white border-slate-100 hover:border-blue-200"
      }`}
    >
      <div className="flex-1 min-w-0 mr-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
              isSubtask
                ? "bg-indigo-100 text-indigo-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isSubtask ? "Subtask" : "Task"}
          </span>
          {task.project && (
            <span className="text-[9px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded truncate max-w-[120px]">
              {task.project?.name || "Project"}
            </span>
          )}
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold capitalize ${
              task.priority === "high"
                ? "bg-red-100 text-red-700"
                : task.priority === "medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {task.priority || "low"}
          </span>
        </div>
        <h5
          className={`text-xs font-semibold truncate ${
            isCompleted ? "text-gray-500 line-through" : "text-gray-800"
          }`}
        >
          {task.title}
        </h5>
        {isSubtask && task.parentTask && (
          <p className="text-[10px] text-gray-400 truncate mt-0.5">
            Parent: {task.parentTask?.title || "—"}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700"
              : task.status === "in-progress"
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {(task.status || "todo").replace("-", " ")}
        </span>
        {!isCompleted && onMove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Move to another date"
          >
            <FaExchangeAlt className="text-[10px]" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Move Task Modal (with impact analysis + auto-recalculate) ──────
const MoveTaskModal = ({ isOpen, onClose, task, employee, onConfirm }) => {
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState(null);
  const [fetchingImpact, setFetchingImpact] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  // Stores the user-editable proposed dates for each affected item: { [id]: "yyyy-MM-dd" }
  const [proposedDates, setProposedDates] = useState({});
  const [proposedParentDate, setProposedParentDate] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setNewDate("");
      setImpactAnalysis(null);
      setConfirmed(false);
      setProposedDates({});
      setProposedParentDate("");
    }
  }, [isOpen]);

  const isSubtask = !!task?.parentTask;
  const parentTaskId = isSubtask
    ? task.parentTask?._id || task.parentTask
    : task?._id;

  // When user picks a new date, fetch impact analysis and auto-recalculate
  const handleDateChange = async (dateStr) => {
    setNewDate(dateStr);
    setImpactAnalysis(null);
    setConfirmed(false);
    setProposedDates({});
    setProposedParentDate("");

    if (!dateStr || !parentTaskId) return;

    setFetchingImpact(true);
    try {
      const response = await apiClient.get(
        `/subtasks/parent/${parentTaskId}`
      );
      const siblings = response.data?.subTasks || [];
      const newDueDate = new Date(dateStr);
      const currentDueDate = new Date(task.dueDate);

      // Calculate the delta (in days) between old and new date
      const deltaMs = newDueDate.getTime() - currentDueDate.getTime();
      const deltaDays = Math.round(deltaMs / (1000 * 60 * 60 * 24));

      // Find affected siblings: subtasks that come after the moved task
      const affectedSiblings = [];
      if (isSubtask && deltaDays > 0) {
        const currentIndex = siblings.findIndex((s) => s._id === task._id);
        siblings.forEach((sibling, idx) => {
          if (sibling._id === task._id) return;
          const siblingDue = new Date(sibling.dueDate);

          // Any sibling due on or after the current task's original date that would overlap
          if (idx > currentIndex || isAfter(newDueDate, siblingDue)) {
            if (
              !isBefore(siblingDue, currentDueDate) ||
              isAfter(newDueDate, siblingDue)
            ) {
              affectedSiblings.push(sibling);
            }
          }
        });
      }

      // Auto-recalculate proposed dates for affected siblings
      const newProposed = {};
      affectedSiblings.forEach((sibling) => {
        const siblingDue = new Date(sibling.dueDate);
        const shiftedDate = addDays(siblingDue, deltaDays);
        newProposed[sibling._id] = format(shiftedDate, "yyyy-MM-dd");
      });
      setProposedDates(newProposed);

      // Check parent task due date
      let parentTaskAffected = false;
      let parentTask = null;
      if (isSubtask) {
        try {
          const parentRes = await apiClient.get(`/tasks/${parentTaskId}`);
          parentTask = parentRes.data?.task;
          if (parentTask?.dueDate) {
            // Find the latest date among: the new moved date + all proposed sibling dates
            const allNewDates = [
              newDueDate,
              ...Object.values(newProposed).map((d) => new Date(d)),
            ];
            const latestDate = allNewDates.reduce(
              (max, d) => (d > max ? d : max),
              allNewDates[0]
            );
            if (isAfter(latestDate, new Date(parentTask.dueDate))) {
              parentTaskAffected = true;
              // Auto-set parent due date to the latest subtask date + 1 day buffer
              const proposedParent = addDays(latestDate, 1);
              setProposedParentDate(format(proposedParent, "yyyy-MM-dd"));
            }
          }
        } catch (e) {
          // ignore
        }
      }

      setImpactAnalysis({
        affectedSiblings,
        parentTaskAffected,
        parentTask,
        totalSiblings: siblings.length,
        newDate: newDueDate,
        currentDate: currentDueDate,
        deltaDays,
      });
    } catch (err) {
      console.error("Error fetching impact analysis:", err);
      setImpactAnalysis({ affectedSiblings: [], parentTaskAffected: false });
    } finally {
      setFetchingImpact(false);
    }
  };

  const updateProposedDate = (siblingId, dateStr) => {
    setProposedDates((prev) => ({ ...prev, [siblingId]: dateStr }));
  };

  const handleConfirmMove = async () => {
    if (!newDate) return;
    setLoading(true);
    try {
      // Pass the proposed dates for siblings and parent so they can all be updated
      await onConfirm(task, newDate, {
        ...impactAnalysis,
        proposedDates,
        proposedParentDate,
      });
      onClose();
    } catch (err) {
      console.error("Failed to move task:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const hasImpact =
    impactAnalysis &&
    (impactAnalysis.affectedSiblings.length > 0 ||
      impactAnalysis.parentTaskAffected);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Task"
      maxWidth="sm:max-w-xl"
    >
      <div className="space-y-4 pb-2">
        {/* Current task info */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                isSubtask
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isSubtask ? "Subtask" : "Task"}
            </span>
            {task.project && (
              <span className="text-[9px] text-gray-500 bg-white px-1.5 py-0.5 rounded">
                {task.project?.name}
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-gray-800">{task.title}</h4>
          {isSubtask && task.parentTask && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              Parent Task: {task.parentTask?.title}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border">
              Current: {format(new Date(task.dueDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Date picker */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1.5 block">
            Move to new date
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={format(new Date(), "yyyy-MM-dd")}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Loading impact */}
        {fetchingImpact && (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Analyzing impact...
          </div>
        )}

        {/* Impact analysis */}
        {impactAnalysis && newDate && !fetchingImpact && (
          <div className="space-y-3">
            {!hasImpact ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5">
                <FaCheckCircle className="text-emerald-500 text-sm mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-700">
                    No cascading impact
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    This task can be safely moved without affecting other
                    tasks.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-3">
                <div className="flex items-start gap-2.5">
                  <FaExclamationTriangle className="text-amber-500 text-sm mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-700">
                      Cascading impact detected
                    </p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      The following dates have been auto-recalculated
                      (shifted by{" "}
                      <strong>{impactAnalysis.deltaDays} day(s)</strong>).
                      You can adjust each date manually.
                    </p>
                  </div>
                </div>

                {/* Affected subtasks with editable dates */}
                {impactAnalysis.affectedSiblings.length > 0 && (
                  <div className="ml-6 space-y-2">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Affected Subtasks (
                      {impactAnalysis.affectedSiblings.length})
                    </p>
                    {impactAnalysis.affectedSiblings.map((sibling) => (
                      <div
                        key={sibling._id}
                        className="bg-white rounded-xl px-3 py-2.5 border border-amber-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-gray-700 truncate mr-2">
                            {sibling.title}
                          </p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                              sibling.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : sibling.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {sibling.priority || "low"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-[9px] text-gray-500 whitespace-nowrap">
                              {format(
                                new Date(sibling.dueDate),
                                "MMM d"
                              )}
                            </span>
                            <FaArrowRight className="text-[8px] text-amber-400 shrink-0" />
                            <input
                              type="date"
                              value={proposedDates[sibling._id] || ""}
                              onChange={(e) =>
                                updateProposedDate(
                                  sibling._id,
                                  e.target.value
                                )
                              }
                              min={format(new Date(), "yyyy-MM-dd")}
                              className="flex-1 border border-amber-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-400 bg-amber-50/50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Parent task due date with editable date */}
                {impactAnalysis.parentTaskAffected &&
                  impactAnalysis.parentTask && (
                    <div className="ml-6 space-y-2">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                        Parent Task Due Date Exceeded
                      </p>
                      <div className="bg-white rounded-xl px-3 py-2.5 border border-red-100 space-y-1.5">
                        <p className="text-[11px] font-semibold text-gray-700 truncate">
                          {impactAnalysis.parentTask.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-[9px] text-gray-500 whitespace-nowrap">
                              {format(
                                new Date(impactAnalysis.parentTask.dueDate),
                                "MMM d"
                              )}
                            </span>
                            <FaArrowRight className="text-[8px] text-red-400 shrink-0" />
                            <input
                              type="date"
                              value={proposedParentDate}
                              onChange={(e) =>
                                setProposedParentDate(e.target.value)
                              }
                              min={format(new Date(), "yyyy-MM-dd")}
                              className="flex-1 border border-red-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-400 bg-red-50/50"
                            />
                          </div>
                        </div>
                        <p className="text-[9px] text-red-500 mt-0.5">
                          Auto-set to latest subtask date + 1 day buffer
                        </p>
                      </div>
                    </div>
                  )}

                {/* Confirm checkbox */}
                <div className="ml-6 mt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-gray-600">
                      I've reviewed the adjusted dates and want to proceed
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary of changes */}
        {impactAnalysis && newDate && !fetchingImpact && hasImpact && confirmed && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1.5">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Summary of Changes
            </p>
            <div className="text-[11px] text-blue-800 space-y-0.5">
              <p>
                • <strong>{task.title}</strong> → {format(new Date(newDate), "MMM d, yyyy")}
              </p>
              {impactAnalysis.affectedSiblings.map((s) => (
                <p key={s._id}>
                  • <strong>{s.title}</strong> →{" "}
                  {proposedDates[s._id]
                    ? format(new Date(proposedDates[s._id]), "MMM d, yyyy")
                    : "unchanged"}
                </p>
              ))}
              {impactAnalysis.parentTaskAffected && proposedParentDate && (
                <p>
                  • Parent: <strong>{impactAnalysis.parentTask?.title}</strong>{" "}
                  → {format(new Date(proposedParentDate), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmMove}
            disabled={
              !newDate ||
              loading ||
              fetchingImpact ||
              (hasImpact && !confirmed)
            }
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 ${
              !newDate ||
              loading ||
              fetchingImpact ||
              (hasImpact && !confirmed)
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 shadow-sm"
            }`}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating {
                  hasImpact
                    ? `${1 + (impactAnalysis?.affectedSiblings?.length || 0) + (impactAnalysis?.parentTaskAffected ? 1 : 0)} items...`
                    : "..."
                }
              </>
            ) : (
              <>
                <FaExchangeAlt className="text-[10px]" />
                {hasImpact
                  ? `Move ${1 + (impactAnalysis?.affectedSiblings?.length || 0) + (impactAnalysis?.parentTaskAffected ? 1 : 0)} items`
                  : "Move Task"}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const useEmployeeWorkload = (employeeId) => {
  return useQuery({
    queryKey: ["employeeWorkload", employeeId],
    queryFn: async () => {
      if (!employeeId) return { tasks: [], subTasks: [] };
      const res = await apiClient.get(`/tasks/employee/${employeeId}`);
      return res.data;
    },
    enabled: !!employeeId,
  });
};

// ─── Employee Calendar ──────────────────────────────────────────────
const EmployeeCalendar = ({ employee, onDayClick }) => {
  const { data: workloadData, isLoading } = useEmployeeWorkload(employee?._id);

  if (!employee) {
    return (
      <div className="flex-1 bg-white rounded-2xl md:rounded-[1.5rem] p-5 flex items-center justify-center h-full min-h-[300px]">
        <div className="text-center text-gray-400">
          <FaCalendarAlt className="text-4xl mx-auto mb-2 opacity-30" />
          <h3 className="text-sm font-medium text-gray-500">
            Select an employee
          </h3>
          <p className="text-xs mt-1">
            Choose an employee from the list to view their 30-day workload
          </p>
        </div>
      </div>
    );
  }

  const today = startOfToday();
  const days = Array.from({ length: 30 }).map((_, i) => addDays(today, i));

  const getWorkloadForDate = (date) => {
    if (isLoading || !workloadData) return 0;
    
    const dateStr = format(date, "yyyy-MM-dd");
    const { subTasks = [] } = workloadData;
    
    const countSubTasks = subTasks.filter(st => 
      st.status !== "completed" && 
      st.status !== "approved" &&
      st.dueDate && format(new Date(st.dueDate), "yyyy-MM-dd") === dateStr
    ).length;

    return countSubTasks;
  };

  const employeeName =
    employee.name ||
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Unknown";

  return (
    <div className="flex-1 bg-white rounded-2xl md:rounded-[1.5rem] p-4 flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4 shrink-0 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shrink-0">
            <img
              src={
                employee.profile ||
                employee.profileImage ||
                `/image/dummy/avatar1.svg`
              }
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">
              {employeeName}
            </h3>
            <p className="text-[11px] text-gray-500 capitalize">
              {employee.position || "Employee"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-slate-200"></span> 0
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-blue-500"></span> 1
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-500"></span> 2-3
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-500"></span> 4+
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
          {days.map((date, i) => {
            const workloadCount = getWorkloadForDate(date);
            const isTodayCell = isSameDay(date, today);

            let bgColor = "bg-slate-50";
            let textColor = "text-slate-600";
            let countBg = "bg-slate-200 text-slate-700";

            if (workloadCount > 3) {
              bgColor = "bg-red-50";
              textColor = "text-red-700";
              countBg = "bg-red-500 text-white";
            } else if (workloadCount > 1) {
              bgColor = "bg-amber-50";
              textColor = "text-amber-700";
              countBg = "bg-amber-500 text-white";
            } else if (workloadCount === 1) {
              bgColor = "bg-blue-50";
              textColor = "text-blue-700";
              countBg = "bg-blue-500 text-white";
            }

            return (
              <div
                key={i}
                onClick={() => onDayClick(date)}
                className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                  isTodayCell
                    ? "border-blue-400 shadow-sm ring-1 ring-blue-100"
                    : "border-transparent hover:border-gray-300"
                } ${bgColor} min-h-[75px]`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-bold ${textColor}`}>
                    {format(date, "MMM d")}
                  </span>
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                      isTodayCell
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-400 bg-white/60"
                    }`}
                  >
                    {isTodayCell ? "Today" : format(date, "EEE")}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white/50 rounded-lg">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shadow-sm ${countBg}`}
                  >
                    {workloadCount}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${textColor}`}
                  >
                    {workloadCount === 1 ? "Task" : "Tasks"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main WorkLoad Page ─────────────────────────────────────────────
const WorkLoad = () => {
  const { data, isLoading } = useGetAllEmployees();
  const employees = data?.employees || [];
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [taskToMove, setTaskToMove] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0]._id);
    }
  }, [employees, selectedEmployeeId]);

  const selectedEmployee = employees.find(
    (e) => e._id === selectedEmployeeId
  );

  const handleDayClick = (date) => {
    setSelectedDay(date);
  };

  const handleMoveTask = (task) => {
    setSelectedDay(null); // close day panel
    setTaskToMove(task); // open move modal
  };

  const handleConfirmMove = async (task, newDateStr, impactAnalysis) => {
    const isSubtask = !!task.parentTask;
    const newDueDate = new Date(newDateStr);
    const { proposedDates, proposedParentDate, affectedSiblings, parentTaskAffected } = impactAnalysis || {};

    try {
      // 1. Update the moved task itself
      if (isSubtask) {
        await apiClient.put(`/subtasks/${task._id}`, {
          dueDate: newDueDate.toISOString(),
        });
      } else {
        await apiClient.put(`/tasks/${task._id}`, {
          dueDate: newDueDate.toISOString(),
        });
      }

      // 2. Update all affected sibling subtasks with their proposed dates
      if (affectedSiblings?.length > 0 && proposedDates) {
        const siblingUpdates = affectedSiblings
          .filter((s) => proposedDates[s._id])
          .map((s) =>
            apiClient.put(`/subtasks/${s._id}`, {
              dueDate: new Date(proposedDates[s._id]).toISOString(),
            })
          );
        await Promise.all(siblingUpdates);
      }

      // 3. Update the parent task due date if it was exceeded
      if (parentTaskAffected && proposedParentDate && isSubtask) {
        const parentId = task.parentTask?._id || task.parentTask;
        await apiClient.put(`/tasks/${parentId}`, {
          dueDate: new Date(proposedParentDate).toISOString(),
        });
      }

      // 4. Invalidate queries to refresh data
      queryClient.invalidateQueries(["todayTasks"]);
      queryClient.invalidateQueries(["employeesTodayStatus"]);
      queryClient.invalidateQueries(["employees"]);
      if (isSubtask && task.parentTask) {
        const parentId = task.parentTask?._id || task.parentTask;
        queryClient.invalidateQueries(["subTasksByParentTask", parentId]);
        queryClient.invalidateQueries(["getTaskById", parentId]);
      }
      // Also invalidate project-level queries
      queryClient.invalidateQueries(["projectTasks"]);
      queryClient.invalidateQueries(["projectDetails"]);
    } catch (err) {
      console.error("Failed to update task dates:", err);
      throw err;
    }
  };

  return (
    <section className="flex flex-col h-full min-h-0 bg-[#F8FAFC]">
      <div className="mb-3 shrink-0 flex items-center gap-3">
        <Navigator path={"/"} title={"Back to Dashboard"} />
        <div className="h-4 w-[1px] bg-gray-300"></div>
        <h2 className="font-bold text-sm md:text-base text-gray-800">
          Workload Calendar
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 h-full min-h-0 overflow-hidden pb-3">
        {/* Sidebar */}
        <div className="w-full lg:w-[260px] xl:w-[280px] flex flex-col bg-white rounded-2xl md:rounded-[1.5rem] p-3 shrink-0 h-[250px] lg:h-full border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1 border-b border-gray-100 pb-2">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
              Employees
            </h3>
            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
              {employees.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                Loading...
              </div>
            ) : (
              employees.map((employee, index) => {
                const isSelected = selectedEmployeeId === employee._id;
                const todayTasks =
                  typeof employee?.today_task_count === "number"
                    ? employee.today_task_count
                    : employee?.todayTaskCount || 0;
                const employeeName =
                  employee.name ||
                  `${employee.firstName || ""} ${
                    employee.lastName || ""
                  }`.trim() ||
                  "Unknown";

                return (
                  <div
                    key={employee._id || index}
                    onClick={() => setSelectedEmployeeId(employee._id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50 border border-blue-100 shadow-sm"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 ${
                          isSelected
                            ? "border-blue-200"
                            : "border-white shadow-sm"
                        }`}
                      >
                        <img
                          src={
                            employee?.profile ||
                            employee?.profileImage ||
                            `/image/dummy/avatar1.svg`
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`font-semibold text-xs truncate ${
                            isSelected ? "text-blue-700" : "text-gray-800"
                          }`}
                        >
                          {employeeName}
                        </h4>
                        <p className="text-[9px] text-gray-500 truncate capitalize">
                          {employee.position || "Employee"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                          todayTasks > 5
                            ? "bg-red-100 text-red-700"
                            : todayTasks > 0
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {todayTasks}{" "}
                        {todayTasks === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Calendar View */}
        <div className="w-full lg:flex-1 h-full min-h-[400px] lg:min-h-0 border border-gray-100 rounded-2xl md:rounded-[1.5rem] shadow-sm bg-white overflow-hidden">
          <EmployeeCalendar
            key={selectedEmployeeId}
            employee={selectedEmployee}
            onDayClick={handleDayClick}
          />
        </div>
      </div>

      {/* Day Tasks Panel */}
      {selectedDay && selectedEmployee && (
        <DayTasksPanel
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          employee={selectedEmployee}
          date={selectedDay}
          onMoveTask={handleMoveTask}
        />
      )}

      {/* Move Task Modal */}
      {taskToMove && (
        <MoveTaskModal
          isOpen={!!taskToMove}
          onClose={() => setTaskToMove(null)}
          task={taskToMove}
          employee={selectedEmployee}
          onConfirm={handleConfirmMove}
        />
      )}
    </section>
  );
};

export default WorkLoad;
