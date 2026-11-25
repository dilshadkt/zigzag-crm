import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiArrowDownLeft, FiArrowUpRight, FiDownload, FiSearch, FiTrash2 } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useCreatePayment, useDeletePayment, useInvoices, useOpenExpenses, usePayments } from "../hooks/useAccounts";
import { splitParty, usePartyOptions } from "../hooks/useParties";
import SearchableSelect from "../components/SearchableSelect";
import { PAYMENT_METHODS, downloadCsv, errorMessage, fmtDate, fmtMoney, methodLabel, rangePresets, toInputDate } from "../utils/format";
import { ConfirmModal, DateRangeFilter, Drawer, EmptyState, ErrorState, Field, PageHeader, Pagination, Spinner, StatCard, Table, btnGhost, btnPrimary, inputCls, selectCls } from "../components/ui";

const blank = (direction = "in") => ({
  direction,
  party: "",
  invoice: "",
  expense: "",
  amount: "",
  date: toInputDate(new Date()),
  method: "bank_transfer",
  reference: "",
  notes: "",
});

const DIRECTIONS = [
  { value: "", label: "All" },
  { value: "in", label: "Pay in" },
  { value: "out", label: "Pay out" },
];

// Older API responses carry only `project`, so fall back to it
const partyOf = (row) => row.party || { name: row.project?.name, type: "client" };

const DRAWER_HINTS = {
  in: {
    none: "Money you received from a client or vendor.",
    client: "The client paid you: an invoice payment, an advance or a retainer.",
    vendor: "The vendor paid you back: a refund or a returned advance.",
  },
  out: {
    none: "Money you paid to a client or vendor.",
    client: "You paid the client: a refund or an overpayment sent back.",
    vendor: "You paid the vendor: for a bill under Expenses, or as an advance.",
  },
};

