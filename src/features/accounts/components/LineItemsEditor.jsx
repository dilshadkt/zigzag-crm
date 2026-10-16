import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { UNITS, blankItem, fmtMoney, round2 } from "../utils/format";
import { btnSmall, inputCls, selectCls } from "./ui";

const lineAmount = (i) => {
  const gross = (Number(i.quantity) || 0) * (Number(i.rate) || 0);
  return round2(gross - (gross * (Number(i.discountPercent) || 0)) / 100);
};

const LineItemsEditor = ({ items, onChange, taxRates = [0, 5, 12, 18, 28], showTax = true, allowOptional = false, symbol = "₹", defaultTaxRate = 18 }) => {
  const update = (index, patch) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const remove = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item._id || index} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-6">
              <input
                className={inputCls}
                placeholder="Item or service (e.g. Social media management)"
                value={item.description}
                onChange={(e) => update(index, { description: e.target.value })}
                aria-label="Description"
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <input
                className={inputCls}
                placeholder="HSN / SAC"
                value={item.hsnSac}
                onChange={(e) => update(index, { hsnSac: e.target.value })}
                aria-label="HSN or SAC code"
              />
            </div>
            <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-2">
              <span className="text-sm font-bold text-slate-800 tabular-nums">{fmtMoney(lineAmount(item), symbol)}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={items.length === 1}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 flex items-center justify-center"
                aria-label="Remove item"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="col-span-4 md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Qty</label>
              <input type="number" min="0" step="any" className={inputCls} value={item.quantity} onChange={(e) => update(index, { quantity: e.target.value })} />
            </div>
            <div className="col-span-4 md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Unit</label>
              <select className={selectCls} value={item.unit} onChange={(e) => update(index, { unit: e.target.value })}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u || "—"}</option>
                ))}
              </select>
            </div>
            <div className="col-span-4 md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Rate</label>
              <input type="number" min="0" step="any" className={inputCls} value={item.rate} placeholder="0.00" onChange={(e) => update(index, { rate: e.target.value })} />
            </div>
            <div className="col-span-4 md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Disc. %</label>
              <input type="number" min="0" max="100" step="any" className={inputCls} value={item.discountPercent} onChange={(e) => update(index, { discountPercent: e.target.value })} />
            </div>
            {showTax && (
              <div className="col-span-4 md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tax %</label>
                <select className={selectCls} value={item.taxRate} onChange={(e) => update(index, { taxRate: Number(e.target.value) })}>
                  {[...new Set([...taxRates, Number(item.taxRate)])].sort((a, b) => a - b).map((r) => (
                    <option key={r} value={r}>{r}%</option>
                  ))}
                </select>
              </div>
            )}
            {allowOptional && (
              <div className="col-span-4 md:col-span-2 flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={item.optional} onChange={(e) => update(index, { optional: e.target.checked })} />
                  Optional
                </label>
              </div>
            )}
            <div className="col-span-12">
              <input
                className={`${inputCls} !text-xs`}
                placeholder="Details shown under the item (optional)"
                value={item.details}
                onChange={(e) => update(index, { details: e.target.value })}
                aria-label="Details"
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className={btnSmall} onClick={() => onChange([...items, blankItem(defaultTaxRate)])}>
        <FiPlus /> Add item
      </button>
    </div>
  );
};

export default LineItemsEditor;
