import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import { useGetAllEmployees } from "../../../api/hooks";
import { useCreateLeadTask } from "../../leads/api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#3f8cff] focus:ring-4 focus:ring-[#3f8cff]/10";

const pad = (n) => String(n).padStart(2, "0");
// Value for a datetime-local input, `days` from now at `hour`
const preset = (days, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const QUICK_TITLES = ["Send brochure", "Prepare quote", "Schedule site visit", "Share demo link"];
const DUE_PRESETS = [
  { label: "Today 6 PM", days: 0, hour: 18 },
  { label: "Tomorrow", days: 1, hour: 10 },
  { label: "In 3 days", days: 3, hour: 10 },
  { label: "Next week", days: 7, hour: 10 },
];

const chipClass = "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200";

const CreateLeadTaskModal = ({ lead, isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const myId = user?._id || user?.id || "";
  const { data: employeesData } = useGetAllEmployees(isOpen, { view: "select" });
  const { mutate: createTask, isPending } = useCreateLeadTask();
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "Medium", assignee: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({ title: "", description: "", dueDate: preset(1), priority: "Medium", assignee: myId });
      setError("");
    }
  }, [isOpen, myId]);

  if (!isOpen || !lead) return null;
  const employees = employeesData?.employees || [];
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Give the task a title");
      return;
    }
    createTask(
      {
        leadId: lead._id || lead.id,
        taskData: {
          title: form.title.trim(),
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
          assignedTo: form.assignee ? [form.assignee] : [],
        },
      },
      {
        onSuccess: (response) => {
          toast.success("Task created");
          onCreated?.(response?.data);
          onClose();
        },
        onError: (err) => setError(err?.response?.data?.message || "Could not create the task"),
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            New task · {lead.name || lead.contact?.name || "Lead"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <FiX />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <input
              value={form.title}
              onChange={(event) => set({ title: event.target.value })}
              placeholder="What needs to be done?"
              maxLength={200}
              autoFocus
              className={inputClass}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_TITLES.map((title) => (
                <button key={title} type="button" onClick={() => set({ title })} className={chipClass}>
                  {title}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={form.description}
            onChange={(event) => set({ description: event.target.value })}
            placeholder="Details (optional)"
            rows={3}
            className={`${inputClass} resize-none`}
          />

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Due</label>
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(event) => set({ dueDate: event.target.value })}
              className={inputClass}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DUE_PRESETS.map((item) => (
                <button key={item.label} type="button" onClick={() => set({ dueDate: preset(item.days, item.hour) })} className={chipClass}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Assign to</label>
              <select value={form.assignee} onChange={(event) => set({ assignee: event.target.value })} className={inputClass}>
                <option value={myId}>Me</option>
                {employees
                  .filter((person) => person._id !== myId)
                  .map((person) => (
                    <option key={person._id} value={person._id}>
                      {`${person.firstName || ""} ${person.lastName || ""}`.trim() || "Unnamed"}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Priority</label>
              <select value={form.priority} onChange={(event) => set({ priority: event.target.value })} className={inputClass}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-xl bg-[#3f8cff] py-2.5 text-sm font-semibold text-white hover:bg-[#2f6bff] disabled:opacity-60"
          >
            {isPending ? "Creating…" : "Create task"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default CreateLeadTaskModal;