const PaymentDrawer = ({ isOpen, onClose, direction }) => {
  const { symbol, permissions } = useAccountsContext();
  const create = useCreatePayment();
  const partyOptions = usePartyOptions(isOpen);
  const [form, setForm] = useState(blank());

  useEffect(() => {
    if (isOpen) setForm(blank(direction));
  }, [isOpen, direction]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isIn = form.direction === "in";

  const party = splitParty(form.party);
  const clientId = party.project || "";

  // Money received from a client can be applied to one of their unpaid invoices
  const { data: invoiceData } = useInvoices({ project: clientId, limit: 100 }, isOpen && isIn && !!clientId);
  const openInvoices = useMemo(
    () => (invoiceData?.invoices || []).filter((i) => i.project?._id === clientId || i.project === clientId).filter((i) => i.status !== "void" && i.balance > 0.009),
    [invoiceData, clientId]
  );
  const invoiceOptions = openInvoices.map((i) => ({
    value: i._id,
    label: i.number,
    hint: `${fmtMoney(i.balance, i.currencySymbol || symbol)} due`,
  }));
  const chosenInvoice = openInvoices.find((i) => i._id === form.invoice);

  // Money paid to a vendor can settle one of their unpaid expenses
  const vendorId = party.vendor || "";
  const canApplyExpense = !isIn && !!vendorId && !!permissions.manageExpenses;
  const { data: expenseData } = useOpenExpenses(vendorId, isOpen && canApplyExpense);
  const openExpenses = expenseData?.expenses || [];
  const expenseOptions = openExpenses.map((x) => ({
    value: x._id,
    label: x.description,
    hint: [`${fmtMoney(x.balance, symbol)} due`, x.billNumber, fmtDate(x.date)].filter(Boolean).join(" · "),
  }));
  const chosenExpense = openExpenses.find((x) => x._id === form.expense);

  const chosen = chosenInvoice || chosenExpense;
  const chosenSymbol = chosenInvoice?.currencySymbol || symbol;

  const submit = async (e) => {
    e?.preventDefault();
    if (create.isPending) return;
    if (!form.party) return toast.error("Choose the party");
    if (!(Number(form.amount) > 0)) return toast.error("Enter an amount greater than zero");
    try {
      await create.mutateAsync({
        ...form,
        party: undefined,
        ...party,
        amount: Number(form.amount),
        invoice: isIn && clientId ? form.invoice || undefined : undefined,
        expense: canApplyExpense ? form.expense || undefined : undefined,
      });
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isIn ? "Pay in — received from party" : "Pay out — paid to party"}
      width="max-w-md"
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button className={btnPrimary} onClick={submit} disabled={create.isPending}>{create.isPending ? "Saving…" : isIn ? "Record pay in" : "Record pay out"}</button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Direction">
          {DIRECTIONS.slice(1).map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => set({ direction: d.value, invoice: "", expense: "" })}
              className={`rounded-lg py-1.5 text-sm font-semibold transition-colors ${form.direction === d.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {DRAWER_HINTS[form.direction][party.project ? "client" : party.vendor ? "vendor" : "none"]}
        </p>

        <Field label="Party" required>
          <SearchableSelect
            value={form.party}
            onChange={(value) => set({ party: value, invoice: "", expense: "" })}
            options={partyOptions}
            placeholder="Select party"
            searchPlaceholder="Search clients and vendors…"
            emptyText="No party found"
          />
        </Field>

        {isIn && clientId && (
          <Field label="Apply to invoice" hint={form.invoice ? undefined : "Leave empty to keep it as an advance"}>
            <SearchableSelect
              value={form.invoice}
              onChange={(invoice) => {
                const inv = openInvoices.find((i) => i._id === invoice);
                set({ invoice, amount: inv && !form.amount ? String(inv.balance) : form.amount });
              }}
              options={invoiceOptions}
              placeholder="Not for an invoice (advance)"
              searchPlaceholder="Search invoices…"
              clearLabel="Not for an invoice (advance)"
              emptyText="No unpaid invoices for this client"
            />
          </Field>
        )}

        {canApplyExpense && (
          <Field label="Apply to expense" hint={form.expense ? undefined : "Leave empty to record the money only. Costs reach reports through Expenses."}>
            <SearchableSelect
              value={form.expense}
              onChange={(expense) => {
                const x = openExpenses.find((o) => o._id === expense);
                set({ expense, amount: x && !form.amount ? String(x.balance) : form.amount });
              }}
              options={expenseOptions}
              placeholder="Not for an expense"
              searchPlaceholder="Search expenses…"
              clearLabel="Not for an expense"
              emptyText="No unpaid expenses for this vendor"
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" required hint={chosen ? `Balance due ${fmtMoney(chosen.balance, chosenSymbol)}` : undefined}>
            <input type="number" min="0" step="any" className={inputCls} value={form.amount} onChange={(e) => set({ amount: e.target.value })} />
          </Field>
          <Field label="Date"><input type="date" className={inputCls} value={form.date} onChange={(e) => set({ date: e.target.value })} /></Field>
          <Field label="Method">
            <select className={selectCls} value={form.method} onChange={(e) => set({ method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Reference / UTR"><input className={inputCls} value={form.reference} onChange={(e) => set({ reference: e.target.value })} /></Field>
        </div>
        <Field label="Notes"><textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
      </form>
    </Drawer>
  );
};

const Payments = () => {
  const { permissions, settings, symbol } = useAccountsContext();
  const presets = useMemo(() => rangePresets(settings?.financialYearStartMonth || 4), [settings]);
  const [range, setRange] = useState({ from: presets[0].from, to: presets[0].to });
  const [direction, setDirection] = useState("");
  const [party, setParty] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState({ open: false, direction: "in" });
  const [toDelete, setToDelete] = useState(null);
  const canManage = permissions.manageInvoices;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [debounced, direction, party, range]);

  const partyOptions = usePartyOptions();
  const { data, isLoading, isError, error, refetch } = usePayments({ ...range, direction, ...splitParty(party), search: debounced, page, limit: 20 });
  const remove = useDeletePayment();

  const exportCsv = () => {
    downloadCsv(`payments-${range.from}-to-${range.to}.csv`, [
      ["Date", "Party", "Party type", "Type", "Amount", "Method", "Reference", "Invoice", "Expense", "Receipt", "Notes"],
      ...(data?.payments || []).map((p) => [toInputDate(p.date), partyOf(p).name, partyOf(p).type === "vendor" ? "Vendor" : "Client", p.direction === "in" ? "Pay in" : "Pay out", p.amount, methodLabel(p.method), p.reference, p.invoice?.number || "", p.expense?.description || "", p.receiptNumber, p.notes]),
    ]);
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Money received from and paid to your clients and vendors."
        actions={
          <>
            <button className={btnGhost} onClick={exportCsv} disabled={!data?.payments?.length}><FiDownload /> Export page</button>
            {canManage && (
              <>
                <button className={btnGhost} onClick={() => setDrawer({ open: true, direction: "out" })}><FiArrowUpRight /> Pay out</button>
                <button className={btnPrimary} onClick={() => setDrawer({ open: true, direction: "in" })}><FiArrowDownLeft /> Pay in</button>
              </>
            )}
          </>
        }
      />

      <div className="mb-4"><DateRangeFilter value={range} onChange={setRange} fyStartMonth={settings?.financialYearStartMonth} /></div>

      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Money in" value={fmtMoney(data.summary.moneyIn, symbol)} sub="received from parties" />
          <StatCard label="Money out" value={fmtMoney(data.summary.moneyOut, symbol)} sub="paid to parties" />
          <StatCard label="Net" value={fmtMoney(data.summary.net, symbol)} sub="in minus out" />
          <StatCard label="Advance held" value={fmtMoney(data.summary.advance, symbol)} sub="from clients, not on an invoice" />
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search party, reference or invoice" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="w-52">
            <SearchableSelect
              value={party}
              onChange={setParty}
              options={partyOptions}
              placeholder="All parties"
              searchPlaceholder="Search clients and vendors…"
              clearLabel="All parties"
              emptyText="No party found"
            />
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Direction">
            {DIRECTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDirection(d.value)}
                className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${direction === d.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              rows={data.payments}
              rowKey={(r) => `${r.source}-${r._id}`}
              empty={<EmptyState title="No payments in this period" text={canManage ? "Record money received from, or paid to, a client or vendor." : undefined} action={canManage && <button className={btnPrimary} onClick={() => setDrawer({ open: true, direction: "in" })}><FiArrowDownLeft /> Pay in</button>} />}
              columns={[
                { key: "date", title: "Date", render: (r) => <span className="text-slate-500 whitespace-nowrap">{fmtDate(r.date)}</span> },
                { key: "party", title: "Party", render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800">{partyOf(r).name}</p>
                    <p className="text-[11px] text-slate-400">{partyOf(r).type === "vendor" ? "Vendor" : "Client"}</p>
                  </div>
                ) },
                { key: "type", title: "Type", render: (r) => (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.direction === "in" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {r.direction === "in" ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                    {r.direction === "in" ? "Pay in" : "Pay out"}
                  </span>
                ) },
                { key: "details", title: "Details", render: (r) => (
                  <div className="text-xs text-slate-500">
                    <p>
                      {methodLabel(r.method)}
                      {r.reference ? ` · ${r.reference}` : ""}
                      {r.receiptNumber ? ` · ${r.receiptNumber}` : ""}
                    </p>
                    <p className="text-slate-400">
                      {r.invoice ? <>Invoice <Link className="text-[#3F8CFF] hover:underline" to={`/accounts/invoices/${r.invoice._id}`}>{r.invoice.number}</Link></> : r.expense ? `Expense: ${r.expense.description}${r.expense.billNumber ? ` (${r.expense.billNumber})` : ""}` : partyOf(r).type === "vendor" ? (r.direction === "in" ? "Vendor refund" : "Vendor payment") : r.direction === "in" ? "Advance" : "Refund"}
                      {r.notes ? ` · ${r.notes}` : ""}
                    </p>
                  </div>
                ) },
                { key: "amount", title: "Amount", align: "right", render: (r) => (
                  <span className={`font-semibold ${r.direction === "in" ? "text-emerald-600" : "text-amber-600"}`}>
                    {r.direction === "in" ? "+" : "−"}{fmtMoney(r.amount, symbol)}
                  </span>
                ) },
                ...(permissions.delete ? [{ key: "act", title: "", align: "right", render: (r) => (
                  r.source === "ledger"
                    ? <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label="Delete" onClick={() => setToDelete(r)}><FiTrash2 className="w-3.5 h-3.5" /></button>
                    : <span className="text-[11px] text-slate-300" title="Recorded on the invoice. Remove it from there.">on invoice</span>
                ) }] : []),
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <PaymentDrawer isOpen={drawer.open} direction={drawer.direction} onClose={() => setDrawer((d) => ({ ...d, open: false }))} />
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this payment?"
        message={toDelete ? `${toDelete.direction === "in" ? "Pay in" : "Pay out"} of ${fmtMoney(toDelete.amount, symbol)} for ${partyOf(toDelete).name}${toDelete.invoice ? ` will be removed, and taken off invoice ${toDelete.invoice.number}` : toDelete.expense ? ` will be removed from the expense "${toDelete.expense.description}". If this payment had closed it, it becomes unpaid again` : " will be removed"}.` : ""}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(toDelete._id).then(() => setToDelete(null)).catch(() => setToDelete(null))}
      />
    </div>
  );
};

export default Payments;
