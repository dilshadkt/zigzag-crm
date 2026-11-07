import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiChevronDown, FiPlus, FiRotateCcw, FiSave, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import {
  useLeadKpiConfig,
  useLeadKpiTeam,
  useResetLeadKpiConfig,
  useSaveLeadKpiConfig,
} from "../../../features/leads/api";

const GROUPS = [
  { id: "activity", title: "Daily activity", hint: "Earned through calls and follow-up discipline." },
  { id: "milestone", title: "Milestones", hint: "Earned when a lead reaches a pipeline stage. Each lead counts once per stage." },
  { id: "penalty", title: "Penalties", hint: "Points taken away. They only apply on working days." },
  { id: "bonus", title: "Bonus", hint: "Extra points on top of the day's score." },
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CATEGORIES = ["", "New", "Contacted", "Qualified", "Hot", "Warm", "Cold", "Won", "Lost"];

const input =
  "rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-gray-300"}`}
  >
    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
  </button>
);

const sign = (points) => (points > 0 ? `+${points}` : String(points));

// How a day's score was made, line by line: credits and debits
const BreakdownLines = ({ day }) => (
  <div className="space-y-1 text-xs">
    {day.breakdown.filter((line) => line.count > 0).map((line) => (
      <p key={line.key} className="flex justify-between gap-3 text-gray-700">
        <span>
          {line.label} <span className="text-gray-400">× {line.count}</span>
        </span>
        <span className="font-semibold text-emerald-600">{sign(line.points)}</span>
      </p>
    ))}
    {day.penalties.map((line) => (
      <p key={line.key} className="flex justify-between gap-3 text-gray-700">
        <span>
          {line.label} <span className="text-gray-400">× {line.count}</span>
        </span>
        <span className="font-semibold text-rose-600">{sign(line.points)}</span>
      </p>
    ))}
    {day.breakdown.every((l) => !l.count) && day.penalties.length === 0 && (
      <p className="text-gray-400">No points yet.</p>
    )}
  </div>
);

const TeamPreview = () => {
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(null);
  const { data, isLoading, isFetching, refetch } = useLeadKpiTeam(date || undefined);
  const rows = data?.data || [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Team score preview</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Check your rules against real activity. Save your changes first; the scores below use the saved rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
          <button type="button" onClick={() => refetch()} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-400">Calculating…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">
          No one is scored yet. Scoring applies to employees whose position has access to My Calls.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {rows.map((row) => {
            const percent = Math.max(0, Math.min(100, Math.round((row.total / row.target) * 100)));
            return (
              <li key={row.user._id} className="py-3">
                <button type="button" onClick={() => setOpen(open === row.user._id ? null : row.user._id)} className="flex w-full items-center gap-3 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-gray-800">{row.user.name}</span>
                    <span className="block truncate text-[11px] text-gray-400">{row.user.position}</span>
                  </span>
                  <span className="hidden w-40 sm:block">
                    <span className="block h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <span className={`block h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${percent}%` }} />
                    </span>
                  </span>
                  <span className="w-24 text-right text-sm font-bold text-gray-800">
                    {row.total} <span className="text-xs font-medium text-gray-400">/ {row.target}</span>
                  </span>
                  <FiChevronDown className={`h-4 w-4 text-gray-400 transition ${open === row.user._id ? "rotate-180" : ""}`} />
                </button>
                {open === row.user._id && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <BreakdownLines day={row} />
                    <p className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-xs font-bold text-gray-800">
                      <span>Total</span>
                      <span>
                        {row.earned} − {Math.abs(row.penaltyTotal)} = {row.total}
                      </span>
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const RuleRow = ({ rule, statuses, onChange, onRemove }) => {
  const debit = rule.kind === "debit";
  const set = (patch) => onChange({ ...rule, ...patch });
  const setParam = (key, value) =>
    set({ params: rule.params.map((param) => (param.key === key ? { ...param, value } : param)) });

  return (
    <div className={`rounded-lg border p-3 ${rule.enabled ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50/60"}`}>
      <div className="flex items-start gap-3">
        <Toggle checked={rule.enabled} onChange={(enabled) => set({ enabled })} label={`Turn ${rule.label} on or off`} />
        <div className="min-w-0 flex-1">
          {rule.custom ? (
            <input value={rule.label} onChange={(e) => set({ label: e.target.value })} maxLength={80} className={`${input} w-full font-semibold`} />
          ) : (
            <p className="text-sm font-semibold text-gray-800">{rule.label}</p>
          )}
          <p className="mt-0.5 text-xs text-gray-500">{rule.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`text-sm font-bold ${debit ? "text-rose-600" : "text-emerald-600"}`}>{debit ? "−" : "+"}</span>
          <input
            type="number"
            min="0"
            step="0.25"
            value={rule.points}
            onChange={(e) => set({ points: e.target.value === "" ? "" : Number(e.target.value) })}
            aria-label={`${rule.label} points`}
            className={`${input} w-20`}
          />
          {rule.custom && (
            <button type="button" onClick={onRemove} aria-label="Delete rule" className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600">
              <FiTrash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {rule.enabled && (
        <div className="mt-3 grid gap-3 pl-12 sm:grid-cols-2 lg:grid-cols-3">
          {rule.trigger && (
            <>
              <label className="text-xs text-gray-500 sm:col-span-2">
                Pipeline stage name(s), comma separated
                <input
                  list="lead-kpi-statuses"
                  value={rule.trigger.statusNames}
                  onChange={(e) => set({ trigger: { ...rule.trigger, statusNames: e.target.value } })}
                  placeholder="e.g. Visited, Walk-in Done"
                  className={`${input} mt-1 w-full`}
                />
              </label>
              <label className="text-xs text-gray-500">
                or any stage in category
                <select
                  value={rule.trigger.statusCategory}
                  onChange={(e) => set({ trigger: { ...rule.trigger, statusCategory: e.target.value } })}
                  className={`${input} mt-1 w-full`}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category || "None"}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {rule.params.map((param) => (
            <label key={param.key} className="text-xs text-gray-500">
              {param.label}
              <span className="mt-1 flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={param.value}
                  onChange={(e) => setParam(param.key, e.target.value === "" ? "" : Number(e.target.value))}
                  className={`${input} w-24`}
                />
                {param.unit && <span>{param.unit}</span>}
              </span>
            </label>
          ))}
          <label className="text-xs text-gray-500">
            Max points per day (0 = no limit)
            <input
              type="number"
              min="0"
              value={rule.dailyCap}
              onChange={(e) => set({ dailyCap: e.target.value === "" ? "" : Number(e.target.value) })}
              className={`${input} mt-1 block w-24`}
            />
          </label>
        </div>
      )}
      <datalist id="lead-kpi-statuses">
        {statuses.map((status) => (
          <option key={status.name} value={status.name} />
        ))}
      </datalist>
    </div>
  );
};

const LeadKpiRulesSection = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "company-admin";
  const { data, isLoading } = useLeadKpiConfig();
  const save = useSaveLeadKpiConfig();
  const reset = useResetLeadKpiConfig();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (data?.data) setConfig(data.data);
  }, [data]);

  if (isLoading || !config) return <div className="p-4 text-sm text-gray-500">Loading lead team rules…</div>;
  const statuses = data?.statuses || [];

  const setRule = (key, next) =>
    setConfig((current) => ({ ...current, rules: current.rules.map((rule) => (rule.key === key ? next : rule)) }));
  const set = (patch) => setConfig((current) => ({ ...current, ...patch }));

  const addCustom = () =>
    setConfig((current) => ({
      ...current,
      rules: [
        ...current.rules,
        {
          key: `custom_${Date.now()}`,
          custom: true,
          group: "milestone",
          kind: "credit",
          label: "New milestone",
          description: "Lead moved to the stage below.",
          points: 5,
          enabled: true,
          dailyCap: 0,
          trigger: { statusNames: "", statusCategory: "" },
          params: [],
        },
      ],
    }));

  const handleSave = () => {
    const body = {
      enabled: config.enabled,
      dailyTarget: Number(config.dailyTarget),
      workStart: config.workStart,
      workEnd: config.workEnd,
      utcOffsetMinutes: Number(config.utcOffsetMinutes),
      workDays: config.workDays,
      rules: config.rules.map((rule) => ({
        key: rule.key,
        enabled: rule.enabled,
        points: Number(rule.points) || 0,
        dailyCap: Number(rule.dailyCap) || 0,
        ...(rule.custom ? { label: rule.label } : {}),
        ...(rule.trigger ? { trigger: rule.trigger } : {}),
        params: rule.params.map((param) => ({ key: param.key, value: Number(param.value) || 0 })),
      })),
    };
    save.mutate(body, {
      onSuccess: () => toast.success("Lead team rules saved"),
      onError: (error) => toast.error(error?.response?.data?.message || "Could not save the rules"),
    });
  };

  const handleReset = () => {
    if (!window.confirm("Reset all lead team rules to the defaults? Custom milestones will be removed.")) return;
    reset.mutate(undefined, {
      onSuccess: () => toast.success("Rules reset to defaults"),
      onError: () => toast.error("Could not reset the rules"),
    });
  };

  const toggleDay = (day) =>
    set({ workDays: config.workDays.includes(day) ? config.workDays.filter((d) => d !== day) : [...config.workDays, day].sort() });

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Lead team score (telecallers & sales)</h3>
            <p className="mt-1 max-w-2xl text-xs text-gray-500">
              Each person starts the day at 0. Every call, follow-up and milestone <b className="text-emerald-600">adds</b> points, and every
              missed follow-up, uncontacted lead or idle stretch <b className="text-rose-600">takes points away</b>. The day&apos;s score is
              credits minus debits, measured against the daily target. Scores are recalculated from real lead activity every 30 minutes, so
              nothing is ever counted twice.
            </p>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-gray-600">
            Scoring on
            <Toggle checked={config.enabled} onChange={(enabled) => set({ enabled })} label="Turn lead team scoring on or off" />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-gray-500">
            Daily target (points)
            <input type="number" min="1" value={config.dailyTarget} onChange={(e) => set({ dailyTarget: e.target.value === "" ? "" : Number(e.target.value) })} className={`${input} mt-1 block w-full`} />
          </label>
          <label className="text-xs text-gray-500">
            Shift starts
            <input type="time" value={config.workStart} onChange={(e) => set({ workStart: e.target.value })} className={`${input} mt-1 block w-full`} />
          </label>
          <label className="text-xs text-gray-500">
            Shift ends
            <input type="time" value={config.workEnd} onChange={(e) => set({ workEnd: e.target.value })} className={`${input} mt-1 block w-full`} />
          </label>
          <label className="text-xs text-gray-500">
            Time zone (minutes from UTC; 330 = India)
            <input type="number" value={config.utcOffsetMinutes} onChange={(e) => set({ utcOffsetMinutes: e.target.value === "" ? "" : Number(e.target.value) })} className={`${input} mt-1 block w-full`} />
          </label>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500">Working days (penalties are skipped on other days)</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {WEEKDAYS.map((label, day) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${config.workDays.includes(day) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {GROUPS.map((group) => {
        const rules = config.rules.filter((rule) => rule.group === group.id);
        if (!rules.length) return null;
        return (
          <div key={group.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{group.title}</h3>
                <p className="text-xs text-gray-500">{group.hint}</p>
              </div>
              {group.id === "milestone" && (
                <button type="button" onClick={addCustom} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <FiPlus /> Custom milestone
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {rules.map((rule) => (
                <RuleRow
                  key={rule.key}
                  rule={rule}
                  statuses={statuses}
                  onChange={(next) => setRule(rule.key, next)}
                  onRemove={() => setConfig((current) => ({ ...current, rules: current.rules.filter((r) => r.key !== rule.key) }))}
                />
              ))}
            </div>
          </div>
        );
      })}

      {isAdmin ? (
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <FiRotateCcw /> Reset to defaults
          </button>
          <button type="button" onClick={handleSave} disabled={save.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            <FiSave /> {save.isPending ? "Saving…" : "Save rules"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400">Only the company admin can change these rules.</p>
      )}

      <TeamPreview />
    </div>
  );
};

export default LeadKpiRulesSection;
