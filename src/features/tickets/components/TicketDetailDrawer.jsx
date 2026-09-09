import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useGetAllEmployees } from "../../../api/hooks";
import {
  useAddTicketComment,
  useAssignTicket,
  useUpdateTicketStatus,
} from "../hooks/useTickets";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  formatStatus,
  personName,
  priorityStyles,
  statusStyles,
  typeStyles,
} from "../utils";

const TicketDetailDrawer = ({
  ticket,
  onClose,
  canAssign,
  canChangeStatus,
  isAssigneeView,
}) => {
  const { data: employeesData } = useGetAllEmployees(!!ticket && canAssign);
  const assignMutation = useAssignTicket();
  const statusMutation = useUpdateTicketStatus();
  const commentMutation = useAddTicketComment();
  const [note, setNote] = useState("");

  if (!ticket) return null;

  const employees = employeesData?.employees || [];
  const isClosed = ticket.status === "closed" || ticket.status === "resolved";
  const canClose = (canChangeStatus || isAssigneeView) && !isClosed;

  const handleAssign = async (assignedTo) => {
    try {
      await assignMutation.mutateAsync({
        ticketId: ticket._id,
        assignedTo: assignedTo || null,
      });
      toast.success(assignedTo ? "Ticket assigned" : "Assignee cleared");
    } catch (error) {
      toast.error(error?.message || "Failed to assign ticket");
    }
  };

  const handleStatus = async (status) => {
    try {
      await statusMutation.mutateAsync({ ticketId: ticket._id, status });
      toast.success(status === "closed" ? "Issue closed" : "Status updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  const handleNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await commentMutation.mutateAsync({
        ticketId: ticket._id,
        message: note.trim(),
      });
      setNote("");
      toast.success("Note added");
    } catch (error) {
      toast.error(error?.message || "Failed to add note");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[80] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-[#F8FAFC] z-[90] shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-white flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wider">
              {ticket.ticketNumber}
            </p>
            <h2 className="text-[17px] font-bold text-slate-900 mt-1">{ticket.title}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {ticket.project?.name || "Client"} · raised by {personName(ticket.createdBy)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${typeStyles[ticket.type]}`}>
                {ticket.type === "complaint" ? "Complaint" : "Issue"}
              </span>
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${priorityStyles[ticket.priority]}`}>
                {PRIORITY_OPTIONS.find((option) => option.value === ticket.priority)?.label}
              </span>
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${statusStyles[ticket.status]}`}>
                {formatStatus(ticket.status)}
              </span>
            </div>
            {ticket.description && (
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{ticket.description}</p>
            )}
          </div>

          {isAssigneeView ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              {canClose ? (
                <button
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() => handleStatus("closed")}
                  className="w-full h-10 rounded-xl bg-[#3F8CFF] text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
                >
                  Close issue
                </button>
              ) : (
                <p className="text-xs text-center text-slate-400 font-medium">This issue is closed.</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Status</label>
                <select
                  value={ticket.status}
                  disabled={!canChangeStatus || statusMutation.isPending}
                  onChange={(e) => handleStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Assigned to</label>
                <select
                  value={ticket.assignedTo?._id || ""}
                  disabled={!canAssign || assignMutation.isPending}
                  onChange={(e) => handleAssign(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 bg-slate-50 outline-none disabled:opacity-50"
                >
                  <option value="">Unassigned</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {personName(employee)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <h3 className="text-xs font-bold text-slate-700 mb-3">Notes</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(ticket.comments || []).length === 0 ? (
                <p className="text-xs text-slate-400">No notes yet.</p>
              ) : (
                ticket.comments.map((item) => (
                  <div key={item._id} className="text-xs">
                    <p className={`font-semibold ${item.isSystem ? "text-slate-400" : "text-slate-700"}`}>
                      {personName(item.user)}
                      <span className="font-medium text-slate-400 ml-2">
                        {item.createdAt ? format(new Date(item.createdAt), "MMM d, h:mm a") : ""}
                      </span>
                    </p>
                    <p className={item.isSystem ? "text-slate-400 italic" : "text-slate-600"}>
                      {item.message}
                    </p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleNote} className="mt-3 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none bg-slate-50"
              />
              <button
                type="submit"
                disabled={commentMutation.isPending || !note.trim()}
                className="px-3 h-9 rounded-xl bg-[#3F8CFF] text-white text-xs font-semibold disabled:opacity-50"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDetailDrawer;
