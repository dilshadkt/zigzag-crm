import React from "react";
import { format } from "date-fns";
import {
  formatStatus,
  personName,
  priorityStyles,
  statusStyles,
  typeStyles,
} from "../utils";

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
    <div className="overflow-auto h-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 sticky top-0 z-10">
            <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500">Ticket</th>
            <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500">Client</th>
            <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500">Type</th>
            <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500">Priority</th>
            {!isAssigneeView && (
              <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500">Assigned to</th>
            )}
            <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500">Status</th>
            <th className="py-2.5 px-3.5 text-xs font-bold text-slate-500">Raised</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
          {tickets.map((ticket) => (
            <tr
              key={ticket._id}
              onClick={() => onSelect(ticket)}
              className="hover:bg-slate-50/70 cursor-pointer"
            >
              <td className="py-3 px-3.5">
                <p className="font-bold text-slate-800">{ticket.title}</p>
                <p className="text-slate-400">{ticket.ticketNumber}</p>
              </td>
              <td className="py-3 px-3.5 font-medium">{ticket.project?.name || "—"}</td>
              <td className="py-3 px-3.5">
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${typeStyles[ticket.type]}`}>
                  {ticket.type === "complaint" ? "Complaint" : "Issue"}
                </span>
              </td>
              <td className="py-3 px-3.5">
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border capitalize ${priorityStyles[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </td>
              {!isAssigneeView && (
                <td className="py-3 px-3.5">{personName(ticket.assignedTo)}</td>
              )}
              <td className="py-3 px-3.5">
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${statusStyles[ticket.status]}`}>
                  {formatStatus(ticket.status)}
                </span>
              </td>
              <td className="py-3 px-3.5 text-slate-500">
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
