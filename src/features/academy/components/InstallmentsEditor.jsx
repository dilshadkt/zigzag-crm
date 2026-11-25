import React, { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Field, inputCls, btnSmall } from "../../accounts/components/ui";
import { fmtMoney, splitInstallments, todayKey } from "../utils";

/**
 * Edits an instalment plan [{label, dueDate: "yyyy-MM-dd", amount}].
 * Shows whether the plan adds up to the net fee.
 */
const InstallmentsEditor = ({ value, onChange, net }) => {
  const [count, setCount] = useState(value.length || 2);
  const [first, setFirst] = useState(value[0]?.dueDate || todayKey());
  const total = value.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const diff = Math.round((Number(net || 0) - total) * 100) / 100;

  const update = (idx, patch) => onChange(value.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl bg-slate-50">
        <Field label="Split into" className="w-24">
          <input type="number" min={1} max={24} className={inputCls} value={count} onChange={(e) => setCount(e.target.value)} />
        </Field>
        <Field label="First due" className="w-40">
          <input type="date" className={inputCls} value={first} onChange={(e) => setFirst(e.target.value)} />
        </Field>
        <button type="button" className={`${btnSmall} h-10`} onClick={() => onChange(splitInstallments(net, count, first))}>
          Make monthly plan
        </button>
        {value.length > 0 && (
          <button type="button" className={`${btnSmall} h-10`} onClick={() => onChange([])}>
            Clear
          </button>
        )}
      </div>

      {value.map((row, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_9.5rem_7.5rem_auto] gap-2 items-center">
          <input className={inputCls} value={row.label} onChange={(e) => update(idx, { label: e.target.value })} aria-label="Label" />
          <input type="date" className={inputCls} value={row.dueDate} onChange={(e) => update(idx, { dueDate: e.target.value })} aria-label="Due date" />
          <input
            type="number"
            min={0}
            step="0.01"
            className={`${inputCls} text-right`}
            value={row.amount}
            onChange={(e) => update(idx, { amount: e.target.value })}
            aria-label="Amount"
          />
          <button
            type="button"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
            onClick={() => onChange(value.filter((_, i) => i !== idx))}
            aria-label="Remove instalment"
          >
            <FiTrash2 />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <button
          type="button"
          className={btnSmall}
          onClick={() => onChange([...value, { label: `Instalment ${value.length + 1}`, dueDate: todayKey(), amount: diff > 0 ? diff : 0 }])}
        >
          <FiPlus /> Add instalment
        </button>
        {value.length > 0 && (
          <span className={`text-xs font-semibold ${Math.abs(diff) > 0.5 ? "text-red-600" : "text-emerald-600"}`}>
            {Math.abs(diff) > 0.5
              ? `${fmtMoney(Math.abs(diff))} ${diff > 0 ? "not planned yet" : "more than the fee"}`
              : "Adds up to the net fee"}
          </span>
        )}
      </div>
      {!value.length && <p className="text-xs text-slate-400">No plan: the whole fee is shown as one balance.</p>}
    </div>
  );
};

export default InstallmentsEditor;
