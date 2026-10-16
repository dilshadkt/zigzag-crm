import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiFileText, FiPlus } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useClient, useClientCosting, useSaveBilling } from "../hooks/useAccounts";
import { INDIAN_STATES, INVOICE_STATUS, PROPOSAL_STATUS, EXPENSE_STATUS, errorMessage, fmtDate, fmtMoney, rangePresets } from "../utils/format";
import { Card, DateRangeFilter, EmptyState, ErrorState, Field, PageHeader, SegmentedTabs, Spinner, StatCard, StatusBadge, Table, btnGhost, btnPrimary, inputCls, selectCls } from "../components/ui";

const emptyBilling = {
  legalName: "", contactName: "", email: "", ccEmails: "", phone: "", gstin: "", pan: "",
  address: { line1: "", line2: "", city: "", state: "", pincode: "", country: "India" },
  paymentTermsDays: "", defaultTdsPercent: 0, billingCycle: "monthly", retainerAmount: 0, budget: 0, notes: "",
};

const BillingForm = ({ billing, projectId, canEdit }) => {
  const save = useSaveBilling();
  const [form, setForm] = useState(emptyBilling);
  useEffect(() => {
    setForm({
      ...emptyBilling,
      ...(billing || {}),
      ccEmails: (billing?.ccEmails || []).join(", "),
      paymentTermsDays: billing?.paymentTermsDays ?? "",
      address: { ...emptyBilling.address, ...(billing?.address || {}) },
    });
  }, [billing]);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setAddr = (patch) => setForm((f) => ({ ...f, address: { ...f.address, ...patch } }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        id: projectId,
        data: {
          ...form,
          paymentTermsDays: form.paymentTermsDays === "" ? "" : Number(form.paymentTermsDays),
          defaultTdsPercent: Number(form.defaultTdsPercent) || 0,
          retainerAmount: Number(form.retainerAmount) || 0,
          budget: Number(form.budget) || 0,
        },
      });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={!canEdit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Legal / billing name"><input className={inputCls} value={form.legalName} onChange={(e) => set({ legalName: e.target.value })} /></Field>
        <Field label="Contact person"><input className={inputCls} value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} /></Field>
        <Field label="Billing email"><input type="email" className={inputCls} value={form.email} onChange={(e) => set({ email: e.target.value })} /></Field>
        <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
        <Field label="GSTIN"><input className={inputCls} value={form.gstin} onChange={(e) => set({ gstin: e.target.value.toUpperCase() })} /></Field>
        <Field label="PAN"><input className={inputCls} value={form.pan} onChange={(e) => set({ pan: e.target.value.toUpperCase() })} /></Field>
        <Field label="Address" className="md:col-span-2"><input className={inputCls} value={form.address.line1} onChange={(e) => setAddr({ line1: e.target.value })} /></Field>
        <Field label="City"><input className={inputCls} value={form.address.city} onChange={(e) => setAddr({ city: e.target.value })} /></Field>
        <Field label="State" hint="Decides CGST + SGST or IGST on invoices">
          <select className={selectCls} value={form.address.state} onChange={(e) => setAddr({ state: e.target.value })}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="PIN code"><input className={inputCls} value={form.address.pincode} onChange={(e) => setAddr({ pincode: e.target.value })} /></Field>
        <Field label="Also email (Cc)" hint="Comma separated"><input className={inputCls} value={form.ccEmails} onChange={(e) => set({ ccEmails: e.target.value })} /></Field>
        <Field label="Payment terms (days)" hint="Blank uses the company default"><input type="number" min="0" className={inputCls} value={form.paymentTermsDays} onChange={(e) => set({ paymentTermsDays: e.target.value })} /></Field>
        <Field label="TDS the client deducts (%)"><input type="number" min="0" max="100" step="any" className={inputCls} value={form.defaultTdsPercent} onChange={(e) => set({ defaultTdsPercent: e.target.value })} /></Field>
        <Field label="Billing cycle">
          <select className={selectCls} value={form.billingCycle} onChange={(e) => set({ billingCycle: e.target.value })}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="one_time">One time</option>
          </select>
        </Field>
        <Field label="Agreed retainer (per cycle)"><input type="number" min="0" step="any" className={inputCls} value={form.retainerAmount} onChange={(e) => set({ retainerAmount: e.target.value })} /></Field>
        <Field label="Total budget" hint="Used to track cost against budget"><input type="number" min="0" step="any" className={inputCls} value={form.budget} onChange={(e) => set({ budget: e.target.value })} /></Field>
        <Field label="Internal notes" className="md:col-span-2"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
      </fieldset>
      {canEdit && (
        <div className="flex justify-end">
          <button className={btnPrimary} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save billing details"}</button>
        </div>
      )}
    </form>
  );
};

