import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiDownload, FiEdit2, FiPaperclip, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { uploadSingleFile } from "../../../api/service";
import { useAccountsContext } from "../context";
import {
  useClientLookup,
  useAddExpenseCategory,
  useCreateExpense,
  useDeleteExpense,
  useDeleteVendor,
  useRemoveExpenseCategory,
  useExpenses,
  useExpenseDescriptions,
  useSetExpenseStatus,
  useUpdateExpense,
  useVendors,
} from "../hooks/useAccounts";
import VendorDrawer from "../components/VendorDrawer";
import SearchableSelect from "../components/SearchableSelect";
import SuggestInput from "../components/SuggestInput";
import { ASSET_CATEGORIES, EXPENSE_STATUS, PAYMENT_METHODS, depreciationLabel, downloadCsv, errorMessage, fmtDate, fmtMoney, kindNoun, methodLabel, rangePresets, toInputDate } from "../utils/format";
import { ConfirmModal, DateRangeFilter, Drawer, EmptyState, ErrorState, Field, PageHeader, Pagination, Spinner, StatCard, StatusBadge, Table, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "../components/ui";

const blankAsset = () => ({
  method: "straight_line",
  years: "",
  ratePercent: "",
  salvageValue: "",
  // Empty means the purchase date
  inUseFrom: "",
  disposedOn: "",
  alreadyOwned: false,
});

// The saved asset details as form values
const assetFormFor = (expense) => {
  const a = expense.asset;
  if (!a) return blankAsset();
  const boughtOn = toInputDate(expense.date);
  return {
    method: a.method,
    years: a.usefulLifeMonths ? String(Math.round((a.usefulLifeMonths / 12) * 100) / 100) : "",
    ratePercent: a.ratePercent ?? "",
    salvageValue: a.salvageValue || "",
    inUseFrom: a.inUseFrom && toInputDate(a.inUseFrom) !== boughtOn ? toInputDate(a.inUseFrom) : "",
    disposedOn: a.disposedOn ? toInputDate(a.disposedOn) : "",
    alreadyOwned: Boolean(a.alreadyOwned),
  };
};

const blank = () => ({
  asset: blankAsset(),
  date: toInputDate(new Date()),
  category: "",
  description: "",
  vendorRef: "",
  billNumber: "",
  amount: "",
  taxAmount: "",
  // Clients this is charged to. With two or more, each row carries its share of the amount.
  clientRows: [{ project: "", share: "" }],
  // false: the amount is split equally; true: the shares were typed in
  sharesCustom: false,
  billable: false,
  payments: [{ method: "bank_transfer", amount: "", reference: "" }],
  status: "approved",
  notes: "",
  attachments: [],
});

const LEGACY_VENDOR = "__legacy";
// A client picked as "paid to" - saved as the client's name, since it has no vendor record
const CLIENT_PREFIX = "client:";

const round2 = (n) => Math.round(n * 100) / 100;

// Split an amount between n clients to the paisa; the last one takes the rounding remainder
const equalShares = (amount, n) => {
  const each = Math.floor((amount / n) * 100) / 100;
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? round2(amount - each * (n - 1)) : each));
};

const clientRowsFor = (expense) => {
  if (expense.allocations?.length) {
    return expense.allocations.map((a) => ({ project: a.project?._id || a.project, share: String(a.amount) }));
  }
  const project = expense.project?._id || expense.project;
  return [{ project: project || "", share: "" }];
};

// Older expenses only have a single paymentMethod / paymentReference
const paymentsFor = (expense) =>
  expense.payments?.length
    ? expense.payments.map((p) => ({ method: p.method, amount: String(p.amount), reference: p.reference || "" }))
    : [{ method: expense.paymentMethod || "bank_transfer", amount: "", reference: expense.paymentReference || "" }];

