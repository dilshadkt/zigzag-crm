import React from "react";
import { useShootCandidates } from "../../../api/hooks";

const dueLabel = (task) => {
  const date = task?.dueDate ? new Date(task.dueDate) : null;
  if (!date || Number.isNaN(date.getTime())) return task?.taskMonth || "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const assigneeLabel = (task) =>
  (task.assignedTo || [])
    .map((user) => user?.firstName)
    .filter(Boolean)
    .join(", ");

/**
 * Lets a shoot-type task pick which already-scheduled tasks (e.g. reels) it
 * will shoot, so the footage link can be attached to them afterwards.
 */
const CoveredTasksPicker = ({ projectId, workType = "reels", value = [], onChange }) => {
  const { data, isLoading } = useShootCandidates(projectId, { workType });
  const tasks = data?.available || [];
  const selected = new Set((value || []).map(String));

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-gray-800">
          Tasks this shoot covers
          <span className="ml-1 font-normal text-gray-400">(optional)</span>
        </p>
        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          {selected.size} selected
        </span>
      </div>
      <p className="text-[11px] text-gray-500">
        Pick the scheduled {workType} this shoot is for. After the shoot, the footage link goes
        onto each one and the shoot&apos;s points are counted per task shot.
      </p>
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading scheduled tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-xs text-gray-500">
          No open {workType} tasks are waiting to be shot in this project.
        </p>
      ) : (
        <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
          {tasks.map((task) => {
            const id = String(task._id);
            return (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={() => toggle(id)}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                  {task.title}
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {[dueLabel(task), assigneeLabel(task)].filter(Boolean).join(" · ")}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoveredTasksPicker;