const Costing = ({ projectId }) => {
  const { symbol, settings } = useAccountsContext();
  const presets = rangePresets(settings?.financialYearStartMonth || 4);
  const [range, setRange] = useState({ from: presets[3].from, to: presets[3].to });
  const { data, isLoading, isError, error } = useClientCosting(projectId, range);
  const c = data?.costing;

  return (
    <div className="space-y-4">
      <DateRangeFilter value={range} onChange={setRange} fyStartMonth={settings?.financialYearStartMonth} />
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState error={error} />
      ) : !c ? (
        <EmptyState icon={FiFileText} title="No activity in this period" text="Invoices, expenses or logged task time will show up here." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Revenue (ex-tax)" value={fmtMoney(c.revenue, symbol)} sub={`${c.invoiceCount} invoice${c.invoiceCount === 1 ? "" : "s"}`} />
            <StatCard label="Direct expenses" value={fmtMoney(c.expenses, symbol)} />
            <StatCard label="Team cost" value={fmtMoney(c.laborCost, symbol)} sub={`${c.laborHours} hrs logged`} />
            <StatCard label="Profit" value={fmtMoney(c.profit, symbol)} tone={c.profit >= 0 ? "good" : "bad"} sub={c.margin === null ? undefined : `${c.margin}% margin`} />
          </div>
          {c.budget > 0 && (
            <Card title="Budget" subtitle={`${fmtMoney(c.totalCost, symbol)} of ${fmtMoney(c.budget, symbol)} used`}>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.budgetUsed > 100 ? "bg-red-500" : c.budgetUsed > 80 ? "bg-amber-500" : "bg-[#3F8CFF]"}`} style={{ width: `${Math.min(c.budgetUsed, 100)}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{c.budgetUsed}% of budget spent</p>
            </Card>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Team time" subtitle="Hours logged on this client's tasks, costed at each person's salary">
              {c.staff.length === 0 ? (
                <p className="text-xs text-slate-400">No time logged.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {c.staff.map((s) => (
                    <li key={s.user} className="py-2 flex justify-between text-sm">
                      <span className="text-slate-700">{s.name}</span>
                      <span className="text-slate-500 tabular-nums">{s.hours} hrs · {s.cost === null ? <em className="text-amber-600 not-italic">no salary set</em> : fmtMoney(s.cost, symbol)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {c.unpricedHours > 0 && <p className="text-[11px] text-amber-600 mt-2">{c.unpricedHours} hrs could not be costed because those people have no salary structure.</p>}
            </Card>
            <Card title="Expenses by category">
              {Object.keys(c.expensesByCategory).length === 0 ? (
                <p className="text-xs text-slate-400">No expenses charged to this client.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {Object.entries(c.expensesByCategory).map(([cat, amount]) => (
                    <li key={cat} className="py-2 flex justify-between text-sm"><span className="text-slate-700">{cat}</span><span className="tabular-nums">{fmtMoney(amount, symbol)}</span></li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

const ClientDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { permissions, symbol } = useAccountsContext();
  const { data, isLoading, isError, error, refetch } = useClient(projectId);
  const [tab, setTab] = useState("overview");

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  const { client, billing, summary, invoices, proposals, expenses } = data;
  const canCosting = permissions.viewReports || permissions.managePayroll;

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "billing", label: "Billing details" },
    ...(canCosting ? [{ value: "costing", label: "Project cost" }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={client.name}
        subtitle={billing?.legalName && billing.legalName !== client.name ? billing.legalName : client.status}
        onBack={() => navigate("/accounts/clients")}
        actions={
          <>
            {permissions.manageProposals && <button className={btnGhost} onClick={() => navigate(`/accounts/proposals/new`)}><FiPlus /> Proposal</button>}
            {permissions.manageInvoices && <button className={btnPrimary} onClick={() => navigate(`/accounts/invoices/new?client=${projectId}`)}><FiPlus /> New invoice</button>}
          </>
        }
      />
      <div className="mb-4"><SegmentedTabs tabs={tabs} value={tab} onChange={setTab} /></div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Invoiced" value={fmtMoney(summary.invoiced, symbol)} />
            <StatCard label="Collected" value={fmtMoney(summary.collected, symbol)} tone="good" />
            <StatCard label="Outstanding" value={fmtMoney(summary.outstanding, symbol)} />
            <StatCard label="Overdue" value={fmtMoney(summary.overdue, symbol)} tone={summary.overdue > 0 ? "bad" : "default"} />
          </div>
          {!billing && permissions.manageInvoices && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-800 flex items-center justify-between gap-3">
              <span>Add this client's GSTIN, address and payment terms once and every invoice will use them.</span>
              <button className={btnGhost} onClick={() => setTab("billing")}>Add details</button>
            </div>
          )}
          <Card title="Invoices" padded={false}>
            <Table
              rows={invoices}
              onRowClick={(r) => navigate(`/accounts/invoices/${r._id}`)}
              empty={<p className="text-xs text-slate-400 p-5">No invoices yet.</p>}
              columns={[
                { key: "number", title: "Invoice", render: (r) => <span className="font-semibold">{r.number}</span> },
                { key: "date", title: "Date", render: (r) => fmtDate(r.issueDate) },
                { key: "status", title: "Status", render: (r) => <StatusBadge status={r.isOverdue ? "overdue" : r.status} map={INVOICE_STATUS} /> },
                { key: "amount", title: "Amount", align: "right", render: (r) => fmtMoney(r.totals?.payable, r.currencySymbol) },
                { key: "balance", title: "Balance", align: "right", render: (r) => fmtMoney(r.status === "draft" ? 0 : r.balance, r.currencySymbol) },
              ]}
            />
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Proposals" padded={false}>
              <Table
                rows={proposals}
                onRowClick={(r) => navigate(`/accounts/proposals/${r._id}`)}
                empty={<p className="text-xs text-slate-400 p-5">No proposals.</p>}
                columns={[
                  { key: "title", title: "Proposal", render: (r) => <div><p className="font-semibold">{r.title}</p><p className="text-xs text-slate-400">{r.number}</p></div> },
                  { key: "status", title: "Status", render: (r) => <StatusBadge status={r.status} map={PROPOSAL_STATUS} /> },
                  { key: "v", title: "Value", align: "right", render: (r) => fmtMoney(r.totals?.payable, r.currencySymbol) },
                ]}
              />
            </Card>
            <Card title="Recent expenses" padded={false}>
              <Table
                rows={expenses}
                empty={<p className="text-xs text-slate-400 p-5">No expenses charged to this client.</p>}
                columns={[
                  { key: "d", title: "Expense", render: (r) => <div><p className="font-semibold">{r.description}</p><p className="text-xs text-slate-400">{fmtDate(r.date)} · {r.category}</p></div> },
                  { key: "s", title: "Status", render: (r) => <StatusBadge status={r.status} map={EXPENSE_STATUS} /> },
                  { key: "a", title: "Amount", align: "right", render: (r) => fmtMoney(r.amount, symbol) },
                ]}
              />
            </Card>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <Card>
          <BillingForm billing={billing} projectId={projectId} canEdit={permissions.manageInvoices || permissions.manageProposals} />
        </Card>
      )}

      {tab === "costing" && canCosting && <Costing projectId={projectId} />}
    </div>
  );
};

export default ClientDetail;
