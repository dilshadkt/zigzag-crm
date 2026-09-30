import React, { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useCompanyProjects, useGetAllEmployees } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { useCreateTicket, useUpdateTicket } from "../hooks/useTickets";
import { PRIORITY_OPTIONS, TYPE_OPTIONS, personName } from "../utils";
import SearchableSelect from "../../../components/pages/campaigns/SearchableSelect";
import FileAndLinkUpload from "../../../components/shared/fileUpload";
import { processAttachments } from "../../../lib/attachmentUtils";
import { uploadSingleFile } from "../../../api/service";

const emptyForm = {
  project: "",
  title: "",
  description: "",
  notes: "",
  type: "issue",
  priority: "medium",
  assignedTo: "",
  attachments: [],
};

const CreateTicketDrawer = ({ isOpen, onClose, ticketToEdit }) => {
  const { companyId, user } = useAuth();
  const { data: projects } = useCompanyProjects(companyId || user?.company, 0, null, { view: "all_list" });
  const { data: employeesData } = useGetAllEmployees(isOpen, { view: 'select' });
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      if (ticketToEdit) {
        setForm({
          project: ticketToEdit.project?._id || ticketToEdit.project || "",
          title: ticketToEdit.title || "",
          description: ticketToEdit.description || "",
          notes: ticketToEdit.notes || "",
          type: ticketToEdit.type || "issue",
          priority: ticketToEdit.priority || "medium",
          assignedTo: ticketToEdit.assignedTo?._id || ticketToEdit.assignedTo || "",
          attachments: ticketToEdit.attachments || [],
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, ticketToEdit]);

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
    const toastId = toast.loading(ticketToEdit ? "Updating ticket..." : "Raising ticket...");
    try {
      let processedAttachments = form.attachments || [];
      const newAttachments = processedAttachments.filter(a => a.preview?.startsWith("blob:"));
      if (newAttachments.length > 0) {
        processedAttachments = await processAttachments(form.attachments, uploadSingleFile);
      }

      const payload = {
        project: form.project,
        title: form.title.trim(),
        description: form.description.trim(),
        notes: form.notes?.trim() || "",
        type: form.type,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        attachments: processedAttachments,
      };

      if (ticketToEdit) {
        await updateTicket.mutateAsync({ ticketId: ticketToEdit._id, data: payload });
        toast.success("Ticket updated", { id: toastId });
      } else {
        await createTicket.mutateAsync(payload);
        toast.success("Ticket raised", { id: toastId });
      }
      onClose();
    } catch (error) {
      toast.error(error?.message || `Failed to ${ticketToEdit ? 'update' : 'raise'} ticket`, { id: toastId });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[100] shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">{ticketToEdit ? "Edit ticket" : "Raise a ticket"}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {ticketToEdit ? "Update ticket details" : "Log an issue or complaint against a client"}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Client</label>
              <SearchableSelect
                name="project"
                value={form.project}
                onChange={(e) => setForm((prev) => ({ ...prev, project: e.target.value }))}
                options={projectOptions}
                placeholder="Select client"
              />
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
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 resize-none"
                placeholder="What happened, and what needs to be done?"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 resize-none"
                placeholder="Additional notes"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Attachments</label>
              <FileAndLinkUpload
                initialFiles={form.attachments.filter(f => f.type !== "link")}
                initialLinks={form.attachments.filter(f => f.type === "link")}
                onChange={(attachments) => setForm(prev => ({ ...prev, attachments }))}
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
              <SearchableSelect
                name="assignedTo"
                value={form.assignedTo}
                onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
                options={employeeOptions}
                placeholder="Unassigned"
              />
            </div>
          </div>

          <div className="p-5 border-t border-slate-100">
            <button
              type="submit"
              disabled={createTicket.isPending || updateTicket.isPending}
              className="w-full h-10 rounded-xl bg-[#3F8CFF] text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {createTicket.isPending || updateTicket.isPending ? "Saving..." : ticketToEdit ? "Save changes" : "Raise ticket"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTicketDrawer;
