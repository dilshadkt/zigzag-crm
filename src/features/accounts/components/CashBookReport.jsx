import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiDownload, FiEdit2 } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import { useAccountsContext } from "../context";
import { useCashBook, useSaveSettings } from "../hooks/useAccounts";
import { downloadCsv, fmtDate, fmtMoney, methodLabel, toInputDate } from "../utils/format";
import { Card, ErrorState, Field, Spinner, StatCard, Table, btnGhost, btnPrimary, inputCls } from "./ui";

const SOURCES = {
  invoice: "Invoice",
  payment: "Payments",
  expense: "Expense",
  purchase: "Purchase",
  asset: "Asset",
  salary: "Salary",
  advance: "Advance",
  fee: "Course fee",
};

const NOTES = {
  cash: "Cash only.",
  bank: "Bank transfer, UPI, cheque and card, across all bank accounts. A cheque counts on the date it was entered.",
};

const OpeningModal = ({ book, name, saved, onClose }) => {
  const save = useSaveSettings();
  const [form, setForm] = useState({
    amount: saved?.amount ? String(saved.amount) : "",
    date: saved?.date ? toInputDate(saved.date) : "",
  });

  const submit = async (e) => {
    e.preventDefault();
    if (save.isPending) return;
    if (form.amount === "" || !Number.isFinite(Number(form.amount))) return toast.error("Enter the opening balance (0 is fine)");
    if (!form.date) return toast.error("Choose the date it applies from");
    try {
      await save.mutateAsync({ openingBalances: { [book]: { amount: Number(form.amount), date: form.date } } });
      onClose();
    } catch {
      // the mutation hook already showed the error
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`${name} opening balance`}>
      <form onSubmit={submit} className="pt-4 space-y-3">
        <Field label="Amount held" required hint={book === "bank" ? "All bank accounts together. Use a minus sign for an overdraft." : "Cash in hand."}>
          <input type="number" step="any" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} autoFocus />
        </Field>
        <Field label="At the start of" required hint="Entries dated before this are treated as already included in the amount.">
          <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
};

const Notice = ({ children }) => (
  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">{children}</p>
);

