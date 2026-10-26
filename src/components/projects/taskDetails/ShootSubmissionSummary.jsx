import React from "react";
import { useShootCandidates } from "../../../api/hooks";
import { getShootWorkType, isShootSessionSubtask } from "../../../utils/shootSession";

const isLink = (value) => /^https?:\/\//i.test(String(value || ""));

// Label / value rows, with links clickable
const FieldValues = ({ fields }) => {
  const rows = (fields || []).filter((field) => String(field?.value || "").trim());
  if (!rows.length) return null;
  return (
    <div className="space-y-0.5">
      {rows.map((field, index) => (
        <div key={`${field.label}-${index}`} className="flex gap-2 text-xs">
          <span className="w-2/5 shrink-0 truncate text-gray-500">{field.label}</span>
          {isLink(field.value) ? (
            <a
              href={field.value}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 truncate font-medium text-blue-600 hover:underline"
            >
              {field.value}
            </a>
          ) : (
            <span className="min-w-0 truncate font-medium text-gray-800">{field.value}</span>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * What a shoot session submitted: the footage link, the tasks it covered (and
 * whether the link reached each one) and how many extras went to the bank.
 * Reviewers use it to check the shoot before approving.
 */
const ShootSubmissionSummary = ({ subtask, parentTaskId }) => {
  const submission = subtask?.shootSubmission;
  const hasSubmission = Boolean(submission?.submittedAt || submission?.footageLink);
  const workType = getShootWorkType(subtask);
  const projectId = subtask?.project?._id || subtask?.project;

  const { data } = useShootCandidates(
    projectId,
    { workType, shootTaskId: parentTaskId },
    { enabled: (hasSubmission || isShootSessionSubtask(subtask)) && !!parentTaskId }
  );

  // Before the shoot is submitted: the tasks it is planned to cover
  if (!hasSubmission) {
    if (!isShootSessionSubtask(subtask)) return null;
    const planned = data?.covered || [];
    return (
      <div className="mt-3 space-y-1.5 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
        <p className="text-[13px] font-bold text-gray-800">
          Tasks this shoot covers ({planned.length})
        </p>
        {planned.length === 0 ? (
          <p className="text-xs text-gray-500">
            No scheduled {workType} picked yet. Use Edit on the task to choose them.
          </p>
        ) : (
          planned.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-1.5 text-sm"
            >
              <span className="min-w-0 truncate font-medium text-gray-800">{task.title}</span>
              <span className="shrink-0 text-xs text-gray-400">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  const covered = data?.covered || [];
  // This session's own extras (the shoot task may have more than one session subtask)
  const extras = (data?.extras || []).filter(
    (item) => !item.sourceSubTask || String(item.sourceSubTask) === String(subtask?._id)
  );
  const unlinked = covered.filter((task) => !task.footageLinked).length;
  const points = Number(subtask?.taskCategory?.points) || 0;
  const multiplier = Math.max(1, Number(subtask?.pointsMultiplier) || 1);

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-bold text-gray-800">Shoot submission</p>
        {points > 0 && (
          <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700">
            {points} × {multiplier} = {points * multiplier} pts
          </span>
        )}
      </div>

      {submission.footageLink && (
        <a
          href={submission.footageLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-sm font-medium text-blue-600 hover:underline"
        >
          {submission.footageLink}
        </a>
      )}

      {covered.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Tasks shot ({covered.length})
          </p>
          {covered.map((task) => (
            <div key={task._id} className="space-y-1 rounded-lg bg-white px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate font-medium text-gray-800">{task.title}</span>
                <span
                  className={`shrink-0 text-[11px] font-semibold ${
                    task.footageLinked ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {task.footageLinked ? "Details attached" : "Details missing"}
                </span>
              </div>
              <FieldValues fields={task.shootFields} />
            </div>
          ))}
          {unlinked > 0 && (
            <p className="text-[11px] font-medium text-red-500">
              {unlinked} task{unlinked > 1 ? "s" : ""} did not receive the link. Send this back
              for rework.
            </p>
          )}
        </div>
      )}

      {Number(submission.extraCount) > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Extra {workType} in the asset bank ({submission.extraCount})
          </p>
          {extras.length > 0 ? (
            extras.map((item, index) => (
              <div key={item._id} className="space-y-1 rounded-lg bg-white px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-medium text-gray-800">
                    {item.topic || `Extra ${index + 1}`}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold capitalize text-gray-400">
                    {item.status}
                  </span>
                </div>
                <FieldValues fields={item.fields} />
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-600">
              {submission.extraCount} extra {workType} added to the client&apos;s asset bank.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ShootSubmissionSummary;
