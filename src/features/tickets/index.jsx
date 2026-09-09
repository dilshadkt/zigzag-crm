import React, { useMemo, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useTickets } from "./hooks/useTickets";
import CreateTicketDrawer from "./components/CreateTicketDrawer";
import TicketDetailDrawer from "./components/TicketDetailDrawer";
import TicketsTable from "./components/TicketsTable";
import { STATUS_OPTIONS, TYPE_OPTIONS } from "./utils";

const Tickets = () => {
  const { isCompany, user } = useAuth();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const canManage =
    isCompany ||
    hasPermission("tickets", "view") ||
    hasPermission("tickets", "viewAll");
  const canCreate = isCompany || hasPermission("tickets", "create");
  const canAssign = isCompany || hasPermission("tickets", "assign");
  const isAssigneeView = !canManage;
  const canChangeStatus =
    isCompany ||
    hasPermission("tickets", "changeStatus") ||
    String(selectedTicket?.assignedTo?._id || selectedTicket?.assignedTo) ===
      String(user?._id || user?.id);

  const params = useMemo(
    () => ({
      search: search.trim(),
      status,
      type,
    }),
    [search, status, type]
  );

  const { data, isLoading } = useTickets(params);
  const tickets = data?.tickets || [];
  const selected =
    tickets.find((ticket) => ticket._id === selectedTicket?._id) || selectedTicket;

  const openCount = tickets.filter(
    (ticket) => ticket.status === "open" || ticket.status === "in_progress"
  ).length;

  return (
    <section className="flex flex-col rounded-2xl overflow-hidden h-full bg-white select-none">
      <div className="p-4 md:p-5 border-b border-slate-100 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isAssigneeView ? "My Issues" : "Issues & Complaints"}
          </h2>
          <p className="text-xs text-slate-500">
            {isAssigneeView
              ? "Issues assigned to you. Add notes and close them when done."
              : "Raise tickets against clients, assign owners, and track progress."}
            {openCount ? ` ${openCount} open.` : ""}
          </p>
        </div>
        {canCreate && !isAssigneeView && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-[#3F8CFF] text-white text-sm font-semibold hover:bg-blue-600"
          >
            <FiPlus className="w-4 h-4" />
            Raise ticket
          </button>
        )}
      </div>

      <div className="px-4 md:px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAssigneeView ? "Search my issues" : "Search tickets"}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:bg-white"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
        >
          <option value="">All types</option>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-hidden">
        <TicketsTable
          tickets={tickets}
          isLoading={isLoading}
          onSelect={setSelectedTicket}
          isAssigneeView={isAssigneeView}
        />
      </div>

      {canCreate && !isAssigneeView && (
        <CreateTicketDrawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}
      <TicketDetailDrawer
        ticket={selected}
        onClose={() => setSelectedTicket(null)}
        canAssign={canAssign}
        canChangeStatus={canChangeStatus}
        isAssigneeView={isAssigneeView}
      />
    </section>
  );
};

export default Tickets;
