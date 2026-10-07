import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { FiX, FiTrash2, FiBell } from "react-icons/fi";
import { useGetAllEmployees } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import {
  useAddTicketComment,
  useAssignTicket,
  useUpdateTicketMentions,
  useUpdateTicketStatus,
  useDeleteTicket,
  useNudgeTicket,
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
import SearchableSelect from "../../../components/pages/campaigns/SearchableSelect";
import FileAndLinkUpload from "../../../components/shared/fileUpload";
import PersonBadge from "./PersonBadge";
import MentionPicker from "./MentionPicker";

const TicketDetailDrawer = ({
  ticket,
  onClose,
  canAssign,
  canMention,
  canChangeStatus,
  isAssigneeView,
  isAdmin,
  onEdit,
}) => {
  const { user } = useAuth();
  const { data: employeesData } = useGetAllEmployees(!!ticket && (canAssign || canMention), { view: 'select' });
  const assignMutation = useAssignTicket();
  const mentionMutation = useUpdateTicketMentions();
  const statusMutation = useUpdateTicketStatus();
  const commentMutation = useAddTicketComment();
  const deleteMutation = useDeleteTicket();
  const nudgeMutation = useNudgeTicket();
  const [note, setNote] = useState("");

  const employeeOptions = React.useMemo(() => {
    const opts = [{ value: "", label: "Unassigned" }];
    if (employeesData?.employees) {
      opts.push(
        ...employeesData.employees.map((emp) => ({
          value: emp._id,
          label: personName(emp),
        }))
      );
    }
    return opts;
  }, [employeesData]);

  if (!ticket) return null;

  const employees = employeesData?.employees || [];
  const isClosed = ticket.status === "closed" || ticket.status === "resolved";
  const createdById = ticket.createdBy?._id || ticket.createdBy;
  const isCreator = String(createdById) === String(user?._id || user?.id);
  const canNudge = isCreator && !!ticket.assignedTo && !isClosed;
  const canClose = canChangeStatus && !isClosed;
  const mentionIds = (ticket.mentions || []).map((person) => person._id || person);

  const handleMentions = async (mentions) => {
    try {
      await mentionMutation.mutateAsync({ ticketId: ticket._id, mentions });
      toast.success(mentions.length ? "Mentions updated" : "Mentions cleared");
    } catch (error) {
      toast.error(error?.message || "Failed to update mentions");
    }
  };

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

  const handleNudge = async () => {
    try {
      await nudgeMutation.mutateAsync(ticket._id);
      toast.success("Reminder sent to assignee");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send reminder");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await deleteMutation.mutateAsync(ticket._id);
      toast.success("Ticket deleted");
      onClose();
    } catch (error) {
      toast.error(error?.message || "Failed to delete ticket");
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
            <div className="mt-2">
              <PersonBadge person={ticket.createdBy} size="h-8 w-8" />
              <p className="mt-1 text-xs text-slate-500">{ticket.project?.name || "Client"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {canNudge && (
              <button
                type="button"
                onClick={handleNudge}
                disabled={nudgeMutation.isPending}
                title="Remind assignee"
                className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50 relative"
              >
                <FiBell className="w-5 h-5" />
                {nudgeMutation.isPending && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </span>
                )}
              </button>
            )}
            {!isClosed && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                title="Edit ticket"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Delete ticket"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50">
              <FiX className="w-5 h-5" />
            </button>
          </div>
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
            {ticket.notes && (
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Additional Notes</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{ticket.notes}</p>
              </div>
            )}
            {ticket.attachments?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Attachments</h4>
                <FileAndLinkUpload
                  disable={true}
                  fileClassName={"grid grid-cols-3 gap-3"}
                  initialFiles={ticket.attachments.filter((file) => file.type !== "link")}
                  initialLinks={ticket.attachments.filter((file) => file.type === "link")}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <h3 className="mb-2 text-xs font-bold text-slate-700">Mentioned</h3>
            {canMention ? (
              <MentionPicker
                employees={employees}
                value={mentionIds}
                onChange={handleMentions}
                disabled={mentionMutation.isPending}
              />
            ) : (ticket.mentions || []).length === 0 ? (
              <p className="text-xs text-slate-400">No one mentioned</p>
            ) : (
              <div className="space-y-2">
                {ticket.mentions.map((person) => (
                  <PersonBadge key={person._id || person} person={person} size="h-7 w-7" />
                ))}
              </div>
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
                <p className="text-xs text-center text-slate-400 font-medium">
                  {isClosed ? "This issue is closed." : "You were mentioned on this issue."}
                </p>
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
                <SearchableSelect
                  name="assignedTo"
                  value={ticket.assignedTo?._id || ""}
                  disabled={!canAssign || assignMutation.isPending}
                  onChange={(e) => handleAssign(e.target.value)}
                  options={employeeOptions}
                  placeholder="Unassigned"
                />
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
