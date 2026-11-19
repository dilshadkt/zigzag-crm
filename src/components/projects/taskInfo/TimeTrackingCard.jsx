import React, { useEffect, useState } from "react";
import Progress from "../../shared/progress";

// Minutes -> "2h 2m" / "45m"
export const formatMinutes = (minutes) => {
  const total = Math.max(0, Math.floor(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const STATUS_LABELS = {
  todo: "To do",
  "in-progress": "In progress",
  paused: "Paused",
  "on-hold": "On hold",
  "on-review": "On review",
  "re-work": "Rework",
  approved: "Approved",
  "client-approved": "Completed",
  completed: "Completed",
};

// Whole minutes a running session has been going, so a subtask that is being
// worked on right now counts without waiting for it to stop
const runningMinutes = (row, nowMs) => {
  if (!row.running || !row.runningSince) return 0;
  const started = new Date(row.runningSince).getTime();
  return Number.isFinite(started) ? Math.max(0, Math.floor((nowMs - started) / 60000)) : 0;
};

/**
 * Time tracking for a task. Nothing is typed in: every subtask's timer runs by
 * itself (it counts while the subtask is in progress, including after a
 * rework), and this card adds them up.
 */
const TimeTrackingCard = ({ data, isLoading, error, estimateHours }) => {
  // Re-render every 30s while something is running so the live minutes move
  const [now, setNow] = useState(() => Date.now());
  const anyRunning = (data?.subtasks || []).some((row) => row.running);
  useEffect(() => {
    if (!anyRunning) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [anyRunning]);

  const rows = (data?.subtasks || []).map((row) => {
    const live = runningMinutes(row, now);
    return {
      ...row,
      liveTotal: row.totalTime + live,
      liveRework: row.reworkTime + (row.runningIsRework ? live : 0),
    };
  });

  const totalMinutes =
    rows.reduce((sum, row) => sum + row.liveTotal, 0) + (data?.taskLevelTime || 0);
  const reworkMinutes = rows.reduce((sum, row) => sum + row.liveRework, 0);
  const estimateMinutes = Math.round((Number(estimateHours) || 0) * 60);
  const progress = estimateMinutes ? Math.min(100, (totalMinutes / estimateMinutes) * 100) : 0;
  const reworkRounds = rows.reduce((sum, row) => sum + (row.reworkCount || 0), 0);

  return (
    <div className="rounded-2xl mt-5 p-4 bg-[#F4F9FD] hidden md:flex flex-col">
      <h4 className="font-medium">Time tracking</h4>
      {isLoading ? (
        <div className="text-sm text-gray-500 mt-2">Loading time data...</div>
      ) : error ? (
        <div className="text-sm text-red-500 mt-2">Error loading time data</div>
      ) : (
        <>
          <div className="flexStart gap-x-3 my-3">
            <Progress size={33} strokeWidth={2} currentValue={progress} />
            <div className="flex flex-col">
              <span className="text-sm">{formatMinutes(totalMinutes)} logged</span>
              <span className="text-xs text-[#91929E]">
                Original Estimate {formatMinutes(estimateMinutes)}
              </span>
            </div>
          </div>

          {reworkMinutes > 0 || reworkRounds > 0 ? (
            <div className="mb-3 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
              {reworkMinutes > 0
                ? `Rework: ${formatMinutes(reworkMinutes)}`
                : "Rework"}
              {reworkRounds > 0 &&
                `${reworkMinutes > 0 ? " across" : ":"} ${reworkRounds} round${reworkRounds === 1 ? "" : "s"}`}
            </div>
          ) : null}

          {rows.length > 0 ? (
            <ul className="flex flex-col gap-y-2.5 border-t border-gray-200/60 pt-3">
              {rows.map((row) => (
                <li key={row._id} className="flex flex-col gap-y-0.5">
                  <div className="flex items-start justify-between gap-x-2">
                    <span className="text-sm font-medium break-words min-w-0" title={row.title}>
                      {row.title}
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {formatMinutes(row.liveTotal)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#91929E]">
                    <span>{STATUS_LABELS[row.status] || row.status}</span>
                    {row.running && (
                      <span className="flex items-center gap-x-1 text-blue-600">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                        running
                      </span>
                    )}
                    {row.estimateMinutes > 0 && <span>of {formatMinutes(row.estimateMinutes)}</span>}
                    {row.reworkCount > 0 && (
                      <span className="text-red-500">
                        {row.reworkCount} rework{row.reworkCount === 1 ? "" : "s"}
                        {row.liveRework > 0 ? ` · ${formatMinutes(row.liveRework)}` : ""}
                      </span>
                    )}
                  </div>
                </li>
              ))}
              {data?.taskLevelTime > 0 && (
                <li className="flex items-start justify-between gap-x-2">
                  <span className="text-sm font-medium">On the task itself</span>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatMinutes(data.taskLevelTime)}
                  </span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-[#91929E]">No subtasks yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default TimeTrackingCard;