/** The cash report or the bank report: every movement with a running balance. */
const CashBookReport = ({ book, range }) => {
  const { symbol, permissions } = useAccountsContext();
  const q = useCashBook(book, range);
  const [editing, setEditing] = useState(false);
  const name = book === "cash" ? "Cash" : "Bank";

  if (q.isLoading) return <Spinner />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;
  const d = q.data;
  const money = (v) => (v === null ? "—" : fmtMoney(v, symbol));
  const showMethod = book === "bank";

  // The opening and closing balances sit in the table, as in a cash book
  const rows = d.beforeOpening
    ? []
    : [
        { id: "opening", edge: "Opening balance", date: d.from, balance: d.openingBalance },
        ...d.transactions,
        { id: "closing", edge: "Closing balance", date: d.to, balance: d.closingBalance, receipts: d.receipts, payments: d.payments },
      ];

  const exportCsv = () =>
    downloadCsv(`${book}-report-${toInputDate(d.from)}-to-${toInputDate(d.to)}.csv`, [
      ["Date", "Particulars", "Details", "Source", "Method", "Reference", "Receipt", "Payment", "Balance"],
      ...rows.map((r) =>
        r.edge
          ? [toInputDate(r.date), r.edge, "", "", "", "", r.receipts ?? "", r.payments ?? "", r.balance]
          : [toInputDate(r.date), r.particulars, r.details, SOURCES[r.source] || r.source, methodLabel(r.method), r.reference, r.direction === "in" ? r.amount : "", r.direction === "out" ? r.amount : "", r.balance]
      ),
    ]);

  const amountCell = (r, direction) => {
    if (r.edge) {
      const value = direction === "in" ? r.receipts : r.payments;
      return value === undefined ? "" : <span className="font-bold">{money(value)}</span>;
    }
    if (r.direction !== direction) return <span className="text-slate-300">—</span>;
    return <span className={`font-semibold ${direction === "in" ? "text-emerald-600" : "text-amber-600"}`}>{money(r.amount)}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Opening balance" value={money(d.openingBalance)} sub={d.beforeOpening ? undefined : `start of ${fmtDate(d.from)}`} />
        <StatCard label="Receipts" value={money(d.receipts)} sub="money in" tone="good" />
        <StatCard label="Payments" value={money(d.payments)} sub="money out" tone="warn" />
        <StatCard label="Closing balance" value={money(d.closingBalance)} sub={d.beforeOpening ? undefined : `end of ${fmtDate(d.to)}`} tone={d.closingBalance < 0 ? "bad" : "default"} />
      </div>

      {!d.openingDate && (
        <Notice>
          No opening balance is set for {name.toLowerCase()}, so the balance counts only what is recorded here.
          {permissions.manageSettings ? " Set one to match what you actually hold." : " Ask someone who manages accounts settings to set it."}
        </Notice>
      )}
      {d.beforeOpening && <Notice>This period ends before the opening balance date ({fmtDate(d.openingDate)}). Choose a later period.</Notice>}
      {!d.beforeOpening && d.startsLate && <Notice>The report starts on {fmtDate(d.openingDate)}, the opening balance date.</Notice>}
      {d.unassigned.count > 0 && (
        <Notice>
          {d.unassigned.count} {d.unassigned.count === 1 ? "entry" : "entries"} in this period ({money(d.unassigned.moneyIn)} in, {money(d.unassigned.moneyOut)} out)
          {d.unassigned.count === 1 ? " is" : " are"} marked &quot;Other&quot; or {d.unassigned.count === 1 ? "has" : "have"} no payment method, so {d.unassigned.count === 1 ? "it is" : "they are"} in neither the cash nor the bank report.
        </Notice>
      )}

      <Card
        title={`${name} transactions`}
        subtitle={NOTES[book]}
        padded={false}
        actions={
          <div className="flex flex-wrap gap-2">
            {permissions.manageSettings && <button className={btnGhost} onClick={() => setEditing(true)}><FiEdit2 /> Opening balance</button>}
            <button className={btnGhost} onClick={exportCsv} disabled={!rows.length}><FiDownload /> Export CSV</button>
          </div>
        }
      >
        <Table
          rows={rows}
          rowKey={(r) => r.id}
          dense
          empty={<p className="p-8 text-center text-sm text-slate-400">Nothing to show for this period.</p>}
          columns={[
            { key: "date", title: "Date", render: (r) => <span className="text-slate-500 whitespace-nowrap">{fmtDate(r.date)}</span> },
            { key: "particulars", title: "Particulars", render: (r) => (r.edge
              ? <span className="font-bold text-slate-800">{r.edge}</span>
              : (
                <div>
                  <p className="font-semibold text-slate-800">{r.particulars}</p>
                  <p className="text-[11px] text-slate-400">{[r.details, r.reference].filter(Boolean).join(" · ")}</p>
                </div>
              )) },
            { key: "source", title: "From", render: (r) => !r.edge && <span className="inline-block whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{SOURCES[r.source] || r.source}</span> },
            ...(showMethod ? [{ key: "method", title: "Method", render: (r) => !r.edge && <span className="text-xs text-slate-600 whitespace-nowrap">{methodLabel(r.method)}</span> }] : []),
            { key: "in", title: "Receipts", align: "right", render: (r) => amountCell(r, "in") },
            { key: "out", title: "Payments", align: "right", render: (r) => amountCell(r, "out") },
            { key: "balance", title: "Balance", align: "right", render: (r) => <span className={`font-semibold whitespace-nowrap ${r.balance < 0 ? "text-red-600" : "text-slate-800"}`}>{money(r.balance)}</span> },
          ]}
        />
      </Card>

      <p className="text-xs text-slate-500">
        Counts invoice payments, entries under Payments, expenses and purchases (assets too) marked Paid, salary payments, salary advances and academy course fees.
        Anything still Unpaid is not counted until marked Paid. Moving money between cash and bank is not recorded yet.
      </p>

      {editing && <OpeningModal book={book} name={name} saved={d.openingSetting} onClose={() => setEditing(false)} />}
    </div>
  );
};

export default CashBookReport;
