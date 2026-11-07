import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { FiCheckCircle, FiCircle, FiExternalLink, FiPhone } from "react-icons/fi";
import { useSetLeadTaskDone } from "../../leads/api";

const PRIORITY_TONE = {
  High: "bg-rose-50 text-rose-600",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-slate-100 text-slate-500",
};

const dueLabel = (value) => {
  if (!value) return { text: "No due date", overdue: false };
  const date = new Date(value);
  const overdue = date < new Date();
  return { text: `${overdue ? "Overdue · " : "Due "}${format(date, "EEE, d MMM · h:mm a")}`, overdue };
};

// Tasks raised from leads, shown in My Calls instead of the general task lists.
const LeadTaskList = ({ tasks, showDone, onToggleDone, loading, onOpenLead, onOpenTask, summary }) => {
  const { mutate: setDone, isPending } = useSetLeadTaskDone();

  const toggle = (task) => {
    const completing = !showDone;
    setDone(
      { taskId: task._id, done: completing },
      {
        onSuccess: () => toast.success(completing ? "Task done" : "Task reopened"),
        onError: (error) => toast.error(error?.response?.data?.message || "Could not update the task"),
      }
    );
  };

  return (
    <div className="space-y-2 lg:space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: false, label: `Open${summary?.open != null ? ` (${summary.open})` : ""}` },
          { id: true, label: "Done" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onToggleDone(item.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              showDone === item.id ? "bg-[#1F1F1F] text-white" : "bg-white text-[#7D8592] hover:text-[#1F1F1F]"
            }`}
          >
            {item.label}
          </button>
        ))}
        {!showDone && summary?.overdue > 0 && (
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            {summary.overdue} overdue
          </span>
        )}
        {!showDone && summary?.dueToday > 0 && (
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {summary.dueToday} due today
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-white" />
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-slate-200/60 bg-white px-3 py-8 text-center text-sm text-slate-400">
          {showDone
            ? "No completed lead tasks yet."
            : "No open tasks. Create one from a lead using the + Task button."}
        </div>
      ) : (
        tasks.map((task) => {
          const due = dueLabel(task.dueDate);
          return (
            <article key={task._id} className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white p-3 lg:p-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => toggle(task)}
                aria-label={showDone ? "Reopen task" : "Mark task done"}
                className="mt-0.5 shrink-0 text-slate-300 hover:text-emerald-500 disabled:opacity-50"
              >
                {showDone ? <FiCheckCircle className="h-5 w-5 text-emerald-500" /> : <FiCircle className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`truncate text-sm font-bold ${showDone ? "text-slate-400 line-through" : "text-slate-900"}`}>
                    {task.title}
                  </h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_TONE[task.priority] || PRIORITY_TONE.Medium}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{task.description}</p>}
                <p className={`mt-1 text-xs ${due.overdue && !showDone ? "font-semibold text-amber-700" : "text-slate-500"}`}>
                  {due.text}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  For{" "}
                  <button
                    type="button"
                    onClick={() => task.leadId && onOpenLead(task.leadId)}
                    className="font-semibold text-[#3F8CFF] hover:underline"
                  >
                    {task.leadName}
                  </button>
                  {task.leadPhone && (
                    <a href={`tel:${String(task.leadPhone).replace(/[^\d+]/g, "")}`} className="ml-2 inline-flex items-center gap-1 text-emerald-700">
                      <FiPhone className="h-3 w-3" />
                      {task.leadPhone}
                    </a>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenTask(task._id)}
                aria-label="Open task"
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <FiExternalLink className="h-4 w-4" />
              </button>
            </article>
          );
        })
      )}
    </div>
  );
};

export default LeadTaskList;
