import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Pencil, X } from "lucide-react";
import { useLeadMemberAttention } from "../leads/api";
import KpiScoreCard from "../telecaller/components/KpiScoreCard";
import { barTone, compactMoney, initials, oneDecimal, percentOf, presenceMeta, duration } from "./helpers";

const SOURCE_LABEL = { person: "Personal", team: "Team default", rules: "Company rule", none: "" };

const TargetBar = ({ label, actual, target, source, format: fmt = oneDecimal, pace }) => {
  const percent = percentOf(actual, target);
  const pacePercent = pace && target ? percentOf(pace, target) : null;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="text-slate-800">
          <span className="font-bold">{fmt(actual)}</span>
          {target ? <span className="text-slate-400"> / {fmt(target)}</span> : <span className="text-slate-300"> · no target</span>}
        </span>
      </div>
      <div className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barTone(percent)}`} style={{ width: `${Math.min(100, percent ?? 0)}%` }} />
        {pacePercent !== null && pacePercent < 100 && (
          <span className="absolute top-0 h-full w-0.5 bg-slate-500/60" style={{ left: `${pacePercent}%` }} title="Where they should be by now" />
        )}
      </div>
      {target > 0 && (
        <p className="mt-0.5 flex justify-between text-[10px] text-slate-400">
          <span>{percent}%{pacePercent !== null && pacePercent < 100 ? ` · pace is ${fmt(pace)}` : ""}</span>
          <span>{SOURCE_LABEL[source] || ""}</span>
        </p>
      )}
    </div>
  );
};

const LeadList = ({ title, tone, leads, empty, dateKey, dateLabel, onOpen }) => (
  <div>
    <p className={`mb-1.5 text-[11px] font-bold uppercase tracking-wide ${tone}`}>{title}</p>
    {leads.length === 0 ? (
      <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-400">{empty}</p>
    ) : (
      <ul className="divide-y divide-slate-50 overflow-hidden rounded-xl border border-slate-100">
        {leads.map((lead) => (
          <li key={lead._id}>
            <button type="button" onClick={() => onOpen(lead._id)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50">
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-800">{lead.name}</span>
                <span className="block truncate text-[10px] text-slate-400">{lead.status || lead.phone || "—"}</span>
              </span>
              {lead[dateKey] && (
                <span className="shrink-0 text-[10px] font-medium text-slate-500">
                  {dateLabel} {format(new Date(lead[dateKey]), "d MMM")}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const MemberDrawer = ({ row, report, canEditTargets, onClose, onEditTargets }) => {
  const navigate = useNavigate();
  const userId = row?.user?._id;
  const { data: attention, isLoading: attentionLoading } = useLeadMemberAttention(userId);

  useEffect(() => {
    if (!row) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [row, onClose]);

  if (!row) return null;

  const presence = presenceMeta(row.presence);
  const { values, sources, period: periodTarget, expected } = row.targets;
  const monthly = report.period.monthly;
  const chart = row.series.map((day) => ({
    label: format(new Date(`${day.date}T00:00:00`), report.period.key === "today" ? "d MMM" : "d"),
    full: format(new Date(`${day.date}T00:00:00`), "EEE d MMM"),
    calls: day.calls,
    score: day.score,
  }));
  const totalStages = row.stages.reduce((sum, stage) => sum + stage.count, 0);
  const openLead = (id) => navigate(`/leads/${id}`);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-label={`${row.user.name} report`}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full flex-col bg-slate-50 shadow-2xl sm:max-w-[520px]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {row.user.profileImage ? (
              <img src={row.user.profileImage} alt="" className="h-11 w-11 rounded-full border border-slate-200 object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#3f8cff]">
                {initials(row.user.name)}
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-[#0A1629]">{row.user.name}</h2>
              <p className="truncate text-xs text-slate-500">{row.user.position || "Sales team"}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold ${presence.tone}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${presence.dot}`} />
                  {presence.label}
                </span>
                {row.presence.lastActivityAt && (
                  <span className="text-slate-400">last action {duration(row.presence.idleMinutes)} ago</span>
                )}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {/* Targets */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Against target · {report.period.label}</h3>
              {canEditTargets && (
                <button
                  type="button"
                  onClick={() => onEditTargets(row.user._id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#3f8cff]"
                >
                  <Pencil className="h-3 w-3" />
                  Set target
                </button>
              )}
            </div>
            <div className="space-y-3">
              <TargetBar label="Calls today" actual={row.today.calls} target={values.dailyCalls} source={sources.dailyCalls} />
              {report.period.key !== "today" && (
                <TargetBar label={`Calls · ${report.period.label.toLowerCase()}`} actual={row.activity.calls} target={periodTarget.calls} source={sources.dailyCalls} />
              )}
              <TargetBar
                label="Score today"
                actual={row.score.today?.total ?? 0}
                target={values.dailyScore}
                source={sources.dailyScore}
              />
              {monthly && (
                <>
                  <TargetBar label="Deals won" actual={row.leads.won} target={periodTarget.won} source={sources.monthlyWon} pace={expected.won} />
                  <TargetBar
                    label="Revenue"
                    actual={row.leads.wonValue}
                    target={periodTarget.revenue}
                    source={sources.monthlyRevenue}
                    format={compactMoney}
                    pace={expected.revenue}
                  />
                </>
              )}
            </div>
          </section>

          {/* Numbers for the period */}
          <section className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Calls", row.activity.calls],
              ["Connected", row.activity.connectRate === null ? "—" : `${row.activity.connectRate}%`],
              ["WhatsApp", row.activity.whatsapp],
              ["New leads", row.leads.newInPeriod],
              ["Won / Lost", `${row.leads.won} / ${row.leads.lost}`],
              ["Win rate", row.leads.winRate === null ? "—" : `${row.leads.winRate}%`],
              ["Tasks done", row.activity.tasksDone],
              ["Tasks overdue", row.activity.tasksOverdue],
              ["Pipeline", compactMoney(row.leads.pipelineValue)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-white px-2 py-2.5">
                <p className="text-base font-black text-[#0A1629]">{value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              </div>
            ))}
          </section>

          {/* Daily trend */}
          {chart.length > 1 && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Day by day</h3>
                <span className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#3f8cff]" />Calls</span>
                  <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-emerald-500" />Score</span>
                </span>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chart} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} interval="preserveStartEnd" />
                    <YAxis yAxisId="calls" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} allowDecimals={false} />
                    <YAxis yAxisId="score" orientation="right" hide />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "none", fontSize: 11 }}
                      labelFormatter={(_, items) => items?.[0]?.payload?.full || ""}
                    />
                    <Bar yAxisId="calls" dataKey="calls" name="Calls" fill="#3f8cff" radius={[3, 3, 0, 0]} maxBarSize={18} />
                    <Line yAxisId="score" dataKey="score" name="Score" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                {row.score.days > 0
                  ? `Average score ${oneDecimal(row.score.avg)} · on target ${row.score.onTarget} of ${row.score.days} working days`
                  : "No scored days in this period yet"}
              </p>
            </section>
          )}

          {/* Today's score, line by line */}
          <KpiScoreCard userId={userId} />

          {/* Where their open leads sit */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Open leads by stage</h3>
              <span className="text-[11px] font-semibold text-slate-500">{row.leads.open} open</span>
            </div>
            {row.stages.length === 0 ? (
              <p className="text-xs text-slate-400">No open leads.</p>
            ) : (
              <ul className="space-y-1.5">
                {row.stages.map((stage) => (
                  <li key={stage.statusId} className="text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
                        <span className="truncate">{stage.name}</span>
                      </span>
                      <span className="font-semibold text-slate-800">{stage.count}</span>
                    </div>
                    <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${(stage.count / totalStages) * 100}%`, backgroundColor: stage.color }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Leads that need a push */}
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-800">Needs attention</h3>
            {attentionLoading && <div className="h-24 animate-pulse rounded-xl bg-slate-50" />}
            {attention?.data && (
              <>
                <LeadList
                  title={`Overdue follow-ups · ${row.leads.overdue}`}
                  tone="text-rose-600"
                  leads={attention.data.overdue}
                  empty="Nothing overdue."
                  dateKey="scheduled"
                  dateLabel="due"
                  onOpen={openLead}
                />
                <LeadList
                  title={`Never contacted · ${row.leads.untouched}`}
                  tone="text-amber-600"
                  leads={attention.data.untouched}
                  empty="Every lead has been contacted."
                  dateKey="createdAt"
                  dateLabel="added"
                  onOpen={openLead}
                />
                <LeadList
                  title={`No next call booked · ${row.leads.noNextCall}`}
                  tone="text-slate-500"
                  leads={attention.data.noNextCall}
                  empty="Every open lead has a call booked."
                  dateKey="lastContactDate"
                  dateLabel="last spoke"
                  onOpen={openLead}
                />
              </>
            )}
            <button
              type="button"
              onClick={() => navigate(`/leads?owner=${row.user._id}`)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2 text-xs font-bold text-[#3f8cff] hover:bg-blue-50"
            >
              View all of {row.user.name.split(" ")[0]}&apos;s leads
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </section>
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default MemberDrawer;
