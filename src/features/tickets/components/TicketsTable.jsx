import React from "react";
import { format } from "date-fns";
import {
  formatStatus,
  personName,
  priorityStyles,
  statusStyles,
  typeStyles,
} from "../utils";
import PersonBadge from "./PersonBadge";

const TicketsTable = ({ tickets, isLoading, onSelect, isAssigneeView }) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!tickets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-sm font-medium">
          {isAssigneeView ? "No issues assigned to you" : "No tickets yet"}
        </p>
        <p className="text-xs mt-1">
          {isAssigneeView
            ? "When someone assigns you an issue, it will show up here."
            : "Raise an issue or complaint against a client to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full p-0 md:p-0 bg-slate-50 md:bg-transparent">
      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            onClick={() => onSelect(ticket)}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start gap-3 mb-3">
              <div>
                <p className="font-bold text-slate-800 text-sm">{ticket.title}</p>
                <p className="text-slate-400 text-[10px] tracking-wider mt-0.5">{ticket.ticketNumber}</p>
              </div>
              <span className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded-lg border ${statusStyles[ticket.status]}`}>
                {formatStatus(ticket.status)}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${typeStyles[ticket.type]}`}>
                  {ticket.type === "complaint" ? "Complaint" : "Issue"}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border capitalize ${priorityStyles[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d") : "—"}
              </span>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex flex-col min-w-0">
                 <span className="text-[10px] font-semibold text-slate-400 mb-0.5">Created by</span>
                 <PersonBadge person={ticket.createdBy} />
              </div>
              <div className="flex flex-col items-end text-right">
                 <span className="text-[10px] font-semibold text-slate-400 mb-0.5">Client</span>
                 <span className="font-semibold text-slate-700">{ticket.project?.name || "—"}</span>
              </div>
              {!isAssigneeView && (
                <div className="flex flex-col items-end text-right">
                   <span className="text-[10px] font-semibold text-slate-400 mb-0.5">Assigned To</span>
                   <span className="font-semibold text-slate-700">{personName(ticket.assignedTo)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <table className="hidden md:table w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
            <th className="py-2.5 px-4 text-xs font-bold text-slate-500">Ticket</th>
            <th className="py-2.5 px-4 text-xs font-bold text-slate-500">Created by</th>
            <th className="py-2.5 px-4 text-xs font-bold text-slate-500">Client</th>
            <th className="py-2.5 px-4 text-xs font-bold text-slate-500">Type</th>
            <th className="py-2.5 px-4 text-xs font-bold text-slate-500">Priority</th>
            {!isAssigneeView && (
              <th className="py-2.5 px-4 text-xs font-bold text-slate-500">Assigned to</th>
            )}
            <th className="py-2.5 px-4 text-xs font-bold text-slate-500">Status</th>
            <th className="py-2.5 px-4 text-xs font-bold text-slate-500">Raised</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
          {tickets.map((ticket) => (
            <tr
              key={ticket._id}
              onClick={() => onSelect(ticket)}
              className="hover:bg-slate-50/70 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4">
                <p className="font-bold text-slate-800">{ticket.title}</p>
                <p className="text-slate-400 mt-0.5">{ticket.ticketNumber}</p>
              </td>
              <td className="py-3 px-4">
                <PersonBadge person={ticket.createdBy} />
              </td>
              <td className="py-3 px-4 font-semibold">{ticket.project?.name || "—"}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${typeStyles[ticket.type]}`}>
                  {ticket.type === "complaint" ? "Complaint" : "Issue"}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-[11px] font-bold rounded-lg border capitalize ${priorityStyles[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </td>
              {!isAssigneeView && (
                <td className="py-3 px-4 font-medium">{personName(ticket.assignedTo)}</td>
              )}
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${statusStyles[ticket.status]}`}>
                  {formatStatus(ticket.status)}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-500 font-medium">
                {ticket.createdAt ? format(new Date(ticket.createdAt), "MMM d") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsTable;
