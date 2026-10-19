import React, { useEffect, useMemo, useState } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FiCalendar, FiCheck, FiFolder } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useGetEmployeeSubTasksToday } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import socketService from "../../../services/socketService";
import RecurringBadge, { isRecurringItem } from "../../shared/RecurringBadge";
import DailyChecklistTaskCard from "./DailyChecklistTaskCard";
import { useMyDailyChecklist } from "./useMyDailyChecklist";

const FINISHED_STATUSES = ["on-review", "approved", "completed", "client-approved"];

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

// Left accent bar + pill colours per priority
const PRIORITY_STYLE = {
  high: { bar: "bg-red-400", pill: "bg-red-50 text-red-600 border-red-100" },
  medium: { bar: "bg-amber-400", pill: "bg-amber-50 text-amber-600 border-amber-100" },
  low: { bar: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-600 border-emerald-100" },
};
const DEFAULT_PRIORITY_STYLE = { bar: "bg-gray-300", pill: "bg-gray-50 text-gray-600 border-gray-200" };

const getPriorityStyle = (priority) =>
  PRIORITY_STYLE[priority?.toLowerCase()] || DEFAULT_PRIORITY_STYLE;

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed": return "bg-green-100 text-green-600";
    case "approved": return "bg-emerald-100 text-emerald-600";
    case "on-review": return "bg-purple-100 text-purple-600";
    case "in-progress": return "bg-blue-100 text-blue-600";
    case "todo": return "bg-orange-100 text-orange-600";
    default: return "bg-gray-100 text-gray-600";
  }
};

// Overdue and in-progress groups show this many items until expanded, so a long
// backlog can't push today's work off the panel.
const COLLAPSED_LIMIT = 3;

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// "Day 2 of 5" for multi-day work that has started; null when the dates don't say.
const getDayProgress = (item) => {
  if (!item.startDate || !item.dueDate) return null;
  const start = startOfDay(new Date(item.startDate));
  const due = startOfDay(new Date(item.dueDate));
  const total = Math.round((due - start) / 86400000) + 1;
  const current = Math.round((startOfDay(new Date()) - start) / 86400000) + 1;
  if (total < 2 || current < 1) return null;
  return {
    current: Math.min(current, total),
    total,
    left: Math.max(0, Math.round((due - startOfDay(new Date())) / 86400000)),
  };
};

// Label + tone for the due date chip; unfinished work past its date shows as overdue
const getDueMeta = (dateString, isFinished) => {
  if (!dateString) return { label: "No due date", tone: "bg-gray-50 text-gray-500" };

  const due = new Date(dateString);
  const dayDiff = Math.round((startOfDay(due) - startOfDay(new Date())) / 86400000);
  const dateLabel = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (dayDiff === 0) return { label: "Today", tone: "bg-amber-50 text-amber-700" };
  if (dayDiff === 1) return { label: "Tomorrow", tone: "bg-blue-50 text-blue-600" };
  if (dayDiff < 0 && !isFinished) return { label: `Overdue · ${dateLabel}`, tone: "bg-red-50 text-red-600" };
  return { label: dateLabel, tone: "bg-gray-50 text-gray-600" };
};

const formatCompletedTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const PanelHeader = ({ title, count, tone, action }) => (
  <div className="mb-2 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <h4 className="text-sm font-semibold text-[#0A1629]">{title}</h4>
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>{count}</span>
    </div>
    {action}
  </div>
);

const ShowMoreToggle = ({ expanded, hiddenCount, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="self-start rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-[#3F8CFF] transition-colors hover:bg-white"
  >
    {expanded ? "Show less" : `Show ${hiddenCount} more`}
  </button>
);

const EmptyState = ({ icon, text }) => (
  <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-white/60 px-4 py-6 text-center">
    <div className="text-2xl">{icon}</div>
    <p className="text-xs font-medium text-gray-500">{text}</p>
  </div>
);

const EmployeeWorkDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const checklist = useMyDailyChecklist(user?._id ? String(user._id) : null);
  const showChecklistAssigned = checklist.total > 0 && !checklist.allDone;
  const showChecklistCompleted = checklist.total > 0 && checklist.allDone;
  const { data: todaySubTasks, isLoading, refetch } = useGetEmployeeSubTasksToday(
    user?._id ? String(user._id) : null
  );

  // Same mechanism as the action-alert popup (GlobalNudges): refetch as soon as
  // a socket notification arrives so the list updates without a page refresh.
  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };

    socketService.onNewNotification(handleUpdate);
    socketService.onSubtaskAssigned(handleUpdate);
    window.addEventListener("taskCreated", handleUpdate);

    return () => {
      socketService.offNewNotification(handleUpdate);
      socketService.offSubtaskAssigned(handleUpdate);
      window.removeEventListener("taskCreated", handleUpdate);
    };
  }, [refetch]);

  const sortedSubTasks = useMemo(
    () =>
      [...(todaySubTasks?.subTasks || []), ...(todaySubTasks?.carried || [])].sort((a, b) => {
        const aRank = PRIORITY_RANK[a?.priority?.toLowerCase()] || 0;
        const bRank = PRIORITY_RANK[b?.priority?.toLowerCase()] || 0;
        return bRank - aRank;
      }),
    [todaySubTasks]
  );

  const pendingWithReasonSubTasks = useMemo(
    () => sortedSubTasks.filter((task) => task.hasPendingReasonToday),
    [sortedSubTasks]
  );

  const activeSubTasks = useMemo(
    () => sortedSubTasks.filter((task) => !task.hasPendingReasonToday),
    [sortedSubTasks]
  );

  // Overdue work (reason needed before ending the shift) and multi-day work that
  // is under way but not due yet. Both come from the API beside "today".
  const overdueSubTasks = useMemo(() => todaySubTasks?.overdue || [], [todaySubTasks]);
  const inProgressSubTasks = useMemo(() => todaySubTasks?.inProgress || [], [todaySubTasks]);
  const inProgressTotal = todaySubTasks?.inProgressTotal ?? inProgressSubTasks.length;
  const [showAllOverdue, setShowAllOverdue] = useState(false);
  const [showAllInProgress, setShowAllInProgress] = useState(false);

  const visibleOverdue = showAllOverdue ? overdueSubTasks : overdueSubTasks.slice(0, COLLAPSED_LIMIT);
  const visibleInProgress = showAllInProgress
    ? inProgressSubTasks
    : inProgressSubTasks.slice(0, COLLAPSED_LIMIT);

  const completedItems = [
    ...(todaySubTasks?.completedTasks || []),
    ...(todaySubTasks?.completedSubTasks || []),
  ].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  // In-progress work is shown but not counted: only what has to be dealt with today is.
  const assignedCount =
    sortedSubTasks.length + overdueSubTasks.length + (showChecklistAssigned ? 1 : 0);
  const hasDueWork =
    assignedCount > 0;
  const completedCount = completedItems.length + (showChecklistCompleted ? 1 : 0);

  const handleSubTaskClick = (item) => {
    const isSubTask = !!item.parentTask;
    const projectId = item.project?._id || item.project;

    if (isSubTask) {
      const parentTaskId = item.parentTask._id || item.parentTask;
      if (projectId) {
        navigate(`/projects/${projectId}/${parentTaskId}?subTaskId=${item._id}`);
      } else {
        navigate(`/tasks/${parentTaskId}?subTaskId=${item._id}`);
      }
    } else {
      if (projectId) {
        navigate(`/projects/${projectId}/${item._id}`);
      } else {
        navigate(`/tasks/${item._id}`);
      }
    }
  };

  const TaskCard = ({ item, completed = false, inProgress = false }) => {
    const isFinished = FINISHED_STATUSES.includes(item.status?.toLowerCase());
    const showPendingBadge = item.hasPendingReasonToday && !isFinished;
    const priority = getPriorityStyle(item.priority);
    const due = getDueMeta(item.dueDate, isFinished || completed);
    const projectName = item.project?.displayName || item.project?.name;
    const dayProgress = inProgress ? getDayProgress(item) : null;

    return (
      <div
        onClick={() => handleSubTaskClick(item)}
        className={`group relative flex cursor-pointer items-stretch overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-px hover:border-[#3F8CFF]/30 hover:shadow-md ${
          completed ? "opacity-80" : ""
        }`}
      >
        <span className={`w-1 shrink-0 ${completed ? "bg-emerald-400" : priority.bar}`} />

        <div className="flex min-w-0 flex-1 items-start justify-between gap-2 px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h5
                className={`max-w-full truncate text-[13px] font-semibold ${
                  completed ? "text-gray-500" : "text-gray-800 group-hover:text-[#3F8CFF]"
                } transition-colors`}
              >
                {item.title}
              </h5>
              {!completed && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priority.pill}`}>
                  {item.priority || "Medium"}
                </span>
              )}
              {isRecurringItem(item) && <RecurringBadge />}
              {showPendingBadge && (
                <span className="rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                  Reason Provided
                </span>
              )}
              {item.isOverdue && (
                <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                  Reason needed
                </span>
              )}
            </div>

            {item.description && (
              <p className="mt-1 line-clamp-1 text-xs italic text-gray-500">{item.description}</p>
            )}

            {showPendingBadge && item.pendingReasonToday && (
              <div className="mt-2 rounded-lg border-l-2 border-orange-400 bg-orange-50/60 p-2 text-[11px] italic text-gray-700">
                &ldquo;{item.pendingReasonToday}&rdquo;
              </div>
            )}

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
              {completed ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <FiCheck className="h-3 w-3" />
                  Done{item.completedAt ? ` at ${formatCompletedTime(item.completedAt)}` : ""}
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${due.tone}`}>
                  <FiCalendar className="h-3 w-3" />
                  {due.label}
                </span>
              )}
              {dayProgress && (
                <span className="font-medium text-gray-500">
                  Day {dayProgress.current} of {dayProgress.total} ·{" "}
                  <span className={dayProgress.left <= 1 ? "text-amber-600" : ""}>
                    {dayProgress.left} day{dayProgress.left === 1 ? "" : "s"} left
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
                  className={`h-full rounded-full ${dayProgress.left <= 1 ? "bg-amber-400" : "bg-[#3F8CFF]/60"}`}
                  style={{ width: `${(dayProgress.current / dayProgress.total) * 100}%` }}
                />
              </div>
            )}
          </div>

          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              showPendingBadge ? "bg-orange-500 text-white shadow-sm" : getStatusColor(item.status)
            }`}
          >
            {showPendingBadge
              ? "Pending"
              : item.status === "todo"
                ? "To Do"
                : item.status?.replace("-", " ") || "To Do"}
          </span>
        </div>
      </div>
    );
  };

  const SectionLabel = ({ children, count, dot }) => (
    <div className="flex items-center gap-2 px-1">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{children}</h5>
      <span className="ml-auto rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
        {count}
      </span>
    </div>
  );

  const Loading = () => (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[56px] animate-pulse rounded-xl border border-gray-100 bg-white" />
      ))}
    </div>
  );

  return (
    <div className="grid h-full min-w-0 grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 md:grid-cols-2 md:p-3">
      {/* Assigned */}
      <section className="flex min-w-0 flex-col rounded-2xl border border-gray-100 bg-gray-50/70 p-2.5 md:p-3">
        <PanelHeader
          title="Assigned Tasks"
          count={isLoading ? "–" : assignedCount}
          tone="bg-blue-50 text-[#3F8CFF]"
          action={
            (sortedSubTasks.length > 0 ||
              overdueSubTasks.length > 0 ||
              inProgressSubTasks.length > 0) && (
              <Link
                to={"/today-tasks"}
                className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#3F8CFF] shadow-sm transition-colors hover:bg-[#E6EDF5]"
              >
                <span>View all</span>
                <MdOutlineKeyboardArrowRight />
              </Link>
            )
          }
        />

        {isLoading ? (
          <Loading />
        ) : (
          <div className="custom-scrollbar flex min-h-[200px] max-h-[320px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {pendingWithReasonSubTasks.length > 0 && (
              <div className="flex flex-col gap-2">
                <SectionLabel count={pendingWithReasonSubTasks.length} dot="animate-pulse bg-orange-500">
                  Pending for Today (Reasons Provided)
                </SectionLabel>
                {pendingWithReasonSubTasks.map((subTask, index) => (
                  <TaskCard key={`pending-${subTask._id || index}`} item={subTask} />
                ))}
              </div>
            )}

            {(activeSubTasks.length > 0 || showChecklistAssigned) && (
              <div className="flex flex-col gap-2">
                {(pendingWithReasonSubTasks.length > 0 ||
                  showChecklistAssigned ||
                  overdueSubTasks.length > 0 ||
                  inProgressSubTasks.length > 0) && (
                  <SectionLabel
                    count={activeSubTasks.length + (showChecklistAssigned ? 1 : 0)}
                    dot="bg-blue-500"
                  >
                    Active Tasks
                  </SectionLabel>
                )}
                {/* Daily checklist assigned to this user, until every item is done */}
                {showChecklistAssigned && <DailyChecklistTaskCard checklist={checklist} compact />}
                {activeSubTasks.map((subTask, index) => (
                  <TaskCard key={`active-${subTask._id || index}`} item={subTask} />
                ))}
              </div>
            )}

            {/* Already late: each needs a reason before the shift can end */}
            {overdueSubTasks.length > 0 && (
              <div className="flex flex-col gap-2">
                <SectionLabel count={overdueSubTasks.length} dot="bg-red-500">
                  Overdue · reason needed to end shift
                </SectionLabel>
                {visibleOverdue.map((subTask, index) => (
                  <TaskCard key={`overdue-${subTask._id || index}`} item={subTask} />
                ))}
                {overdueSubTasks.length > COLLAPSED_LIMIT && (
                  <ShowMoreToggle
                    expanded={showAllOverdue}
                    hiddenCount={overdueSubTasks.length - COLLAPSED_LIMIT}
                    onToggle={() => setShowAllOverdue((open) => !open)}
                  />
                )}
              </div>
            )}

            {/* Multi-day work that has started but isn't due yet. Never blocks the shift. */}
            {inProgressSubTasks.length > 0 && (
              <div className="flex flex-col gap-2">
                <SectionLabel count={inProgressTotal} dot="bg-sky-400">
                  In Progress · due later
                </SectionLabel>
                {!hasDueWork && (
                  <p className="px-1 text-[11px] text-gray-500">
                    Nothing is due today. This is what you&apos;re in the middle of.
                  </p>
                )}
                {visibleInProgress.map((subTask, index) => (
                  <TaskCard key={`in-progress-${subTask._id || index}`} item={subTask} inProgress />
                ))}
                {inProgressSubTasks.length > COLLAPSED_LIMIT && (
                  <ShowMoreToggle
                    expanded={showAllInProgress}
                    hiddenCount={inProgressSubTasks.length - COLLAPSED_LIMIT}
                    onToggle={() => setShowAllInProgress((open) => !open)}
                  />
                )}
                {showAllInProgress && inProgressTotal > inProgressSubTasks.length && (
                  <p className="px-1 text-[11px] text-gray-400">
                    +{inProgressTotal - inProgressSubTasks.length} more not shown
                  </p>
                )}
              </div>
            )}

            {!hasDueWork && inProgressSubTasks.length === 0 && (
              <EmptyState icon="✨" text="You're all caught up for today!" />
            )}
          </div>
        )}
      </section>

      {/* Completed */}
      <section className="flex min-w-0 flex-col rounded-2xl border border-gray-100 bg-gray-50/70 p-2.5 md:p-3">
        <PanelHeader
          title="Completed Today"
          count={isLoading ? "–" : completedCount}
          tone="bg-green-50 text-green-600"
        />

        {isLoading ? (
          <Loading />
        ) : completedItems.length > 0 || showChecklistCompleted ? (
          <div className="custom-scrollbar flex min-h-[200px] max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
            {showChecklistCompleted && <DailyChecklistTaskCard checklist={checklist} />}
            {completedItems.map((item, index) => (
              <TaskCard key={`completed-${item._id || index}`} item={item} completed />
            ))}
          </div>
        ) : (
          <EmptyState icon="🕒" text="No completed tasks yet" />
        )}
      </section>
    </div>
  );
};

export default EmployeeWorkDetails;
