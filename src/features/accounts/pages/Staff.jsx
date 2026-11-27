import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiDollarSign, FiDownload, FiEdit2, FiPlus, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import { useAccountsContext } from "../context";
import {
  useDeleteAdvance,
  useDeletePayment,
  useExpense,
  useMoveVendorToStaff,
  useSetExpenseStatus,
  useStaff,
  useStaffMember,
  useStaffVendorMatches,
  useVendors,
} from "../hooks/useAccounts";
import { EXPENSE_STATUS, downloadCsv, fmtDate, fmtMoney, methodLabel, monthLabel, toInputDate } from "../utils/format";
import { ConfirmModal, EmptyState, ErrorState, PageHeader, Spinner, StatCard, StatusBadge, Table, btnGhost, btnPrimary, btnSmall, inputCls } from "../components/ui";
import SearchableSelect from "../components/SearchableSelect";
import { AdvanceModal } from "../components/AdvancesPanel";
import { ExpenseDrawer } from "./Expenses";
import { PaymentDrawer } from "./Payments";

const TYPES = {
  salary: { label: "Salary", cls: "bg-emerald-50 text-emerald-700" },
  advance: { label: "Advance", cls: "bg-amber-50 text-amber-700" },
  expense: { label: "Expense", cls: "bg-violet-50 text-violet-600" },
  payment: { label: "Payment", cls: "bg-blue-50 text-blue-600" },
};

const dash = <span className="text-slate-300">—</span>;

// Moving needs both rights: it edits spending and removes a vendor record
const mayMove = (permissions) => Boolean(permissions.manageExpenses && permissions.delete);

const confirmText = (vendor, staff) =>
  `${vendor.name}'s expenses and payments will move to ${staff.name}, and ${vendor.name} will be removed from the vendor list. This can't be undone.`;

/** Vendor records that look like staff, each with a button to move it across. */
const VendorMatches = () => {
  const { permissions } = useAccountsContext();
  const { data } = useStaffVendorMatches();
  const move = useMoveVendorToStaff();
  const [chosen, setChosen] = useState(null);
  const matches = data?.matches || [];
  if (!matches.length) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-bold text-amber-800">
        {matches.length === 1 ? "1 vendor looks like a staff member" : `${matches.length} vendors look like staff members`}
      </p>
      <p className="text-xs text-amber-700 mb-2">Move them so they leave the vendor list and their history shows here. Check each one first.</p>
      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.vendor._id} className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-xl px-3 py-2">
            <span className="text-sm text-slate-700">Vendor <b>{m.vendor.name}</b> → staff <b>{m.staff.name}</b>{m.staff.former ? " (left)" : ""} <span className="text-xs text-slate-400">({m.reason})</span></span>
            {mayMove(permissions)
              ? <button className={btnSmall} onClick={() => setChosen(m)}>Move to staff</button>
              : <span className="text-xs text-slate-400">Needs expense and delete access</span>}
          </li>
        ))}
      </ul>
      <ConfirmModal
        isOpen={!!chosen}
        onClose={() => setChosen(null)}
        title="Move this vendor to staff?"
        message={chosen ? confirmText(chosen.vendor, chosen.staff) : ""}
        confirmLabel="Move"
        busy={move.isPending}
        onConfirm={() => move.mutateAsync({ id: chosen.staff._id, vendorId: chosen.vendor._id }).then(() => setChosen(null)).catch(() => setChosen(null))}
      />
    </div>
  );
};

const StaffList = () => {
  const navigate = useNavigate();
  const { symbol } = useAccountsContext();
  const { data, isLoading, isError, error, refetch } = useStaff();
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const staff = (data?.staff || []).filter((s) => !q || `${s.name} ${s.position || ""} ${s.email || ""} ${s.phoneNumber || ""}`.toLowerCase().includes(q));
  const money = (v) => (v ? fmtMoney(v, symbol) : dash);
  const salaryColumns = data?.seesSalary
    ? [
        { key: "monthly", title: "Monthly salary", align: "right", render: (s) => money(s.monthlySalary) },
        { key: "salaryPaid", title: "Salary paid", align: "right", render: (s) => money(s.totals.salaryPaid) },
        { key: "salaryDue", title: "Salary due", align: "right", render: (s) => money(s.totals.salaryDue) },
        { key: "adv", title: "Advance pending", align: "right", render: (s) => money(s.totals.advancesPending) },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Staff list"
        subtitle="Your team, and the money that moves between them and the company."
        actions={
          <button
            className={btnGhost}
            disabled={!staff.length}
            onClick={() => downloadCsv("staff.csv", [
              ["Name", "Position", "Email", "Phone", ...(data.seesSalary ? ["Monthly salary", "Salary paid", "Salary due", "Advance pending"] : []), "Expenses", "Reimbursement due", "Paid through Payments"],
              ...staff.map((s) => [s.name, s.position, s.email, s.phoneNumber, ...(data.seesSalary ? [s.monthlySalary ?? "", s.totals.salaryPaid, s.totals.salaryDue, s.totals.advancesPending] : []), s.totals.expenses, s.totals.reimbursementDue, s.totals.paid]),
            ])}
          >
            <FiDownload /> Export CSV
          </button>
        }
      />
      <VendorMatches />
      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search staff" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <Table
            rows={staff}
            onRowClick={(s) => navigate(`/accounts/staff/${s._id}`)}
            empty={<EmptyState icon={FiUsers} title={q ? "No staff match your search" : "No staff yet"} text={q ? undefined : "Add people on the Employees page and they appear here."} />}
            columns={[
              { key: "name", title: "Staff", render: (s) => (
                <div>
                  <p className="font-semibold text-slate-800">{s.name}{s.isArchived && <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Left</span>}</p>
                  <p className="text-xs text-slate-400">{[s.position, s.phoneNumber || s.email].filter(Boolean).join(" · ")}</p>
                </div>
              ) },
              ...salaryColumns,
              { key: "exp", title: "Expenses", align: "right", render: (s) => money(s.totals.expenses) },
              { key: "due", title: "To reimburse", align: "right", render: (s) => (s.totals.reimbursementDue ? <span className="text-amber-600 font-semibold">{fmtMoney(s.totals.reimbursementDue, symbol)}</span> : dash) },
              { key: "paid", title: "Paid via Payments", align: "right", render: (s) => money(s.totals.paid) },
            ]}
          />
        )}
      </div>
    </div>
  );
};

