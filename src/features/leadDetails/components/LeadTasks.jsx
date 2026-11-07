import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiCircle, FiPlus } from "react-icons/fi";
import { useGetLeadTasks } from "../../leads/api";

const DONE = ["completed", "approved", "client-approved"];

const LeadTasks = ({ leadId, onCreate }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetLeadTasks(leadId);
  const tasks = data?.data || [];

  return (
    <div className="space-y-3 rounded-3xl bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Tasks for this lead</h3>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#3f8cff] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2f6bff]"
        >
          <FiPlus /> New task
        </button>
      </div>
      {isLoading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No tasks yet. Create one to track what to do next.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const done = DONE.includes(task.status);
            const overdue = !done && task.dueDate && new Date(task.dueDate) < new Date();
            const people = (task.assignedTo || []).map((person) => person.firstName).filter(Boolean).join(", ");
            return (
              <li key={task._id}>
                <button
                  type="button"
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="flex w-full items-start gap-3 py-3 text-left hover:bg-slate-50/60"
                >
                  {done ? (
                    <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />
                  ) : (
                    <FiCircle className="mt-0.5 shrink-0 text-slate-300" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${done ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {task.title}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {people || "Unassigned"} · {task.priority}
                      {task.dueDate && (
                        <span className={overdue ? "font-semibold text-rose-500" : ""}>
                          {" "}· due {format(new Date(task.dueDate), "d MMM, h:mm a")}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-500">
                    {task.status.replace("-", " ")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LeadTasks;
