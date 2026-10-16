import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiDownload, FiEdit2, FiPaperclip, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { uploadSingleFile } from "../../../api/service";
import { useAccountsContext } from "../context";
import {
  useClientLookup,
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useSetExpenseStatus,
  useUpdateExpense,
} from "../hooks/useAccounts";
import { EXPENSE_STATUS, PAYMENT_METHODS, downloadCsv, errorMessage, fmtDate, fmtMoney, methodLabel, rangePresets, toInputDate } from "../utils/format";
import { ConfirmModal, DateRangeFilter, Drawer, EmptyState, ErrorState, Field, PageHeader, Pagination, Spinner, StatCard, StatusBadge, Table, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "../components/ui";

const blank = () => ({
  date: toInputDate(new Date()),
  category: "",
  description: "",
  vendor: "",
  billNumber: "",
  amount: "",
  taxAmount: "",
  project: "",
  billable: false,
  paymentMethod: "bank_transfer",
  paymentReference: "",
  status: "approved",
  notes: "",
  attachments: [],
});

const ExpenseDrawer = ({ isOpen, onClose, expense }) => {
  const { settings, symbol } = useAccountsContext();
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const { data: clients } = useClientLookup(isOpen);
  const [form, setForm] = useState(blank());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      expense
        ? {
            ...blank(),
            ...expense,
            date: toInputDate(expense.date),
            project: expense.project?._id || expense.project || "",
            amount: expense.amount,
            taxAmount: expense.taxAmount || "",
            attachments: expense.attachments || [],
          }
        : { ...blank(), category: settings?.expenseCategories?.[0] || "" }
    );
  }, [isOpen, expense, settings]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const total = (Number(form.amount) || 0) + (Number(form.taxAmount) || 0);

  const attach = async (file) => {
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    const res = await uploadSingleFile(data);
    setUploading(false);
    if (!res.success || !res.fileUrl) {
      toast.error("Could not upload the file");
      return;
    }
    set({ attachments: [...form.attachments, { url: res.fileUrl, name: res.originalName || file.name, mimeType: res.mimeType || file.type }] });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.description.trim() || !(Number(form.amount) >= 0) || form.amount === "") {
      toast.error("Category, description and amount are required");
      return;
    }
    const payload = {
      ...form,
      amount: Number(form.amount),
      taxAmount: Number(form.taxAmount) || 0,
      project: form.project || null,
      billable: Boolean(form.project && form.billable),
    };
    delete payload._id;
    try {
      if (expense) await update.mutateAsync({ id: expense._id, data: payload });
      else await create.mutateAsync(payload);
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const busy = create.isPending || update.isPending;
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? "Edit expense" : "Add expense"}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button className={btnPrimary} onClick={submit} disabled={busy || uploading}>{busy ? "Saving…" : "Save expense"}</button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><input type="date" className={inputCls} value={form.date} onChange={(e) => set({ date: e.target.value })} /></Field>
          <Field label="Category" required>
            <select className={selectCls} value={form.category} onChange={(e) => set({ category: e.target.value })}>
              {!settings?.expenseCategories?.includes(form.category) && form.category && <option value={form.category}>{form.category}</option>}
              {(settings?.expenseCategories || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description" required><input className={inputCls} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="What was it for?" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vendor / paid to"><input className={inputCls} value={form.vendor} onChange={(e) => set({ vendor: e.target.value })} /></Field>
          <Field label="Bill / invoice no."><input className={inputCls} value={form.billNumber} onChange={(e) => set({ billNumber: e.target.value })} /></Field>
          <Field label="Amount (before tax)" required><input type="number" min="0" step="any" className={inputCls} value={form.amount} onChange={(e) => set({ amount: e.target.value })} /></Field>
          <Field label="GST paid" hint="Input tax credit"><input type="number" min="0" step="any" className={inputCls} value={form.taxAmount} onChange={(e) => set({ taxAmount: e.target.value })} /></Field>
        </div>
        <p className="text-xs text-slate-500">Total paid: <b>{fmtMoney(total, symbol)}</b></p>

        <div className="p-3 rounded-xl bg-slate-50 space-y-3">
          <Field label="Charge to client" hint="Counts towards that client's project cost">
            <select className={selectCls} value={form.project} onChange={(e) => set({ project: e.target.value, billable: e.target.value ? form.billable : false })}>
              <option value="">Not for a specific client</option>
              {(clients?.clients || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          {form.project && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.billable} onChange={(e) => set({ billable: e.target.checked })} />
              Bill this to the client (shows up when creating their invoice)
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Paid by">
            <select className={selectCls} value={form.paymentMethod} onChange={(e) => set({ paymentMethod: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Reference / UTR"><input className={inputCls} value={form.paymentReference} onChange={(e) => set({ paymentReference: e.target.value })} /></Field>
          {!expense && (
            <Field label="Status">
              <select className={selectCls} value={form.status} onChange={(e) => set({ status: e.target.value })}>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending approval</option>
              </select>
            </Field>
          )}
        </div>

        <Field label="Receipts & bills">
          <div className="space-y-2">
            {form.attachments.map((a, i) => (
              <div key={a.url} className="flex items-center justify-between gap-2 text-xs bg-slate-50 rounded-lg px-3 py-2">
                <a href={a.url} target="_blank" rel="noreferrer" className="text-[#3F8CFF] truncate">{a.name || "Attachment"}</a>
                <button type="button" onClick={() => set({ attachments: form.attachments.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-500" aria-label="Remove file"><FiX /></button>
              </div>
            ))}
            <label className={`${btnSmall} cursor-pointer`}>
              <FiPaperclip /> {uploading ? "Uploading…" : "Attach file"}
              <input type="file" className="hidden" accept="image/*,.pdf" disabled={uploading} onChange={(e) => { attach(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </div>
        </Field>
        <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
      </form>
    </Drawer>
  );
};

const Expenses = () => {
  const { permissions, settings, symbol } = useAccountsContext();
  const presets = useMemo(() => rangePresets(settings?.financialYearStartMonth || 4), [settings]);
  const [range, setRange] = useState({ from: presets[0].from, to: presets[0].to });
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState({ open: false, expense: null });
  const [toDelete, setToDelete] = useState(null);
  const [toReject, setToReject] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [debounced, category, status, range]);

  const { data, isLoading, isError, error, refetch } = useExpenses({ ...range, category, status, search: debounced, page, limit: 20 });
  const setExpenseStatus = useSetExpenseStatus();
  const remove = useDeleteExpense();
  const canManage = permissions.manageExpenses;

  const exportCsv = () => {
    const rows = data?.expenses || [];
    downloadCsv(`expenses-${range.from}-to-${range.to}.csv`, [
      ["Date", "Category", "Description", "Vendor", "Bill no", "Client", "Amount", "GST", "Total", "Status", "Paid by"],
      ...rows.map((e) => [toInputDate(e.date), e.category, e.description, e.vendor, e.billNumber, e.project?.name || "", e.amount, e.taxAmount, e.total, e.status, methodLabel(e.paymentMethod)]),
    ]);
  };

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Everything the company spends, by category and by client."
        actions={
          <>
            <button className={btnGhost} onClick={exportCsv} disabled={!data?.expenses?.length}><FiDownload /> Export page</button>
            {canManage && <button className={btnPrimary} onClick={() => setDrawer({ open: true, expense: null })}><FiPlus /> Add expense</button>}
          </>
        }
      />

      <div className="mb-4"><DateRangeFilter value={range} onChange={setRange} fyStartMonth={settings?.financialYearStartMonth} /></div>

      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Total spent" value={fmtMoney(data.summary.total, symbol)} sub={`${data.total} expense${data.total === 1 ? "" : "s"}`} />
          <StatCard label="Before tax" value={fmtMoney(data.summary.amount, symbol)} />
          <StatCard label="GST paid" value={fmtMoney(data.summary.tax, symbol)} sub="claimable as input credit" />
          <StatCard label="Biggest category" value={data.summary.byCategory[0]?.category || "—"} sub={data.summary.byCategory[0] ? fmtMoney(data.summary.byCategory[0].total, symbol) : undefined} />
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search description or vendor" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={`${selectCls} !w-auto`} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            <option value="">All categories</option>
            {(settings?.expenseCategories || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className={`${selectCls} !w-auto`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            {Object.entries(EXPENSE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              rows={data.expenses}
              empty={<EmptyState title="No expenses in this period" text={canManage ? "Add an expense to start tracking spend." : undefined} action={canManage && <button className={btnPrimary} onClick={() => setDrawer({ open: true, expense: null })}><FiPlus /> Add expense</button>} />}
              columns={[
                { key: "date", title: "Date", render: (r) => <span className="text-slate-500 whitespace-nowrap">{fmtDate(r.date)}</span> },
                { key: "desc", title: "Expense", render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800">{r.description}</p>
                    <p className="text-xs text-slate-400">{r.category}{r.vendor ? ` · ${r.vendor}` : ""}{r.attachments?.length ? ` · ${r.attachments.length} file` : ""}</p>
                  </div>
                ) },
                { key: "client", title: "Client", render: (r) => (r.project ? <div><span>{r.project.name}</span>{r.billable && <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.invoice ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{r.invoice ? `Billed ${r.invoice.number}` : "Billable"}</span>}</div> : <span className="text-slate-300">—</span>) },
                { key: "status", title: "Status", render: (r) => <StatusBadge status={r.status} map={EXPENSE_STATUS} /> },
                { key: "total", title: "Total", align: "right", render: (r) => <div><span className="font-semibold">{fmtMoney(r.total, symbol)}</span>{r.taxAmount > 0 && <p className="text-[11px] text-slate-400">incl. GST {fmtMoney(r.taxAmount, symbol)}</p>}</div> },
                ...(canManage ? [{ key: "act", title: "", align: "right", render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    {r.status === "pending" && (
                      <>
                        <button className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 flex items-center justify-center" title="Approve" aria-label="Approve" onClick={() => setExpenseStatus.mutate({ id: r._id, data: { status: "approved" } })}><FiCheck /></button>
                        <button className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center" title="Reject" aria-label="Reject" onClick={() => setToReject(r)}><FiX /></button>
                      </>
                    )}
                    {r.status === "approved" && <button className={btnSmall} onClick={() => setExpenseStatus.mutate({ id: r._id, data: { status: "paid" } })}>Mark paid</button>}
                    <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" aria-label="Edit" onClick={() => setDrawer({ open: true, expense: r })}><FiEdit2 className="w-3.5 h-3.5" /></button>
                    {permissions.delete && !r.invoice && <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label="Delete" onClick={() => setToDelete(r)}><FiTrash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                ) }] : []),
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <ExpenseDrawer isOpen={drawer.open} expense={drawer.expense} onClose={() => setDrawer({ open: false, expense: null })} />
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this expense?"
        message={toDelete ? `${toDelete.description} (${fmtMoney(toDelete.total, symbol)}) will be removed.` : ""}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(toDelete._id).then(() => setToDelete(null)).catch(() => {})}
      />
      <ConfirmModal
        isOpen={!!toReject}
        onClose={() => setToReject(null)}
        title="Reject this expense?"
        confirmLabel="Reject"
        danger
        reasonLabel="Reason"
        reasonRequired
        busy={setExpenseStatus.isPending}
        onConfirm={(reason) => setExpenseStatus.mutateAsync({ id: toReject._id, data: { status: "rejected", reason } }).then(() => setToReject(null)).catch(() => {})}
      />
    </div>
  );
};

export default Expenses;
