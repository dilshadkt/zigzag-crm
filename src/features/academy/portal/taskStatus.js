import { SUBMISSION_STATUS, dayKey, todayKey } from "../utils";

/** Task states the way a student reads them. */
export const TASK_STATUS = {
  ...SUBMISSION_STATUS,
  submitted: { label: "Submitted", cls: "bg-blue-50 text-blue-700" },
  resubmit: { label: "Please resubmit", cls: "bg-red-50 text-red-700" },
  todo: { label: "To do", cls: "bg-amber-50 text-amber-700" },
  overdue: { label: "Overdue", cls: "bg-red-50 text-red-700" },
};

export const statusOf = (task) => {
  if (task.submission) return task.submission.status;
  return task.dueDate && dayKey(task.dueDate) < todayKey() ? "overdue" : "todo";
};

export const isOpenTask = (task) => ["todo", "overdue", "resubmit"].includes(statusOf(task));
