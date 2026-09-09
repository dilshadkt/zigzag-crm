export const personName = (person) =>
  `${person?.firstName || ""} ${person?.lastName || ""}`.trim() ||
  person?.name ||
  "Unassigned";

export const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const TYPE_OPTIONS = [
  { value: "issue", label: "Issue" },
  { value: "complaint", label: "Complaint" },
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const statusStyles = {
  open: "bg-blue-50 text-blue-600 border-blue-100",
  in_progress: "bg-amber-50 text-amber-600 border-amber-100",
  resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};

export const typeStyles = {
  issue: "bg-indigo-50 text-indigo-600 border-indigo-100",
  complaint: "bg-rose-50 text-rose-600 border-rose-100",
};

export const priorityStyles = {
  low: "bg-slate-50 text-slate-500 border-slate-200",
  medium: "bg-blue-50 text-blue-600 border-blue-100",
  high: "bg-amber-50 text-amber-600 border-amber-100",
  urgent: "bg-red-50 text-red-600 border-red-100",
};

export const formatStatus = (status) =>
  STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
