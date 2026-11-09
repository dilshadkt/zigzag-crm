import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  ChevronRight,
  IndianRupee,
  Phone,
  RefreshCcw,
  Settings2,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLeadTeamReport } from "../leads/api";
import MemberDrawer from "./MemberDrawer";
import TargetsModal from "./TargetsModal";
import {
  PERIODS,
  SORTS,
  barTone,
  compactMoney,
  initials,
  oneDecimal,
  percentOf,
  presenceMeta,
  sortRows,
} from "./helpers";

// A thin progress bar with an optional marker for where the person should be by now.
const Bar = ({ percent, pace, className = "" }) => (
  <div className={`relative h-1.5 overflow-hidden rounded-full bg-slate-100 ${className}`}>
    <div className={`h-full rounded-full ${barTone(percent)}`} style={{ width: `${Math.min(100, percent ?? 0)}%` }} />
    {pace !== null && pace !== undefined && pace > 0 && pace < 100 && (
      <span className="absolute top-0 h-full w-0.5 bg-slate-500/60" style={{ left: `${pace}%` }} />
    )}
  </div>
);

const Tile = ({ icon: Icon, tone, label, value, hint, percent, pace }) => (
  <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4">
    <div className="mb-2 flex items-center gap-2">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    </div>
    <p className="text-xl font-black text-[#0A1629]">{value}</p>
    {percent !== null && percent !== undefined && <Bar percent={percent} pace={pace} className="mt-1.5" />}
    {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
  </div>
);

const Avatar = ({ user }) =>
  user.profileImage ? (
    <img src={user.profileImage} alt="" className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover" />
  ) : (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#3f8cff]">
      {initials(user.name)}
    </span>
  );

const StatusPill = ({ presence }) => {
  const meta = presenceMeta(presence);
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

// "12 / 40" with a bar underneath. Without a target it just shows the number.
const Progress = ({ actual, target, pace, format = oneDecimal }) => {
  const percent = percentOf(actual, target);
  return (
    <div className="min-w-[88px]">
      <p className="text-xs font-bold text-slate-800">
        {format(actual)}
        {target ? <span className="font-medium text-slate-400"> / {format(target)}</span> : null}
      </p>
      {target ? <Bar percent={percent} pace={pace} className="mt-1" /> : <p className="mt-0.5 text-[10px] text-slate-300">no target</p>}
    </div>
  );
};

const Count = ({ value, warn }) => (
  <span className={`text-xs font-bold ${value > 0 && warn ? warn : "text-slate-700"}`}>{value}</span>
);

const GRID = "xl:grid-cols-[minmax(150px,1.3fr)_112px_96px_96px_96px_96px_84px_56px_44px_16px]";

const SalesTeamPanel = () => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState("month");
  const [sort, setSort] = useState("score");
  const [selectedId, setSelectedId] = useState(null);
  const [targetsFor, setTargetsFor] = useState(null); // null = closed, "all" = open, or a user id to list first

  const { data: report, isLoading, isError, isFetching, refetch } = useLeadTeamReport(period);

  const rows = useMemo(() => sortRows(report?.rows || [], sort), [report, sort]);
  const selected = rows.find((row) => row.user._id === selectedId) || null;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[1.5rem] bg-white" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-[2rem] bg-white" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="rounded-[2rem] border border-slate-100 bg-white p-10 text-center">
        <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-amber-500" />
        <p className="text-sm font-semibold text-slate-700">Could not load the team report</p>
        <button type="button" onClick={() => refetch()} className="mt-3 rounded-xl bg-[#3f8cff] px-4 py-2 text-xs font-bold text-white">
          Try again
        </button>
      </div>
    );
  }

  const { totals, period: info } = report;
  const monthly = info.monthly;
  const callsPercent = percentOf(totals.calls, totals.targets.calls);
  const wonPercent = percentOf(totals.won, totals.targets.won);
  const wonPace = percentOf(totals.targets.expectedWon, totals.targets.won);
  const revenuePercent = percentOf(totals.wonValue, totals.targets.revenue);
  const revenuePace = percentOf(totals.targets.expectedRevenue, totals.targets.revenue);
  const scoreTarget = report.teamTarget.dailyScore || report.ruleDailyTarget;
  const scorePercent = totals.avgScore === null ? null : percentOf(Math.max(0, totals.avgScore), scoreTarget);
  const attention = totals.overdue + totals.untouched;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-[2rem] border border-slate-100 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Users className="h-4 w-4 text-[#3f8cff]" />
            Sales team · {info.label}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {totals.people} {totals.people === 1 ? "person" : "people"} · {info.workDays} working{" "}
            {info.workDays === 1 ? "day" : "days"} so far · shift {report.shift.start}–{report.shift.end}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-50 p-0.5">
            {PERIODS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPeriod(item.key)}
                className={`rounded-[10px] px-3 py-1.5 text-[11px] font-bold transition ${
                  period === item.key ? "bg-white text-[#3f8cff] shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["leadMemberAttention"] });
              refetch();
            }}
            aria-label="Refresh"
            title="Refresh"
            className="rounded-xl bg-slate-50 p-2 text-slate-400 hover:text-[#3f8cff]"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          {report.canEditTargets && (
            <button
              type="button"
              onClick={() => setTargetsFor("all")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3f8cff] px-4 py-2 text-[11px] font-bold text-white shadow-sm shadow-blue-100 hover:bg-[#337ae6]"
            >
              <Target className="h-3.5 w-3.5" />
              Set targets
            </button>
          )}
        </div>
      </div>

      {!report.enabled && (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-700">
          Lead scoring is switched off in Settings → Rules, so scores are not shown.
        </p>
      )}

      {/* Team totals */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-6">
        <Tile
          icon={Phone}
          tone="bg-blue-50 text-[#3f8cff]"
          label="Calls"
          value={totals.calls}
          percent={callsPercent}
          hint={
            totals.targets.calls
              ? `of ${totals.targets.calls} target · ${totals.callsToday} today`
              : `${totals.callsToday} today · no target set`
          }
        />
        <Tile
          icon={Award}
          tone="bg-violet-50 text-violet-600"
          label="Deals won"
          value={totals.won}
          percent={monthly ? wonPercent : null}
          pace={info.key === "month" ? wonPace : null}
          hint={
            monthly && totals.targets.won
              ? `of ${oneDecimal(totals.targets.won)} target`
              : `${totals.lost} lost${totals.winRate !== null ? ` · ${totals.winRate}% win rate` : ""}`
          }
        />
        <Tile
          icon={IndianRupee}
          tone="bg-emerald-50 text-emerald-600"
          label="Revenue"
          value={compactMoney(totals.wonValue)}
          percent={monthly ? revenuePercent : null}
          pace={info.key === "month" ? revenuePace : null}
          hint={monthly && totals.targets.revenue ? `of ${compactMoney(totals.targets.revenue)} target` : `Pipeline ${compactMoney(totals.pipelineValue)}`}
        />
        <Tile
          icon={Trophy}
          tone="bg-amber-50 text-amber-600"
          label="Avg daily score"
          value={totals.avgScore === null ? "—" : oneDecimal(totals.avgScore)}
          percent={scorePercent}
          hint={`target ${scoreTarget} a day`}
        />
        <Tile
          icon={AlertTriangle}
          tone="bg-rose-50 text-rose-600"
          label="Needs attention"
          value={attention}
          hint={`${totals.overdue} overdue · ${totals.untouched} never contacted`}
        />
        <Tile
          icon={Users}
          tone="bg-sky-50 text-sky-600"
          label="Working now"
          value={`${totals.activeNow} / ${totals.people}`}
          hint={totals.idle ? `${totals.idle} idle or not started` : "Everyone is on it"}
        />
      </div>

      {/* Team list */}
      <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-800">Team members</h3>
          <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            Sort by
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-lg border-none bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 focus:ring-2 focus:ring-blue-100"
            >
              {SORTS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto mb-2 h-6 w-6 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No one is on the sales team yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Give a position access to My Calls in Settings → Positions and its employees will show up here.
            </p>
          </div>
        ) : (
          <>
            {/* Column headings (desktop) */}
            <div className={`hidden gap-2 border-b border-slate-50 bg-slate-50/50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 xl:grid ${GRID}`}>
              <span>Member</span>
              <span>Status</span>
              <span>Calls today</span>
              <span>Calls</span>
              <span>Deals won</span>
              <span>Revenue</span>
              <span>Score today</span>
              <span>Overdue</span>
              <span>New</span>
              <span />
            </div>

            <ul className="divide-y divide-slate-50">
              {rows.map((row) => {
                const t = row.targets;
                return (
                  <li key={row.user._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.user._id)}
                      className={`group w-full px-4 py-3 text-left transition hover:bg-slate-50/70 xl:grid xl:items-center xl:gap-2 ${GRID}`}
                    >
                      {/* Member */}
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Avatar user={row.user} />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-slate-800 group-hover:text-[#3f8cff]">{row.user.name}</span>
                          <span className="block truncate text-[10px] text-slate-400">{row.user.position || "Sales"}</span>
                        </span>
                        <span className="ml-auto xl:hidden">
                          <StatusPill presence={row.presence} />
                        </span>
                      </span>

                      <span className="hidden xl:block">
                        <StatusPill presence={row.presence} />
                      </span>

                      {/* Mobile summary */}
                      <span className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 xl:hidden">
                        <span>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-slate-400">Calls today</span>
                          <Progress actual={row.today.calls} target={t.values.dailyCalls} />
                        </span>
                        <span>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-slate-400">Score today</span>
                          <Progress actual={row.score.today?.total ?? 0} target={t.values.dailyScore} />
                        </span>
                        <span>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-slate-400">Deals won</span>
                          <Progress actual={row.leads.won} target={monthly ? t.period.won : null} pace={info.key === "month" ? percentOf(t.expected.won, t.period.won) : null} />
                        </span>
                        <span>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-slate-400">Revenue</span>
                          <Progress actual={row.leads.wonValue} target={monthly ? t.period.revenue : null} format={compactMoney} pace={info.key === "month" ? percentOf(t.expected.revenue, t.period.revenue) : null} />
                        </span>
                        <span className="col-span-2 flex gap-4 text-[11px] text-slate-500">
                          <span>
                            Overdue <Count value={row.leads.overdue} warn="text-rose-600" />
                          </span>
                          <span>
                            Never contacted <Count value={row.leads.untouched} warn="text-amber-600" />
                          </span>
                          <span>
                            Calls <Count value={row.activity.calls} />
                          </span>
                        </span>
                      </span>

                      {/* Desktop cells */}
                      <span className="hidden xl:block">
                        <Progress actual={row.today.calls} target={t.values.dailyCalls} />
                      </span>
                      <span className="hidden xl:block">
                        <Progress actual={row.activity.calls} target={t.period.calls} />
                      </span>
                      <span className="hidden xl:block">
                        <Progress
                          actual={row.leads.won}
                          target={monthly ? t.period.won : null}
                          pace={info.key === "month" ? percentOf(t.expected.won, t.period.won) : null}
                        />
                      </span>
                      <span className="hidden xl:block">
                        <Progress
                          actual={row.leads.wonValue}
                          target={monthly ? t.period.revenue : null}
                          format={compactMoney}
                          pace={info.key === "month" ? percentOf(t.expected.revenue, t.period.revenue) : null}
                        />
                      </span>
                      <span className="hidden xl:block">
                        {row.score.today ? (
                          <>
                            <Progress actual={row.score.today.total} target={t.values.dailyScore} />
                            {row.score.avg !== null && (
                              <span className="text-[10px] text-slate-400">avg {oneDecimal(row.score.avg)}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </span>
                      <span className="hidden xl:block">
                        <Count value={row.leads.overdue} warn="text-rose-600" />
                      </span>
                      <span className="hidden xl:block">
                        <Count value={row.leads.newInPeriod} />
                      </span>
                      <ChevronRight className="hidden h-4 w-4 text-slate-300 group-hover:text-[#3f8cff] xl:block" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <p className="flex items-center gap-1.5 px-2 text-[11px] text-slate-400">
        <Settings2 className="h-3 w-3" />
        The thin mark on a bar is where the person should be by now. Scores come from the rules in Settings → Rules.
      </p>

      <MemberDrawer
        row={selected}
        report={report}
        canEditTargets={report.canEditTargets}
        onClose={() => setSelectedId(null)}
        onEditTargets={(id) => setTargetsFor(id)}
      />
      <TargetsModal
        isOpen={targetsFor !== null}
        focusUserId={targetsFor && targetsFor !== "all" ? targetsFor : null}
        onClose={() => setTargetsFor(null)}
      />
    </div>
  );
};

export default SalesTeamPanel;
