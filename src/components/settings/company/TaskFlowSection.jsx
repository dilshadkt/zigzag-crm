import React, { useMemo, useState } from "react";
import {
  FiEdit3,
  FiTrash2,
  FiLayers,
  FiChevronRight,
  FiUser,
  FiUsers,
  FiSearch,
  FiPause,
  FiPlay,
  FiSend,
  FiLink,
  FiFlag,
} from "react-icons/fi";
import clsx from "clsx";

const STAGE_COLORS = {
  content: "bg-purple-100 text-purple-700",
  design: "bg-pink-100 text-pink-700",
  publish: "bg-green-100 text-green-700",
  campaign: "bg-orange-100 text-orange-700",
  motion: "bg-blue-100 text-blue-700",
  "video editing": "bg-indigo-100 text-indigo-700",
  "video shooting": "bg-teal-100 text-teal-700",
};
const stageColor = (taskName) =>
  STAGE_COLORS[String(taskName || "").toLowerCase()] || "bg-gray-100 text-gray-600";

const personName = (user) =>
  user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "" : "";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
];

// One stage of a flow: what it is, who does it, how much of the timeline it takes.
const StageCard = ({ stage, index, totalWeight }) => {
  const pinnedName = personName(stage.assignee);
  const share = totalWeight > 0 ? Math.round(((stage.weightage ?? 1) / totalWeight) * 100) : null;
  const flags = [
    stage.requiresClientApproval && { Icon: FiSend, label: "Client review before done", tone: "text-blue-500" },
    stage.requiresWorkLink && { Icon: FiLink, label: "Work link required", tone: "text-purple-500" },
    stage.requiresCampaignReport && { Icon: FiFlag, label: "Campaign report required", tone: "text-indigo-500" },
  ].filter(Boolean);

  return (
    <div className="w-[176px] shrink-0 rounded-xl border border-gray-100 bg-gray-50/60 p-3 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <span
          className={clsx(
            "w-5 h-5 shrink-0 rounded-md text-[10px] font-bold flex items-center justify-center",
            stageColor(stage.taskName)
          )}
        >
          {index + 1}
        </span>
        <span className="text-[13px] font-bold text-gray-800 leading-tight break-words">
          {stage.taskName}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {stage.role ? (
          <span
            className="inline-flex w-fit max-w-full items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700"
            title="Picked from the project's team by role"
          >
            <FiUsers className="w-3 h-3 shrink-0" />
            <span className="truncate">{stage.role}</span>
          </span>
        ) : (
          <span
            className="inline-flex w-fit items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
            title="No role set. On a project without this person the stage falls back to their role. Edit the flow to choose a role."
          >
            Specific person
          </span>
        )}
        {pinnedName && (
          <span
            className="flex items-center gap-1 text-[11px] text-gray-500"
            title={
              stage.role
                ? "Preferred person. Used when they are on the project's team."
                : "Always this person"
            }
          >
            <FiUser className="w-3 h-3 shrink-0 text-gray-400" />
            <span className="truncate">{stage.role ? `Prefers ${pinnedName}` : pinnedName}</span>
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {share !== null ? (
          <div className="flex-1" title={`${share}% of the task's time`}>
            <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${share}%` }} />
            </div>
            <span className="text-[10px] font-medium text-gray-400">{share}% of time</span>
          </div>
        ) : (
          <span />
        )}
        {flags.length > 0 && (
          <div className="flex items-center gap-1">
            {flags.map(({ Icon, label, tone }) => (
              <span key={label} title={label}>
                <Icon className={clsx("w-3 h-3", tone)} />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskFlowSection = ({
  taskFlows,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const flowsList = useMemo(() => taskFlows || [], [taskFlows]);
  const activeCount = flowsList.filter((flow) => flow.isActive).length;
  const counts = { all: flowsList.length, active: activeCount, paused: flowsList.length - activeCount };

  const visibleFlows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return flowsList.filter((flow) => {
      if (filter === "active" && !flow.isActive) return false;
      if (filter === "paused" && flow.isActive) return false;
      if (!term) return true;
      return (
        flow.name?.toLowerCase().includes(term) ||
        (flow.flows || []).some(
          (stage) =>
            stage.taskName?.toLowerCase().includes(term) || stage.role?.toLowerCase().includes(term)
        )
      );
    });
  }, [flowsList, search, filter]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-[13px] font-medium text-gray-400">Loading pipelines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <FiTrash2 className="text-red-500 w-5 h-5" />
        </div>
        <h3 className="text-[14px] font-bold text-red-900 mb-1">Failed to load flows</h3>
        <p className="text-[12px] text-red-600/70 max-w-xs">{error.message}</p>
      </div>
    );
  }

  if (flowsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed px-6 text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <FiLayers className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-800 mb-1">No task flows yet</h3>
        <p className="text-[12px] text-gray-500 max-w-sm">
          A flow is a reusable chain of stages, like Content → Design → Publish. Each stage
          names a role, and the person is picked from the project&apos;s team when you create a
          task. Use &quot;Add Flow&quot; to create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search + status filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        <div className="relative sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flows, stages or roles"
            className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-[12px] font-medium outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
          />
        </div>
        <div className="inline-flex rounded-xl bg-gray-50 border border-gray-100 p-0.5 self-start">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={clsx(
                "px-3 py-1 rounded-lg text-[11px] font-bold transition-all",
                filter === key ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {label} <span className="font-medium opacity-70">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {visibleFlows.length === 0 && (
        <div className="py-10 text-center text-[12px] text-gray-400 bg-white rounded-2xl border border-gray-100">
          No flows match your search.
        </div>
      )}

      {visibleFlows.map((flow) => {
        const stages = flow.flows || [];
        const totalWeight = stages.reduce((sum, stage) => sum + (stage.weightage ?? 1), 0);

        return (
          <div
            key={flow._id}
            className={clsx(
              "bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3",
              !flow.isActive && "bg-gray-50/60"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={clsx(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0",
                    flow.isActive ? "bg-purple-500 shadow-purple-500/20" : "bg-gray-300"
                  )}
                >
                  <FiLayers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[14px] font-bold text-gray-800 break-words">{flow.name}</h3>
                    <span
                      className={clsx(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border",
                        flow.isActive
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      )}
                    >
                      <span
                        className={clsx(
                          "w-1.5 h-1.5 rounded-full mr-1.5",
                          flow.isActive ? "bg-green-500" : "bg-gray-400"
                        )}
                      />
                      {flow.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {stages.length} {stages.length === 1 ? "stage" : "stages"}
                    {!flow.isActive && " · hidden from the Add Task form"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(flow)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] font-bold text-gray-600 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all"
                >
                  <FiEdit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => (flow.isActive ? onDelete(flow) : onRestore(flow))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] font-bold text-gray-600 hover:text-purple-600 hover:border-purple-100 hover:bg-purple-50 transition-all"
                  title={flow.isActive ? "Hide this flow from the Add Task form" : "Show this flow in the Add Task form"}
                >
                  {flow.isActive ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5" />}
                  {flow.isActive ? "Pause" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => onPermanentDelete(flow)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                  title="Delete permanently"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className={clsx("flex flex-wrap items-stretch gap-y-2", !flow.isActive && "opacity-70")}>
              {stages.map((stage, index) => (
                <React.Fragment key={stage._id || index}>
                  <StageCard stage={stage} index={index} totalWeight={totalWeight} />
                  {index < stages.length - 1 && (
                    <FiChevronRight className="self-center mx-1 w-4 h-4 text-gray-300 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })}

      <p className="px-1 text-[11px] text-gray-400">
        {activeCount} active · {flowsList.length - activeCount} paused
      </p>
    </div>
  );
};

export default TaskFlowSection;