const StaffDetail = ({ staffId }) => {
  const navigate = useNavigate();
  const { permissions, symbol } = useAccountsContext();
  const { data, isLoading, isError, error, refetch } = useStaffMember(staffId);
  const { data: vendorData } = useVendors(undefined, mayMove(permissions));
  const setExpenseStatus = useSetExpenseStatus();
  const removePayment = useDeletePayment();
  const removeAdvance = useDeleteAdvance();
  const move = useMoveVendorToStaff();
  const [expenseDrawer, setExpenseDrawer] = useState({ open: false, id: null });
  const editing = useExpense(expenseDrawer.id);
  const [paying, setPaying] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (editing.isError) setExpenseDrawer({ open: false, id: null });
  }, [editing.isError]);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  const { staff, totals, transactions, seesSalary } = data;
  const closeExpense = () => setExpenseDrawer({ open: false, id: null });
  // An existing expense opens once it has loaded
  const drawerExpense = expenseDrawer.id ? editing.data?.expense : null;

  const exportCsv = () =>
    downloadCsv(`staff-${staff.name.replace(/[^\w-]+/g, "-")}.csv`, [
      ["Date", "Type", "Description", "Detail", "Money in", "Money out", "Status", "Method"],
      ...transactions.map((t) => [toInputDate(t.date), TYPES[t.type].label, t.description, t.detail, t.direction === "in" ? t.amount : "", t.direction === "out" ? t.amount : "", t.status || "", t.method ? methodLabel(t.method) : ""]),
    ]);

  const canDelete = (t) => (t.type === "payment" && permissions.delete) || (t.type === "advance" && permissions.managePayroll && t.status === "pending");

  return (
    <div>
      <PageHeader
        title={staff.name}
        subtitle={[staff.position, staff.email, staff.phoneNumber, staff.isArchived ? "No longer with the company" : null].filter(Boolean).join(" · ")}
        onBack={() => navigate("/accounts/staff")}
        actions={
          <>
            <button className={btnGhost} onClick={exportCsv} disabled={!transactions.length}><FiDownload /> Export CSV</button>
            {permissions.managePayroll && <button className={btnGhost} onClick={() => navigate("/accounts/payroll")}>Salary and payslips</button>}
            {permissions.managePayroll && <button className={btnGhost} onClick={() => setAdvancing(true)}><FiPlus /> Advance</button>}
            {permissions.manageInvoices && <button className={btnGhost} onClick={() => setPaying(true)}><FiDollarSign /> Pay in or out</button>}
            {permissions.manageExpenses && <button className={btnPrimary} onClick={() => setExpenseDrawer({ open: true, id: null })}><FiPlus /> Expense</button>}
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {seesSalary && (
          <>
            <StatCard label="Salary paid" value={fmtMoney(totals.salaryPaid, symbol)} sub={staff.monthlySalary ? `${fmtMoney(staff.monthlySalary, symbol)} a month` : "no salary set up"} />
            <StatCard label="Salary due" value={fmtMoney(totals.salaryDue, symbol)} tone={totals.salaryDue ? "warn" : "default"} sub="approved, not yet paid" />
            <StatCard label="Advance pending" value={fmtMoney(totals.advancesPending, symbol)} sub="to be recovered from salary" />
          </>
        )}
        <StatCard label="Expenses" value={fmtMoney(totals.expenses, symbol)} sub="paid to this person" />
        <StatCard label="To reimburse" value={fmtMoney(totals.reimbursementDue, symbol)} tone={totals.reimbursementDue ? "warn" : "default"} />
        <StatCard label="Paid via Payments" value={fmtMoney(totals.paid, symbol)} sub={totals.received ? `${fmtMoney(totals.received, symbol)} received back` : "includes reimbursements"} />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl mb-4">
        <h3 className="px-4 pt-4 pb-2 text-sm font-bold text-slate-800">Transactions</h3>
        <Table
          rows={transactions}
          rowKey={(t) => `${t.type}-${t.id}`}
          empty={<EmptyState title="Nothing recorded yet" text="Salary payments, advances, expenses and payments for this person show here." />}
          columns={[
            { key: "date", title: "Date", render: (t) => <span className="text-slate-500 whitespace-nowrap">{fmtDate(t.date)}</span> },
            { key: "type", title: "Type", render: (t) => <StatusBadge status={t.type} map={TYPES} /> },
            { key: "desc", title: "Details", render: (t) => (
              <div>
                <p className="font-semibold text-slate-800">{t.description}{t.month ? ` for ${monthLabel(t.month, true)}` : ""}</p>
                <p className="text-xs text-slate-400">{[t.detail, t.method ? methodLabel(t.method) : null, t.recoverMonth ? `recovered from ${monthLabel(t.recoverMonth, true)}` : null].filter(Boolean).join(" · ")}</p>
              </div>
            ) },
            { key: "status", title: "Status", render: (t) => (t.type === "expense" ? <StatusBadge status={t.status} map={EXPENSE_STATUS} /> : t.type === "advance" ? <span className="text-xs text-slate-500">{t.status === "recovered" ? "Recovered" : "Waiting"}</span> : <span className="text-xs text-slate-500">{t.direction === "in" ? "Received" : "Paid"}</span>) },
            { key: "amount", title: "Amount", align: "right", render: (t) => <span className={`font-semibold whitespace-nowrap ${t.direction === "in" ? "text-emerald-600" : "text-slate-800"}`}>{t.direction === "in" ? "+" : ""}{fmtMoney(t.amount, symbol)}</span> },
            { key: "act", title: "", align: "right", render: (t) => (
              <div className="flex items-center justify-end gap-1">
                {t.type === "expense" && permissions.manageExpenses && t.status === "approved" && !t.paid && <button className={btnSmall} onClick={() => setExpenseStatus.mutate({ id: t.id, data: { status: "paid" } })}>Mark paid</button>}
                {t.type === "expense" && permissions.manageExpenses && <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" aria-label={`Edit ${t.description}`} onClick={() => setExpenseDrawer({ open: true, id: t.id })}><FiEdit2 className="w-3.5 h-3.5" /></button>}
                {canDelete(t) && <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label={`Delete ${t.description}`} onClick={() => setToDelete(t)}><FiTrash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ) },
          ]}
        />
      </div>

      {mayMove(permissions) && (vendorData?.vendors || []).length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-sm font-bold text-slate-800">Was {staff.name} also added as a vendor?</p>
          <p className="text-xs text-slate-500 mb-2">Pick that vendor to move its history here and take it off the vendor list.</p>
          <div className="max-w-xs">
            <SearchableSelect
              value=""
              onChange={(id) => setVendor(vendorData.vendors.find((v) => v._id === id) || null)}
              options={vendorData.vendors.map((v) => ({ value: v._id, label: v.name, hint: v.phone || v.email }))}
              placeholder="Choose a vendor"
              searchPlaceholder="Search vendors…"
              emptyText="No vendor found"
            />
          </div>
        </div>
      )}

      <ExpenseDrawer
        isOpen={expenseDrawer.open && (!expenseDrawer.id || !!drawerExpense)}
        expense={drawerExpense || null}
        staff={staff}
        onClose={closeExpense}
      />
      <PaymentDrawer isOpen={paying} direction="out" staff={staff} onClose={() => setPaying(false)} />
      {advancing && <AdvanceModal advance={{}} employee={staff} employees={[staff]} onClose={() => setAdvancing(false)} />}
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title={toDelete?.type === "advance" ? "Delete this advance?" : "Delete this payment?"}
        message={toDelete ? `${fmtMoney(toDelete.amount, symbol)} on ${fmtDate(toDelete.date)} will be removed.` : ""}
        confirmLabel="Delete"
        danger
        busy={removePayment.isPending || removeAdvance.isPending}
        onConfirm={() => (toDelete.type === "advance" ? removeAdvance : removePayment).mutateAsync(toDelete.id).then(() => setToDelete(null)).catch(() => setToDelete(null))}
      />
      <ConfirmModal
        isOpen={!!vendor}
        onClose={() => setVendor(null)}
        title="Move this vendor to staff?"
        message={vendor ? confirmText(vendor, staff) : ""}
        confirmLabel="Move"
        busy={move.isPending}
        onConfirm={() => move.mutateAsync({ id: staff._id, vendorId: vendor._id }).then(() => setVendor(null)).catch(() => setVendor(null))}
      />
    </div>
  );
};

const Staff = () => {
  const { staffId } = useParams();
  return staffId ? <StaffDetail key={staffId} staffId={staffId} /> : <StaffList />;
};

export default Staff;
