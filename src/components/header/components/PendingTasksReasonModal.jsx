import React, { useEffect, useMemo, useState } from "react";
import { MdCheck, MdClose, MdOpenInNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSubmitPendingReason } from "../../../api/hooks";

const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  "on-review": "On Review",
  "re-work": "Rework",
  approved: "Approved",
  "client-approved": "Client Approved",
  completed: "Completed",
};

const formatDate = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getParentTitle = (task) =>
  task?.parentTask?.title || task?.parentTaskName || "Untitled task";

const getProjectName = (task) =>
  task?.project?.displayName || task?.project?.name || "No project";

const getTaskHref = (task) => {
  const projectId = task?.project?._id || task?.project;
  const parentTaskId = task?.parentTask?._id || task?.parentTask;
  if (projectId && parentTaskId) return `/projects/${projectId}/${parentTaskId}`;
  if (parentTaskId) return `/tasks/${parentTaskId}`;
  return `/tasks/${task?._id}`;
};

const PendingTasksReasonModal = ({
  isOpen,
  onClose,
  onGlobalClose,
  tasks = [],
}) => {
  const [selectedId, setSelectedId] = useState(null);

  const remainingCount = useMemo(
    () => tasks.filter((task) => !task.hasPendingReasonToday).length,
    [tasks]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      return;
    }

    setSelectedId((current) => {
      if (current && tasks.some((task) => task._id === current)) return current;
      const firstUnsaved = tasks.find((task) => !task.hasPendingReasonToday);
      return firstUnsaved?._id || tasks[0]?._id || null;
    });
  }, [isOpen, tasks]);

  if (!isOpen) return null;

  const selectedTask =
    tasks.find((task) => task._id === selectedId) || tasks[0] || null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="flex h-[min(640px,90vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
        <aside className="flex max-h-48 shrink-0 flex-col border-b border-gray-100 bg-slate-50 md:max-h-none md:w-[320px] md:border-b-0 md:border-r">
          <div className="border-b border-gray-100 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              End of shift
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              Pending tasks
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {remainingCount} of {tasks.length} still need a reason
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {tasks.length === 0 ? (
              <div className="rounded-xl bg-white px-4 py-8 text-center text-sm text-slate-500">
                No pending tasks
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const isSelected = task._id === selectedTask?._id;
                  const isSaved = Boolean(task.hasPendingReasonToday);

                  return (
                    <button
                      key={task._id}
                      type="button"
                      onClick={() => setSelectedId(task._id)}
                      className={`w-full rounded-xl border px-3.5 py-3 text-left transition-colors ${
                        isSelected
                          ? "border-blue-200 bg-white shadow-sm"
                          : "border-transparent bg-transparent hover:bg-white/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-semibold leading-5 ${
                            isSelected ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {task.title || "Untitled subtask"}
                        </p>
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isSaved
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {isSaved ? "Saved" : "Required"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {getParentTitle(task)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Task details
              </h3>
              <p className="text-sm text-slate-500">
                Review the work and explain why it is still pending today.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <MdClose size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {selectedTask ? (
              <TaskDetailsPanel
                key={selectedTask._id}
                task={selectedTask}
                onClose={onClose}
                onGlobalClose={onGlobalClose}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Select a task to view details
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-slate-50/80 px-6 py-4">
            <p className="text-sm text-slate-500">
              {remainingCount === 0
                ? "All pending tasks have a reason."
                : `${remainingCount} reason${remainingCount === 1 ? "" : "s"} still required`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              {remainingCount === 0 ? "Done" : "Close"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-800">{value || "—"}</p>
  </div>
);

const TaskDetailsPanel = ({ task, onClose, onGlobalClose }) => {
  const navigate = useNavigate();
  const [reason, setReason] = useState(task.pendingReasonToday || "");
  const [isSaved, setIsSaved] = useState(Boolean(task.hasPendingReasonToday));
  const { mutate: submitReason, isPending: isSubmitting } =
    useSubmitPendingReason(task._id);

  const assignees = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
    ? [task.assignedTo]
    : [];

  const handleSave = () => {
    if (!reason.trim()) return;
    submitReason(reason.trim(), {
      onSuccess: () => setIsSaved(true),
    });
  };

  const handleOpenTask = () => {
    if (onGlobalClose) onGlobalClose();
    onClose();
    navigate(getTaskHref(task));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            {getProjectName(task)}
          </p>
          <h4 className="mt-1 text-xl font-semibold text-slate-900">
            {task.title || "Untitled subtask"}
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            Parent task: {getParentTitle(task)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenTask}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-600"
        >
          Open task
          <MdOpenInNew size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 md:grid-cols-4">
        <DetailItem
          label="Status"
          value={STATUS_LABELS[task.status] || task.status}
        />
        <DetailItem label="Priority" value={task.priority || "—"} />
        <DetailItem label="Due date" value={formatDate(task.dueDate)} />
        <DetailItem
          label="Assignees"
          value={
            assignees.length
              ? assignees
                  .map((person) =>
                    [person.firstName, person.lastName].filter(Boolean).join(" ")
                  )
                  .filter(Boolean)
                  .join(", ")
              : "Unassigned"
          }
        />
      </div>

      {task.description ? (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Description
          </p>
          <p className="mt-1 line-clamp-4 text-sm leading-6 text-slate-600">
            {task.description.replace(/<[^>]*>/g, "")}
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="pending-reason"
            className="text-sm font-semibold text-slate-800"
          >
            Reason for pending
          </label>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              isSaved
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {isSaved ? "Saved" : "Required"}
          </span>
        </div>
        <textarea
          id="pending-reason"
          rows={4}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Explain why this work is still pending today..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              isSubmitting ||
              !reason.trim() ||
              (isSaved && reason.trim() === (task.pendingReasonToday || ""))
            }
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isSaved ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isSaved ? (
              <>
                <MdCheck size={16} />
                Saved
              </>
            ) : (
              "Save reason"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingTasksReasonModal;
