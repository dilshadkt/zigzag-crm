import React from "react";
import { useShootCandidates } from "../../../api/hooks";
import { getShootWorkType } from "../../../utils/shootSession";

/**
 * What a shoot session submitted: the footage link, the tasks it covered (and
 * whether the link reached each one) and how many extras went to the bank.
 * Reviewers use it to check the shoot before approving.
 */
const ShootSubmissionSummary = ({ subtask, parentTaskId }) => {
  const submission = subtask?.shootSubmission;
  const hasSubmission = Boolean(submission?.footageLink);
  const workType = getShootWorkType(subtask);
  const projectId = subtask?.project?._id || subtask?.project;

  const { data } = useShootCandidates(
    projectId,
    { workType, shootTaskId: parentTaskId },
    { enabled: hasSubmission && !!parentTaskId }
  );
  if (!hasSubmission) return null;

  const covered = data?.covered || [];
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

      <a
        href={submission.footageLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block truncate text-sm font-medium text-blue-600 hover:underline"
      >
        {submission.footageLink}
      </a>

      {covered.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Tasks shot ({covered.length})
          </p>
          {covered.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-1.5 text-sm"
            >
              <span className="min-w-0 truncate text-gray-800">{task.title}</span>
              <span
                className={`shrink-0 text-[11px] font-semibold ${
                  task.footageLinked ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {task.footageLinked ? "Link attached" : "Link missing"}
              </span>
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
        <p className="text-xs text-gray-600">
          {submission.extraCount} extra {workType} added to the client&apos;s asset bank.
        </p>
      )}
    </div>
  );
};

export default ShootSubmissionSummary;
