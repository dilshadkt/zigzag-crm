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

// ─── Helpers ─────────────────────────────────────────────────────────
const DAY_MS = 1000 * 60 * 60 * 24;
const diffDays = (a, b) => Math.round((new Date(a) - new Date(b)) / DAY_MS);

const calculateMovabilityScore = (task, allSiblings, parentTask) => {
  const taskIndex = allSiblings.findIndex((s) => s._id === task._id);
  const laterSiblings = allSiblings.filter((s, idx) => s._id !== task._id && idx > taskIndex);
  const taskDurationDays = task.timeEstimate ? Math.max(1, Math.ceil(task.timeEstimate / 8)) : 1;
  const parentDeadline = parentTask?.dueDate ? new Date(parentTask.dueDate) : null;
  const daysToParentDeadline = parentDeadline ? diffDays(parentDeadline, task.dueDate) : 999;
  const nextSibling = laterSiblings[0];
  const daysToNextSibling = nextSibling ? diffDays(nextSibling.dueDate, task.dueDate) : 999;

  let movabilityScore = 50;
  if (taskDurationDays <= 1) movabilityScore += 15;
  else if (taskDurationDays <= 2) movabilityScore += 5;
  else movabilityScore -= 10;
  if (laterSiblings.length === 0) movabilityScore += 20;
  else if (daysToNextSibling > 3) movabilityScore += 10;
  else movabilityScore -= 15;
  if (daysToParentDeadline > 5) movabilityScore += 15;
  else if (daysToParentDeadline > 2) movabilityScore += 5;
  else if (daysToParentDeadline <= 1) movabilityScore -= 20;
  const prio = (task.priority || "Low").toLowerCase();
  if (prio === "low") movabilityScore += 5;
  else if (prio === "high") movabilityScore -= 10;
  return Math.max(0, Math.min(100, movabilityScore));
};

