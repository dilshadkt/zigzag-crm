// Small formatting helpers for the Sales team view.

export const money = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0);

// ₹3.2L, ₹1.4Cr, ₹850
export const compactMoney = (value) => {
  const n = Number(value) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n >= 100000000 ? 0 : 1).replace(/\.0$/, "")}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 0 : 1).replace(/\.0$/, "")}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${money(n)}`;
};

export const oneDecimal = (value) => {
  const n = Number(value) || 0;
  // Scores move in quarter points, so keep up to two decimals (2.25, 0.56) and drop trailing zeros
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
};

export const percentOf = (actual, target) => {
  if (!target || target <= 0) return null;
  return Math.max(0, Math.round((actual / target) * 100));
};

// Green when the target is met, blue while on the way, amber when well behind the pace.
export const barTone = (percent, paceRatio = 1) => {
  if (percent === null) return "bg-slate-200";
  if (percent >= 100) return "bg-emerald-500";
  if (percent >= paceRatio * 70) return "bg-[#3f8cff]";
  return "bg-amber-400";
};

export const duration = (minutes) => {
  if (minutes === null || minutes === undefined) return "";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// Where someone is right now, as a label and colours for a small pill.
export const presenceMeta = (presence = {}) => {
  switch (presence.state) {
    case "active":
      return { label: "Working now", tone: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" };
    case "idle":
      return { label: `Idle ${duration(presence.idleMinutes)}`, tone: "bg-amber-50 text-amber-700", dot: "bg-amber-500" };
    case "not_started":
      return { label: "Not started", tone: "bg-rose-50 text-rose-600", dot: "bg-rose-500" };
    case "no_activity":
      return { label: "No activity today", tone: "bg-rose-50 text-rose-600", dot: "bg-rose-500" };
    case "finished":
      return { label: "Finished for today", tone: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
    case "before_shift":
      return { label: "Shift not started", tone: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
    default:
      return { label: "Day off", tone: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
  }
};

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

export const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "7 days" },
  { key: "month", label: "This month" },
  { key: "lastMonth", label: "Last month" },
];

export const SORTS = [
  { key: "score", label: "Score today" },
  { key: "calls", label: "Calls" },
  { key: "won", label: "Deals won" },
  { key: "revenue", label: "Revenue" },
  { key: "overdue", label: "Overdue" },
];

export const sortRows = (rows, key) => {
  const pick = {
    score: (row) => row.score?.today?.total ?? -Infinity,
    calls: (row) => row.activity.calls,
    won: (row) => row.leads.won,
    revenue: (row) => row.leads.wonValue,
    overdue: (row) => row.leads.overdue,
  }[key];
  return [...rows].sort((a, b) => pick(b) - pick(a) || a.user.name.localeCompare(b.user.name));
};
