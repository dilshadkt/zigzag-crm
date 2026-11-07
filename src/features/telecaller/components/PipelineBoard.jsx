import { useState } from "react";
import { format } from "date-fns";

const money = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0);

const nextCall = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : format(date, "d MMM, h:mm a");
};

const stageLabel = (stage) => {
  if (stage.category === "Won") return "Won";
  if (stage.category === "Lost") return "Lost";
  return "";
};

// Kanban view of the sales person's leads. Drag a card to another column, or use the select on touch screens.
const PipelineBoard = ({ pipeline, loading, onMove, onOpen }) => {
  const [dragging, setDragging] = useState(null);
  const [overKey, setOverKey] = useState(null);
  const stages = pipeline?.stages || [];

  const drop = (stage) => {
    setOverKey(null);
    if (dragging && dragging.stageKey !== stage.key) onMove(dragging.lead, stage);
    setDragging(null);
  };

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-white" />;
  if (stages.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-10 text-center text-sm text-slate-400">
        No pipeline stages are set up yet. Add them in Lead Settings → Pipeline Stages.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {pipeline?.truncated && (
        <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Showing your 400 most recently updated leads.
        </p>
      )}
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
        {stages.map((stage) => (
          <section
            key={stage.key}
            onDragOver={(event) => {
              event.preventDefault();
              setOverKey(stage.key);
            }}
            onDragLeave={() => setOverKey((current) => (current === stage.key ? null : current))}
            onDrop={() => drop(stage)}
            className={`flex min-h-0 w-[260px] shrink-0 flex-col rounded-2xl border bg-slate-50/70 p-2 lg:w-0 lg:min-w-[250px] lg:flex-1 ${
              overKey === stage.key ? "border-[#3F8CFF] bg-blue-50/50" : "border-slate-200/60"
            }`}
          >
            <header className="mb-2 px-1.5 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="truncate">{stage.name}</span>
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  {stage.count}
                </span>
              </div>
              {stage.value > 0 && <p className="mt-0.5 text-[11px] text-slate-400">₹{money(stage.value)}</p>}
            </header>

            <div className="min-h-[80px] flex-1 space-y-2 overflow-y-auto">
              {stage.leads.length === 0 && (
                <p className="px-2 py-4 text-center text-[11px] text-slate-300">Drop leads here</p>
              )}
              {stage.leads.map((lead) => (
                <article
                  key={lead._id}
                  draggable
                  onDragStart={() => setDragging({ lead, stageKey: stage.key })}
                  onDragEnd={() => {
                    setDragging(null);
                    setOverKey(null);
                  }}
                  className="cursor-grab rounded-xl border border-slate-200/70 bg-white p-2.5 active:cursor-grabbing"
                >
                  <button type="button" onClick={() => onOpen(lead)} className="block w-full text-left">
                    <p className="truncate text-xs font-bold text-slate-900">{lead.name || "Untitled lead"}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {lead.project?.name || lead.companyName || lead.phone || "—"}
                    </p>
                  </button>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="truncate">
                      {lead.isFollowUp && lead.scheduled ? `Call ${nextCall(lead.scheduled)}` : "No call scheduled"}
                    </span>
                    {(lead.dealValue || lead.budget) > 0 && (
                      <span className="shrink-0 font-semibold text-slate-600">₹{money(lead.dealValue || lead.budget)}</span>
                    )}
                  </div>
                  <select
                    aria-label={`Move ${lead.name || "lead"} to another stage`}
                    value={stage.key}
                    onChange={(event) => {
                      const target = stages.find((item) => item.key === event.target.value);
                      if (target && target.key !== stage.key) onMove(lead, target);
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-1 text-[11px] text-slate-600 outline-none lg:hidden"
                  >
                    {stages.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.name}
                        {stageLabel(item) ? ` (${stageLabel(item)})` : ""}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PipelineBoard;