// ─── Full-screen Workload Analyzer Modal ────────────────────────────
const WorkloadAnalyzerModal = ({
  isOpen,
  onClose,
  employee,
  date,
  onConfirmMove,
  workloadData,
}) => {
  const { data, isLoading } = useTodayTasks(employee?._id, date);
  const [selectedTask, setSelectedTask] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzingTask, setAnalyzingTask] = useState(false);
  const [selectedTargetDate, setSelectedTargetDate] = useState(null);
  const [proposedSiblingDates, setProposedSiblingDates] = useState({});
  const [proposedParentDate, setProposedParentDate] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [moving, setMoving] = useState(false);
  const [preAnalyzedScores, setPreAnalyzedScores] = useState({});

  const subTasks = data?.subTasks || [];
  const reworkSubTasks = data?.reworkSubTasks || [];
  const completedSubTasks = data?.completedSubTasks || [];

  const pendingList = [...subTasks, ...reworkSubTasks].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );
  const completedList = [...completedSubTasks];

  useEffect(() => {
    const fetchScores = async () => {
      if (!isOpen || pendingList.length === 0) return;
      
      const parentIds = [...new Set(pendingList.map(t => t.parentTask?._id || t.parentTask).filter(Boolean))];
      if (parentIds.length === 0) return;

      try {
        const scores = {};
        for (const parentId of parentIds) {
          const siblingRes = await apiClient.get(`/subtasks/parent/${parentId}`);
          const allSiblings = siblingRes.data?.subTasks || [];
          
          let parentTask = null;
          try {
            const parentRes = await apiClient.get(`/tasks/${parentId}`);
            parentTask = parentRes.data?.task;
          } catch (e) { /* ignore */ }
          
          allSiblings.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          
          pendingList.filter(t => (t.parentTask?._id || t.parentTask) === parentId).forEach(task => {
            scores[task._id] = calculateMovabilityScore(task, allSiblings, parentTask);
          });
        }
        setPreAnalyzedScores(scores);
      } catch (err) {
        console.error("Pre-analysis error:", err);
      }
    };
    fetchScores();
  }, [isOpen, data]);

  useEffect(() => {
    setAnalysisData(null);
    setSelectedTargetDate(null);
    setProposedSiblingDates({});
    setProposedParentDate("");
    setConfirmed(false);
  }, [selectedTask?._id]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTask(null);
      setAnalysisData(null);
      setSelectedTargetDate(null);
      setProposedSiblingDates({});
      setProposedParentDate("");
      setConfirmed(false);
    }
  }, [isOpen]);

  const analyzeTask = async (task) => {
    setSelectedTask(task);
    setAnalyzingTask(true);
    setAnalysisData(null);
    setSelectedTargetDate(null);
    setConfirmed(false);

    try {
      const parentTaskId = task.parentTask?._id || task.parentTask;
      const siblingRes = await apiClient.get(`/subtasks/parent/${parentTaskId}`);
      const allSiblings = siblingRes.data?.subTasks || [];
      const siblings = allSiblings.filter((s) => s._id !== task._id);
      const taskIndex = allSiblings.findIndex((s) => s._id === task._id);

      let parentTask = null;
      try {
        const parentRes = await apiClient.get(`/tasks/${parentTaskId}`);
        parentTask = parentRes.data?.task;
      } catch (e) { /* ignore */ }

      allSiblings.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      const laterSiblings = allSiblings.filter((s, idx) => {
        if (s._id === task._id) return false;
        return idx > taskIndex;
      });

      const taskDurationDays = task.timeEstimate
        ? Math.max(1, Math.ceil(task.timeEstimate / 8))
        : 1;

      const parentDeadline = parentTask?.dueDate ? new Date(parentTask.dueDate) : null;
      const daysToParentDeadline = parentDeadline ? diffDays(parentDeadline, task.dueDate) : 999;
      const nextSibling = laterSiblings[0];
      const daysToNextSibling = nextSibling ? diffDays(nextSibling.dueDate, task.dueDate) : 999;

      const movabilityScore = calculateMovabilityScore(task, allSiblings, parentTask);

      let recommendation = "";
      let recommendationType = "neutral";
      const prio = (task.priority || "Low").toLowerCase();
      if (movabilityScore >= 70) {
        recommendationType = "safe";
        const reasons = [];
        if (laterSiblings.length === 0) reasons.push("No dependent subtasks after it");
        if (taskDurationDays <= 1) reasons.push("Short task (~" + (task.timeEstimate || 8) + "h)");
        if (daysToParentDeadline > 5) reasons.push(daysToParentDeadline + " day buffer to parent deadline");
        recommendation = reasons.length > 0 ? reasons.join(" \u2022 ") : "Low impact task";
      } else if (movabilityScore >= 40) {
        recommendationType = "caution";
        recommendation = "Moderate impact \u2014 check sibling dates before moving";
      } else {
        recommendationType = "warning";
        const reasons = [];
        if (laterSiblings.length > 0 && daysToNextSibling <= 2)
          reasons.push("Only " + daysToNextSibling + " day(s) to next subtask");
        if (daysToParentDeadline <= 2)
          reasons.push("Only " + daysToParentDeadline + " day(s) to parent deadline");
        if (prio === "high") reasons.push("High priority");
        recommendation = reasons.length > 0 ? reasons.join(" \u2022 ") : "Moving may cause cascading deadline issues";
      }

      const recommendedDates = [];
      const today = startOfToday();
      const allSubTasks = workloadData?.subTasks || [];

      for (let i = 1; i <= 14; i++) {
        const candidateDate = addDays(today, i);
        if (isSameDay(candidateDate, date)) continue;
        const dateStr = format(candidateDate, "yyyy-MM-dd");
        const dayLoad = allSubTasks.filter(
          (st) =>
            st.status !== "completed" &&
            st.status !== "approved" &&
            st.dueDate &&
            format(new Date(st.dueDate), "yyyy-MM-dd") === dateStr
        ).length;
        const violatesParent = parentDeadline && isAfter(candidateDate, parentDeadline);
        let cascadeCount = 0;
        const deltaDays = diffDays(candidateDate, task.dueDate);
        if (deltaDays > 0) {
          laterSiblings.forEach((s) => {
            const sDue = new Date(s.dueDate);
            if (isAfter(candidateDate, sDue) || isSameDay(candidateDate, sDue)) cascadeCount++;
          });
        }
        recommendedDates.push({
          date: candidateDate,
          dateStr,
          dayLoad,
          violatesParent,
          cascadeCount,
          dayOfWeek: format(candidateDate, "EEE"),
          isWeekend: candidateDate.getDay() === 0 || candidateDate.getDay() === 6,
          score:
            (violatesParent ? 100 : 0) +
            dayLoad * 10 +
            cascadeCount * 20 +
            (candidateDate.getDay() === 0 || candidateDate.getDay() === 6 ? 50 : 0),
        });
      }
      recommendedDates.sort((a, b) => a.score - b.score);

      setAnalysisData({
        siblings,
        laterSiblings,
        parentTask,
        taskIndex,
        taskDurationDays,
        daysToParentDeadline,
        daysToNextSibling,
        movabilityScore,
        recommendation,
        recommendationType,
        recommendedDates,
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisData(null);
    } finally {
      setAnalyzingTask(false);
    }
  };

  const selectTargetDate = (targetDate) => {
    setSelectedTargetDate(targetDate);
    setConfirmed(false);
    if (!analysisData || !selectedTask) return;
    const deltaDays = diffDays(targetDate, selectedTask.dueDate);
    const newProposed = {};
    if (deltaDays > 0) {
      analysisData.laterSiblings.forEach((s) => {
        const sDue = new Date(s.dueDate);
        if (isAfter(targetDate, sDue) || isSameDay(targetDate, sDue)) {
          const shifted = addDays(sDue, deltaDays);
          newProposed[s._id] = format(shifted, "yyyy-MM-dd");
        }
      });
    }
    setProposedSiblingDates(newProposed);

    const parentDue = analysisData.parentTask?.dueDate
      ? new Date(analysisData.parentTask.dueDate)
      : null;
    if (parentDue) {
      const allNewDates = [targetDate, ...Object.values(newProposed).map((d) => new Date(d))];
      const latestDate = allNewDates.reduce((max, d) => (d > max ? d : max), allNewDates[0]);
      if (isAfter(latestDate, parentDue)) {
        setProposedParentDate(format(addDays(latestDate, 1), "yyyy-MM-dd"));
      } else {
        setProposedParentDate("");
      }
    } else {
      setProposedParentDate("");
    }
  };

  const handleConfirmMove = async () => {
    if (!selectedTask || !selectedTargetDate) return;
    setMoving(true);
    try {
      const affectedSiblings =
        analysisData?.laterSiblings?.filter((s) => proposedSiblingDates[s._id]) || [];
      await onConfirmMove(selectedTask, format(selectedTargetDate, "yyyy-MM-dd"), {
        affectedSiblings,
        parentTaskAffected: !!proposedParentDate,
        parentTask: analysisData?.parentTask,
        proposedDates: proposedSiblingDates,
        proposedParentDate,
      });
      setSelectedTask(null);
      setAnalysisData(null);
      setSelectedTargetDate(null);
      setConfirmed(false);
    } catch (err) {
      console.error("Move error:", err);
    } finally {
      setMoving(false);
    }
  };

  if (!isOpen) return null;

  const employeeName =
    employee?.name ||
    `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() ||
    "Unknown";

  const affectedSiblingsCount = Object.keys(proposedSiblingDates).length;
  const hasImpact = affectedSiblingsCount > 0 || !!proposedParentDate;

  return (
    <div className="fixed inset-0 z-[1000] flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-full h-full bg-[#F8FAFC]">
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-100">
                <img
                  src={employee?.profile || employee?.profileImage || "/image/dummy/avatar1.svg"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">{employeeName}</h2>
                <p className="text-[10px] text-gray-500">{format(date, "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {pendingList.length} Pending
              </span>
              {completedList.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {completedList.length} Done
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Two-panel layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Task list */}
          <div className="w-[360px] xl:w-[400px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <FaClock className="text-amber-500 text-[10px]" />
                Subtasks for this day
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Click a subtask to analyze movability
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-slate-100 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : pendingList.length === 0 && completedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FaCheckCircle className="text-3xl mb-3 opacity-40" />
                  <p className="text-sm font-medium">No subtasks for this day</p>
                </div>
              ) : (
                <>
                  {pendingList.map((task) => {
                    const isSelected = selectedTask?._id === task._id;
                    const prio = (task.priority || "Low").toLowerCase();
                    return (
                      <div
                        key={task._id}
                        onClick={() => analyzeTask(task)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-400 bg-blue-50/80 shadow-md ring-1 ring-blue-100"
                            : "border-transparent bg-white hover:border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase bg-indigo-100 text-indigo-700">
                              Subtask
                            </span>
                            {task.project && (
                              <span className="text-[8px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                {task.project?.name}
                              </span>
                            )}
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded font-bold capitalize ${
                                prio === "high"
                                  ? "bg-red-100 text-red-700"
                                  : prio === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {task.priority || "Low"}
                            </span>
                            {preAnalyzedScores[task._id] >= 70 && (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                                <FaCheckCircle className="text-[7px]" /> Recommended
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg capitalize whitespace-nowrap ${
                              task.status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : task.status === "re-work"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {(task.status || "todo").replace("-", " ")}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-gray-800 leading-tight mb-1">
                          {task.title}
                        </h5>
                        {task.parentTask && (
                          <p className="text-[9px] text-gray-400 truncate">
                            Parent: {task.parentTask?.title || "\u2014"}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {task.timeEstimate && (
                            <span className="text-[9px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <FaClock className="text-[7px]" />
                              {task.timeEstimate}h
                            </span>
                          )}
                          <span className="text-[9px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                            Due: {format(new Date(task.dueDate), "MMM d")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {completedList.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                        <FaCheckCircle className="text-[9px]" /> Completed ({completedList.length})
                      </h4>
                      {completedList.map((task) => (
                        <div key={task._id} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 mb-1.5">
                          <h5 className="text-xs font-medium text-gray-500 line-through">{task.title}</h5>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Analysis panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedTask ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400 max-w-xs">
                  <FaCalendarAlt className="text-5xl mx-auto mb-4 opacity-20" />
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    Select a subtask to analyze
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Click on any pending subtask on the left to see its movability score,
                    recommended dates, and cascading impact analysis
                  </p>
                </div>
              </div>
            ) : analyzingTask ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500">Analyzing task dependencies...</p>
                </div>
              </div>
            ) : analysisData ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Task info + Movability Score */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div
                      className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-sm border ${
                        analysisData.recommendationType === "safe"
                          ? "bg-emerald-50 border-emerald-200"
                          : analysisData.recommendationType === "caution"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <span
                        className={`text-xl font-black ${
                          analysisData.recommendationType === "safe"
                            ? "text-emerald-600"
                            : analysisData.recommendationType === "caution"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {analysisData.movabilityScore}
                      </span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Score</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">{selectedTask.title}</h3>
                    {selectedTask.parentTask && (
                      <p className="text-[10px] text-gray-500 mb-2">
                        Parent: {selectedTask.parentTask?.title}
                      </p>
                    )}
                    <div
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        analysisData.recommendationType === "safe"
                          ? "bg-emerald-100 text-emerald-700"
                          : analysisData.recommendationType === "caution"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {analysisData.recommendationType === "safe" ? (
                        <FaCheckCircle className="text-[9px]" />
                      ) : (
                        <FaExclamationTriangle className="text-[9px]" />
                      )}
                      {analysisData.recommendationType === "safe"
                        ? "Recommended to move"
                        : analysisData.recommendationType === "caution"
                        ? "Move with caution"
                        : "Not recommended"}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">{analysisData.recommendation}</p>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="bg-white rounded-xl p-2.5 border border-gray-100 flex flex-col justify-center">
                    <p className="text-[9px] text-gray-500 font-medium">Duration</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight mt-0.5">
                      ~{analysisData.taskDurationDays}d
                      <span className="text-[9px] font-normal text-gray-400 ml-1">({selectedTask.timeEstimate || 8}h)</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-gray-100 flex flex-col justify-center">
                    <p className="text-[9px] text-gray-500 font-medium">Later Siblings</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight mt-0.5">
                      {analysisData.laterSiblings.length}
                      <span className="text-[9px] font-normal text-gray-400 ml-1">subtasks</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-gray-100 flex flex-col justify-center">
                    <p className="text-[9px] text-gray-500 font-medium">Next Sibling</p>
                    <p className={`text-sm font-bold leading-tight mt-0.5 ${analysisData.daysToNextSibling <= 2 ? "text-red-600" : "text-gray-800"}`}>
                      {analysisData.daysToNextSibling >= 999 ? "None" : analysisData.daysToNextSibling + "d gap"}
                    </p>
                    {analysisData.laterSiblings[0] && (
                      <p className="text-[8px] text-gray-400 mt-0.5 truncate">
                        Due: {format(new Date(analysisData.laterSiblings[0].dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-gray-100 flex flex-col justify-center">
                    <p className="text-[9px] text-gray-500 font-medium">Parent Deadline</p>
                    <p className={`text-sm font-bold leading-tight mt-0.5 ${analysisData.daysToParentDeadline <= 2 ? "text-red-600" : "text-gray-800"}`}>
                      {analysisData.daysToParentDeadline >= 999 ? "N/A" : analysisData.daysToParentDeadline + "d away"}
                    </p>
                    {analysisData.parentTask?.dueDate && (
                      <p className="text-[8px] text-gray-400 mt-0.5 truncate">
                        Due: {format(new Date(analysisData.parentTask.dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sibling Details Preview (before moving) */}
                {analysisData.laterSiblings.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FaProjectDiagram className="text-slate-400" /> Dependent Subtasks Timeline
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
                      {analysisData.laterSiblings.map((sib, idx) => (
                        <div key={sib._id} className="shrink-0 w-[140px] bg-white border border-slate-100 p-2 rounded-lg shadow-sm">
                          <p className="text-[9px] font-bold text-gray-700 truncate">{sib.title}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[8px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {format(new Date(sib.dueDate), "MMM d, yyyy")}
                            </span>
                            <span className="text-[8px] text-slate-400 font-medium text-right">
                              +{diffDays(sib.dueDate, selectedTask.dueDate)}d gap
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* Recommended dates */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <FaCalendarAlt className="text-blue-500 text-[10px]" />
                    Recommended Target Dates
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {analysisData.recommendedDates
                      .filter((d) => !d.isWeekend)
                      .slice(0, 12)
                      .map((dateInfo) => {
                        const isDateSelected = selectedTargetDate && isSameDay(selectedTargetDate, dateInfo.date);
                        return (
                          <div
                            key={dateInfo.dateStr}
                            onClick={() => selectTargetDate(dateInfo.date)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-all border-2 ${
                              isDateSelected
                                ? "border-blue-400 bg-blue-50 shadow-md ring-1 ring-blue-100"
                                : dateInfo.violatesParent
                                ? "border-transparent bg-red-50/50 hover:border-red-200"
                                : dateInfo.cascadeCount > 0
                                ? "border-transparent bg-amber-50/50 hover:border-amber-200"
                                : "border-transparent bg-white hover:border-gray-200 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-800">{format(dateInfo.date, "MMM d")}</span>
                              <span className="text-[9px] text-gray-400">{dateInfo.dayOfWeek}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                  dateInfo.dayLoad === 0
                                    ? "bg-emerald-100 text-emerald-700"
                                    : dateInfo.dayLoad <= 2
                                    ? "bg-blue-100 text-blue-700"
                                    : dateInfo.dayLoad <= 4
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {dateInfo.dayLoad} tasks
                              </span>
                              {dateInfo.cascadeCount > 0 && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                  {dateInfo.cascadeCount} cascade
                                </span>
                              )}
                              {dateInfo.violatesParent && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                  Exceeds deadline
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Impact Preview */}
                {selectedTargetDate && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <FaExchangeAlt className="text-blue-500 text-[10px]" />
                      Impact Preview — Moving to {format(selectedTargetDate, "MMM d, yyyy")}
                    </h4>

                    {!hasImpact ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                        <FaCheckCircle className="text-emerald-500 text-sm mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-700">No cascading impact</p>
                          <p className="text-[10px] text-emerald-600">
                            No sibling subtasks or parent deadlines are affected. Safe to move.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <FaExclamationTriangle className="text-amber-500 text-sm mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-amber-700">
                              {affectedSiblingsCount} subtask(s) will be shifted
                              {proposedParentDate ? " + parent deadline update" : ""}
                            </p>
                            <p className="text-[10px] text-amber-600">
                              Auto-recalculated below. You can adjust dates manually.
                            </p>
                          </div>
                        </div>

                        {affectedSiblingsCount > 0 && (
                          <div className="space-y-1.5 ml-5">
                            {analysisData.laterSiblings
                              .filter((s) => proposedSiblingDates[s._id])
                              .map((s) => (
                                <div
                                  key={s._id}
                                  className="bg-white rounded-lg px-3 py-2 border border-amber-100 flex items-center justify-between gap-2"
                                >
                                  <p className="text-[10px] font-semibold text-gray-700 truncate min-w-0">
                                    {s.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[9px] text-gray-500">{format(new Date(s.dueDate), "MMM d")}</span>
                                    <FaArrowRight className="text-[8px] text-amber-400" />
                                    <input
                                      type="date"
                                      value={proposedSiblingDates[s._id] || ""}
                                      onChange={(e) =>
                                        setProposedSiblingDates((prev) => ({
                                          ...prev,
                                          [s._id]: e.target.value,
                                        }))
                                      }
                                      className="border border-amber-200 rounded px-1.5 py-0.5 text-[10px] bg-amber-50/50 w-[115px]"
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {proposedParentDate && analysisData.parentTask && (
                          <div className="ml-5 bg-white rounded-lg px-3 py-2 border border-red-100 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold text-red-600 uppercase">Parent Task</p>
                              <p className="text-[10px] font-semibold text-gray-700 truncate">
                                {analysisData.parentTask.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] text-gray-500">
                                {format(new Date(analysisData.parentTask.dueDate), "MMM d")}
                              </span>
                              <FaArrowRight className="text-[8px] text-red-400" />
                              <input
                                type="date"
                                value={proposedParentDate}
                                onChange={(e) => setProposedParentDate(e.target.value)}
                                className="border border-red-200 rounded px-1.5 py-0.5 text-[10px] bg-red-50/50 w-[115px]"
                              />
                            </div>
                          </div>
                        )}

                        <div className="ml-5 mt-1">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={confirmed}
                              onChange={(e) => setConfirmed(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-[10px] text-gray-600">
                              I've reviewed the cascading changes and want to proceed
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleConfirmMove}
                        disabled={moving || (hasImpact && !confirmed)}
                        className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 ${
                          moving || (hasImpact && !confirmed)
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {moving ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <FaExchangeAlt className="text-[10px]" />
                            Move to {format(selectedTargetDate, "MMM d")}
                            {hasImpact &&
                              " (+" +
                                (affectedSiblingsCount + (proposedParentDate ? 1 : 0)) +
                                " updates)"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
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
          <h3 className="text-sm font-medium text-gray-500">Select an employee</h3>
          <p className="text-xs mt-1">Choose an employee from the list to view their 30-day workload</p>
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
    return subTasks.filter(
      (st) =>
        st.status !== "completed" &&
        st.status !== "approved" &&
        st.dueDate &&
        format(new Date(st.dueDate), "yyyy-MM-dd") === dateStr
    ).length;
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
              src={employee.profile || employee.profileImage || `/image/dummy/avatar1.svg`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{employeeName}</h3>
            <p className="text-[11px] text-gray-500 capitalize">{employee.position || "Employee"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-200"></span> 0</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500"></span> 1</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500"></span> 2-3</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500"></span> 4+</span>
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
            if (workloadCount > 3) { bgColor = "bg-red-50"; textColor = "text-red-700"; countBg = "bg-red-500 text-white"; }
            else if (workloadCount > 1) { bgColor = "bg-amber-50"; textColor = "text-amber-700"; countBg = "bg-amber-500 text-white"; }
            else if (workloadCount === 1) { bgColor = "bg-blue-50"; textColor = "text-blue-700"; countBg = "bg-blue-500 text-white"; }

            return (
              <div
                key={i}
                onClick={() => onDayClick(date)}
                className={`flex flex-col p-2 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                  isTodayCell ? "border-blue-400 shadow-sm ring-1 ring-blue-100" : "border-transparent hover:border-gray-300"
                } ${bgColor} min-h-[75px]`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-bold ${textColor}`}>{format(date, "MMM d")}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${isTodayCell ? "bg-blue-100 text-blue-700" : "text-gray-400 bg-white/60"}`}>
                    {isTodayCell ? "Today" : format(date, "EEE")}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white/50 rounded-lg">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shadow-sm ${countBg}`}>{workloadCount}</div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${textColor}`}>{workloadCount === 1 ? "Task" : "Tasks"}</span>
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
  const { data, isLoading } = useGetAllEmployees(true, { view: "workload" });
  const employees = data?.employees || [];
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: workloadData } = useEmployeeWorkload(selectedEmployeeId);

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0]._id);
    }
  }, [employees, selectedEmployeeId]);

  const selectedEmployee = employees.find((e) => e._id === selectedEmployeeId);

  const handleDayClick = (date) => {
    setSelectedDay(date);
  };

  const handleConfirmMove = async (task, newDateStr, impactAnalysis) => {
    const isSubtask = !!task.parentTask;
    const newDueDate = new Date(newDateStr);
    const { proposedDates, proposedParentDate, affectedSiblings, parentTaskAffected } = impactAnalysis || {};

    try {
      if (isSubtask) {
        await apiClient.put(`/subtasks/${task._id}`, { dueDate: newDueDate.toISOString() });
      } else {
        await apiClient.put(`/tasks/${task._id}`, { dueDate: newDueDate.toISOString() });
      }

      if (affectedSiblings?.length > 0 && proposedDates) {
        await Promise.all(
          affectedSiblings
            .filter((s) => proposedDates[s._id])
            .map((s) => apiClient.put(`/subtasks/${s._id}`, { dueDate: new Date(proposedDates[s._id]).toISOString() }))
        );
      }

      if (parentTaskAffected && proposedParentDate && isSubtask) {
        const parentId = task.parentTask?._id || task.parentTask;
        await apiClient.put(`/tasks/${parentId}`, { dueDate: new Date(proposedParentDate).toISOString() });
      }

      queryClient.invalidateQueries(["todayTasks"]);
      queryClient.invalidateQueries(["employeesTodayStatus"]);
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["employeeWorkload"]);
      if (isSubtask && task.parentTask) {
        const parentId = task.parentTask?._id || task.parentTask;
        queryClient.invalidateQueries(["subTasksByParentTask", parentId]);
        queryClient.invalidateQueries(["getTaskById", parentId]);
      }
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
        <h2 className="font-bold text-sm md:text-base text-gray-800">Workload Calendar</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 h-full min-h-0 overflow-hidden pb-3">
        {/* Sidebar */}
        <div className="w-full lg:w-[260px] xl:w-[280px] flex flex-col bg-white rounded-2xl md:rounded-[1.5rem] p-3 shrink-0 h-[250px] lg:h-full border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1 border-b border-gray-100 pb-2">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Employees</h3>
            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full">{employees.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">Loading...</div>
            ) : (
              employees.map((employee, index) => {
                const isSelected = selectedEmployeeId === employee._id;
                const todayTasks = typeof employee?.today_task_count === "number" ? employee.today_task_count : employee?.todayTaskCount || 0;
                const employeeName = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown";

                return (
                  <div
                    key={employee._id || index}
                    onClick={() => setSelectedEmployeeId(employee._id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isSelected ? "bg-blue-50 border border-blue-100 shadow-sm" : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 ${isSelected ? "border-blue-200" : "border-white shadow-sm"}`}>
                        <img src={employee?.profile || employee?.profileImage || `/image/dummy/avatar1.svg`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-semibold text-xs truncate ${isSelected ? "text-blue-700" : "text-gray-800"}`}>{employeeName}</h4>
                        <p className="text-[9px] text-gray-500 truncate capitalize">{employee.position || "Employee"}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                        todayTasks > 5 ? "bg-red-100 text-red-700" : todayTasks > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {todayTasks} {todayTasks === 1 ? "task" : "tasks"}
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

      {/* Full-screen Workload Analyzer */}
      {selectedDay && selectedEmployee && (
        <WorkloadAnalyzerModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          employee={selectedEmployee}
          date={selectedDay}
          onConfirmMove={handleConfirmMove}
          workloadData={workloadData}
        />
      )}
    </section>
  );
};

export default WorkLoad;
