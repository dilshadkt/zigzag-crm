import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiCalendar, FiFolder } from "react-icons/fi";
import { useSubmitPendingReason } from "../../api/hooks";
import { submitSubTaskPendingReason, updateSubTaskById } from "../../api/service";

const DAY_MS = 86400000;
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const dayDiff = (dateString) =>
  Math.round((startOfDay(new Date(dateString)) - startOfDay(new Date())) / DAY_MS);
const shortDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const PRIORITY_BAR = { high: "bg-red-400", medium: "bg-amber-400", low: "bg-emerald-400" };

const COLUMNS = [
  { key: "overdue", title: "Overdue", hint: "reason needed", dot: "bg-red-500", tint: "bg-red-50/60" },
  { key: "today", title: "Due today", hint: "finish today", dot: "bg-blue-500", tint: "bg-blue-50/60" },
  { key: "inProgress", title: "In progress", hint: "due later", dot: "bg-sky-400", tint: "bg-sky-50/60" },
  { key: "upcoming", title: "Upcoming 7 days", hint: "not started", dot: "bg-gray-400", tint: "bg-gray-100/70" },
];

const errorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

const BoardCard = ({ item, column, selected, onToggle }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);

  const { mutate: saveReason, isPending: isSaving } = useSubmitPendingReason(item._id);
  const { mutate: startTask, isPending: isStarting } = useMutation({
    mutationFn: () => updateSubTaskById(item._id, { status: "in-progress" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employeeSubTasksToday"] }),
    onError: (err) => setError(errorMessage(err)),
  });

  const open = () => {
    const projectId = item.project?._id || item.project;
    const parentId = item.parentTask?._id || item.parentTask;
    if (!parentId) return navigate(`/tasks/${item._id}`);
    navigate(
      projectId
        ? `/projects/${projectId}/${parentId}?subTaskId=${item._id}`
        : `/tasks/${parentId}?subTaskId=${item._id}`
    );
  };

  const due = item.dueDate ? dayDiff(item.dueDate) : null;
  let dueLabel = "No due date";
  let dueTone = "bg-gray-50 text-gray-500";
  if (due !== null) {
    if (due < 0) {
      dueLabel = `${-due}d late · ${shortDate(item.dueDate)}`;
      dueTone = "bg-red-50 text-red-600";
    } else if (due === 0) {
      dueLabel = "Today";
      dueTone = "bg-amber-50 text-amber-700";
    } else if (due === 1) {
      dueLabel = "Tomorrow";
      dueTone = "bg-blue-50 text-blue-600";
    } else {
      dueLabel = shortDate(item.dueDate);
      dueTone = "bg-gray-50 text-gray-600";
    }
  }

  let dayProgress = null;
  if (column === "inProgress" && item.startDate && item.dueDate) {
    const total = Math.round((startOfDay(new Date(item.dueDate)) - startOfDay(new Date(item.startDate))) / DAY_MS) + 1;
    const current = Math.round((startOfDay(new Date()) - startOfDay(new Date(item.startDate))) / DAY_MS) + 1;
    if (total >= 2 && current >= 1) dayProgress = { current: Math.min(current, total), total };
  }

  const canStart = (column === "today" || column === "upcoming") && item.status !== "in-progress";
  const projectName = item.project?.displayName || item.project?.name;

  const submitReason = () => {
    if (!reason.trim()) return;
    setError(null);
    saveReason(reason.trim(), { onError: (err) => setError(errorMessage(err)) });
  };

  return (
    <div className={`shrink-0 overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${selected ? "border-blue-400 ring-1 ring-blue-300" : "border-gray-100"}`}>
      <div className="flex">
        <span className={`w-1 shrink-0 ${PRIORITY_BAR[item.priority?.toLowerCase()] || "bg-gray-300"}`} />
        <div className="min-w-0 flex-1 px-3 py-2">
          <div className="flex items-start gap-2">
            {column === "overdue" && (
              <input
                type="checkbox"
                checked={!!selected}
                onChange={onToggle}
                aria-label={`Select ${item.title}`}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600"
              />
            )}
            <button
              type="button"
              onClick={open}
              className="block min-w-0 max-w-full truncate text-left text-[13px] font-semibold text-gray-800 hover:text-[#3F8CFF]"
              title={item.title}
            >
              {item.title}
            </button>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${dueTone}`}>
              <FiCalendar className="h-3 w-3" />
              {dueLabel}
            </span>
            {dayProgress && (
              <span className="font-medium text-gray-500">
                Day {dayProgress.current} of {dayProgress.total} ·{" "}
                <span className={due <= 1 ? "text-amber-600" : ""}>
                  {due} day{due === 1 ? "" : "s"} left
                </span>
              </span>
            )}
            {projectName && (
              <span className="inline-flex min-w-0 items-center gap-1 font-medium text-[#3F8CFF]">
                <FiFolder className="h-3 w-3 shrink-0" />
                <span className="truncate">{projectName}</span>
              </span>
            )}
          </div>

          {dayProgress && (
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${due <= 1 ? "bg-amber-400" : "bg-[#3F8CFF]/60"}`}
                style={{ width: `${(dayProgress.current / dayProgress.total) * 100}%` }}
              />
            </div>
          )}

          {column === "overdue" && !reasonOpen && (
            <button
              type="button"
              onClick={() => setReasonOpen(true)}
              className="mt-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
            >
              Add reason
            </button>
          )}

          {column === "overdue" && reasonOpen && (
            <div className="mt-2">
              <textarea
                autoFocus
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this still pending?"
                className="w-full resize-none rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
              />
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={submitReason}
                  disabled={isSaving || !reason.trim()}
                  className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Save reason"}
                </button>
                <button
                  type="button"
                  onClick={() => setReasonOpen(false)}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {canStart && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                startTask();
              }}
              disabled={isStarting}
              className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-50"
            >
              {isStarting ? "Starting…" : "Start"}
            </button>
          )}

          {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

BoardCard.propTypes = {
  item: PropTypes.object.isRequired,
  column: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onToggle: PropTypes.func,
};

// Select several overdue tasks and give them one reason in a single save
const BulkReasonBar = ({ selectedIds, onClear }) => {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    if (!reason.trim() || isSaving) return;
    setIsSaving(true);
    setError(null);
    const results = await Promise.allSettled(
      selectedIds.map((id) => submitSubTaskPendingReason(id, reason.trim()))
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    await queryClient.invalidateQueries({ queryKey: ["employeeSubTasksToday"] });
    setIsSaving(false);
    if (failed) {
      setError(`${failed} of ${selectedIds.length} could not be saved. Try again.`);
    } else {
      setReason("");
      onClear();
    }
  };

  return (
    <div className="mb-2 shrink-0 rounded-xl border border-blue-200 bg-white p-2 shadow-sm">
      <p className="mb-1 text-[11px] font-semibold text-blue-700">
        Give one reason to {selectedIds.length} selected task{selectedIds.length === 1 ? "" : "s"}
      </p>
      <textarea
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why are these still pending?"
        className="w-full resize-none rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
      />
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={isSaving || !reason.trim()}
          className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save for all"}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={isSaving}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

BulkReasonBar.propTypes = {
  selectedIds: PropTypes.array.isRequired,
  onClear: PropTypes.func.isRequired,
};

// items: { overdue, today, inProgress, upcoming } — already filtered by the page
const MyWorkBoard = ({ items }) => {
  const [selected, setSelected] = useState(() => new Set());
  // Only keep ids that are still overdue (a saved reason removes the card)
  const overdueIds = (items.overdue || []).map((item) => item._id);
  const selectedIds = overdueIds.filter((id) => selected.has(id));
  const allSelected = overdueIds.length > 0 && selectedIds.length === overdueIds.length;

  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
  <div className="grid h-full min-h-[320px] grid-cols-1 grid-rows-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-4">
    {COLUMNS.map((column) => {
      const cards = items[column.key] || [];
      return (
        <section
          key={column.key}
          className={`flex h-full min-h-0 min-w-0 flex-col rounded-2xl border border-gray-100 p-2.5 ${column.tint}`}
        >
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className={`h-2 w-2 rounded-full ${column.dot}`} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">{column.title}</h3>
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
              {cards.length}
            </span>
            {column.key === "overdue" && cards.length > 0 ? (
              <label className="ml-auto flex cursor-pointer items-center gap-1 text-[10px] font-medium text-gray-500">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(overdueIds))}
                  className="h-3 w-3 rounded border-gray-300 text-blue-600"
                />
                Select all
              </label>
            ) : (
              <span className="ml-auto text-[10px] text-gray-400">{column.hint}</span>
            )}
          </div>
          {column.key === "overdue" && selectedIds.length > 0 && (
            <BulkReasonBar selectedIds={selectedIds} onClear={() => setSelected(new Set())} />
          )}
          <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {cards.length === 0 ? (
              <p className="rounded-xl border-2 border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400">
                Nothing here
              </p>
            ) : (
              cards.map((item) => (
                <BoardCard
                  key={item._id}
                  item={item}
                  column={column.key}
                  selected={selected.has(item._id)}
                  onToggle={() => toggle(item._id)}
                />
              ))
            )}
          </div>
        </section>
      );
    })}
  </div>
  );
};

MyWorkBoard.propTypes = {
  items: PropTypes.object.isRequired,
};

export default MyWorkBoard;
