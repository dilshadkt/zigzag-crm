import React, { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
import MultiSelect from "../../shared/Field/multiSelect";
import DatePicker from "../../shared/Field/date";
import Input from "../../shared/Field/input";
import CategoryPicker from "../../shared/Field/categoryPicker";
import CoveredTasksPicker from "./CoveredTasksPicker";
import CategoryFieldInputs from "../../shared/CategoryFieldInputs";
import {
  getFieldsForCategoryId,
  isCategoryFieldFilled,
} from "../../../utils/categoryFields";
import { useAddTaskForm } from "../../../hooks/useAddTaskForm";
import {
  useCreateTask,
  useGetTaskFlows,
  useResolveTaskFlow,
  useProjectDetails,
  useGetAllEmployees,
  useGetWorkSchedule,
  useGetHolidays,
  useGetTaskCategories,
  useAssetBank,
} from "../../../api/hooks";
import FileAndLinkUpload from "../../shared/fileUpload";
import { useAuth } from "../../../hooks/useAuth";
import { FiAlertTriangle, FiCheck, FiClock, FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from "react-icons/fi";
import Modal from "../../shared/modal";
import DateChangeReasonModal from "../dateChangeReasonModal";
import { canWaiveReschedulePenalty } from "../../../utils/rescheduleReasons";
import {
  computeFlowDatesWithSchedule,
  isWeeklyOff,
  isHoliday,
  formatShortDate,
} from "../../../utils/workingDayUtils";
import { useCheckAvailability } from "../../../features/vacations/hooks/useVacations";
import { useGetCampaignsByCompany } from "../../../api/campaigns";
import {
  extraWorkTypeValueFromName,
  getSelectedWorkItems,
  matchStandardWorkType,
  resolveTaskCategoryId,
  taskHoursToMinutes,
} from "../workDetailsForm/workTypeMapping";

const formatConflictDate = (value) => {
  if (!value) return "—";
  const date = new Date(typeof value === "string" && !value.includes("T")
    ? `${value}T00:00:00`
    : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatConflictRange = (start, end) => {
  const from = formatConflictDate(start);
  const to = formatConflictDate(end);
  return from === to ? from : `${from} – ${to}`;
};

const getConflictTypeMeta = (type) => {
  if (type === "sick_leave") return { label: "Sick leave", className: "bg-rose-50 text-rose-700 border-rose-100" };
  if (type === "vacation") return { label: "Annual leave", className: "bg-amber-50 text-amber-700 border-amber-100" };
  if (type === "subtask") return { label: "Subtask", className: "bg-indigo-50 text-indigo-700 border-indigo-100" };
  if (type === "task") return { label: "Task", className: "bg-blue-50 text-blue-700 border-blue-100" };
  return { label: String(type || "Conflict").replace("_", " "), className: "bg-gray-50 text-gray-600 border-gray-100" };
};

const getConflictCounts = (items = []) => {
  const taskCount = items.filter((d) => d.type === "task" || d.type === "subtask").length;
  const leaveCount = items.filter((d) => d.type === "vacation" || d.type === "sick_leave").length;
  return { taskCount, leaveCount, total: items.length };
};

const getConflictSummary = (name, items = []) => {
  const firstName = String(name || "Employee").trim().split(" ")[0] || "Employee";
  const { taskCount, leaveCount } = getConflictCounts(items);
  const parts = [];
  if (taskCount > 0) {
    parts.push(`${taskCount} task conflict${taskCount === 1 ? "" : "s"}`);
  }
  if (leaveCount > 0) {
    parts.push(`${leaveCount} leave`);
  }
  if (parts.length === 0) {
    return `${firstName} has schedule conflicts`;
  }
  return `${firstName} has ${parts.join(" and ")}`;
};

const ConflictItem = ({ item }) => {
  const meta = getConflictTypeMeta(item.type);
  const scheduledStart = item.originalStart || item.startDate;
  const scheduledEnd = item.originalEnd || item.endDate;
  const overlapStart = item.overlapStart || item.startDate;
  const overlapEnd = item.overlapEnd || item.endDate;
  // Open the task in a new tab so the form being filled in is not lost.
  const detailPath = item.parentTaskId
    ? item.projectId
      ? `/projects/${item.projectId}/${item.parentTaskId}?subTaskId=${item.subTaskId}`
      : `/tasks/${item.parentTaskId}`
    : null;
  const openDetail = () => window.open(detailPath, "_blank", "noopener");
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 ${
        detailPath ? "cursor-pointer transition-colors hover:border-blue-200 hover:bg-blue-50/40" : ""
      }`}
      {...(detailPath
        ? {
            role: "link",
            tabIndex: 0,
            title: "Open task details",
            onClick: openDetail,
            onKeyDown: (e) => {
              if (e.key === "Enter") openDetail();
            },
          }
        : {})}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${meta.className}`}>
          {meta.label}
        </span>
        {item.status ? (
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold capitalize text-gray-500">
            {item.status.replace("-", " ")}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs font-semibold text-gray-800">
        {item.title || item.taskName || meta.label}
      </p>
      {item.parentTaskName ? (
        <p className="text-[11px] text-gray-500">Parent: {item.parentTaskName}</p>
      ) : null}
      {item.projectName ? (
        <p className="text-[11px] text-gray-500">Project: {item.projectName}</p>
      ) : null}
      <p className="mt-1 text-[11px] text-gray-600">
        Scheduled: {formatConflictRange(scheduledStart, scheduledEnd)}
      </p>
      <p className="text-[11px] font-medium text-amber-700">
        Overlaps: {formatConflictRange(overlapStart, overlapEnd)}
      </p>
    </div>
  );
};

const toLocalKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const isoDay = (value) => (value ? String(value).slice(0, 10) : null);

const keyToDate = (key) => new Date(`${key}T00:00:00`);

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const isLeaveItem = (item) => item.type === "vacation" || item.type === "sick_leave";

// Full-screen view of one person's load: a month calendar on the left, their
// conflicting tasks on the right. A task sits on its due date, the day the
// daily limit is counted on; leave fills every day it covers.
const ConflictCalendar = ({ conflict, weeklyOffs = [], holidays = [] }) => {
  const limit = conflict.dailyTaskLimit || 10;
  const items = conflict.conflictingDates || [];
  const windowStart = isoDay(conflict.checkStartDate);
  const windowEnd = isoDay(conflict.checkEndDate);

  const { tasks, tasksByDay, leaveByDay } = useMemo(() => {
    const taskList = [];
    const byDay = {};
    const leave = {};
    items.forEach((item) => {
      if (isLeaveItem(item)) {
        const start = keyToDate(isoDay(item.overlapStart || item.startDate));
        const end = keyToDate(isoDay(item.overlapEnd || item.endDate));
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = toLocalKey(d);
          (leave[key] = leave[key] || []).push(item);
        }
        return;
      }
      const dueKey = isoDay(item.originalEnd || item.endDate);
      if (!dueKey) return;
      const task = { ...item, dueKey, startKey: isoDay(item.originalStart || item.startDate) };
      taskList.push(task);
      (byDay[dueKey] = byDay[dueKey] || []).push(task);
    });
    taskList.sort((a, b) => a.dueKey.localeCompare(b.dueKey));
    return { tasks: taskList, tasksByDay: byDay, leaveByDay: leave };
  }, [items]);

  // Days this assignment could be due on without going over the limit.
  const suggestions = useMemo(() => {
    if (!windowEnd) return [];
    const anchor = keyToDate(windowEnd);
    const earliest = windowStart ? keyToDate(windowStart) : anchor;
    const out = [];
    for (let offset = -14; offset <= 14; offset += 1) {
      const date = new Date(anchor);
      date.setDate(date.getDate() + offset);
      if (date < earliest) continue;
      const key = toLocalKey(date);
      if (isWeeklyOff(date, weeklyOffs) || isHoliday(date, holidays)) continue;
      if ((leaveByDay[key] || []).length > 0) continue;
      const load = (tasksByDay[key] || []).length;
      if (load + 1 > limit) continue;
      out.push({ key, load, offset });
    }
    return out
      .sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset) || b.offset - a.offset)
      .slice(0, 5);
  }, [windowStart, windowEnd, tasksByDay, leaveByDay, weeklyOffs, holidays, limit]);
  const suggestedKeys = useMemo(() => new Set(suggestions.map((s) => s.key)), [suggestions]);

  const dueLoad = windowEnd ? (tasksByDay[windowEnd] || []).length : 0;
  const dueDayIsFine =
    windowEnd &&
    dueLoad + 1 <= limit &&
    !(leaveByDay[windowEnd] || []).length;

  const initialDay = windowEnd || tasks[0]?.dueKey || toLocalKey(new Date());
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedTaskIdx, setSelectedTaskIdx] = useState(null);
  const [month, setMonth] = useState(() => {
    const base = keyToDate(initialDay);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const goToDay = (key) => {
    setSelectedDay(key);
    const date = keyToDate(key);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // week starts on Monday
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out = Array(offset).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      out.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    return out;
  }, [month]);

  const shiftMonth = (delta) =>
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  const selectedTask = selectedTaskIdx !== null ? tasks[selectedTaskIdx] : null;

  // How the picked task collides with the assignment being created.
  const explain = (task) => {
    const lines = [];
    const load = (tasksByDay[task.dueKey] || []).length;
    if (windowStart && windowEnd) {
      const overlaps = task.startKey <= windowEnd && task.dueKey >= windowStart;
      if (task.dueKey === windowEnd) {
        lines.push({
          tone: "red",
          text: `Both are due on ${formatConflictDate(windowEnd)}.`,
        });
      } else if (task.dueKey >= windowStart && task.dueKey <= windowEnd) {
        lines.push({
          tone: "amber",
          text: `It is due on ${formatConflictDate(task.dueKey)}, inside this assignment's window (${formatConflictRange(windowStart, windowEnd)}).`,
        });
      } else if (overlaps) {
        lines.push({
          tone: "amber",
          text: `Its schedule (${formatConflictRange(task.startKey, task.dueKey)}) overlaps this assignment's window (${formatConflictRange(windowStart, windowEnd)}).`,
        });
      }
    }
    lines.push({
      tone: load + 1 > limit ? "red" : load === limit ? "amber" : "gray",
      text: `${load} task${load === 1 ? "" : "s"} already due on ${formatConflictDate(task.dueKey)}; with this assignment it would be ${load + 1} of a ${limit}-task daily limit.`,
    });
    if (windowEnd && task.dueKey === windowEnd && suggestions.length > 0) {
      lines.push({
        tone: "green",
        text: `Moving this assignment's due date to ${formatConflictDate(suggestions[0].key)} avoids the clash.`,
      });
    }
    return lines;
  };

  const toneClass = {
    red: "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    green: "bg-green-50 text-green-700 border-green-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };

  const dayItems = [...(leaveByDay[selectedDay] || [])];

  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
            aria-label="Previous month"
          >
            ‹
          </button>
          <p className="text-base font-semibold text-gray-800">
            {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase text-gray-400">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, idx) => {
            if (!date) return <span key={`blank-${idx}`} />;
            const key = toLocalKey(date);
            const dayTasks = tasksByDay[key] || [];
            const onLeave = (leaveByDay[key] || []).length > 0;
            const off = isWeeklyOff(date, weeklyOffs) || isHoliday(date, holidays);
            const count = dayTasks.length;
            const inWindow = windowStart && windowEnd && key >= windowStart && key <= windowEnd;
            const isDue = key === windowEnd;
            const isSuggested = suggestedKeys.has(key) && !isDue;
            const picked = selectedTask && selectedTask.dueKey === key;
            const tone = onLeave
              ? "border-rose-200 bg-rose-50"
              : count > limit
              ? "border-red-300 bg-red-50"
              : count === limit
              ? "border-amber-300 bg-amber-50"
              : count > 0
              ? "border-blue-100 bg-blue-50/50"
              : off
              ? "border-gray-100 bg-gray-50"
              : inWindow
              ? "border-indigo-100 bg-indigo-50/40"
              : "border-gray-100 bg-white";
            const countTone =
              count > limit
                ? "bg-red-600 text-white"
                : count === limit
                ? "bg-amber-500 text-white"
                : "bg-blue-100 text-blue-700";
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedDay(key);
                  setSelectedTaskIdx(null);
                }}
                className={`flex min-h-[84px] flex-col rounded-lg border p-1.5 text-left transition-colors hover:border-blue-300 ${tone} ${
                  isSuggested ? "outline outline-2 outline-green-400" : ""
                } ${picked ? "ring-2 ring-purple-500" : selectedDay === key ? "ring-2 ring-blue-500" : ""}`}
              >
                <span className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${off ? "text-gray-400" : "text-gray-700"}`}>
                    {date.getDate()}
                  </span>
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 text-[10px] font-bold ${countTone}`}>
                      {count}/{limit}
                    </span>
                  )}
                </span>
                {isDue && (
                  <span className="mt-0.5 truncate rounded bg-indigo-600 px-1 text-[10px] font-semibold text-white">
                    This task due
                  </span>
                )}
                {isSuggested && (
                  <span className="mt-0.5 truncate text-[10px] font-semibold text-green-600">✓ Free</span>
                )}
                {onLeave && (
                  <span className="mt-auto truncate text-[10px] font-semibold text-rose-600">
                    {leaveByDay[key][0].title || "Leave"}
                  </span>
                )}
                {!onLeave && count > 0 && (
                  <span className="mt-auto truncate text-[10px] text-gray-500">
                    {dayTasks[0].parentTaskName || dayTasks[0].title}
                    {count > 1 ? ` +${count - 1}` : ""}
                  </span>
                )}
                {!onLeave && count === 0 && off && (
                  <span className="mt-auto text-[10px] text-gray-400">Off</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-blue-200 bg-blue-100" />Under limit</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-amber-300 bg-amber-100" />At limit ({limit})</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-red-300 bg-red-100" />Over limit</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-rose-200 bg-rose-100" />Leave</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border border-indigo-100 bg-indigo-50" />This assignment</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border-2 border-green-400" />Suggested</span>
          <span>Tasks are shown on their due date.</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-3">
          <p className="text-xs font-semibold text-gray-700">Suggested due dates</p>
          {!windowEnd ? (
            <p className="mt-1 text-xs text-gray-400">Set a due date to get suggestions.</p>
          ) : dueDayIsFine ? (
            <p className="mt-1 text-xs text-green-600">
              {formatConflictDate(windowEnd)} is within the daily limit ({dueLoad + 1} of {limit}).
            </p>
          ) : suggestions.length === 0 ? (
            <p className="mt-1 text-xs text-gray-500">No free working day within two weeks of the current due date.</p>
          ) : (
            <>
              <p className="mt-1 text-xs text-gray-500">
                {formatConflictDate(windowEnd)} is {(leaveByDay[windowEnd] || []).length ? "a leave day" : `over the limit (${dueLoad + 1} of ${limit})`}. These days are free:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => goToDay(s.key)}
                    className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 hover:bg-green-100"
                  >
                    {formatConflictDate(s.key)} · {s.load} task{s.load === 1 ? "" : "s"}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-gray-100 bg-white p-3">
          <p className="mb-2 text-xs font-semibold text-gray-700">
            Conflicting tasks ({tasks.length})
          </p>
          <div className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
            {dayItems.map((item, i) => (
              <ConflictItem key={`leave-${i}`} item={item} />
            ))}
            {tasks.length === 0 && dayItems.length === 0 && (
              <p className="text-xs text-gray-400">No conflicting tasks.</p>
            )}
            {tasks.map((task, idx) => {
              const active = selectedTaskIdx === idx;
              return (
                <div
                  key={`${task.subTaskId || idx}`}
                  className={`rounded-xl border transition-colors ${
                    active
                      ? "border-purple-300 bg-purple-50/40"
                      : selectedTaskIdx === null && task.dueKey === selectedDay
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-gray-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTaskIdx(active ? null : idx);
                      if (!active) goToDay(task.dueKey);
                    }}
                    className="w-full px-3 py-2 text-left"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-gray-800">
                        {task.parentTaskName || task.title}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold text-gray-500">
                        Due {formatConflictDate(task.dueKey)}
                      </span>
                    </span>
                    <span className="block truncate text-[11px] text-gray-500">
                      {task.title}
                      {task.projectName ? ` · ${task.projectName}` : ""}
                    </span>
                  </button>
                  {active && (
                    <div className="space-y-1.5 px-3 pb-3">
                      <p className="text-[11px] text-gray-600">
                        Scheduled: {formatConflictRange(task.startKey, task.dueKey)}
                        {task.status ? ` · ${task.status.replace("-", " ")}` : ""}
                      </p>
                      {explain(task).map((line, i) => (
                        <p
                          key={i}
                          className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium ${toneClass[line.tone]}`}
                        >
                          {line.text}
                        </p>
                      ))}
                      {task.parentTaskId && (
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              task.projectId
                                ? `/projects/${task.projectId}/${task.parentTaskId}?subTaskId=${task.subTaskId}`
                                : `/tasks/${task.parentTaskId}`,
                              "_blank",
                              "noopener"
                            )
                          }
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          Open task details ↗
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConflictDetails = ({ conflicts, title, emptyText, weeklyOffs = [], holidays = [] }) => {
  const [openConflict, setOpenConflict] = useState(null);

  if (!conflicts?.length) {
    return emptyText ? (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-5 text-center">
        <p className="text-sm font-medium text-gray-500">{emptyText}</p>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-2">
      {title ? (
        <div className="flex items-center gap-2">
          <FiAlertTriangle className="h-4 w-4 text-amber-500" />
          <h5 className="text-sm font-semibold text-gray-800">{title}</h5>
        </div>
      ) : null}
      {conflicts.map((conflict, idx) => {
        const items = conflict.conflictingDates || [];
        const isOverloaded = conflict.isOverloaded;
        return (
          <div
            key={`${conflict.employeeId || idx}-${conflict.label || "main"}`}
            className={`flex flex-col gap-2 rounded-2xl border ${isOverloaded ? 'border-red-200 bg-red-50' : 'border-amber-100 bg-white'} px-3 py-2.5 shadow-sm`}
          >
            <div className="flex items-center justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${isOverloaded ? 'text-red-800' : 'text-gray-800'}`}>
                  {getConflictSummary(conflict.employeeName, items)}
                </p>
                <p className={`text-[11px] ${isOverloaded ? 'text-red-600' : 'text-gray-500'}`}>
                  {conflict.employeeName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenConflict(conflict)}
                className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${isOverloaded ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
              >
                View more
              </button>
            </div>
            {isOverloaded ? (
              <div className="text-[11px] font-medium text-red-700 bg-red-100/50 rounded-lg px-2 py-1.5 flex items-start gap-1.5">
                <FiAlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  This assignment exceeds the daily task limit ({conflict.dailyTaskLimit}). 
                  Would have {conflict.projectedTasksInOneDay ?? conflict.maxTasksInOneDay} task(s) on a single day ({conflict.maxTasksInOneDay} already assigned).
                </span>
              </div>
            ) : (
              <div className="text-[11px] font-medium text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 flex items-start gap-1.5 border border-gray-100">
                <FiCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-500" />
                <span>
                  Workload is within the daily limit ({conflict.dailyTaskLimit}). 
                  Would have {conflict.projectedTasksInOneDay ?? conflict.maxTasksInOneDay} task(s) on a single day ({conflict.maxTasksInOneDay} already assigned).
                </span>
              </div>
            )}
          </div>
        );
      })}

      <Modal
        isOpen={!!openConflict}
        onClose={() => setOpenConflict(null)}
        title={openConflict ? getConflictSummary(openConflict.employeeName, openConflict.conflictingDates) : "Conflicts"}
        maxWidth="sm:max-w-[96vw] lg:max-w-[1400px]"
      >
        {openConflict && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {openConflict.employeeName} has {(openConflict.conflictingDates || []).length} overlapping item{(openConflict.conflictingDates || []).length === 1 ? "" : "s"} on these dates.
            </p>
            <ConflictCalendar
              key={`${openConflict.employeeId}-${openConflict.label}`}
              conflict={openConflict}
              weeklyOffs={weeklyOffs}
              holidays={holidays}
            />
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setOpenConflict(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const NO_STAGES = [];

const MONTHS_AHEAD = 12;

const monthKeyOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const formatMonthKey = (key) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

// This month and the next MONTHS_AHEAD - 1. A task can't be started in a month
// that has already gone, so earlier months are never offered; `current` (the
// month the modal opened on) is kept only so an already-selected past month
// still has something to show.
const getUpcomingMonthOptions = (current) => {
  const now = new Date();
  const options = Array.from({ length: MONTHS_AHEAD }, (_, index) => {
    const value = monthKeyOf(new Date(now.getFullYear(), now.getMonth() + index, 1));
    return { value, label: formatMonthKey(value) };
  });
  if (current && !options.some((option) => option.value === current)) {
    if (current < options[0].value) {
      options.unshift({ value: current, label: formatMonthKey(current) });
    }
  }
  return options;
};

const AddTask = ({
  isOpen,
  setShowModalTask,
  teams,
  initialValues,
  isLoading = false,
  onSubmit,
  projectData,
  isEdit = false,
  monthWorkDetails,
  selectedMonth,
  projects = [], // <-- add default empty array
  showProjectSelection = false, // <-- new prop to control project selection visibility
  editShootCategory = null, // edit only: the shoot category found on the task or its subtasks
}) => {
  const { user } = useAuth();
  const companyId = user?.company;

  // Month the new task belongs to. Starts as the month the page is showing and
  // can be moved to a later one from the header; editing keeps the task's month.
  const [activeMonth, setActiveMonth] = useState(selectedMonth || "");
  useEffect(() => {
    if (isOpen) setActiveMonth(selectedMonth || "");
  }, [isOpen, selectedMonth]);

  // Fetch task flows for the company
  const { data: taskFlowsData } = useGetTaskFlows(companyId);
  const taskFlows = taskFlowsData || [];

  // Fetch company work schedule (weekly-off rules)
  const { data: workSchedule } = useGetWorkSchedule(companyId);
  const weeklyOffs = workSchedule?.weeklyOffs || [];

  // Fetch company holidays
  const { data: holidays = [] } = useGetHolidays(companyId);

  // Fetch company task categories
  const { data: taskCategories = [], isLoading: isLoadingTaskCategories } =
    useGetTaskCategories(companyId);

  const skipCategoryWarningRef = useRef(false);
  const [showMissingCategoryModal, setShowMissingCategoryModal] = useState(false);
  // Set when saving is attempted while a flow stage still has nobody assigned
  const [flowAssigneeBlocked, setFlowAssigneeBlocked] = useState(false);

  const handleClose = () => {
    skipCategoryWarningRef.current = false;
    setShowMissingCategoryModal(false);
    resetForm();
    setShowModalTask(false);
  };

  // Prepare initial values for the form
  const prepareInitialValues = () => {
    if (!initialValues) return {};

    return {
      title: initialValues.title || "",
      task_description: initialValues.task_description || "",
      project: initialValues.project?._id || initialValues.project || null,
      taskGroup: initialValues.taskGroup || "",
      taskCategory: initialValues.taskCategory?._id || initialValues.taskCategory || "",
      taskFlow: initialValues.taskFlow?._id || initialValues.taskFlow || "",
      extraTaskWorkType: initialValues.extraTaskWorkType || "",
      // taskMonth: isEdit ? selectedMonth : initialValues.selectedMonth || "",
      taskMonth: selectedMonth || "",
      startDate: initialValues.startDate || "",
      dueDate: initialValues.dueDate || "",
      priority: initialValues.priority || "Low",
      assignedTo: initialValues.assignedTo
        ? Array.isArray(initialValues.assignedTo)
          ? initialValues.assignedTo.map((user) => user._id || user)
          : [initialValues.assignedTo._id || initialValues.assignedTo]
        : [],
      copyOfDescription: initialValues.copyOfDescription || "",
      description: initialValues.description || "",
      dueDateChangeReason: initialValues.dueDateChangeReason || "",
      requiresClientApproval: initialValues.requiresClientApproval || false,
      sequentialSubtasks:
        initialValues.sequentialSubtasks ?? Boolean(initialValues.taskFlow),
      requiresWorkLink: initialValues.requiresWorkLink || false,
      campaign: initialValues.campaign?._id || initialValues.campaign || "",
      requiresCampaignReport: initialValues.requiresCampaignReport || false,
      customFields: initialValues.customFields || [],
      categoryFieldValues: initialValues.categoryFieldValues || [],
      subtasks: initialValues.subtasks || [],
      attachments: initialValues.attachments || [],
      timeEstimate:
        taskHoursToMinutes(initialValues.timeEstimate) ??
        initialValues.timeEstimate ??
        "",
    };
  };

  const handleTaskSubmit = async (formData, helpers) => {
    const hasUnassignedFlowStep = (formData.subtasks || []).some(
      (step) => step?.isFromFlow && !(step.assignee?._id || step.assignee)
    );
    if (!isEdit && hasUnassignedFlowStep) {
      setFlowAssigneeBlocked(true);
      helpers?.setSubmitting?.(false);
      return;
    }

    const categories = Array.isArray(taskCategories) ? taskCategories : [];
    const missing = (formData.subtasks || []).filter((step) => {
      if (step?.taskCategory) return false;
      return !categories.some(
        (category) =>
          String(category.name || "").toLowerCase() ===
          String(step?.taskName || "").toLowerCase()
      );
    });
    const noStepsAndNoTaskCategory =
      (!formData.subtasks || formData.subtasks.length === 0) &&
      !formData.taskCategory;

    if (
      (missing.length > 0 || noStepsAndNoTaskCategory) &&
      !skipCategoryWarningRef.current
    ) {
      setShowMissingCategoryModal(true);
      helpers?.setSubmitting?.(false);
      return;
    }

    const categoryFields = getFieldsForCategoryId(
      taskCategories,
      formData.taskCategory,
      formData.categoryFieldValues
    );
    const missingField = categoryFields.find(
      (field) => field.required && !isCategoryFieldFilled(field)
    );
    if (missingField) {
      toast.error(`Fill in "${missingField.label}" before saving`);
      helpers?.setSubmitting?.(false);
      return;
    }

    skipCategoryWarningRef.current = false;
    await onSubmit(
      {
        ...formData,
        categoryFieldValues: categoryFields.filter((field) => isCategoryFieldFilled(field)),
      },
      helpers
    );
  };

  const {
    values,
    touched,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useAddTaskForm(prepareInitialValues(), handleTaskSubmit);
  // Track selected project separately to avoid hook dependency issues
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialValues?.project?._id || initialValues?.project || ""
  );

  const campaignProjectId =
    selectedProjectId && selectedProjectId !== "other"
      ? selectedProjectId
      : null;
  const { data: projectCampaignsData } = useGetCampaignsByCompany(companyId, {
    projectId: campaignProjectId || undefined,
  });
  const projectCampaigns = projectCampaignsData?.data || [];

  // Banked footage the coordinator can build this reel from (new reel tasks only)
  const bankProjectId = campaignProjectId || projectData?._id || null;
  // Banked footage is filed under the work type of the shoot that covered it
  // ("reels", or a category name such as "Reel Editing")
  const bankWorkType =
    values.taskGroup === "extraTask" ? values.extraTaskWorkType : values.taskGroup;
  const isReelTask =
    Boolean(bankWorkType) &&
    !["campaign", "extraTask", "general", "Select work type"].includes(bankWorkType);
  const { data: assetBankData } = useAssetBank(
    bankProjectId,
    { status: "available", workType: bankWorkType },
    { enabled: !isEdit && isReelTask }
  );
  const bankedReelOptions = (assetBankData?.items || []).map((item, index) => ({
    value: item._id,
    label: [
      item.topic || `Banked reel ${index + 1}`,
      item.sourceMonth ? `shot ${item.sourceMonth}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
  useEffect(() => {
    if (values.assetBankItem && !isReelTask) setFieldValue("assetBankItem", "");
  }, [isReelTask, values.assetBankItem, setFieldValue]);

  // Fields the chosen category asks for (e.g. a work link)
  const categoryFieldDefs = getFieldsForCategoryId(
    taskCategories,
    values.taskCategory,
    values.categoryFieldValues
  );
  const handleCategoryFieldChange = (key, value) => {
    setFieldValue(
      "categoryFieldValues",
      categoryFieldDefs.map((field) => (field.key === key ? { ...field, value } : field))
    );
  };

  // Picking banked footage fills the matching fields from what was saved with it
  useEffect(() => {
    if (isEdit || !values.assetBankItem || !categoryFieldDefs.length) return;
    const item = (assetBankData?.items || []).find(
      (entry) => String(entry._id) === String(values.assetBankItem)
    );
    if (!item) return;
    const saved = (item.fields || []).filter((field) => field?.value);
    const next = categoryFieldDefs.map((field) => {
      if (isCategoryFieldFilled(field)) return field;
      const match = saved.find(
        (entry) => String(entry.label).toLowerCase() === String(field.label).toLowerCase()
      );
      return match ? { ...field, value: match.value } : field;
    });
    if (next.some((field, index) => field.value !== categoryFieldDefs[index].value)) {
      setFieldValue("categoryFieldValues", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.assetBankItem, assetBankData]);

  // A different category has different fields, so start the answers over
  const prevCategoryRef = useRef(values.taskCategory);
  useEffect(() => {
    if (prevCategoryRef.current === values.taskCategory) return;
    prevCategoryRef.current = values.taskCategory;
    if (!isEdit && values.categoryFieldValues?.length) {
      setFieldValue("categoryFieldValues", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.taskCategory]);

  const prevCampaignRef = useRef(initialValues?.campaign?._id || initialValues?.campaign || "");
  const prevTaskGroupRef = useRef(initialValues?.taskGroup || "");

  // Refs to track previous "master" values for resetting manual subtask edits
  const prevMasterValues = useRef({
    taskFlow: initialValues?.taskFlow || "",
    startDate: isEdit && initialValues?.startDate
      ? new Date(initialValues.startDate).toISOString().split('T')[0]
      : "",
    dueDate: isEdit && initialValues?.dueDate
      ? new Date(initialValues.dueDate).toISOString().split('T')[0]
      : ""
  });

  // State for due date change reason modal
  const [showDateChangeReasonModal, setShowDateChangeReasonModal] =
    useState(false);
  const [pendingNewDueDate, setPendingNewDueDate] = useState(null);

  // Vacation availability state
  const availabilityMutation = useCheckAvailability();
  const [availabilityConflicts, setAvailabilityConflicts] = useState([]);

  // Trigger availability check when assignees or dates change
  useEffect(() => {
    // Only check if we have dates and assignees
    const hasMainAssignees = values.assignedTo?.length > 0;
    const hasSubtasks = values.subtasks?.length > 0;

    if (!values.startDate || !values.dueDate || (!hasMainAssignees && !hasSubtasks)) {
      setAvailabilityConflicts([]);
      return;
    }

    const checks = [];

    // 1. Add main task assignees to check list
    if (hasMainAssignees) {
      values.assignedTo.forEach((empId) => {
        checks.push({
          employeeId: empId,
          startDate: values.startDate,
          endDate: values.dueDate,
          label: "main",
        });
      });
    }

    // 2. Add subtask assignees to check list
    if (hasSubtasks) {
      values.subtasks.forEach((sub, idx) => {
        const subAssigneeId = typeof sub.assignee === "object" ? sub.assignee?._id : sub.assignee;
        if (subAssigneeId && sub.startDate && sub.dueDate) {
          checks.push({
            employeeId: subAssigneeId,
            startDate: sub.startDate,
            endDate: sub.dueDate,
            label: `subtask-${idx}`,
            taskCategory: sub.taskCategory?._id || sub.taskCategory || undefined,
          });
        }
      });
    }

    if (checks.length > 0) {
      // Use a timeout to debounce the API call slightly
      const timeoutId = setTimeout(() => {
        availabilityMutation.mutate({ checks, excludeTaskId: isEdit ? initialValues?._id : undefined }, {
          onSuccess: (data) => {
            setAvailabilityConflicts(data.conflicts || []);
          },
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAvailabilityConflicts([]);
    }
  }, [
    values.assignedTo,
    values.subtasks,
    values.startDate,
    values.dueDate,
    values.taskFlow, // Also check when flow changes as it updates subtasks
  ]);


  // Fetch project details when a project is selected
  const {
    data: selectedProjectData,
    isLoading: isLoadingProjectDetails,
    error: projectDetailsError,
  } = useProjectDetails(
    selectedProjectId && selectedProjectId !== "other"
      ? selectedProjectId
      : null,
    {
      enabled:
        !!selectedProjectId &&
        selectedProjectId !== "" &&
        selectedProjectId !== "other",
    }
  );
  // Fetch all employees when "Other" project is selected or no project is selected (for board view and tasks without projects)
  const { data: allEmployeesData, isLoading: isLoadingEmployees } =
    useGetAllEmployees(
      selectedProjectId === "other" ||
      selectedProjectId === "" ||
      selectedProjectId === null
    );

  // Project pages only load the month they are showing, so when the header
  // moves the task to another month, load the project's full work details.
  const { data: contextProjectData } = useProjectDetails(
    projectData?._id || null,
    {
      enabled:
        !isEdit &&
        !!projectData?._id &&
        !selectedProjectId &&
        !!activeMonth &&
        activeMonth !== selectedMonth,
    }
  );

  // Work details (the month's quota per work type) for the month being added to.
  const resolveMonthWorkDetails = () => {
    if (
      selectedProjectData &&
      selectedProjectId &&
      selectedProjectId !== "other"
    ) {
      return selectedProjectData.workDetails?.find(
        (wd) => wd.month === activeMonth
      );
    }
    if (!activeMonth || activeMonth === selectedMonth) {
      return monthWorkDetails || projectData?.workDetails;
    }
    const source = contextProjectData?.workDetails || projectData?.workDetails;
    return Array.isArray(source)
      ? source.find((wd) => wd.month === activeMonth)
      : null;
  };

  // Keep taskMonth on the form in step with the month picked in the header
  useEffect(() => {
    if (activeMonth) {
      setFieldValue("taskMonth", activeMonth);
    }
  }, [activeMonth, values.taskMonth, setFieldValue]);

  const handleMonthChange = (event) => {
    const next = event.target.value;
    if (!next || next === activeMonth) return;
    setActiveMonth(next);
    // Work types and their quotas belong to a month, so the earlier pick may
    // not exist (or have anything left) in the new one.
    setFieldValue("taskGroup", "");
    setFieldValue("extraTaskWorkType", "");
    setFieldValue("taskCategory", "");
  };

  // Update selectedProjectId when values.project changes
  useEffect(() => {
    setSelectedProjectId(values?.project || "");
  }, [values?.project]);

  // Reset task group when project changes (only for new tasks, not edits)
  useEffect(() => {
    if (!isEdit && values.project !== initialValues?.project) {
      setFieldValue("taskGroup", "");
      setFieldValue("extraTaskWorkType", "");
      setFieldValue("taskCategory", "");
    }
  }, [values.project, initialValues?.project, setFieldValue, isEdit]);

  // Work type pick fills the Master category used for points — no second dropdown
  useEffect(() => {
    if (isEdit) return;
    const workDetails = resolveMonthWorkDetails();

    const nextId = resolveTaskCategoryId({
      taskGroup: values.taskGroup,
      extraTaskWorkType: values.extraTaskWorkType,
      workDetails,
      categories: taskCategories,
    });
    if (String(values.taskCategory || "") !== String(nextId || "")) {
      setFieldValue("taskCategory", nextId || "");
    }
  }, [
    values.taskGroup,
    values.extraTaskWorkType,
    values.taskCategory,
    selectedProjectData,
    selectedProjectId,
    selectedMonth,
    activeMonth,
    contextProjectData,
    monthWorkDetails,
    projectData,
    taskCategories,
    isEdit,
    setFieldValue,
  ]);

  // Prefill time estimate from the selected Master category (minutes)
  useEffect(() => {
    if (isEdit) return;
    if (!values.taskGroup || values.taskGroup === "campaign") return;
    if (
      values.taskGroup === "extraTask" &&
      (!values.extraTaskWorkType ||
        values.extraTaskWorkType === "Select work type")
    ) {
      return;
    }

    const workDetails = resolveMonthWorkDetails();

    const categoryId = resolveTaskCategoryId({
      taskGroup: values.taskGroup,
      extraTaskWorkType: values.extraTaskWorkType,
      workDetails,
      categories: taskCategories,
    });
    if (!categoryId) return;

    const category = (taskCategories || []).find(
      (item) => String(item._id) === String(categoryId)
    );
    const minutes = Number(category?.time) || 0;
    if (minutes <= 0) return;

    if (String(values.timeEstimate ?? "") !== String(minutes)) {
      setFieldValue("timeEstimate", minutes);
    }
  }, [
    values.taskGroup,
    values.extraTaskWorkType,
    values.timeEstimate,
    selectedProjectData,
    selectedProjectId,
    selectedMonth,
    activeMonth,
    contextProjectData,
    monthWorkDetails,
    projectData,
    taskCategories,
    isEdit,
    setFieldValue,
  ]);

  // Handle automatic custom fields based on task group
  useEffect(() => {
    if (
      values.taskGroup === "shooting" ||
      (values.taskGroup === "extraTask" &&
        matchStandardWorkType(values.extraTaskWorkType) === "shooting")
    ) {
      const hasUrlField = values.customFields?.some(
        (field) =>
          field.label?.toLowerCase().includes("url") ||
          field.label?.toLowerCase().includes("shooting")
      );
      if (!hasUrlField) {
        setFieldValue("customFields", [
          ...(values.customFields || []),
          { label: "Shooting URL", value: "", type: "url" },
        ]);
      }
    }
  }, [values.taskGroup, values.extraTaskWorkType, setFieldValue]);

  // Handle automatic work link field based on requiresWorkLink option
  useEffect(() => {
    if (values.requiresWorkLink) {
      const hasWorkLinkField = values.customFields?.some(
        (field) =>
          field.label?.toLowerCase().includes("work link") ||
          field.label?.toLowerCase().includes("google drive") ||
          field.label?.toLowerCase().includes("link")
      );
      if (!hasWorkLinkField) {
        setFieldValue("customFields", [
          ...(values.customFields || []),
          { label: "Work Link", value: "", type: "url" },
        ]);
      }
    }
  }, [values.requiresWorkLink, setFieldValue]);

  useEffect(() => {
    if (values.campaign && values.campaign !== prevCampaignRef.current) {
      setFieldValue("requiresCampaignReport", true);
      if (!values.taskGroup || values.taskGroup === "Select task group" || values.taskGroup === "Select work type") {
        setFieldValue("taskGroup", "campaign");
      }
    }
    if (!values.campaign && prevCampaignRef.current && values.taskGroup !== "campaign") {
      setFieldValue("requiresCampaignReport", false);
    }
    prevCampaignRef.current = values.campaign;
  }, [values.campaign, values.taskGroup, setFieldValue]);

  useEffect(() => {
    if (values.taskGroup === "campaign" && prevTaskGroupRef.current !== "campaign") {
      setFieldValue("requiresCampaignReport", true);
      setFieldValue("requiresClientApproval", false);
      setFieldValue("requiresWorkLink", false);
      setFieldValue("taskFlow", "");
      setFieldValue("extraTaskWorkType", "");
    }
    prevTaskGroupRef.current = values.taskGroup;
  }, [values.taskGroup, setFieldValue]);

  // Who does each stage of the chosen flow on this project. A stage names a role
  // and the person comes from the project's team, so a flow is never turned away
  // because one particular person is not on the project.
  const flowProjectId = values.project || projectData?._id || null;
  const { data: resolvedStages = NO_STAGES, isFetching: isResolvingFlow } =
    useResolveTaskFlow(companyId, isEdit ? "" : values.taskFlow, flowProjectId);

  // Flow chosen: take its requirements and put the people it resolved to on the task
  useEffect(() => {
    if (!values.taskFlow || taskFlows.length === 0) return;
    const selectedFlow = taskFlows.find((flow) => flow._id === values.taskFlow);
    if (!selectedFlow?.flows?.length) return;

    const resolvedIds = resolvedStages
      .map((stage) => stage.assignee?._id)
      .filter(Boolean)
      .map(String);
    const mergedAssignees = Array.from(
      new Set([...(values.assignedTo || []).map(String), ...resolvedIds])
    );
    if (mergedAssignees.length !== (values.assignedTo?.length || 0)) {
      setFieldValue("assignedTo", mergedAssignees);
    }
    setFieldValue("requiresClientApproval", selectedFlow.flows.some(step => step.requiresClientApproval));
    setFieldValue("sequentialSubtasks", true);
    setFieldValue("requiresWorkLink", selectedFlow.flows.some(step => step.requiresWorkLink));
    setFieldValue(
      "requiresCampaignReport",
      selectedFlow.flows.some(
        (step) =>
          step.requiresCampaignReport ||
          String(step.taskName || "").toLowerCase() === "campaign"
      )
    );
  }, [values.taskFlow, taskFlows, resolvedStages, setFieldValue]);

  // A new flow or project starts with a clean "pick someone" warning
  useEffect(() => {
    setFlowAssigneeBlocked(false);
  }, [values.taskFlow, flowProjectId]);

  // ── Sync subtasks in Formik whenever flow or main dates change ──────────
  useEffect(() => {
    // Editing: the subtasks already exist (and the update does not recreate
    // them), so a date or flow change must not generate a second set.
    if (isEdit) {
      prevMasterValues.current = {
        taskFlow: values.taskFlow,
        startDate: values.startDate,
        dueDate: values.dueDate,
      };
      return;
    }

    // Wait for the flow's owners so the preview opens with people already filled in
    if (values.taskFlow && isResolvingFlow) return;

    const isMasterChanged =
      values.taskFlow !== prevMasterValues.current.taskFlow ||
      values.startDate !== prevMasterValues.current.startDate ||
      values.dueDate !== prevMasterValues.current.dueDate ||
      flowProjectId !== (prevMasterValues.current.projectId ?? flowProjectId);

    if (isMasterChanged) {
      if (values.taskFlow && values.startDate && values.dueDate && taskFlows.length > 0) {
        const selectedFlow = taskFlows.find(flow => flow._id === values.taskFlow);
        if (selectedFlow?.flows?.length) {
          const calculatedSteps = computeFlowDatesWithSchedule(
            values.startDate,
            values.dueDate,
            selectedFlow.flows,
            weeklyOffs,
            holidays
          );

          // Keep manual subtasks and replace/add flow-based ones
          const manualSubtasks = (values.subtasks || []).filter(s => !s.isFromFlow);
          
          const existingFlowSubtasks = (values.subtasks || []).filter((s) => s.isFromFlow);
          const flowSubtasks = calculatedSteps.map((s, idx) => {
            const matchedCategory = (Array.isArray(taskCategories) ? taskCategories : []).find(
              (category) =>
                String(category.name || "").toLowerCase() ===
                String(s.taskName || "").toLowerCase()
            );
            const previous = existingFlowSubtasks[idx];
            const keepPreviousCategory =
              previous &&
              String(previous.taskName || "").toLowerCase() ===
                String(s.taskName || "").toLowerCase() &&
              previous.taskCategory
                ? previous.taskCategory
                : "";
            return {
            taskName: s.taskName,
            taskCategory: keepPreviousCategory || matchedCategory?._id || "",
            // Resolved from the project's team; only a flow with no resolution at all
            // (the lookup failed) falls back to the person saved on the stage
            assignee:
              resolvedStages[idx]?.assignee?._id ||
              (resolvedStages.length
                ? ""
                : typeof s.assignee === 'object' && s.assignee !== null ? s.assignee._id : s.assignee) ||
              "",
            assigneeSource: resolvedStages[idx]?.source || "",
            role: selectedFlow.flows[idx].role || resolvedStages[idx]?.role || "",
            candidateIds: (resolvedStages[idx]?.candidates || []).map((user) => String(user._id)),
            startDate: s.startDate.toISOString().split('T')[0],
            dueDate: s.dueDate.toISOString().split('T')[0],
            wasAdjusted: s.wasAdjusted,
            skippedDay: s.skippedDay,
            skippedDayType: s.skippedDayType,
            weightage: s.weightage,
            requiresClientApproval: selectedFlow.flows[idx].requiresClientApproval,
            requiresWorkLink: selectedFlow.flows[idx].requiresWorkLink,
            requiresCampaignReport:
              selectedFlow.flows[idx].requiresCampaignReport ||
              String(selectedFlow.flows[idx].taskName || "").toLowerCase() === "campaign",
            isFromFlow: true
          };
          });

          setFieldValue("subtasks", [...flowSubtasks, ...manualSubtasks]);
        }
      } else if (!values.taskFlow && prevMasterValues.current.taskFlow) {
        // If we transitioned from a flow to no flow, remove only the flow subtasks
        const manualSubtasks = (values.subtasks || []).filter(s => !s.isFromFlow);
        setFieldValue("subtasks", manualSubtasks);
      }

      // Update refs to latest master values
      prevMasterValues.current = {
        taskFlow: values.taskFlow,
        startDate: values.startDate,
        dueDate: values.dueDate,
        projectId: flowProjectId,
      };
    }
  }, [isEdit, values.taskFlow, values.startDate, values.dueDate, values.taskCategory, taskFlows, taskCategories, weeklyOffs, holidays, setFieldValue, resolvedStages, isResolvingFlow, flowProjectId]);

  // Handle manual date overrides for subtasks
  const handleSubtaskDateChange = (index, field, newValue) => {
    const updated = [...(values.subtasks || [])];
    if (!updated[index]) return;

    updated[index][field] = newValue;

    // Sequential cascade: if a dueDate changes, move the START of the next task
    if (field === 'dueDate' && index < updated.length - 1 && updated[index + 1].isFromFlow) {
      updated[index + 1].startDate = newValue;
      // If the next start date is now after its due date, bump the due date too
      if (new Date(updated[index + 1].startDate) > new Date(updated[index + 1].dueDate)) {
        updated[index + 1].dueDate = newValue;
      }
    }

    setFieldValue("subtasks", updated);
  };

  const addManualSubtask = () => {
    const newSubtask = {
      taskName: "",
      taskCategory: "",
      assignee: values.assignedTo?.[0] || "",
      startDate: values.startDate || new Date().toISOString().split('T')[0],
      dueDate: values.dueDate || new Date().toISOString().split('T')[0],
      isManual: true,
      isFromFlow: false,
      requiresClientApproval: false,
      requiresWorkLink: false,
      requiresCampaignReport: false
    };
    setFieldValue("subtasks", [...(values.subtasks || []), newSubtask]);
  };

  const moveSubtask = (index, direction) => {
    const updated = [...(values.subtasks || [])];
    if (direction === 'up' && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === 'down' && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    setFieldValue("subtasks", updated);
  };

  const removeSubtask = (index) => {
    const updated = values.subtasks.filter((_, i) => i !== index);
    setFieldValue("subtasks", updated);
  };

  const handleSubtaskChange = (index, field, value) => {
    const updated = [...(values.subtasks || [])];
    updated[index][field] = value;
    if (field === "assignee") updated[index].assigneeSource = "manual";
    setFieldValue("subtasks", updated);
  };

  const handleSubtaskCategoryChange = (index, categoryId) => {
    const categories = Array.isArray(taskCategories) ? taskCategories : [];
    const category = categories.find(
      (item) => String(item._id) === String(categoryId)
    );
    const updated = [...(values.subtasks || [])];
    if (!updated[index]) return;
    updated[index].taskCategory = categoryId || "";
    if (!updated[index].isFromFlow) {
      updated[index].taskName = category?.name || "";
    }
    setFieldValue("subtasks", updated);
  };

  const getSelectedSubtaskCategoryId = (step) => {
    if (step?.taskCategory) {
      return typeof step.taskCategory === "object"
        ? step.taskCategory._id
        : step.taskCategory;
    }
    const match = (Array.isArray(taskCategories) ? taskCategories : []).find(
      (category) =>
        String(category.name || "").toLowerCase() ===
        String(step?.taskName || "").toLowerCase()
    );
    return match?._id || "";
  };

  const uncategorizedSubtasks = (values.subtasks || []).filter(
    (step) => !getSelectedSubtaskCategoryId(step)
  );
  const parentCategory = (Array.isArray(taskCategories) ? taskCategories : []).find(
    (category) => String(category._id) === String(values.taskCategory || "")
  );
  // A category set to "cover other scheduled tasks" (e.g. a shoot) adds a task picker
  const shootCategory =
    [
      parentCategory,
      ...(values.subtasks || []).map((step) =>
        (Array.isArray(taskCategories) ? taskCategories : []).find(
          (category) => String(category._id) === String(getSelectedSubtaskCategoryId(step))
        )
      ),
    ].find((category) => category?.coversWork) || (isEdit ? editShootCategory : null);
  const shootProjectId =
    selectedProjectId && selectedProjectId !== "other"
      ? selectedProjectId
      : projectData?._id || "";

  useEffect(() => {
    if (!shootCategory && values.coveredTasks?.length) {
      setFieldValue("coveredTasks", []);
    }
  }, [shootCategory, values.coveredTasks, setFieldValue]);

  const selectedFlow = taskFlows.find((flow) => flow._id === values.taskFlow);
  const flowStepsMissingCategory = (selectedFlow?.flows || []).filter((step) => {
    const name = String(step?.taskName || "").toLowerCase();
    if (!name) return true;
    return !(Array.isArray(taskCategories) ? taskCategories : []).some(
      (category) =>
        category?.isActive !== false &&
        String(category.name || "").toLowerCase() === name
    );
  });
  const showFlowCategoryBanner =
    Boolean(values.taskFlow) &&
    ((values.subtasks || []).length > 0
      ? uncategorizedSubtasks.length > 0
      : flowStepsMissingCategory.length > 0);
  const missingCategoryCount =
    (values.subtasks || []).length > 0
      ? uncategorizedSubtasks.length
      : flowStepsMissingCategory.length;

  const handleMissingCategoryGoBack = () => {
    setShowMissingCategoryModal(false);
  };

  const handleMissingCategorySaveAnyway = () => {
    skipCategoryWarningRef.current = true;
    setShowMissingCategoryModal(false);
    handleSubmit();
  };

  // Initialize form when modal opens for editing
  useEffect(() => {
    if (isOpen && isEdit && initialValues) {
      // Set project ID for editing

      setSelectedProjectId(
        initialValues.project?._id || initialValues.project || ""
      );

      // Ensure all fields are properly set
      const preparedValues = prepareInitialValues();
      Object.keys(preparedValues).forEach((key) => {
        if (preparedValues[key] !== undefined && preparedValues[key] !== null) {
          setFieldValue(key, preparedValues[key]);
        }
      });
    }
  }, [isOpen, isEdit, initialValues, setFieldValue]);

  // Get task group options from selected project's work details
  const getTaskGroupOptions = () => {
    const workDetails = resolveMonthWorkDetails();

    if (!workDetails) {
      return [
        { label: "Campaign", value: "campaign" },
        { label: "Other", value: "extraTask" },
      ];
    }

    const options = [];

    // Show all work types that have total > 0 (not just count > 0)
    // This ensures categories still appear even when quota is fully consumed
    getSelectedWorkItems(workDetails, taskCategories).forEach((item) => {
      if (Number(item.total) > 0) {
        const remaining = Number(item.count) || 0;
        options.push({
          label: remaining > 0
            ? `${item.name} (${remaining} remaining)`
            : `${item.name} (0 remaining)`,
          value: item.kind === "standard" ? item.key : item.name,
          name: item.name,
          remaining,
        });
      }
    });

    // Always add Campaign and Other — they do not consume monthly content quota
    options.push({
      label: "Campaign",
      value: "campaign",
      name: "Campaign",
    });
    options.push({
      label: "Other",
      value: "extraTask",
    });

    return options;
  };

  // Get task flow options
  const getTaskFlowOptions = () => {
    const options = [{ label: "No Task Flow", value: "" }];

    if (taskFlows && taskFlows.length > 0) {
      taskFlows.forEach((flow) => {
        if (flow.isActive) {
          options.push({
            label: flow.name,
            value: flow._id,
          });
        }
      });
    }

    return options;
  };

  const getExtraTaskWorkTypeOptions = () => {
    const seen = new Set();
    return (taskCategories || [])
      .filter((category) => category?.isActive !== false)
      .map((category) => ({
        label:
          Number(category.points) > 0
            ? `${category.name} (${category.points} pts)`
            : category.name,
        value: extraWorkTypeValueFromName(category.name),
      }))
      .filter((option) => {
        const key = String(option.value || "").toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  // Get assignee options based on selected project
  const getAssigneeOptions = () => {
    if (
      selectedProjectData &&
      selectedProjectId &&
      selectedProjectId !== "other"
    ) {
      // Use project teams if available
      return (
        selectedProjectData.teams?.map((user) => ({
          label: `${user.firstName} (${user.position})`,
          value: user._id,
        })) || []
      );
    } else if (
      !selectedProjectId &&
      projectData?._id &&
      (projectData.teams?.length > 0 || teams?.length > 0)
    ) {
      // Opened from a project page: only that project's team can be assigned
      return (
        (projectData.teams?.length > 0 ? projectData.teams : teams).map(
          (user) => ({
            label: `${user.firstName} (${user.position})`,
            value: user._id,
          })
        )
      );
    } else if (
      (selectedProjectId === "other" ||
        selectedProjectId === "" ||
        selectedProjectId === null) &&
      allEmployeesData?.employees
    ) {
      // Use all company employees when "Other" is selected or no project is selected
      return (
        allEmployeesData.employees?.map((user) => ({
          label: `${user.name} (${user.position})`,
          value: user._id,
        })) || []
      );
    } else {
      // Fallback to provided teams prop
      return (
        teams?.map((user) => ({
          label: `${user.firstName} (${user.position})`,
          value: user._id,
        })) || []
      );
    }
  };

  const taskGroupOptions = getTaskGroupOptions();

  // Picking a work type suggests it as the task name. The name stays editable:
  // it is only replaced while it is empty or still the last suggestion.
  const suggestedTitleRef = useRef("");
  const suggestedTitle = taskGroupOptions.find(
    (option) => option.value === values.taskGroup
  )?.name;
  useEffect(() => {
    if (isEdit) return;
    const suggestion = suggestedTitle;
    if (!suggestion) return;
    const current = values.title || "";
    if (!current || current === suggestedTitleRef.current) {
      setFieldValue("title", suggestion);
      suggestedTitleRef.current = suggestion;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedTitle, isEdit]);
  const taskFlowOptions = getTaskFlowOptions();

  // Flow steps with nobody on them yet: from the subtask preview once it exists,
  // otherwise from what the flow resolved to (dates not set yet)
  const flowSubtasks = (values.subtasks || []).filter((step) => step?.isFromFlow);
  const unassignedFlowSteps = !values.taskFlow || isEdit
    ? []
    : flowSubtasks.length > 0
      ? flowSubtasks.filter((step) => !(step.assignee?._id || step.assignee))
      : resolvedStages.filter((stage) => !stage.assignee);
  const extraTaskWorkTypeOptions = getExtraTaskWorkTypeOptions();

  // Check if "Other" project is selected or no project is selected
  const isOtherProjectSelected = selectedProjectId === "other";
  const isNoProjectSelected =
    selectedProjectId === "" || selectedProjectId === null;

  const isTaskGroupSelected =
    values.taskGroup &&
    values.taskGroup !== "Select task group" &&
    values.taskGroup !== "Select work type";
  const isCampaignTaskSelected = values.taskGroup === "campaign";
  // A work type with no quota left is saved as extra work (same category).
  const isOverQuotaTask =
    !isEdit &&
    taskGroupOptions.some(
      (option) => option.value === values.taskGroup && option.remaining === 0
    );
  const isExtraTaskSelected = values.taskGroup === "extraTask";
  const isExtraTaskWorkTypeSelected = isExtraTaskSelected
    ? values.extraTaskWorkType &&
    values.extraTaskWorkType !== "Select work type"
    : true;
  const isFormEnabled =
    isOtherProjectSelected ||
    isNoProjectSelected ||
    (isTaskGroupSelected && isExtraTaskWorkTypeSelected);

  // Add project select options
  const projectOptions = [
    { label: "No Project", value: null },
    ...projects.map((p) => ({ label: p.name, value: p._id })),
    { label: "Other", value: "other" },
  ];

  // Handle due date change - check if we need to ask for reason
  const handleDueDateChange = (e) => {
    const newDate = e.target.value;
    const originalDueDate = initialValues?.dueDate;

    // Normalize dates for comparison (convert to YYYY-MM-DD format)
    const normalizeDate = (date) => {
      if (!date) return "";
      // If already in YYYY-MM-DD format, return as is
      if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      // Otherwise, convert to YYYY-MM-DD
      try {
        return new Date(date).toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    const normalizedNewDate = normalizeDate(newDate);
    const normalizedOriginalDate = normalizeDate(originalDueDate);

    // If editing and there's an existing dueDate, show reason modal
    if (
      isEdit &&
      normalizedOriginalDate &&
      normalizedNewDate &&
      normalizedNewDate !== normalizedOriginalDate
    ) {
      setPendingNewDueDate(newDate);
      setShowDateChangeReasonModal(true);
    } else {
      // Directly update the date if no reason needed
      handleChange(e);
    }
  };

  // Handle reason submission
  const handleDateChangeReasonSubmit = ({ reasonType, reason, faultUser }) => {
    // Update the due date
    setFieldValue("dueDate", pendingNewDueDate);
    // Store why it moved: the type decides who (if anyone) loses points
    setFieldValue("dueDateChangeReason", reason);
    setFieldValue("dueDateReasonType", reasonType);
    setFieldValue("dueDateFaultUser", faultUser || "");

    // Reset modal state
    setShowDateChangeReasonModal(false);
    setPendingNewDueDate(null);
  };

  // Handle reason modal cancel
  const handleDateChangeReasonCancel = () => {
    setShowDateChangeReasonModal(false);
    setPendingNewDueDate(null);
  };

  if (!isOpen) return null;

  const mainConflicts = availabilityConflicts.filter((c) => c.label === "main");
  const allConflicts = availabilityConflicts;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#2155A3]/20 backdrop-blur-sm p-3 md:p-4">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-3 md:px-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Task" : "Add Task"}
            </h4>
            <p className="text-xs text-gray-500">
              Task details on the left. Subtasks and conflicts on the right.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeMonth &&
              (isEdit ? (
                <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:inline-flex">
                  {formatMonthKey(activeMonth)}
                </span>
              ) : (
                <select
                  aria-label="Task month"
                  value={activeMonth}
                  onChange={handleMonthChange}
                  disabled={isLoading}
                  className="hidden cursor-pointer rounded-full border-0 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 outline-none focus:ring-2 focus:ring-blue-200 sm:inline-flex"
                >
                  {getUpcomingMonthOptions(selectedMonth).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            <PrimaryButton
              icon="/icons/cancel.svg"
              disable={isLoading}
              className="bg-[#F4F9FD]"
              onclick={() => !isLoading && handleClose()}
            />
          </div>
        </header>

        {isLoadingProjectDetails &&
          selectedProjectId &&
          selectedProjectId !== "other" && (
            <div className="mx-5 mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 md:mx-6">
              Loading project details...
            </div>
          )}
        {projectDetailsError &&
          selectedProjectId &&
          selectedProjectId !== "other" && (
            <div className="mx-5 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 md:mx-6">
              Failed to load project details. Please try again.
            </div>
          )}
        {isOtherProjectSelected && (
          <div className="mx-5 mt-3 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800 md:mx-6">
            External project — work type and flow fields are hidden.
          </div>
        )}

        <form
          action=" "
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
            <div className="min-h-0 space-y-5 overflow-y-auto border-gray-100 px-5 py-5 md:px-6 lg:border-r">
            {showProjectSelection && (
              <Select
                errors={errors}
                touched={touched}
                name={"project"}
                selectedValue={values?.project || ""}
                value={values?.project || ""}
                onChange={handleChange}
                title="Project"
                options={projectOptions}
                defaultValue=""
                required={false}
              />
            )}
              {/* Hidden input for taskMonth */}
              <input
                type="hidden"
                name="taskMonth"
                value={activeMonth || ""}
              />

              {/* Show task group and task flow if:
                    1. Not "Other" project AND not "no project" 
                    2. OR we're in project context (showProjectSelection is false) */}
              {((!isOtherProjectSelected && !isNoProjectSelected) ||
                !showProjectSelection) && (
                  <>
                    <Select
                      errors={errors}
                      touched={touched}
                      name={"taskGroup"}
                      selectedValue={values?.taskGroup || "Select work type"}
                      value={values?.taskGroup || "Select work type"}
                      onChange={handleChange}
                      title="Work type"
                      options={
                        isLoadingProjectDetails
                          ? [{ label: "Loading...", value: "" }]
                          : taskGroupOptions
                      }
                      defaultValue="Select work type"
                      disabled={isLoadingProjectDetails}
                    />
                    {isOverQuotaTask && (
                      <p className="pl-[6px] -mt-2 text-xs font-semibold text-amber-600">
                        No quota left for this work type. This task will be
                        added as an extra task.
                      </p>
                    )}
                    {shootCategory && shootProjectId && (
                      <CoveredTasksPicker
                        projectId={shootProjectId}
                        shootTaskId={isEdit ? initialValues?._id : null}
                        workType={shootCategory.coversWorkType || "reels"}
                        value={values.coveredTasks || []}
                        onChange={(ids) => setFieldValue("coveredTasks", ids)}
                      />
                    )}
                    {isExtraTaskSelected && (
                      <div className="space-y-1.5">
                        <Select
                          errors={errors}
                          touched={touched}
                          name={"extraTaskWorkType"}
                          selectedValue={
                            values?.extraTaskWorkType || "Select work type"
                          }
                          value={values?.extraTaskWorkType || "Select work type"}
                          onChange={handleChange}
                          title="Category"
                          options={
                            isLoadingTaskCategories
                              ? [{ label: "Loading...", value: "" }]
                              : extraTaskWorkTypeOptions
                          }
                          defaultValue="Select work type"
                          disabled={isLoadingTaskCategories}
                        />
                        <p className="text-[11px] text-amber-600 px-0.5">
                          Counted as extra work for this month. Does not use the
                          project quota.
                        </p>
                      </div>
                    )}
                    {!isEdit && isReelTask && bankedReelOptions.length > 0 && (
                      <div className="space-y-1.5">
                        <Select
                          errors={errors}
                          touched={touched}
                          name={"assetBankItem"}
                          selectedValue={values?.assetBankItem || ""}
                          value={values?.assetBankItem || ""}
                          onChange={handleChange}
                          title="Use banked footage (optional)"
                          placeholder="Shoot not needed — pick banked footage"
                          options={[
                            { label: "No, new footage", value: "" },
                            ...bankedReelOptions,
                          ]}
                        />
                        <p className="text-[11px] text-gray-500 px-0.5">
                          {bankedReelOptions.length} item(s) banked from earlier
                          shoots. The footage details are added to the task and this
                          month's quota is used as normal.
                        </p>
                      </div>
                    )}
                    {categoryFieldDefs.length > 0 && (
                      <div className="space-y-2">
                        <CategoryFieldInputs
                          fields={categoryFieldDefs}
                          onChange={handleCategoryFieldChange}
                          disabled={isLoadingTaskCategories}
                        />
                      </div>
                    )}
                  </>
                )}

              {((!isOtherProjectSelected && !isNoProjectSelected) ||
                !showProjectSelection) &&
                campaignProjectId && (
                  <Select
                    errors={errors}
                    touched={touched}
                    name={"campaign"}
                    selectedValue={values?.campaign || ""}
                    value={values?.campaign || ""}
                    onChange={handleChange}
                    title={isCampaignTaskSelected ? "Campaign" : "Campaign (optional)"}
                    options={[
                      { label: "None", value: "" },
                      ...projectCampaigns.map((c) => ({
                        label: c.name,
                        value: c._id,
                      })),
                    ]}
                    defaultValue=""
                    required={false}
                    disabled={!isFormEnabled && !isOtherProjectSelected}
                  />
                )}

              <div>
                <Input
                  placeholder="Task Name"
                  title="Task Name"
                  errors={errors}
                  name={"title"}
                  onchange={handleChange}
                  touched={touched}
                  value={values}
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
              </div>

              <div>
                <Description
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"task_description"}
                  value={values}
                  title="Task Description"
                  placeholder="Add task description"
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <DatePicker
                          errors={errors}
                          value={values.startDate}
                          onChange={handleChange}
                          name={"startDate"}
                          title="Start date"
                          touched={touched}
                          disabled={!isFormEnabled && !isOtherProjectSelected}
                        />
                        {values.startDate && (isWeeklyOff(new Date(values.startDate), weeklyOffs) || isHoliday(new Date(values.startDate), holidays)) && (
                          <div className="flex items-center gap-1.5 mt-1 px-1">
                            <FiAlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="text-[11px] text-amber-600 font-medium whitespace-nowrap">
                              {isHoliday(new Date(values.startDate), holidays)
                                ? `Holiday: ${holidays.find(h => new Date(h.date).toDateString() === new Date(values.startDate).toDateString())?.name}`
                                : "Weekly-off day"} — task can still start here
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <DatePicker
                          title="Due date"
                          errors={errors}
                          value={values.dueDate}
                          onChange={handleDueDateChange}
                          touched={touched}
                          name={"dueDate"}
                          disabled={!isFormEnabled && !isOtherProjectSelected}
                        />
                        {values.dueDate && (isWeeklyOff(new Date(values.dueDate), weeklyOffs) || isHoliday(new Date(values.dueDate), holidays)) && (
                          <div className="flex items-center gap-1.5 mt-1 px-1">
                            <FiAlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="text-[11px] text-amber-600 font-medium whitespace-nowrap">
                              {isHoliday(new Date(values.dueDate), holidays)
                                ? `Holiday: ${holidays.find(h => new Date(h.date).toDateString() === new Date(values.dueDate).toDateString())?.name}`
                                : "Weekly-off day"} — subtasks will be adjusted
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <Input
                          title="Time Estimate (mins)"
                          placeholder="e.g. 120"
                          errors={errors}
                          name="timeEstimate"
                          type="number"
                          onchange={handleChange}
                          touched={touched}
                          value={values}
                          disabled={!isFormEnabled && !isOtherProjectSelected}
                        />
                      </div>
              </div>

              {((!isOtherProjectSelected && !isNoProjectSelected) ||
                !showProjectSelection) &&
                !isCampaignTaskSelected && (
                  <>
                    <Select
                      errors={errors}
                      touched={touched}
                      name={"taskFlow"}
                      selectedValue={values?.taskFlow || ""}
                      value={values?.taskFlow || ""}
                      onChange={handleChange}
                      title="Task Flow (Optional)"
                      options={taskFlowOptions}
                      defaultValue=""
                      disabled={!isFormEnabled}
                    />
                    {unassignedFlowSteps.length > 0 && (
                      <div
                        className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 ${
                          flowAssigneeBlocked
                            ? "border-red-200 bg-red-50"
                            : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <FiAlertTriangle
                          className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                            flowAssigneeBlocked ? "text-red-500" : "text-amber-500"
                          }`}
                        />
                        <div className={`text-xs ${flowAssigneeBlocked ? "text-red-800" : "text-amber-800"}`}>
                          <p className="font-semibold">
                            {flowAssigneeBlocked
                              ? "Choose someone for these steps before saving:"
                              : "Nobody on this project's team fits these steps:"}
                          </p>
                          <ul className="mt-0.5 list-disc pl-4">
                            {unassignedFlowSteps.map((step, i) => (
                              <li key={i}>
                                {step.taskName}
                                {step.role ? ` (needs a ${step.role})` : ""}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-1">
                            Pick someone for each on the right, or add a {unassignedFlowSteps.find((step) => step.role)?.role || "matching"} to the project team.
                          </p>
                        </div>
                      </div>
                    )}
                    {values.taskFlow && (!values.startDate || !values.dueDate) && (
                      <div className="bg-blue-50 px-3 py-2.5 text-xs text-blue-500 italic flex items-center gap-1.5 border border-blue-200 rounded-xl">
                        <FiClock className="w-3 h-3" />
                        Set parent Start &amp; Due dates to preview the flow schedule.
                      </div>
                    )}
                    {showFlowCategoryBanner && (
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <FiAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                        <div className="text-xs text-amber-800">
                          <p className="font-semibold">
                            {missingCategoryCount} flow step{missingCategoryCount === 1 ? "" : "s"} {missingCategoryCount === 1 ? "has" : "have"} no category.
                          </p>
                          <p className="mt-0.5">
                            Those steps will not earn category points. Choose a category on each subtask on the right so the assignee is credited.
                          </p>
                          {(!values.subtasks || values.subtasks.length === 0) &&
                            flowStepsMissingCategory.some((step) => step.taskName) && (
                              <p className="mt-1 font-medium">
                                {flowStepsMissingCategory
                                  .map((step) => step.taskName)
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </>
                )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MultiSelect
                title="Assignees"
                errors={errors}
                onChange={handleChange}
                touched={touched}
                name={"assignedTo"}
                value={values?.assignedTo || []}
                options={getAssigneeOptions()}
                placeholder={
                  (isOtherProjectSelected || isNoProjectSelected) &&
                    isLoadingEmployees
                    ? "Loading employees..."
                    : "Select Assignees"
                }
                disabled={
                  (!isFormEnabled &&
                    !isOtherProjectSelected &&
                    !isNoProjectSelected) ||
                  ((isOtherProjectSelected || isNoProjectSelected) &&
                    isLoadingEmployees)
                }
              />
              <Select
                errors={errors}
                name={"priority"}
                touched={touched}
                value={values?.priority || "Low"}
                onChange={handleChange}
                title="Priority"
                options={["Low", "Medium", "High"]}
                disabled={!isFormEnabled && !isOtherProjectSelected}
              />
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FiCheck className="h-4 w-4 text-blue-600" />
                  <h5 className="text-sm font-semibold text-gray-800">Requirements</h5>
                </div>
                <div className="space-y-2">
                  {!isCampaignTaskSelected && (
                    <>
                    <label htmlFor="requiresClientApproval" className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                      <input
                        type="checkbox"
                        id="requiresClientApproval"
                        name="requiresClientApproval"
                        checked={values.requiresClientApproval}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        disabled={!isFormEnabled && !isOtherProjectSelected}
                      />
                      <span className="text-sm font-medium text-gray-700">Client approval</span>
                    </label>
                    <label htmlFor="sequentialSubtasks" className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                      <input
                        type="checkbox"
                        id="sequentialSubtasks"
                        name="sequentialSubtasks"
                        checked={Boolean(values.sequentialSubtasks)}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        disabled={!isFormEnabled && !isOtherProjectSelected}
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Run subtasks in order</span>
                        <p className="text-[11px] text-gray-400 font-medium">
                          Next step stays locked until the previous one is finished, including client approval.
                        </p>
                      </div>
                    </label>
                    </>
                  )}
                  {!isCampaignTaskSelected && (
                    <label htmlFor="requiresWorkLink" className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                      <input
                        type="checkbox"
                        id="requiresWorkLink"
                        name="requiresWorkLink"
                        checked={values.requiresWorkLink}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600"
                        disabled={!isFormEnabled && !isOtherProjectSelected}
                      />
                      <span className="text-sm font-medium text-gray-700">Work link</span>
                    </label>
                  )}
                  <label htmlFor="requiresCampaignReport" className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                    <input
                      type="checkbox"
                      id="requiresCampaignReport"
                      name="requiresCampaignReport"
                      checked={values.requiresCampaignReport}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                      disabled={!isFormEnabled && !isOtherProjectSelected}
                    />
                    <span className="text-sm font-medium text-gray-700">Campaign report</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flexBetween mb-3">
                  <h5 className="text-sm font-medium text-gray-700">
                    Additional Fields (e.g. Shooting URL)
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      const newFields = [...(values.customFields || []), { label: "", value: "", type: "text" }];
                      setFieldValue("customFields", newFields);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-all"
                  >
                    <FiPlus className="w-3 h-3" /> Add Field
                  </button>
                </div>

                {values.customFields && values.customFields.length > 0 ? (
                  <div className="space-y-3">
                    {values.customFields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Field Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Shooting URL"
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...values.customFields];
                              newFields[index].label = e.target.value;
                              setFieldValue("customFields", newFields);
                            }}
                            className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 ${errors.customFields && errors.customFields[index]?.label ? 'border-red-400' : 'border-gray-200'}`}
                          />
                          {errors.customFields && errors.customFields[index]?.label && (
                            <span className="text-[10px] text-red-500 mt-1 block">{errors.customFields[index].label}</span>
                          )}
                        </div>
                        <div className="flex-[2]">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Field Value</label>
                          <input
                            type={field.type || "text"}
                            placeholder="Enter value..."
                            value={field.value}
                            onChange={(e) => {
                              const newFields = [...values.customFields];
                              newFields[index].value = e.target.value;
                              setFieldValue("customFields", newFields);
                            }}
                            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newFields = values.customFields.filter((_, i) => i !== index);
                            setFieldValue("customFields", newFields);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove field"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">No additional fields added.</p>
                )}
              </div>

              <div>
                <Description
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"copyOfDescription"}
                  value={values?.copyOfDescription || ""}
                  title="Content for Description"
                  placeholder="Add copy of description"
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
              </div>
              <div>
                <Description
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"description"}
                  value={values?.description || ""}
                  title="Description for publishing"
                  placeholder="Add some description of the task"
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
              </div>

              <FileAndLinkUpload
                  fileClassName={"grid grid-cols-3 gap-3"}
                  initialFiles={
                    values?.attachments?.filter(
                      (file) => file.type !== "link"
                    ) || []
                  }
                  initialLinks={
                    values?.attachments?.filter(
                      (file) => file.type === "link"
                    ) || []
                  }
                  onChange={(files) => setFieldValue("attachments", files)}
                  disable={!isFormEnabled && !isOtherProjectSelected}
                />

            </div>

            <div className="min-h-0 space-y-5 overflow-y-auto bg-[#F7F9FC] px-5 py-5 md:px-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Subtasks</h5>
                    <p className="text-xs text-gray-500">
                      {values.taskFlow
                        ? taskFlows.find((f) => f._id === values.taskFlow)?.name || "Task flow"
                        : "Checklist of work to create with this task"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addManualSubtask}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700"
                  >
                    <FiPlus className="h-3 w-3" /> Add step
                  </button>
                </div>

                {(values.subtasks && values.subtasks.length > 0) || values.taskFlow ? (
                  <div className="space-y-3">
                    {values.subtasks?.map((step, index) => {
                      const assigneeOptions = getAssigneeOptions();
                      const currentAssigneeId = typeof step.assignee === "object" ? step.assignee?._id : step.assignee;
                      const stepConflicts = availabilityConflicts.filter((c) => c.label === `subtask-${index}`);

                      return (
                        <div
                          key={index}
                          className={`rounded-2xl border bg-white p-3 shadow-sm ${
                            getSelectedSubtaskCategoryId(step)
                              ? "border-gray-100"
                              : "border-amber-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[11px] font-bold text-blue-600">
                              {index + 1}
                            </span>
                            {step.isFromFlow ? (
                              <input
                                type="text"
                                value={step.taskName}
                                onChange={(e) => handleSubtaskChange(index, "taskName", e.target.value)}
                                placeholder="Subtask name..."
                                className="min-w-0 flex-1 border-b border-transparent bg-transparent py-0.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-300"
                              />
                            ) : (
                              <span className="min-w-0 flex-1 text-sm font-semibold text-gray-800">
                                {step.taskName || "New subtask"}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveSubtask(index, 'up')}
                                className="p-1 text-gray-300 transition-all hover:text-blue-500 disabled:opacity-30"
                                title="Move up"
                              >
                                <FiArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={index === values.subtasks.length - 1}
                                onClick={() => moveSubtask(index, 'down')}
                                className="p-1 text-gray-300 transition-all hover:text-blue-500 disabled:opacity-30"
                                title="Move down"
                              >
                                <FiArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSubtask(index)}
                                className="p-1 text-gray-300 transition-all hover:text-red-500 ml-1"
                                title="Remove subtask"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3">
                            <CategoryPicker
                              categories={taskCategories}
                              value={getSelectedSubtaskCategoryId(step)}
                              onChange={(categoryId) => handleSubtaskCategoryChange(index, categoryId)}
                              disabled={isLoadingTaskCategories}
                              compact
                              placeholder={isLoadingTaskCategories ? "Loading..." : "Select category..."}
                              emptyLabel="No category — will not earn points"
                            />
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <select
                              value={currentAssigneeId || ""}
                              onChange={(e) => handleSubtaskChange(index, "assignee", e.target.value)}
                              className={`rounded-lg border bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-700 outline-none ${
                                step.isFromFlow && !currentAssigneeId
                                  ? flowAssigneeBlocked ? "border-red-300" : "border-amber-300"
                                  : "border-gray-200"
                              }`}
                            >
                              <option value="">Assign to...</option>
                              {(() => {
                                const candidates = new Set((step.candidateIds || []).map(String));
                                const preferred = assigneeOptions.filter((opt) => candidates.has(String(opt.value)));
                                if (preferred.length === 0) {
                                  return assigneeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ));
                                }
                                return (
                                  <>
                                    <optgroup label={step.role ? `${step.role} on this project` : "Suggested"}>
                                      {preferred.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Everyone else">
                                      {assigneeOptions
                                        .filter((opt) => !candidates.has(String(opt.value)))
                                        .map((opt) => (
                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </optgroup>
                                  </>
                                );
                              })()}
                            </select>
                            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">
                              <input
                                type="date"
                                value={step.startDate}
                                onChange={(e) => handleSubtaskDateChange(index, "startDate", e.target.value)}
                                className="w-full bg-transparent text-xs text-gray-600 outline-none"
                              />
                              <span className="text-gray-300">–</span>
                              <input
                                type="date"
                                value={step.dueDate}
                                onChange={(e) => handleSubtaskDateChange(index, "dueDate", e.target.value)}
                                className="w-full bg-transparent text-xs text-gray-600 outline-none"
                              />
                            </div>
                          </div>

                          {step.isFromFlow && (
                            <p
                              className={`mt-1.5 text-[11px] ${
                                currentAssigneeId ? "text-gray-400" : flowAssigneeBlocked ? "font-semibold text-red-600" : "text-amber-600"
                              }`}
                            >
                              {!currentAssigneeId
                                ? `No ${step.role || "matching person"} on this project's team. Choose someone.`
                                : step.assigneeSource === "manual"
                                  ? "Chosen by you"
                                  : step.assigneeSource === "pinned"
                                    ? "Preferred person for this step"
                                    : step.assigneeSource === "role"
                                      ? `Auto-assigned: least busy ${step.role || "team member"}`
                                      : ""}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <label className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                              <input
                                type="checkbox"
                                checked={step.requiresClientApproval}
                                onChange={(e) => handleSubtaskChange(index, "requiresClientApproval", e.target.checked)}
                                className="h-3.5 w-3.5 rounded text-blue-600"
                              />
                              Approval
                            </label>
                            <label className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                              <input
                                type="checkbox"
                                checked={step.requiresWorkLink}
                                onChange={(e) => handleSubtaskChange(index, "requiresWorkLink", e.target.checked)}
                                className="h-3.5 w-3.5 rounded text-purple-600"
                              />
                              Link
                            </label>
                            <label className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                              <input
                                type="checkbox"
                                checked={step.requiresCampaignReport}
                                onChange={(e) => handleSubtaskChange(index, "requiresCampaignReport", e.target.checked)}
                                className="h-3.5 w-3.5 rounded text-indigo-600"
                              />
                              Report
                            </label>
                          </div>

                          {step.wasAdjusted && (
                            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                              <FiAlertTriangle className="h-3 w-3" />
                              Shifted from {step.skippedDayType?.toLowerCase()} ({step.skippedDay})
                            </div>
                          )}

                          {!getSelectedSubtaskCategoryId(step) && (
                            <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-2">
                              <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                              <p className="text-[11px] leading-snug text-amber-800">
                                No category on this subtask, so it will not earn category points.
                                {parentCategory
                                  ? ` If you save anyway, the task work type (${parentCategory.name}, ${parentCategory.points} pts) is used as a fallback.`
                                  : " Completing it will not credit category points."}
                              </p>
                            </div>
                          )}

                          {stepConflicts.length > 0 && (
                            <div className="mt-3">
                              <ConflictDetails conflicts={stepConflicts} weeklyOffs={weeklyOffs} holidays={holidays} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <p className="text-center text-[11px] text-gray-400">
                      {values.subtasks.length} subtask{values.subtasks.length === 1 ? "" : "s"} will be created with this task
                    </p>
                    {uncategorizedSubtasks.length > 0 && (
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                        <FiAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                        <p className="text-xs text-amber-800">
                          {uncategorizedSubtasks.length} subtask{uncategorizedSubtasks.length === 1 ? " has" : "s have"} no category and will not earn category points.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={addManualSubtask}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 py-8 text-blue-500 hover:bg-blue-50"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span className="text-sm font-semibold">Add the first subtask</span>
                  </button>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Schedule & conflicts</h5>
                    <p className="text-xs text-gray-500">Who is busy, and on which dates.</p>
                  </div>
                  {allConflicts.length > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      {allConflicts.length} issue{allConflicts.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <ConflictDetails
                  conflicts={mainConflicts}
                  weeklyOffs={weeklyOffs}
                  holidays={holidays}
                  emptyText="No assignee conflicts on the main dates."
                />
              </div>
            </div>
          </div>

          <footer className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3 md:px-6">
            <div className="text-xs text-gray-500">
              {uncategorizedSubtasks.length > 0
                ? `${uncategorizedSubtasks.length} subtask${uncategorizedSubtasks.length === 1 ? "" : "s"} missing a category — they will not earn category points.`
                : Object.keys(errors).length > 0 && Object.keys(touched).length > 0
                ? `Please fix: ${Object.keys(errors).join(", ")}`
                : "Review conflicts before saving."}
            </div>
            <PrimaryButton
              type="submit"
              title="Save Task"
              loading={isLoading || availabilityMutation.isPending}
              disable={(!isFormEnabled && !isOtherProjectSelected) || isLoading || availabilityMutation.isPending}
            />
          </footer>
        </form>
      </div>

      {/* Due Date Change Reason Modal */}
      <DateChangeReasonModal
        isOpen={showDateChangeReasonModal}
        onClose={handleDateChangeReasonCancel}
        onConfirm={handleDateChangeReasonSubmit}
        oldDate={initialValues?.dueDate}
        newDate={pendingNewDueDate}
        canWaivePenalty={canWaiveReschedulePenalty(
          user,
          initialValues?.project || selectedProjectData
        )}
        teams={
          (Array.isArray(teams) && teams.length > 0 && teams) ||
          selectedProjectData?.teams ||
          allEmployeesData?.employees ||
          []
        }
        assigneeIds={initialValues?.assignedTo || []}
        itemLabel="task"
      />

      {/* Missing category points warning */}
      <Modal
        isOpen={showMissingCategoryModal}
        onClose={handleMissingCategoryGoBack}
        title="Some steps have no category"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {(values.subtasks || []).length === 0 && !values.taskCategory
              ? "This task has no work type and no categorized subtasks, so completing it will not credit category points."
              : "These subtasks have no category, so they will not earn category points when completed."}
          </p>
          {uncategorizedSubtasks.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
                No category
              </p>
              <ul className="space-y-1.5">
                {uncategorizedSubtasks.map((step, idx) => (
                  <li key={`${step.taskName || "step"}-${idx}`} className="text-sm text-amber-900">
                    {step.taskName || `Subtask ${idx + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {parentCategory ? (
            <p className="text-xs text-gray-500">
              If you save anyway, the task work type ({parentCategory.name}, {parentCategory.points} pts) will be used as a fallback.
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Assign a category on each subtask if you want those points credited. You can still save without one.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleMissingCategoryGoBack}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={handleMissingCategorySaveAnyway}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Save anyway
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddTask;
