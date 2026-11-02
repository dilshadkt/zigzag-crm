import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiFolder } from "react-icons/fi";

const DAY_MS = 86400000;
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const dayDiff = (dateString) =>
  Math.round((startOfDay(new Date(dateString)) - startOfDay(new Date())) / DAY_MS);
const shortDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const PRIORITY_BAR = { high: "bg-red-400", medium: "bg-amber-400", low: "bg-emerald-400" };

const COLUMNS = [
  { key: "todo", title: "To do", hint: "due today, not started", dot: "bg-blue-500", tint: "bg-blue-50/60" },
  { key: "inProgress", title: "In progress", hint: "started", dot: "bg-sky-400", tint: "bg-sky-50/60" },
  { key: "onHold", title: "On hold", hint: "paused", dot: "bg-amber-400", tint: "bg-amber-50/60" },
  { key: "carried", title: "Carried forward", hint: "upcoming, pulled onto today", dot: "bg-violet-400", tint: "bg-violet-50/60" },
];

const columnOf = (item) => {
  if (item.isCarriedForward) return "carried";
  if (item.status === "in-progress") return "inProgress";
  if (item.status === "on-hold" || item.status === "paused") return "onHold";
  return "todo";
};

const isSubTask = (item) => Boolean(item.parentTask || item.isSubTask);

const Assignees = ({ users }) => {
  if (!users?.length) return <span className="text-gray-400">Unassigned</span>;
  const names = users
    .slice(0, 2)
    .map((u) => `${u.firstName || ""} ${u.lastName || ""}`.trim())
    .filter(Boolean)
    .join(", ");
  return (
    <span className="inline-flex min-w-0 items-center gap-1 text-gray-500">
      <span className="flex -space-x-1">
        {users.slice(0, 2).map((u, i) =>
          u.profileImage ? (
            <img
              key={u._id || i}
              src={u.profileImage}
              alt=""
              className="h-4 w-4 rounded-full border border-white object-cover"
            />
          ) : (
            <span
              key={u._id || i}
              className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-blue-100 text-[8px] font-bold text-blue-600"
            >
              {(u.firstName?.[0] || "?").toUpperCase()}
            </span>
          )
        )}
      </span>
      <span className="truncate">
        {names}
        {users.length > 2 && ` +${users.length - 2}`}
      </span>
    </span>
  );
};

Assignees.propTypes = { users: PropTypes.array };

const BoardCard = ({ item }) => {
  const navigate = useNavigate();
  const sub = isSubTask(item);
  const projectId = item.project?._id || item.project;
  const parentId = item.parentTask?._id || item.parentTask;

  const open = () => {
    if (sub && parentId) {
      navigate(
        projectId
          ? `/projects/${projectId}/${parentId}?subTaskId=${item._id}`
          : `/tasks/${parentId}?subTaskId=${item._id}`
      );
    } else if (projectId) {
      navigate(`/projects/${projectId}/${item._id}`);
    } else {
      navigate(`/tasks/${item._id}`);
    }
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

  const projectName = item.project?.displayName || item.project?.name;

  return (
    <div className="shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex">
        <span className={`w-1 shrink-0 ${PRIORITY_BAR[item.priority?.toLowerCase()] || "bg-gray-300"}`} />
        <div className="min-w-0 flex-1 px-3 py-2">
          {sub && item.parentTask?.title && (
            <p className="truncate text-[10px] font-medium text-gray-400" title={item.parentTask.title}>
              {item.parentTask.title}
            </p>
          )}
          <button
            type="button"
            onClick={open}
            className="block min-w-0 max-w-full truncate text-left text-[13px] font-semibold text-gray-800 hover:text-[#3F8CFF]"
            title={item.title}
          >
            {item.title}
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            <span
              className={`rounded-md px-1.5 py-0.5 font-medium ${
                sub ? "bg-purple-50 text-purple-600" : "bg-slate-100 text-slate-600"
              }`}
            >
              {sub ? "Subtask" : "Task"}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${dueTone}`}>
              <FiCalendar className="h-3 w-3" />
              {dueLabel}
            </span>
            {item.reworkCount > 0 && (
              <span className="rounded-md bg-red-50 px-1.5 py-0.5 font-medium text-red-600">
                Rework {item.reworkCount}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <Assignees users={item.assignedTo} />
            {projectName && (
              <span className="inline-flex min-w-0 items-center gap-1 font-medium text-[#3F8CFF]">
                <FiFolder className="h-3 w-3 shrink-0" />
                <span className="truncate">{projectName}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

BoardCard.propTypes = { item: PropTypes.object.isRequired };

// items: today's tasks and subtasks, already filtered by the page
const CompanyTodayBoard = ({ items }) => {
  const grouped = useMemo(() => {
    const groups = { todo: [], inProgress: [], onHold: [], carried: [] };
    items.forEach((item) => groups[columnOf(item)].push(item));
    return groups;
  }, [items]);

  return (
    <div className="grid h-full min-h-[320px] grid-cols-1 grid-rows-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((column) => {
        const cards = grouped[column.key];
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
              <span className="ml-auto truncate text-[10px] text-gray-400">{column.hint}</span>
            </div>
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {cards.length === 0 ? (
                <p className="rounded-xl border-2 border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400">
                  Nothing here
                </p>
              ) : (
                cards.map((item) => <BoardCard key={item._id} item={item} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

CompanyTodayBoard.propTypes = { items: PropTypes.array.isRequired };

export default CompanyTodayBoard;
