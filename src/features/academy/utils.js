import { companyDayKey, companyTodayKey } from "../../utils/companyDate";

export { fmtMoney, fmtCompact, errorMessage, downloadCsv } from "../accounts/utils/format";

/** A stored date (UTC midnight of the chosen day) as "yyyy-MM-dd" for inputs. */
export const dayKey = (value) => (value ? companyDayKey(value) : "");
export const todayKey = () => companyTodayKey();

/** "25 Nov 2026" from a stored date or a "yyyy-MM-dd" key, without zone drift. */
export const fmtDay = (value) => {
  if (!value) return "—";
  const key = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? value : dayKey(value);
  if (!key) return "—";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
};

export const fmtPercent = (value) => (value === null || value === undefined ? "—" : `${Math.round(value)}%`);

export const fmtSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const ENROLLMENT_STATUS = {
  enrolled: { label: "Enrolled", cls: "bg-blue-50 text-blue-700" },
  ongoing: { label: "Ongoing", cls: "bg-emerald-50 text-emerald-700" },
  on_hold: { label: "On hold", cls: "bg-amber-50 text-amber-700" },
  completed: { label: "Completed", cls: "bg-violet-50 text-violet-700" },
  dropped: { label: "Dropped", cls: "bg-slate-100 text-slate-500" },
};

export const BATCH_STATUS = {
  upcoming: { label: "Upcoming", cls: "bg-blue-50 text-blue-700" },
  ongoing: { label: "Ongoing", cls: "bg-emerald-50 text-emerald-700" },
  completed: { label: "Completed", cls: "bg-slate-100 text-slate-600" },
};

export const FEE_STATUS = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700" },
  partly_paid: { label: "Part paid", cls: "bg-blue-50 text-blue-700" },
  due: { label: "Due", cls: "bg-slate-100 text-slate-600" },
  unpaid: { label: "Unpaid", cls: "bg-slate-100 text-slate-600" },
  overdue: { label: "Overdue", cls: "bg-red-50 text-red-700" },
};

export const SUBMISSION_STATUS = {
  submitted: { label: "To review", cls: "bg-amber-50 text-amber-700" },
  resubmit: { label: "Resubmit asked", cls: "bg-red-50 text-red-700" },
  reviewed: { label: "Reviewed", cls: "bg-emerald-50 text-emerald-700" },
  missing: { label: "Not submitted", cls: "bg-slate-100 text-slate-500" },
};

export const ATTENDANCE_STATUS = {
  present: { label: "Present", short: "P", cls: "bg-emerald-500 text-white", soft: "bg-emerald-50 text-emerald-700" },
  late: { label: "Late", short: "L", cls: "bg-amber-500 text-white", soft: "bg-amber-50 text-amber-700" },
  absent: { label: "Absent", short: "A", cls: "bg-red-500 text-white", soft: "bg-red-50 text-red-700" },
  excused: { label: "Excused", short: "E", cls: "bg-slate-500 text-white", soft: "bg-slate-100 text-slate-600" },
};

export const SOURCE_LABELS = {
  meta_ads: "Meta ads",
  google_ads: "Google ads",
  instagram: "Instagram",
  referral: "Referral",
  walk_in: "Walk-in",
  website: "Website",
  other: "Other",
};

export const MODE_LABELS = { offline: "Offline", online: "Online", weekend: "Weekend", hybrid: "Hybrid" };

export const PAYMENT_MODE_LABELS = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank transfer",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};

export const CLASS_DAYS = [
  ["mon", "Mon"],
  ["tue", "Tue"],
  ["wed", "Wed"],
  ["thu", "Thu"],
  ["fri", "Fri"],
  ["sat", "Sat"],
  ["sun", "Sun"],
];

export const portalUrl = () => `${window.location.origin}/student/login`;
export const verifyUrl = (number) => `${window.location.origin}/verify/certificate/${encodeURIComponent(number)}`;

/** wa.me link with the student's login details. */
export const whatsappCredentialsLink = ({ name, phone, login, password, academy = "the academy" }) => {
  const text = [
    `Hi ${name || ""},`,
    `Your student portal for ${academy} is ready.`,
    `Login: ${portalUrl()}`,
    `Phone/email: ${login}`,
    `Password: ${password}`,
    "Please change your password after you sign in.",
  ].join("\n");
  const digits = String(phone || "").replace(/\D/g, "");
  const to = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
};

/** Split a net fee into n monthly instalments starting on a day key. */
export const splitInstallments = (net, count, firstDay) => {
  const n = Math.max(1, Math.min(24, Number(count) || 1));
  const total = Math.round((Number(net) || 0) * 100);
  const base = Math.floor(total / n);
  const [y, m, d] = (firstDay || todayKey()).split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1 + i, 1));
    const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(d, last));
    const cents = i === n - 1 ? total - base * (n - 1) : base;
    return { label: `Instalment ${i + 1}`, dueDate: date.toISOString().slice(0, 10), amount: cents / 100 };
  });
};
