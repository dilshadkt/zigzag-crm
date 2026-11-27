import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiDownload, FiEdit2, FiPackage, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useCreateItem, useDeleteItem, useItems, useUpdateItem } from "../hooks/useAccounts";
import { ASSET_CATEGORIES, ITEM_TYPES, UNITS, depreciationLabel, downloadCsv, fmtMoney } from "../utils/format";
import { ConfirmModal, Drawer, EmptyState, ErrorState, Field, PageHeader, SegmentedTabs, Spinner, Table, btnGhost, btnPrimary, inputCls, selectCls } from "../components/ui";

const blank = (type) => ({ type, name: "", category: "", description: "", unit: "", rate: "", taxRate: 0, hsnSac: "", method: "", years: "", ratePercent: "" });

const formFor = (item) => ({
  ...blank(item.type),
  ...item,
  rate: item.rate || "",
  method: item.depreciation?.method || "",
  years: item.depreciation?.usefulLifeMonths ? String(Math.round((item.depreciation.usefulLifeMonths / 12) * 100) / 100) : "",
  ratePercent: item.depreciation?.ratePercent ?? "",
});

/** May this person change items of this list? Mirrors the API. */
const mayManage = (permissions, type) =>
  type === "sale" ? Boolean(permissions.manageInvoices || permissions.manageProposals) : Boolean(permissions.manageExpenses);

