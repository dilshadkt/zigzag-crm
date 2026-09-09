import React, { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useCompanyProjects, useGetAllEmployees } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { useCreateTicket } from "../hooks/useTickets";
import { PRIORITY_OPTIONS, TYPE_OPTIONS, personName } from "../utils";

const emptyForm = {
  project: "",
  title: "",
  description: "",
  type: "issue",
  priority: "medium",
  assignedTo: "",
};

const CreateTicketDrawer = ({ isOpen, onClose }) => {
  const { companyId, user } = useAuth();
  const { data: projects } = useCompanyProjects(companyId || user?.company, 0);
  const { data: employeesData } = useGetAllEmployees(isOpen);
  const createTicket = useCreateTicket();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) setForm(emptyForm);
  }, [isOpen]);

  const projectOptions = useMemo(
    () =>
      (projects || []).map((project) => ({
        value: project._id,
        label: project.name,
      })),
    [projects]
  );

  const employeeOptions = useMemo(
    () => [
      { value: "", label: "Unassigned" },
      ...(employeesData?.employees || []).map((employee) => ({
        value: employee._id,
        label: personName(employee),
      })),
    ],
    [employeesData]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project || !form.title.trim()) {
      toast.error("Client and title are required");
      return;
    }
    try {
      await createTicket.mutateAsync({
        project: form.project,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
      });
      toast.success("Ticket raised");
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to raise ticket");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[80] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[90] shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Raise a ticket</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Log an issue or complaint against a client
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Client</label>
              <select
                value={form.project}
                onChange={(e) => setForm((prev) => ({ ...prev, project: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none"
              >
                <option value="">Select client</option>
                {projectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none focus:bg-white focus:ring-1 focus:ring-slate-400"
                placeholder="Short summary of the issue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 resize-none"
                placeholder="What happened, and what needs to be done?"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Assign to</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none"
              >
                {employeeOptions.map((option) => (
                  <option key={option.value || "none"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100">
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="w-full h-10 rounded-xl bg-[#3F8CFF] text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {createTicket.isPending ? "Raising..." : "Raise ticket"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTicketDrawer;