/** Add or edit an expense, a purchase or an asset. `kind` applies to new records. */
export const ExpenseDrawer = ({ isOpen, onClose, expense, kind = "expense" }) => {
  const { settings, symbol } = useAccountsContext();
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const { data: clients } = useClientLookup(isOpen);
  const { data: vendorData } = useVendors(undefined, isOpen);
  const { data: pastData } = useExpenseDescriptions(isOpen);
  const [addingVendor, setAddingVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [toRemove, setToRemove] = useState(null);
  const deleteVendor = useDeleteVendor();
  const addCategoryMutation = useAddExpenseCategory();
  const removeCategoryMutation = useRemoveExpenseCategory();
  const [form, setForm] = useState(blank());
  const [uploading, setUploading] = useState(false);
  const recordKind = expense ? expense.kind || "expense" : kind;
  const isAsset = recordKind === "asset";
  const noun = recordKind;

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      expense
        ? {
            ...blank(),
            ...expense,
            date: toInputDate(expense.date),
            clientRows: clientRowsFor(expense),
            sharesCustom: Boolean(expense.allocations?.length),
            billable: Boolean(expense.billable),
            amount: expense.amount,
            taxAmount: expense.taxAmount || "",
            attachments: expense.attachments || [],
            asset: assetFormFor(expense),
            payments: paymentsFor(expense),
            // Older expenses only have the vendor as text, with no vendor record
            vendorRef: expense.vendorRef?._id || expense.vendorRef || (expense.vendor ? LEGACY_VENDOR : ""),
          }
        : { ...blank(), category: kind === "asset" ? "" : settings?.expenseCategories?.[0] || "" }
    );
  }, [isOpen, expense, settings, kind]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setAsset = (patch) => setForm((f) => ({ ...f, asset: { ...f.asset, ...patch } }));
  // Something already owned had no purchase to pay for here
  const owned = isAsset && form.asset.alreadyOwned;

  const vendorOptions = [
    ...(form.vendorRef === LEGACY_VENDOR
      ? [{ value: LEGACY_VENDOR, label: expense?.vendor || "", hint: "not in vendor list", removable: false }]
      : []),
    ...(vendorData?.vendors || []).map((v) => ({ value: v._id, label: v.name, hint: v.gstin || v.phone })),
    // Clients can be paid to as well (refunds, payments made on their behalf)
    ...(clients?.clients || []).map((c) => ({ value: CLIENT_PREFIX + c._id, label: c.name, hint: "Client", removable: false })),
  ];

  const descriptionSuggestions = (pastData?.descriptions || []).map((d) => ({
    ...d,
    label: d.description,
    hint: d.category,
  }));

  // Reusing an earlier expense: fill in what it was usually filed under
  const pickDescription = (item) => {
    const patch = { description: item.description };
    if (listedCategories.includes(item.category)) patch.category = item.category;
    if (!form.vendorRef) {
      // Last paid to a vendor record, or to a client (kept as the client's name)
      const match = item.vendorRef
        ? vendorOptions.find((o) => o.value === item.vendorRef)
        : item.vendor && vendorOptions.find((o) => o.value.startsWith(CLIENT_PREFIX) && o.label === item.vendor);
      if (match) patch.vendorRef = match.value;
    }
    set(patch);
  };

  // A category already on this expense stays selectable even if it is off the list now
  const listedCategories = settings?.expenseCategories || [];
  const categoryOptions = [
    ...listedCategories.map((c) => ({ value: c, label: c })),
    ...(form.category && !listedCategories.includes(form.category)
      ? [{ value: form.category, label: form.category, removable: false }]
      : []),
  ];

  const addCategory = async (name) => {
    try {
      const res = await addCategoryMutation.mutateAsync(name);
      set({ category: res.category });
    } catch {
      // the mutation hook already showed the error
    }
  };

  const confirmRemove = async () => {
    try {
      if (toRemove.type === "vendor") {
        await deleteVendor.mutateAsync(toRemove.id);
        if (form.vendorRef === toRemove.id) set({ vendorRef: "" });
      } else {
        await removeCategoryMutation.mutateAsync(toRemove.id);
      }
    } catch {
      // the mutation hook already showed why (e.g. the vendor is still used on expenses)
    }
    setToRemove(null);
  };

  const total = round2((Number(form.amount) || 0) + (owned ? 0 : Number(form.taxAmount) || 0));

  // Charging to clients: one client owns the whole amount, several split it
  const chosenRows = form.clientRows.filter((r) => r.project);
  const multiClient = chosenRows.length > 1;
  const shareAmounts = multiClient
    ? form.sharesCustom
      ? chosenRows.map((r) => Number(r.share) || 0)
      : equalShares(Number(form.amount) || 0, chosenRows.length)
    : [];
  const sharesSum = round2(shareAmounts.reduce((s, a) => s + a, 0));
  const sharesOff = multiClient && Math.abs(sharesSum - (Number(form.amount) || 0)) > 0.01;
  const clientList = clients?.clients || [];
  const clientName = (id) => clientList.find((c) => c._id === id)?.name;

  const setClientRows = (clientRows, sharesCustom = false) => set({ clientRows, sharesCustom });
  const pickClient = (i, project) =>
    setClientRows(form.clientRows.map((r, j) => (j === i ? { ...r, project } : r)));
  const addClientRow = () => setClientRows([...form.clientRows, { project: "", share: "" }]);
  const removeClientRow = (i) => {
    const rest = form.clientRows.filter((_, j) => j !== i);
    setClientRows(rest.length ? rest : [{ project: "", share: "" }]);
  };
  // Typing a share freezes the others at what they show now, so only that row moves
  const setShare = (rowIndex, value) => {
    let n = -1;
    const rows = form.clientRows.map((r, j) => {
      if (r.project) n += 1;
      const shown = r.project ? String(shareAmounts[n]) : "";
      return { ...r, share: j === rowIndex ? value : shown };
    });
    setClientRows(rows, true);
  };

  // One payment pays the whole total; with several, each row carries its own amount
  const split = form.payments.length > 1;
  const paidSum = round2(form.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
  const balance = round2(total - paidSum);

  const setPayment = (i, patch) =>
    set({ payments: form.payments.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const addPayment = () =>
    set({
      payments: [
        ...form.payments.map((p, i) => (!split && i === 0 ? { ...p, amount: String(total || "") } : p)),
        { method: "cash", amount: "", reference: "" },
      ],
    });
  const removePayment = (i) => set({ payments: form.payments.filter((_, j) => j !== i) });

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
      toast.error(isAsset ? "Category, asset name and cost are required" : "Category, description and amount are required");
      return;
    }
    if (isAsset && form.asset.method === "straight_line" && !(Number(form.asset.years) > 0)) {
      toast.error("Enter the useful life in years");
      return;
    }
    if (isAsset && form.asset.method === "written_down" && !(Number(form.asset.ratePercent) > 0)) {
      toast.error("Enter the yearly depreciation rate");
      return;
    }
    if (!owned && split && (Math.abs(balance) > 0.01 || form.payments.some((p) => !(Number(p.amount) > 0)))) {
      toast.error(
        balance > 0
          ? `Payments are ${fmtMoney(balance, symbol)} short of the total`
          : balance < 0
            ? `Payments are ${fmtMoney(-balance, symbol)} more than the total`
            : "Enter an amount for every payment"
      );
      return;
    }
    if (sharesOff) {
      toast.error(`Client shares add up to ${fmtMoney(sharesSum, symbol)} but the amount is ${fmtMoney(Number(form.amount) || 0, symbol)}`);
      return;
    }
    const payload = {
      ...form,
      amount: Number(form.amount),
      taxAmount: Number(form.taxAmount) || 0,
      project: chosenRows.length === 1 ? chosenRows[0].project : null,
      allocations: multiClient ? chosenRows.map((r, i) => ({ project: r.project, amount: shareAmounts[i] })) : [],
      // A shared expense can't be billed to one client
      billable: Boolean(chosenRows.length === 1 && form.billable),
      payments: form.payments.map((p) => ({
        method: p.method,
        amount: split ? Number(p.amount) : total,
        reference: p.reference,
      })),
    };
    delete payload._id;
    delete payload.clientRows;
    delete payload.sharesCustom;
    if (form.vendorRef === LEGACY_VENDOR) delete payload.vendorRef; // keep the old text name as it is
    else if (form.vendorRef.startsWith(CLIENT_PREFIX)) {
      // A client has no vendor record: unlink any vendor and keep the client's name as text
      payload.vendorRef = null;
      payload.vendor = vendorOptions.find((o) => o.value === form.vendorRef)?.label || "";
    } else delete payload.vendor;
    delete payload.paymentMethod;
    delete payload.paymentReference;
    delete payload.position;
    if (expense) delete payload.kind;
    else payload.kind = recordKind;
    if (isAsset) {
      const a = form.asset;
      payload.asset = {
        method: a.method,
        usefulLifeMonths: Math.round(Number(a.years) * 12) || null,
        ratePercent: Number(a.ratePercent) || null,
        salvageValue: Number(a.salvageValue) || 0,
        inUseFrom: a.inUseFrom,
        disposedOn: a.disposedOn,
        alreadyOwned: a.alreadyOwned,
      };
      Object.assign(payload, { project: null, allocations: [], billable: false });
      if (owned) Object.assign(payload, { taxAmount: 0, payments: [] });
    } else delete payload.asset;
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
    <>
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? `Edit ${noun}` : isAsset ? "Add asset" : `Add ${noun}`}
      subtitle={isAsset ? "Its cost reaches profit month by month, as depreciation." : undefined}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button className={btnPrimary} onClick={submit} disabled={busy || uploading}>{busy ? "Saving…" : `Save ${noun}`}</button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        {isAsset && !expense && (
          <label className="flex items-start gap-2 text-sm text-slate-700 p-3 rounded-xl bg-slate-50">
            <input type="checkbox" className="mt-1" checked={form.asset.alreadyOwned} onChange={(e) => setAsset({ alreadyOwned: e.target.checked })} />
            <span>We already own this<span className="block text-[11px] text-slate-400">No payment is recorded. Use the original purchase date and cost.</span></span>
          </label>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label={isAsset ? "Purchase date" : "Date"}><input type="date" className={inputCls} value={form.date} onChange={(e) => set({ date: e.target.value })} /></Field>
          <Field label="Category" required>
            {isAsset ? (
              <>
                <input className={inputCls} list="asset-categories" value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder="Choose or type" />
                <datalist id="asset-categories">{ASSET_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
              </>
            ) : (
              <SearchableSelect
                value={form.category}
                onChange={(category) => set({ category })}
                options={categoryOptions}
                placeholder="Select category"
                searchPlaceholder="Search or type a new category…"
                createLabel="Add category"
                createRequiresQuery
                onCreate={addCategory}
                onRemove={(o) => setToRemove({ type: "category", id: o.value, name: o.label })}
                removeLabel="Remove category"
              />
            )}
          </Field>
        </div>
        {isAsset ? (
          <Field label="Asset name" required>
            <input className={inputCls} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="e.g. MacBook Pro 14, design desk" />
          </Field>
        ) : (
          <Field label="Description" required>
            <SuggestInput
              value={form.description}
              onChange={(description) => set({ description })}
              onPick={pickDescription}
              suggestions={descriptionSuggestions}
              placeholder={recordKind === "purchase" ? "What did you buy?" : "What was it for?"}
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          {!owned && <Field label="Vendor / paid to">
            <SearchableSelect
              value={form.vendorRef}
              onChange={(vendorRef) => set({ vendorRef })}
              options={vendorOptions}
              placeholder="Select vendor"
              searchPlaceholder="Search vendors…"
              clearLabel="No vendor"
              createLabel="Add new vendor"
              emptyText="No vendor found"
              onCreate={(name) => {
                setNewVendorName(name);
                setAddingVendor(true);
              }}
              onRemove={(o) => setToRemove({ type: "vendor", id: o.value, name: o.label })}
              removeLabel="Remove vendor"
            />
          </Field>}
          <Field label="Bill / invoice no."><input className={inputCls} value={form.billNumber} onChange={(e) => set({ billNumber: e.target.value })} /></Field>
          <Field label={owned ? "Cost" : "Amount (before tax)"} required hint={isAsset && !owned ? "This is what gets depreciated. Include GST you can't claim." : undefined}><input type="number" min="0" step="any" className={inputCls} value={form.amount} onChange={(e) => set({ amount: e.target.value })} /></Field>
          {!owned && <Field label="GST paid" hint="Input tax credit"><input type="number" min="0" step="any" className={inputCls} value={form.taxAmount} onChange={(e) => set({ taxAmount: e.target.value })} /></Field>}
        </div>
        {!owned && <p className="text-xs text-slate-500">Total paid: <b>{fmtMoney(total, symbol)}</b></p>}

        {isAsset && (
          <div className="p-3 rounded-xl border border-slate-100 space-y-3">
            <span className="block text-sm font-medium text-slate-700">Depreciation</span>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Method">
                <select className={selectCls} value={form.asset.method} onChange={(e) => setAsset({ method: e.target.value })}>
                  <option value="straight_line">Straight line</option>
                  <option value="written_down">Written down value</option>
                </select>
              </Field>
              {form.asset.method === "straight_line" ? (
                <Field label="Useful life (years)" required><input type="number" min="0" step="any" className={inputCls} value={form.asset.years} onChange={(e) => setAsset({ years: e.target.value })} /></Field>
              ) : (
                <Field label="Rate (% a year)" required><input type="number" min="0" max="100" step="any" className={inputCls} value={form.asset.ratePercent} onChange={(e) => setAsset({ ratePercent: e.target.value })} /></Field>
              )}
              <Field label="Salvage value" hint="What it will still be worth at the end"><input type="number" min="0" step="any" className={inputCls} value={form.asset.salvageValue} onChange={(e) => setAsset({ salvageValue: e.target.value })} placeholder="0" /></Field>
              <Field label="In use from" hint="Empty: the purchase date"><input type="date" className={inputCls} value={form.asset.inUseFrom} onChange={(e) => setAsset({ inUseFrom: e.target.value })} /></Field>
              {expense && (
                <Field label="Disposed on" hint="Sold or scrapped: depreciation stops"><input type="date" className={inputCls} value={form.asset.disposedOn} onChange={(e) => setAsset({ disposedOn: e.target.value })} /></Field>
              )}
            </div>
            <p className="text-[11px] text-slate-400">A full month is charged for the month it comes into use. Ask your accountant which method and rate to use.</p>
          </div>
        )}

        {!isAsset && <div className="p-3 rounded-xl bg-slate-50 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Charge to client</span>
              {multiClient && form.sharesCustom && (
                <button type="button" className="text-xs font-semibold text-[#3F8CFF]" onClick={() => setClientRows(form.clientRows)}>
                  Split equally
                </button>
              )}
            </div>
            {form.clientRows.map((row, i) => {
              const taken = new Set(form.clientRows.filter((_, j) => j !== i).map((r) => r.project));
              const options = clientList.filter((c) => !taken.has(c._id)).map((c) => ({ value: c._id, label: c.name }));
              // A client that has since been removed from the list stays visible on an old expense
              if (row.project && !options.some((o) => o.value === row.project)) {
                options.push({ value: row.project, label: clientName(row.project) || "Unknown client" });
              }
              const shareIndex = row.project ? chosenRows.indexOf(row) : -1;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <SearchableSelect
                      value={row.project}
                      onChange={(project) => pickClient(i, project)}
                      options={options}
                      placeholder={i === 0 ? "Not for a specific client" : "Select client"}
                      searchPlaceholder="Search clients…"
                      clearLabel={i === 0 ? "Not for a specific client" : undefined}
                      emptyText="No client found"
                    />
                  </div>
                  {multiClient && row.project && (
                    <input
                      type="number"
                      min="0"
                      step="any"
                      aria-label={`${clientName(row.project) || "Client"} share`}
                      className={`${inputCls} !w-28 shrink-0`}
                      value={shareAmounts[shareIndex] ?? ""}
                      onChange={(e) => setShare(i, e.target.value)}
                    />
                  )}
                  {form.clientRows.length > 1 && (
                    <button
                      type="button"
                      title="Remove client"
                      aria-label="Remove client"
                      onClick={() => removeClientRow(i)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              );
            })}
            {chosenRows.length > 0 && form.clientRows.every((r) => r.project) && clientList.length > form.clientRows.length && (
              <button type="button" className="flex items-center gap-1 text-xs font-semibold text-[#3F8CFF]" onClick={addClientRow}>
                <FiPlus /> Add another client
              </button>
            )}
            {multiClient ? (
              <p className={`text-xs ${sharesOff ? "text-red-500" : "text-slate-500"}`}>
                {sharesOff
                  ? `Shares add up to ${fmtMoney(sharesSum, symbol)} of ${fmtMoney(Number(form.amount) || 0, symbol)}`
                  : "The amount (before tax) is shared between these clients and counts towards each one&apos;s project cost."}
              </p>
            ) : (
              <p className="text-xs text-slate-400">Counts towards that client&apos;s project cost</p>
            )}
          </div>
          {chosenRows.length === 1 && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.billable} onChange={(e) => set({ billable: e.target.checked })} />
              Bill this to the client (shows up when creating their invoice)
            </label>
          )}
        </div>}

        {!owned && <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Payments</span>
            {split && (
              <span className={`text-xs font-semibold ${Math.abs(balance) <= 0.01 ? "text-emerald-600" : "text-amber-600"}`}>
                {Math.abs(balance) <= 0.01
                  ? "Fully paid"
                  : balance > 0
                    ? `Remaining ${fmtMoney(balance, symbol)}`
                    : `Over by ${fmtMoney(-balance, symbol)}`}
              </span>
            )}
          </div>
          {form.payments.map((p, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <Field label={split ? `Payment ${i + 1} · paid by` : "Paid by"}>
                  <select className={selectCls} value={p.method} onChange={(e) => setPayment(i, { method: e.target.value })}>
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </Field>
                {split ? (
                  <Field label="Amount">
                    <input type="number" min="0" step="any" className={inputCls} value={p.amount} onChange={(e) => setPayment(i, { amount: e.target.value })} />
                  </Field>
                ) : (
                  <Field label="Reference / UTR"><input className={inputCls} value={p.reference} onChange={(e) => setPayment(i, { reference: e.target.value })} /></Field>
                )}
              </div>
              {split && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Reference / UTR"><input className={inputCls} value={p.reference} onChange={(e) => setPayment(i, { reference: e.target.value })} /></Field>
                  </div>
                  <button type="button" onClick={() => removePayment(i)} className="h-10 w-10 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label="Remove payment"><FiTrash2 /></button>
                </div>
              )}
            </div>
          ))}
          <button type="button" className={btnSmall} onClick={addPayment}><FiPlus /> {split ? "Add another payment" : "Split into multiple payments"}</button>
        </div>}

        {!expense && !owned && (
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={(e) => set({ status: e.target.value })}>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending approval</option>
            </select>
          </Field>
        )}

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
    <VendorDrawer
      isOpen={addingVendor}
      initialName={newVendorName}
      onClose={() => setAddingVendor(false)}
      onSaved={(vendor) => set({ vendorRef: vendor._id })}
    />
    <ConfirmModal
      isOpen={!!toRemove}
      onClose={() => setToRemove(null)}
      title={toRemove?.type === "vendor" ? "Remove this vendor?" : "Remove this category?"}
      message={
        toRemove?.type === "vendor"
          ? `${toRemove.name} will be removed from your vendors. A vendor that is already used on expenses can't be removed.`
          : toRemove
            ? `"${toRemove.name}" will be removed from the list. Expenses already filed under it keep it.`
            : ""
      }
      confirmLabel="Remove"
      danger
      busy={deleteVendor.isPending || removeCategoryMutation.isPending}
      onConfirm={confirmRemove}
    />
    </>
  );
};

// The Expenses and Purchases tabs are the same list over different kinds
const VIEWS = {
  expenses: {
    title: "Expenses",
    subtitle: "Everything the company spends day to day, by category and by client.",
    kind: "expense",
    add: [{ kind: "expense", label: "Add expense" }],
    column: "Expense",
    one: "expense",
    search: "Search description or vendor",
    emptyTitle: "No expenses in this period",
    emptyText: "Add an expense to start tracking spend.",
  },
  purchases: {
    title: "Purchases",
    subtitle: "Goods you buy, and assets the company keeps. Assets are depreciated instead of counted as a cost at once.",
    kind: "purchases",
    add: [{ kind: "asset", label: "Purchase asset" }, { kind: "purchase", label: "Add purchase" }],
    column: "Purchase",
    one: "purchase",
    search: "Search item or vendor",
    emptyTitle: "No purchases in this period",
    emptyText: "Record a purchase, or an asset the company bought.",
  },
};

const Expenses = ({ view = "expenses" }) => {
  const config = VIEWS[view];
  const { permissions, settings, symbol } = useAccountsContext();
  const presets = useMemo(() => rangePresets(settings?.financialYearStartMonth || 4), [settings]);
  const [range, setRange] = useState({ from: presets[0].from, to: presets[0].to });
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState(config.kind);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState({ open: false, expense: null, kind: "expense" });
  const [toDelete, setToDelete] = useState(null);
  const [toReject, setToReject] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [debounced, category, status, kind, range]);

  const { data, isLoading, isError, error, refetch } = useExpenses({ ...range, kind, category, status, search: debounced, page, limit: 20 });
  const setExpenseStatus = useSetExpenseStatus();
  const remove = useDeleteExpense();
  const canManage = permissions.manageExpenses;
  const openNew = (newKind) => setDrawer({ open: true, expense: null, kind: newKind });
  // The main button comes last, so it sits at the end of the row
  const addButtons = config.add.map((a, i) => (
    <button key={a.kind} className={i === config.add.length - 1 ? btnPrimary : btnGhost} onClick={() => openNew(a.kind)}><FiPlus /> {a.label}</button>
  ));

  const exportCsv = () => {
    const rows = data?.expenses || [];
    downloadCsv(`${view}-${range.from}-to-${range.to}.csv`, [
      ["Date", "Type", "Category", "Description", "Vendor", "Bill no", "Client", "Amount", "GST", "Total", "Status", "Paid by"],
      ...rows.map((e) => [toInputDate(e.date), kindNoun(e), e.category, e.description, e.vendor, e.billNumber, e.allocations?.length ? e.allocations.map((a) => `${a.project?.name || "Unknown"} ${a.amount}`).join(" + ") : e.project?.name || "", e.amount, e.taxAmount, e.total, e.status, e.asset?.alreadyOwned ? "" : e.payments?.length > 1 ? e.payments.map((p) => `${methodLabel(p.method)} ${p.amount}`).join(" + ") : methodLabel(e.paymentMethod)]),
    ]);
  };

  return (
    <div>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        actions={
          <>
            <button className={btnGhost} onClick={exportCsv} disabled={!data?.expenses?.length}><FiDownload /> Export page</button>
            {canManage && addButtons}
          </>
        }
      />

      <div className="mb-4"><DateRangeFilter value={range} onChange={setRange} fyStartMonth={settings?.financialYearStartMonth} /></div>

      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Total spent" value={fmtMoney(data.summary.total, symbol)} sub={`${data.total} ${config.one}${data.total === 1 ? "" : "s"}`} />
          <StatCard label="Before tax" value={fmtMoney(data.summary.amount, symbol)} />
          <StatCard label="GST paid" value={fmtMoney(data.summary.tax, symbol)} sub="claimable as input credit" />
          <StatCard label="Biggest category" value={data.summary.byCategory[0]?.category || "—"} sub={data.summary.byCategory[0] ? fmtMoney(data.summary.byCategory[0].total, symbol) : undefined} />
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder={config.search} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {view === "purchases" && (
            <select className={`${selectCls} !w-auto`} value={kind} onChange={(e) => { setKind(e.target.value); setCategory(""); }} aria-label="Type">
              <option value="purchases">All purchases</option>
              <option value="purchase">Goods</option>
              <option value="asset">Assets</option>
            </select>
          )}
          <select className={`${selectCls} !w-auto`} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            <option value="">All categories</option>
            {(kind === "asset" ? ASSET_CATEGORIES : settings?.expenseCategories || []).map((c) => <option key={c} value={c}>{c}</option>)}
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
              empty={<EmptyState title={config.emptyTitle} text={canManage ? config.emptyText : undefined} action={canManage && <div className="flex gap-2">{addButtons}</div>} />}
              columns={[
                { key: "date", title: "Date", render: (r) => <span className="text-slate-500 whitespace-nowrap">{fmtDate(r.date)}</span> },
                { key: "desc", title: config.column, render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800">{r.description}{r.kind === "asset" && <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600">Asset</span>}</p>
                    {r.kind === "asset" && <p className="text-xs text-slate-400">{depreciationLabel(r.asset)}{r.asset?.alreadyOwned ? " · already owned" : ""}</p>}
                    <p className="text-xs text-slate-400">{r.category}{r.vendor ? ` · ${r.vendor}` : ""}{r.attachments?.length ? ` · ${r.attachments.length} file` : ""}{r.payments?.length > 1 ? ` · ${r.payments.map((p) => methodLabel(p.method)).join(" + ")}` : ""}</p>
                  </div>
                ) },
                { key: "client", title: "Client", render: (r) => (r.allocations?.length ? <div title={r.allocations.map((a) => `${a.project?.name || "Unknown"}: ${fmtMoney(a.amount, symbol)}`).join("\n")}><span>{r.allocations[0].project?.name || "Unknown"}</span><span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">+{r.allocations.length - 1} more</span></div> : r.project ? <div><span>{r.project.name}</span>{r.billable && <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.invoice ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{r.invoice ? `Billed ${r.invoice.number}` : "Billable"}</span>}</div> : <span className="text-slate-300">—</span>) },
                { key: "status", title: "Status", render: (r) => (
                  <div>
                    <StatusBadge status={r.status} map={EXPENSE_STATUS} />
                    {r.status === "approved" && r.linkedPaid > 0 && (
                      <p className="mt-0.5 text-[11px] text-slate-400 whitespace-nowrap">{fmtMoney(r.linkedPaid, symbol)} paid · {fmtMoney(r.total - r.linkedPaid, symbol)} due</p>
                    )}
                  </div>
                ) },
                { key: "total", title: "Total", align: "right", render: (r) => <div><span className="font-semibold">{fmtMoney(r.total, symbol)}</span>{r.taxAmount > 0 && <p className="text-[11px] text-slate-400">incl. GST {fmtMoney(r.taxAmount, symbol)}</p>}</div> },
                ...(canManage ? [{ key: "act", title: "", align: "right", render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    {r.status === "pending" && (
                      <>
                        <button className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 flex items-center justify-center" title="Approve" aria-label="Approve" onClick={() => setExpenseStatus.mutate({ id: r._id, data: { status: "approved" } })}><FiCheck /></button>
                        <button className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center" title="Reject" aria-label="Reject" onClick={() => setToReject(r)}><FiX /></button>
                      </>
                    )}
                    {r.status === "approved" && !r.asset?.alreadyOwned && <button className={btnSmall} onClick={() => setExpenseStatus.mutate({ id: r._id, data: { status: "paid" } })}>Mark paid</button>}
                    <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" aria-label="Edit" onClick={() => setDrawer({ open: true, expense: r, kind: r.kind || "expense" })}><FiEdit2 className="w-3.5 h-3.5" /></button>
                    {permissions.delete && !r.invoice && <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label="Delete" onClick={() => setToDelete(r)}><FiTrash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                ) }] : []),
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <ExpenseDrawer isOpen={drawer.open} expense={drawer.expense} kind={drawer.kind} onClose={() => setDrawer((d) => ({ ...d, open: false, expense: null }))} />
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete this ${kindNoun(toDelete).toLowerCase()}?`}
        message={toDelete ? `${toDelete.description} (${fmtMoney(toDelete.total, symbol)}) will be removed.${toDelete.kind === "asset" ? " Its depreciation is removed from past months too. If it was sold or scrapped, edit it and set the disposal date instead." : ""}` : ""}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(toDelete._id).then(() => setToDelete(null)).catch(() => {})}
      />
      <ConfirmModal
        isOpen={!!toReject}
        onClose={() => setToReject(null)}
        title={`Reject this ${kindNoun(toReject).toLowerCase()}?`}
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
