import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiCopy, FiDownload, FiEdit2, FiPaperclip, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { uploadSingleFile } from "../../../api/service";
import { useAccountsContext } from "../context";
import {
  useAccountClients,
  useClientLookup,
  useAddExpenseCategory,
  useCreateItem,
  useItems,
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
import ItemPicker from "../components/ItemPicker";
import ClientDrawer from "../components/ClientDrawer";
import { useMarkUnpaid } from "../components/MarkUnpaid";
import SearchableSelect from "../components/SearchableSelect";
import SuggestInput from "../components/SuggestInput";
import { ASSET_CATEGORIES, EXPENSE_STATUS, PAYMENT_METHODS, depreciationLabel, downloadCsv, errorMessage, fmtDate, fmtMoney, kindNoun, methodLabel, rangePresets, round2, toInputDate } from "../utils/format";
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
  quantity: "1",
  unitPrice: "",
  // Follows from the quantity and the price
  amount: "",
  taxAmount: "",
  // Set when a saved item brought its GST rate, so the GST follows the amount
  gstRate: null,
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
// How the party dropdown tells a client from a vendor: "client:<project id>" or
// "account:<id>" for a client without a project. A vendor is its id alone.
const CLIENT_PREFIX = "client:";
const ACCOUNT_PREFIX = "account:";

const partyValueFor = (r) => {
  if (r.staff) return "";
  if (r.partyProject) return CLIENT_PREFIX + (r.partyProject._id || r.partyProject);
  if (r.partyClient) return ACCOUNT_PREFIX + (r.partyClient._id || r.partyClient);
  // Older expenses only have the party as text, with no record behind it
  return r.vendorRef?._id || r.vendorRef || (r.vendor ? LEGACY_VENDOR : "");
};

// A saved record as form values
const formFor = (record) => ({
  ...blank(),
  ...record,
  date: toInputDate(record.date),
  clientRows: clientRowsFor(record),
  sharesCustom: Boolean(record.allocations?.length),
  billable: Boolean(record.billable),
  // Records from before quantity and price were entered are one of the whole amount
  quantity: String(record.quantity || 1),
  unitPrice: String(record.unitPrice ?? record.amount ?? ""),
  amount: record.amount,
  taxAmount: record.taxAmount || "",
  gstRate: null,
  attachments: record.attachments || [],
  asset: assetFormFor(record),
  payments: paymentsFor(record),
  staff: record.staff?._id || record.staff || "",
  vendorRef: partyValueFor(record),
});

// What a duplicate takes from the original. Its date, bill number, files, status
// and payment references belong to the original alone.
const copyFor = (record) => {
  const form = formFor(record);
  return {
    ...blank(),
    ...Object.fromEntries(
      ["category", "description", "vendor", "vendorRef", "staff", "quantity", "unitPrice", "amount", "taxAmount", "clientRows", "sharesCustom", "billable", "notes"].map((k) => [k, form[k]])
    ),
    asset: { ...form.asset, inUseFrom: "", disposedOn: "" },
    payments: form.payments.map((p) => ({ ...p, reference: "" })),
  };
};

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

/**
 * Add or edit an expense, a purchase or an asset. `kind` applies to new records;
 * `staff` is who a new one is paid to, when opened from the Staff section, and
 * `copyOf` is the record a new one starts from.
 */
export const ExpenseDrawer = ({ isOpen, onClose, expense, kind = "expense", staff, copyOf }) => {
  const { settings, symbol, permissions } = useAccountsContext();
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const { data: clients } = useClientLookup(isOpen);
  const { data: vendorData } = useVendors(undefined, isOpen);
  const { data: pastData } = useExpenseDescriptions(isOpen);
  const [addingVendor, setAddingVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [addingClient, setAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const { data: otherClients } = useAccountClients(undefined, isOpen);
  const { data: itemData } = useItems({ type: "expense" }, isOpen);
  const createItem = useCreateItem();
  const [toRemove, setToRemove] = useState(null);
  const deleteVendor = useDeleteVendor();
  const addCategoryMutation = useAddExpenseCategory();
  const removeCategoryMutation = useRemoveExpenseCategory();
  const [form, setForm] = useState(blank());
  const [uploading, setUploading] = useState(false);
  // The saved record behind the form, if any: the one edited, or the one copied
  const source = expense || copyOf;
  const recordKind = source ? source.kind || "expense" : kind;
  const isAsset = recordKind === "asset";
  const noun = recordKind;

  useEffect(() => {
    if (!isOpen) return;
    if (expense) setForm(formFor(expense));
    else if (copyOf) setForm(copyFor(copyOf));
    else setForm({ ...blank(), staff: staff?._id || "", category: kind === "asset" ? "" : settings?.expenseCategories?.[0] || "" });
    // `staff` is only read when the drawer opens, so it is left out on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, expense, copyOf, settings, kind]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Quantity or price changed: the amount follows, and so does a saved item's GST
  const withAmount = (next) => {
    const quantity = Number(next.quantity);
    const amount = next.unitPrice === "" || !(quantity >= 0) ? "" : String(round2(quantity * Number(next.unitPrice)));
    const taxAmount = next.gstRate ? (amount === "" ? "" : String(round2((Number(amount) * next.gstRate) / 100))) : next.taxAmount;
    return { ...next, amount, taxAmount };
  };
  const setLine = (patch) => setForm((f) => withAmount({ ...f, ...patch }));

  // A saved item fills in what it knows; everything stays editable
  const pickItem = (item) => {
    const d = item.depreciation;
    setForm((f) => {
      const next = {
        ...f,
        description: item.name,
        category: item.category || f.category,
        asset: isAsset && d?.method
          ? { ...f.asset, method: d.method, years: d.usefulLifeMonths ? String(Math.round((d.usefulLifeMonths / 12) * 100) / 100) : "", ratePercent: d.ratePercent ?? "" }
          : f.asset,
      };
      if (!item.rate) return next;
      return withAmount({ ...next, unitPrice: String(item.rate), gstRate: item.taxRate || null, taxAmount: "" });
    });
  };
  const setAsset = (patch) => setForm((f) => ({ ...f, asset: { ...f.asset, ...patch } }));
  // Something already owned had no purchase to pay for here
  const owned = isAsset && form.asset.alreadyOwned;

  // Vendors and clients together. Clients can be paid to as well (refunds,
  // payments made on their behalf).
  const partyOptions = [
    ...(form.vendorRef === LEGACY_VENDOR
      ? [{ value: LEGACY_VENDOR, label: source?.vendor || "", hint: "not in the party list", removable: false }]
      : []),
    ...(vendorData?.vendors || []).map((v) => ({ value: v._id, label: v.name, hint: "Vendor" })),
    ...(clients?.clients || []).map((c) => ({ value: CLIENT_PREFIX + c._id, label: c.name, hint: "Client", removable: false })),
    ...(otherClients?.clients || []).map((c) => ({ value: ACCOUNT_PREFIX + c._id, label: c.name, hint: "Client", removable: false })),
  ];
  // A saved client that has since left the lists stays visible
  if (/^(client|account):/.test(form.vendorRef) && !partyOptions.some((o) => o.value === form.vendorRef)) {
    partyOptions.push({ value: form.vendorRef, label: source?.vendor || "Client", hint: "Client", removable: false });
  }
  const mayAddVendor = Boolean(permissions.manageExpenses);
  const mayAddClient = Boolean(permissions.manageExpenses || permissions.manageInvoices || permissions.manageProposals);
  const addVendor = (name) => { setNewVendorName(name); setAddingVendor(true); };
  const addClient = (name) => { setNewClientName(name); setAddingClient(true); };

  // Saved expense items first, then what was typed on earlier expenses
  const items = itemData?.items || [];
  const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const itemSuggestions = [
    ...items.map((i) => ({ item: i, label: i.name, hint: i.rate ? `Item · ${fmtMoney(i.rate, symbol)}` : "Item" })),
    ...(pastData?.descriptions || [])
      .filter((d) => !items.some((i) => sameName(i.name, d.description)))
      .map((d) => ({ ...d, label: d.description, hint: d.category })),
  ];
  const typed = form.description.trim();
  const canSaveItem = Boolean(permissions.manageExpenses) && typed && !!itemData && !items.some((i) => sameName(i.name, typed));
  const saveItem = () =>
    createItem.mutate({ type: "expense", name: typed, category: form.category, rate: Number(form.unitPrice) || 0, taxRate: form.gstRate || 0 });

  // Reusing an earlier expense: fill in what it was usually filed under
  const pickPast = (past) => {
    const patch = { description: past.description };
    if (listedCategories.includes(past.category)) patch.category = past.category;
    if (!form.vendorRef) {
      const value = partyValueFor({ ...past, staff: null });
      // Older ones kept a client only by name
      const match = partyOptions.find((o) => o.value === value)
        || (past.vendor && partyOptions.find((o) => o.value !== LEGACY_VENDOR && o.label === past.vendor));
      if (match) patch.vendorRef = match.value;
    }
    set(patch);
  };
  const pickSuggestion = (s) => (s.item ? pickItem(s.item) : pickPast(s));

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
    if (!form.category || !form.description.trim() || form.unitPrice === "" || !(Number(form.unitPrice) >= 0)) {
      toast.error(`Category, ${isAsset ? "asset name" : `${noun} item`} and price are required`);
      return;
    }
    if (!(Number(form.quantity) > 0)) {
      toast.error("Enter a quantity greater than zero");
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
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
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
    delete payload.gstRate;
    payload.partyProject = null;
    payload.partyClient = null;
    // For a staff member or a client the API takes the name from their record
    const client = /^(client|account):(.+)$/.exec(form.vendorRef);
    if (form.staff || client) {
      delete payload.vendorRef;
      delete payload.vendor;
      if (client && !form.staff) payload[client[1] === "client" ? "partyProject" : "partyClient"] = client[2];
    } else if (form.vendorRef === LEGACY_VENDOR) delete payload.vendorRef; // keep the old text name as it is
    else delete payload.vendor;
    delete payload.paymentMethod;
    delete payload.paymentReference;
    delete payload.position;
    payload.staff = form.staff || null;
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
      title={expense ? `Edit ${noun}` : copyOf ? `Duplicate ${noun}` : isAsset ? "Add asset" : `Add ${noun}`}
      subtitle={copyOf ? "Check the details and save. The original stays as it is." : isAsset ? "Its cost reaches profit month by month, as depreciation." : undefined}
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
        {isAsset && <ItemPicker type="asset" onPick={pickItem} placeholder="Pick from the asset items" />}
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
          <div>
            <Field label={recordKind === "purchase" ? "Purchase item" : "Expense item"} required>
              <SuggestInput
                value={form.description}
                onChange={(description) => set({ description })}
                onPick={pickSuggestion}
                suggestions={itemSuggestions}
                placeholder={recordKind === "purchase" ? "What did you buy?" : "What was it for?"}
              />
            </Field>
            {canSaveItem && (
              <button type="button" className="mt-1 text-xs font-semibold text-[#3F8CFF]" onClick={saveItem} disabled={createItem.isPending}>
                Save “{typed}” to the item list
              </button>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {!owned && (form.staff ? (
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-1">Paid to (staff)</span>
              <div className="flex items-center justify-between gap-2 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50">
                <span className="truncate">{staff?._id === form.staff ? staff.name : source?.vendor}</span>
                <button type="button" className="text-xs font-semibold text-[#3F8CFF] shrink-0" onClick={() => set({ staff: "", vendorRef: "" })}>Change</button>
              </div>
            </div>
          ) : <Field label="Party" hint="Vendor or client">
            <SearchableSelect
              value={form.vendorRef}
              onChange={(vendorRef) => set({ vendorRef })}
              options={partyOptions}
              placeholder="Select party"
              searchPlaceholder="Search vendors and clients…"
              clearLabel="No party"
              createLabel="New vendor"
              emptyText="No party found"
              onCreate={mayAddVendor ? addVendor : undefined}
              extraActions={mayAddClient ? [{ label: "New client", onSelect: addClient }] : undefined}
              onRemove={(o) => setToRemove({ type: "vendor", id: o.value, name: o.label })}
              removeLabel="Remove vendor"
            />
          </Field>)}
          <Field label="Bill / invoice no."><input className={inputCls} value={form.billNumber} onChange={(e) => set({ billNumber: e.target.value })} /></Field>
          <Field label="Quantity" required><input type="number" min="0" step="any" className={inputCls} value={form.quantity} onChange={(e) => setLine({ quantity: e.target.value })} /></Field>
          <Field label="Price per unit" required hint="Before tax"><input type="number" min="0" step="any" className={inputCls} value={form.unitPrice} onChange={(e) => setLine({ unitPrice: e.target.value })} /></Field>
          <Field label={owned ? "Cost" : isAsset ? "Cost (before tax)" : "Amount (before tax)"} hint={isAsset && !owned ? "This is what gets depreciated. Include GST you can't claim." : "Quantity × price"}><input className={inputCls} value={form.amount} readOnly tabIndex={-1} /></Field>
          {!owned && <Field label="GST paid" hint="Input tax credit"><input type="number" min="0" step="any" className={inputCls} value={form.taxAmount} onChange={(e) => set({ taxAmount: e.target.value, gstRate: null })} /></Field>}
        </div>
        {!owned && <p className="text-xs text-slate-500">Total with GST: <b>{fmtMoney(total, symbol)}</b></p>}

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
            <p className="text-[11px] text-slate-400">Depreciation is calculated monthly, even though a rate is entered per year. A full month is charged for the month it comes into use. Ask your accountant which method and rate to use.</p>
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
              <option value="approved">Unpaid</option>
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
    <ClientDrawer
      isOpen={addingClient}
      initialName={newClientName}
      onClose={() => setAddingClient(false)}
      onSaved={(client) => set({ vendorRef: ACCOUNT_PREFIX + client._id })}
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
    column: "Expense item",
    one: "expense",
    search: "Search item or party",
    emptyTitle: "No expenses in this period",
    emptyText: "Add an expense to start tracking spend.",
  },
  purchases: {
    title: "Purchases",
    subtitle: "Goods you buy, and assets the company keeps. Assets are depreciated instead of counted as a cost at once.",
    kind: "purchases",
    add: [{ kind: "asset", label: "Purchase asset" }, { kind: "purchase", label: "Add purchase" }],
    column: "Purchase item",
    one: "purchase",
    search: "Search item or party",
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
  const unpaid = useMarkUnpaid();
  const remove = useDeleteExpense();
  const canManage = permissions.manageExpenses;
  const openNew = (newKind) => setDrawer({ open: true, expense: null, kind: newKind });
  const openCopy = (record) => setDrawer({ open: true, expense: null, copyOf: record, kind: record.kind || "expense" });
  // The main button comes last, so it sits at the end of the row
  const addButtons = config.add.map((a, i) => (
    <button key={a.kind} className={i === config.add.length - 1 ? btnPrimary : btnGhost} onClick={() => openNew(a.kind)}><FiPlus /> {a.label}</button>
  ));

  const exportCsv = () => {
    const rows = data?.expenses || [];
    downloadCsv(`${view}-${range.from}-to-${range.to}.csv`, [
      ["Date", "Type", "Category", "Item", "Party", "Bill no", "Client", "Quantity", "Price", "Amount", "GST", "Total", "Status", "Paid by"],
      ...rows.map((e) => [toInputDate(e.date), kindNoun(e), e.category, e.description, e.vendor, e.billNumber, e.allocations?.length ? e.allocations.map((a) => `${a.project?.name || "Unknown"} ${a.amount}`).join(" + ") : e.project?.name || "", e.quantity || 1, e.unitPrice ?? e.amount, e.amount, e.taxAmount, e.total, EXPENSE_STATUS[e.status]?.label || e.status, e.asset?.alreadyOwned ? "" : e.payments?.length > 1 ? e.payments.map((p) => `${methodLabel(p.method)} ${p.amount}`).join(" + ") : methodLabel(e.paymentMethod)]),
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
                    <p className="text-xs text-slate-400">{r.category}{r.vendor ? ` · ${r.vendor}` : ""}{r.unitPrice != null && r.quantity && r.quantity !== 1 ? ` · ${r.quantity} × ${fmtMoney(r.unitPrice, symbol)}` : ""}{r.attachments?.length ? ` · ${r.attachments.length} file` : ""}{r.payments?.length > 1 ? ` · ${r.payments.map((p) => methodLabel(p.method)).join(" + ")}` : ""}</p>
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
                    {r.status === "paid" && !r.asset?.alreadyOwned && <button className={btnSmall} onClick={() => unpaid.ask({ id: r._id, description: r.description, total: r.total, linkedPaid: r.linkedPaid })}>Mark unpaid</button>}
                    <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" title="Edit" aria-label="Edit" onClick={() => setDrawer({ open: true, expense: r, kind: r.kind || "expense" })}><FiEdit2 className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" title="Duplicate" aria-label={`Duplicate ${r.description}`} onClick={() => openCopy(r)}><FiCopy className="w-3.5 h-3.5" /></button>
                    {permissions.delete && !r.invoice && <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label="Delete" onClick={() => setToDelete(r)}><FiTrash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                ) }] : []),
              ]}
            />
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <ExpenseDrawer isOpen={drawer.open} expense={drawer.expense} copyOf={drawer.copyOf} kind={drawer.kind} onClose={() => setDrawer((d) => ({ open: false, expense: null, kind: d.kind }))} />
      {unpaid.modal}
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