const ItemDrawer = ({ isOpen, onClose, item, type }) => {
  const { settings, symbol, permissions } = useAccountsContext();
  const create = useCreateItem();
  const update = useUpdateItem();
  const [form, setForm] = useState(() => blank(type));

  useEffect(() => {
    if (isOpen) setForm(item ? formFor(item) : blank(type));
  }, [isOpen, item, type]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isSale = form.type === "sale";
  const isAsset = form.type === "asset";
  const busy = create.isPending || update.isPending;
  const categories = isAsset ? ASSET_CATEGORIES : isSale ? [] : settings?.expenseCategories || [];
  const noun = ITEM_TYPES.find((t) => t.value === form.type)?.one || "item";

  const submit = async (e) => {
    e?.preventDefault();
    if (busy) return;
    if (!form.name.trim()) return toast.error("Enter the item name");
    // Expense items and assets are filed by category
    if (!isSale && !form.category.trim()) return toast.error("Choose a category");
    const data = {
      type: form.type,
      name: form.name,
      category: form.category,
      description: form.description,
      unit: form.unit,
      rate: Number(form.rate) || 0,
      taxRate: Number(form.taxRate) || 0,
      hsnSac: form.hsnSac,
      depreciation: isAsset
        ? { method: form.method, usefulLifeMonths: Math.round(Number(form.years) * 12) || null, ratePercent: Number(form.ratePercent) || null }
        : {},
    };
    try {
      if (item) await update.mutateAsync({ id: item._id, data });
      else await create.mutateAsync(data);
      onClose();
    } catch {
      // the mutation hook already showed the error
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-md"
      title={item ? `Edit ${noun}` : `Add ${noun}`}
      subtitle="Picking an item copies these details. Changing it later does not change what is already recorded."
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="button" className={btnPrimary} onClick={submit} disabled={busy}>{busy ? "Saving…" : "Save item"}</button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="List" required hint="Where this item can be picked">
          <select className={selectCls} value={form.type} onChange={(e) => set({ type: e.target.value, category: "" })}>
            {ITEM_TYPES.filter((t) => mayManage(permissions, t.value)).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Item name" required>
          <input className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
        </Field>
        <Field label="Category" required={!isSale}>
          <input className={inputCls} list="item-categories" value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder={categories.length ? "Choose or type" : "Optional"} />
          <datalist id="item-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={isSale ? "Selling price" : "Usual cost"} hint={`Before tax, in ${symbol}`}>
            <input type="number" min="0" step="any" className={inputCls} value={form.rate} onChange={(e) => set({ rate: e.target.value })} />
          </Field>
          <Field label="GST %">
            <select className={selectCls} value={form.taxRate} onChange={(e) => set({ taxRate: Number(e.target.value) })}>
              {[...new Set([0, ...(settings?.taxRates || [5, 12, 18, 28]), Number(form.taxRate)])].sort((a, b) => a - b).map((r) => <option key={r} value={r}>{r}%</option>)}
            </select>
          </Field>
          {isSale && (
            <>
              <Field label="Unit">
                <select className={selectCls} value={form.unit} onChange={(e) => set({ unit: e.target.value })}>
                  {UNITS.map((u) => <option key={u} value={u}>{u || "—"}</option>)}
                </select>
              </Field>
              <Field label="HSN / SAC"><input className={inputCls} value={form.hsnSac} onChange={(e) => set({ hsnSac: e.target.value })} /></Field>
            </>
          )}
        </div>
        {isSale && (
          <Field label="Details" hint="Shown under the item on invoices and proposals">
            <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        )}
        {isAsset && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Depreciation">
              <select className={selectCls} value={form.method} onChange={(e) => set({ method: e.target.value })}>
                <option value="">Decide when bought</option>
                <option value="straight_line">Straight line</option>
                <option value="written_down">Written down value</option>
              </select>
            </Field>
            {form.method === "straight_line" && (
              <Field label="Useful life (years)"><input type="number" min="0" step="any" className={inputCls} value={form.years} onChange={(e) => set({ years: e.target.value })} /></Field>
            )}
            {form.method === "written_down" && (
              <Field label="Rate (% a year)"><input type="number" min="0" max="100" step="any" className={inputCls} value={form.ratePercent} onChange={(e) => set({ ratePercent: e.target.value })} /></Field>
            )}
          </div>
        )}
        <button type="submit" className="hidden" />
      </form>
    </Drawer>
  );
};

const Items = () => {
  const { permissions, symbol } = useAccountsContext();
  const [type, setType] = useState("sale");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [drawer, setDrawer] = useState({ open: false, item: null });
  const [toDelete, setToDelete] = useState(null);
  const { data, isLoading, isError, error, refetch } = useItems({ type, search: debounced });
  const remove = useDeleteItem();
  const canManage = mayManage(permissions, type);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const current = ITEM_TYPES.find((t) => t.value === type);
  // While another list loads, don't show the previous one under this heading
  const items = (data?.items || []).filter((i) => i.type === type);
  const addButton = <button className={btnPrimary} onClick={() => setDrawer({ open: true, item: null })}><FiPlus /> Add {current.one}</button>;

  const exportCsv = () =>
    downloadCsv(`${type}-items.csv`, [
      ["Item", "List", "Category", "Price", "GST %", "Unit", "HSN/SAC", "Details"],
      ...items.map((i) => [i.name, current.label, i.category, i.rate, i.taxRate, i.unit, i.hsnSac, i.description]),
    ]);

  return (
    <div>
      <PageHeader
        title="Item list"
        subtitle="Saved items for invoices, expenses and assets, each on its own list."
        actions={
          <>
            <button className={btnGhost} onClick={exportCsv} disabled={!items.length}><FiDownload /> Export CSV</button>
            {canManage && addButton}
          </>
        }
      />

      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
          <SegmentedTabs value={type} onChange={setType} tabs={ITEM_TYPES.map((t) => ({ value: t.value, label: t.label, count: data?.counts?.[t.value] }))} />
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search items" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <Table
            rows={items}
            onRowClick={canManage ? (item) => setDrawer({ open: true, item }) : undefined}
            empty={<EmptyState icon={FiPackage} title={debounced ? "No items match your search" : `No ${current.label.toLowerCase()} yet`} text={debounced ? undefined : current.hint} action={!debounced && canManage && addButton} />}
            columns={[
              { key: "name", title: "Item", render: (i) => (
                <div>
                  <p className="font-semibold text-slate-800">{i.name}</p>
                  <p className="text-xs text-slate-400">{type === "asset" && i.depreciation?.method ? depreciationLabel(i.depreciation) : i.description}</p>
                </div>
              ) },
              { key: "category", title: "Category", render: (i) => i.category || <span className="text-slate-300">—</span> },
              { key: "rate", title: type === "sale" ? "Price" : "Usual cost", align: "right", render: (i) => (i.rate ? <span className="whitespace-nowrap">{fmtMoney(i.rate, symbol)}{i.unit ? <span className="text-slate-400"> / {i.unit}</span> : null}</span> : <span className="text-slate-300">—</span>) },
              { key: "tax", title: "GST", align: "right", render: (i) => `${i.taxRate || 0}%` },
              ...(canManage || permissions.delete ? [{ key: "act", title: "", align: "right", render: (i) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {canManage && <button className="w-7 h-7 rounded-lg text-slate-400 hover:text-[#3F8CFF] hover:bg-blue-50 flex items-center justify-center" aria-label={`Edit ${i.name}`} onClick={() => setDrawer({ open: true, item: i })}><FiEdit2 className="w-3.5 h-3.5" /></button>}
                  {permissions.delete && <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label={`Delete ${i.name}`} onClick={() => setToDelete(i)}><FiTrash2 className="w-3.5 h-3.5" /></button>}
                </div>
              ) }] : []),
            ]}
          />
        )}
      </div>

      <ItemDrawer isOpen={drawer.open} item={drawer.item} type={type} onClose={() => setDrawer({ open: false, item: null })} />
      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this item?"
        message={toDelete ? `${toDelete.name} will be removed from the list. Records that used it stay as they are.` : ""}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(toDelete._id).then(() => setToDelete(null)).catch(() => setToDelete(null))}
      />
    </div>
  );
};

export default Items;
