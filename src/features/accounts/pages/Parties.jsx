import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useAccountClients, useClients, useDeleteAccountClient, useDeleteVendor, useStaffVendorMatches, useVendors } from "../hooks/useAccounts";
import { fmtMoney } from "../utils/format";
import { ConfirmModal, EmptyState, ErrorState, PageHeader, SegmentedTabs, Spinner, Table, btnPrimary, inputCls } from "../components/ui";
import VendorDrawer from "../components/VendorDrawer";
import ClientDrawer from "../components/ClientDrawer";

const TYPES = ["client", "vendor"];

const dash = <span className="text-slate-300">—</span>;

/**
 * Everyone the company deals with money-wise, in one list. Clients (CRM projects,
 * plus clients added here that have no project) and vendors stay separate
 * records; this only shows them together.
 */
const Parties = () => {
  const navigate = useNavigate();
  const { permissions, symbol } = useAccountsContext();
  const canManage = permissions.manageExpenses;
  const canManageClients = permissions.manageInvoices || permissions.manageProposals;
  const [params, setParams] = useSearchParams();
  const type = TYPES.includes(params.get("type")) ? params.get("type") : "";
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [drawer, setDrawer] = useState({ open: false, vendor: null });
  const [clientDrawer, setClientDrawer] = useState({ open: false, client: null });
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const clientQuery = useClients({ search: debounced });
  const vendorQuery = useVendors({ search: debounced });
  const otherQuery = useAccountClients({ search: debounced });
  const staffMatches = useStaffVendorMatches(type !== "client").data?.matches?.length || 0;
  const removeVendor = useDeleteVendor();
  const removeClient = useDeleteAccountClient();
  const remove = toDelete?.type === "client" ? removeClient : removeVendor;

  // `noProject` marks a client added here; it has no CRM project or detail page
  const clients = [
    ...(clientQuery.data?.clients || []).map((c) => ({ ...c, type: "client" })),
    ...(otherQuery.data?.clients || []).map((c) => ({ ...c, type: "client", noProject: true })),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const vendors = (vendorQuery.data?.vendors || []).map((v) => ({ ...v, type: "vendor" }));
  const rows =
    type === "client" ? clients
    : type === "vendor" ? vendors
    : [...clients, ...vendors].sort((a, b) => a.name.localeCompare(b.name));

  const outstanding = clients.reduce((s, c) => s + c.outstanding, 0);
  const overdue = clients.reduce((s, c) => s + c.overdue, 0);

  const isLoading = clientQuery.isLoading || vendorQuery.isLoading;
  // The clients added here load separately: if only they fail, say so and still show the rest
  const failed = clientQuery.isError ? clientQuery : vendorQuery.isError ? vendorQuery : null;

  const openAdd = () => setDrawer({ open: true, vendor: null });
  const openEdit = (row) => {
    if (row.type === "client") setClientDrawer({ open: true, client: row });
    else setDrawer({ open: true, vendor: row });
  };
  const canEdit = (row) => (row.type === "client" ? Boolean(row.noProject) && canManageClients : canManage);

  const openRow = (row) => {
    if (row.type === "client" && !row.noProject) navigate(`/accounts/clients/${row._id}`);
    else if (canEdit(row)) openEdit(row);
  };

  const nameColumn = {
    key: "name",
    title: type === "client" ? "Client" : type === "vendor" ? "Vendor" : "Party",
    render: (r) => {
      const sub = r.noProject
        ? ["No project", r.contactName || r.phone || r.email].filter(Boolean).join(" · ")
        : r.type === "client"
          ? r.hasBilling ? r.billing?.legalName || "Billing profile set" : "No billing details yet"
          : r.gstin ? `GSTIN ${r.gstin}` : r.phone || r.email;
      return (
        <div className="flex items-center gap-3">
          {r.thumbImg ? (
            <img src={r.thumbImg} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <span className="w-8 h-8 shrink-0 rounded-lg bg-[#ECF3FF] text-[#3F8CFF] text-xs font-bold flex items-center justify-center">{r.name?.[0]?.toUpperCase()}</span>
          )}
          <div>
            <p className="font-semibold text-slate-800">{r.name}</p>
            {sub && <p className="text-xs text-slate-400">{sub}</p>}
          </div>
        </div>
      );
    },
  };

  // Money columns only apply to clients; vendors show a dash in the combined list
  const clientMoney = (key, title, cls) => ({
    key,
    title,
    align: "right",
    render: (r) => (r.type === "client" ? <span className={cls?.(r)}>{fmtMoney(r[key], symbol)}</span> : dash),
  });
  const invoiced = clientMoney("invoiced", "Invoiced");
  const collected = clientMoney("collected", "Collected", () => "text-emerald-600");
  const outstandingCol = clientMoney("outstanding", "Outstanding", (r) => (r.overdue > 0 ? "text-red-600 font-semibold" : ""));

  const actions = canManage || canManageClients
    ? [{ key: "act", title: "", align: "right", render: (r) => canEdit(r) && (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" aria-label={`Edit ${r.name}`} onClick={() => openEdit(r)}><FiEdit2 className="w-3.5 h-3.5" /></button>
          {permissions.delete && (
            <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label={`Delete ${r.name}`} onClick={() => setToDelete(r)}><FiTrash2 className="w-3.5 h-3.5" /></button>
          )}
        </div>
      ) }]
    : [];

  const columns = {
    "": [
      nameColumn,
      { key: "type", title: "Type", render: (r) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.type === "client" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
          {r.type === "client" ? "Client" : "Vendor"}
        </span>
      ) },
      invoiced,
      outstandingCol,
      // Clients: costs charged to them. Vendors: what has been spent with them.
      { key: "expenses", title: "Expenses", align: "right", render: (r) => {
        const amount = r.type === "client" ? r.expenses : r.totalSpent;
        return amount ? fmtMoney(amount, symbol) : dash;
      } },
      ...actions,
    ],
    client: [
      nameColumn,
      { key: "retainer", title: "Retainer", align: "right", render: (r) => (r.billing?.retainerAmount ? `${fmtMoney(r.billing.retainerAmount, symbol)} / ${r.billing.billingCycle?.replace("_", " ")}` : dash) },
      invoiced,
      collected,
      outstandingCol,
      { key: "expenses", title: "Expenses", align: "right", render: (r) => (r.expenses ? fmtMoney(r.expenses, symbol) : dash) },
      ...actions,
    ],
    vendor: [
      nameColumn,
      { key: "contact", title: "Contact", render: (r) => (
        r.phone || r.email
          ? <div className="text-sm text-slate-600"><p>{r.phone}</p><p className="text-xs text-slate-400">{r.email}</p></div>
          : dash
      ) },
      { key: "count", title: "Expenses", align: "right", render: (r) => r.expenseCount },
      { key: "total", title: "Total spent", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.totalSpent, symbol)}</span> },
      ...actions,
    ],
  }[type];

  const emptyTitle = debounced
    ? "No parties match your search"
    : type === "vendor" ? "No vendors yet" : type === "client" ? "No clients found" : "No parties yet";
  const emptyText = debounced
    ? undefined
    : type === "vendor"
      ? canManage ? "Add the suppliers you pay, then pick them on expenses and payments. Employees are under Staff." : undefined
      : canManageClients ? "Add a client to quote or bill them without creating a project." : undefined;

  return (
    <div>
      <PageHeader
        title="Parties"
        subtitle={`${clients.length} client${clients.length === 1 ? "" : "s"} · ${vendors.length} vendor${vendors.length === 1 ? "" : "s"} ·${fmtMoney(outstanding, symbol)} outstanding${overdue ? `, ${fmtMoney(overdue, symbol)} overdue` : ""}`}
        actions={
          <>
            {canManageClients && type !== "vendor" && (
              <button className={btnPrimary} onClick={() => setClientDrawer({ open: true, client: null })}><FiPlus /> Add client</button>
            )}
            {canManage && type !== "client" && (
              <button className={btnPrimary} onClick={openAdd}><FiPlus /> Add vendor</button>
            )}
          </>
        }
      />

      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search parties" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <SegmentedTabs
            value={type}
            onChange={(value) => setParams(value ? { type: value } : {}, { replace: true })}
            tabs={[
              { value: "", label: "All" },
              { value: "client", label: "Clients" },
              { value: "vendor", label: "Vendors" },
            ]}
          />
        </div>

        {otherQuery.isError && type !== "vendor" && (
          <p className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100" role="alert">
            Clients without a project could not be loaded.{" "}
            <button type="button" className="font-semibold underline" onClick={() => otherQuery.refetch()}>Try again</button>
          </p>
        )}

        {staffMatches > 0 && type !== "client" && (
          <p className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
            {staffMatches === 1 ? "1 vendor looks like a staff member." : `${staffMatches} vendors look like staff members.`}{" "}
            <Link to="/accounts/staff" className="font-semibold underline">Move them in Staff</Link>
          </p>
        )}

        {isLoading ? (
          <Spinner />
        ) : failed ? (
          <ErrorState error={failed.error} onRetry={failed.refetch} />
        ) : (
          <Table
            rows={rows}
            rowKey={(r) => `${r.type}-${r._id}`}
            onRowClick={type === "vendor" && !canManage ? undefined : openRow}
            empty={<EmptyState icon={FiUsers} title={emptyTitle} text={emptyText} />}
            columns={columns}
          />
        )}
      </div>

      <VendorDrawer isOpen={drawer.open} vendor={drawer.vendor} onClose={() => setDrawer({ open: false, vendor: null })} />
      <ClientDrawer isOpen={clientDrawer.open} client={clientDrawer.client} onClose={() => setClientDrawer({ open: false, client: null })} />
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title={toDelete?.type === "client" ? "Delete this client?" : "Delete this vendor?"}
        message={toDelete ? `${toDelete.name} will be removed.` : ""}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(toDelete._id).then(() => setToDelete(null)).catch(() => setToDelete(null))}
      />
    </div>
  );
};

export default Parties;
