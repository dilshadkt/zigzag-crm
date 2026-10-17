import React, { useEffect, useMemo, useState } from "react";
import Modal from "../modal";
import { useShootCandidates } from "../../../api/hooks";
import { isHttpLink } from "../../../utils/shootSession";

const MAX_EXTRA = 50;

const dueLabel = (task) => {
  const date = task?.dueDate ? new Date(task.dueDate) : null;
  if (!date || Number.isNaN(date.getTime())) return task?.taskMonth || "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const TaskRow = ({ task, checked, onToggle, disabled }) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 hover:bg-gray-50">
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onToggle(String(task._id))}
      disabled={disabled}
      className="h-4 w-4 rounded text-blue-600"
    />
    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
      {task.title}
    </span>
    <span className="shrink-0 text-xs text-gray-400">{dueLabel(task)}</span>
  </label>
);

/**
 * Shown when a shoot-session subtask is sent to review: the drive link, which
 * of the scheduled tasks were actually shot (points = category points x ticked
 * tasks) and any extra reels to put in the client's asset bank.
 */
const ShootSubmitModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  subtask,
  projectId,
  shootTaskId,
  workType = "reels",
}) => {
  const { data, isLoading: loadingTasks } = useShootCandidates(
    projectId,
    { workType, shootTaskId },
    { enabled: isOpen && !!shootTaskId }
  );
  const covered = useMemo(() => data?.covered || [], [data]);
  const available = useMemo(() => data?.available || [], [data]);

  const stored = subtask?.shootSubmission;
  const [link, setLink] = useState("");
  const [ticked, setTicked] = useState(() => new Set());
  const [extraCount, setExtraCount] = useState(0);
  const [extraTopics, setExtraTopics] = useState("");
  const [error, setError] = useState("");

  // Start from the stored submission on a resubmit, else from what the shoot covers
  useEffect(() => {
    if (!isOpen || !data) return;
    const storedShot = (stored?.shotTasks || []).map((t) => String(t._id || t));
    const coveredIds = covered.map((t) => String(t._id));
    setTicked(new Set(storedShot.length ? storedShot : coveredIds));
    setLink(stored?.footageLink || "");
    setExtraCount(stored?.extraCount || 0);
    setExtraTopics("");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, data]);

  const toggle = (id) => {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError("");
  };

  const categoryPoints = Number(subtask?.taskCategory?.points) || 0;
  const count = ticked.size;
  const multiplier = Math.max(1, count);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isHttpLink(link)) {
      setError("Enter the footage drive link (a full http/https link).");
      return;
    }
    if (covered.length > 0 && count === 0) {
      setError("Tick at least one task this shoot covered.");
      return;
    }
    const extras = Math.max(0, Math.min(MAX_EXTRA, Math.floor(Number(extraCount) || 0)));
    onSubmit({
      footageLink: link.trim(),
      shotTaskIds: [...ticked],
      extraCount: extras,
      extraTopics: extraTopics
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, extras),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit shoot for review" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-[13px] font-bold text-gray-700">
            Footage drive link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setError("");
            }}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
          <p className="text-[11px] text-gray-500">
            This link is added to every {workType} task you tick below.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-gray-700">
              Tasks you shot ({count})
            </label>
            {categoryPoints > 0 && (
              <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                {categoryPoints} × {multiplier} = {categoryPoints * multiplier} pts
              </span>
            )}
          </div>
          {loadingTasks ? (
            <p className="text-xs text-gray-400">Loading scheduled tasks...</p>
          ) : (
            <>
              {covered.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Planned for this shoot
                  </p>
                  {covered.map((task) => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      checked={ticked.has(String(task._id))}
                      onToggle={toggle}
                      disabled={isLoading}
                    />
                  ))}
                  <p className="text-[11px] text-gray-500">
                    Untick anything you did not shoot. It goes back to the schedule.
                  </p>
                </div>
              )}
              {available.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Other scheduled {workType} (tick to add to this shoot)
                  </p>
                  <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                    {available.map((task) => (
                      <TaskRow
                        key={task._id}
                        task={task}
                        checked={ticked.has(String(task._id))}
                        onToggle={toggle}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>
              )}
              {covered.length === 0 && available.length === 0 && (
                <p className="text-xs text-gray-500">
                  No scheduled {workType} tasks to attach. Only the footage link is needed.
                </p>
              )}
            </>
          )}
        </div>

        <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
          <label className="block text-[13px] font-bold text-gray-700">
            Extra {workType} shot (add to the client&apos;s bank)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max={MAX_EXTRA}
              value={extraCount}
              onChange={(e) => setExtraCount(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <span className="text-xs text-gray-500">
              Footage beyond the tasks above. Usable later in any month.
            </span>
          </div>
          {Number(extraCount) > 0 && (
            <textarea
              value={extraTopics}
              onChange={(e) => setExtraTopics(e.target.value)}
              rows={Math.min(5, Math.max(2, Number(extraCount)))}
              placeholder={"One topic per line (optional)\nDiwali offer\nStaff story"}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          )}
        </div>

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || loadingTasks}
            className={`h-10 rounded-xl px-6 text-sm font-medium ${
              isLoading || loadingTasks
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Submitting..." : "Submit for review"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ShootSubmitModal;
