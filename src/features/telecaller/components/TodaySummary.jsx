import { FiAlertCircle, FiAward, FiCalendar, FiPhoneCall } from "react-icons/fi";

// Used until a manager sets a call target on the Lead Dashboard (Sales team tab)
const DEFAULT_GOAL = 40;

const money = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0);

const Tile = ({ icon: Icon, label, value, hint, tone }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white p-2.5 lg:p-3.5">
    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
      <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </div>
    <p className="mt-1.5 text-xl font-bold text-slate-900 lg:text-2xl">{value}</p>
    {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
  </div>
);

const TodaySummary = ({ summary = {} }) => {
  // The target is set by the manager; salespeople cannot change it
  const managerGoal = summary.callTarget > 0 ? summary.callTarget : null;
  const goal = managerGoal || DEFAULT_GOAL;
  const calls = summary.callsToday || 0;
  const percent = Math.min(100, Math.round((calls / goal) * 100));

  return (
    <div className="mb-2 grid grid-cols-2 gap-2 lg:mb-4 lg:grid-cols-4 lg:gap-3">
      <div className="rounded-xl border border-slate-200/60 bg-white p-2.5 lg:p-3.5">
        <div className="flex items-center">
          <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FiPhoneCall className="h-3.5 w-3.5" />
            </span>
            Calls today
          </span>
        </div>
        <p className="mt-1.5 text-xl font-bold text-slate-900 lg:text-2xl">
          {calls}
          <span className="text-sm font-medium text-slate-400"> / {goal}</span>
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-[#3F8CFF]"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        {managerGoal && <p className="mt-1 text-[11px] text-slate-400">Target set by your manager</p>}
      </div>
      <Tile
        icon={FiCalendar}
        label="Due today"
        value={summary.dueToday || 0}
        hint={summary.untouched ? `${summary.untouched} not contacted yet` : "All leads touched"}
        tone="bg-blue-50 text-blue-600"
      />
      <Tile
        icon={FiAlertCircle}
        label="Overdue"
        value={summary.overdue || 0}
        hint={summary.overdue ? "Call these first" : "You're on track"}
        tone="bg-amber-50 text-amber-600"
      />
      <Tile
        icon={FiAward}
        label="Won this month"
        value={summary.wonThisMonth || 0}
        hint={summary.wonValueThisMonth ? `₹${money(summary.wonValueThisMonth)}` : "No deal value yet"}
        tone="bg-violet-50 text-violet-600"
      />
    </div>
  );
};

export default TodaySummary;
