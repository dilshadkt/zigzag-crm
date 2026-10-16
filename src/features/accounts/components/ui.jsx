import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import { rangePresets } from "../utils/format";

export const inputCls =
  "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white outline-none transition focus:border-[#3F8CFF] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400";
export const selectCls = `${inputCls} pr-8`;
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#3F8CFF] text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-red-200 bg-white text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap";
export const btnSmall =
  "inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap";

export const Field = ({ label, hint, error, children, className = "", required }) => (
  <label className={`block ${className}`}>
    {label && (
      <span className="block text-xs font-semibold text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
    )}
    {children}
    {hint && !error && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
    {error && <span className="block text-[11px] text-red-500 mt-1">{error}</span>}
  </label>
);

export const Card = ({ title, subtitle, actions, children, className = "", padded = true }) => (
  <div className={`bg-white border border-slate-100 rounded-2xl ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
        <div className="min-w-0">
          {title && <h3 className="text-sm font-bold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    <div className={padded ? "p-5" : ""}>{children}</div>
  </div>
);

const TONES = {
  default: "text-slate-900",
  good: "text-emerald-600",
  bad: "text-red-600",
  warn: "text-amber-600",
};

export const StatCard = ({ label, value, sub, tone = "default", icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white border border-slate-100 rounded-2xl p-4 ${onClick ? "cursor-pointer hover:border-[#3F8CFF]/40 transition-colors" : ""}`}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
    </div>
    <p className={`mt-1.5 text-xl font-bold tabular-nums ${TONES[tone]}`}>{value}</p>
    {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
  </div>
);

export const StatusBadge = ({ status, map }) => {
  const s = map[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
};

export const PageHeader = ({ title, subtitle, actions, onBack, badge }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
    <div className="flex items-start gap-3 min-w-0">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 w-8 h-8 shrink-0 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
          aria-label="Back"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-slate-800 truncate">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

export const Spinner = ({ label = "Loading" }) => (
  <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2" role="status">
    <span className="w-4 h-4 border-2 border-slate-200 border-t-[#3F8CFF] rounded-full animate-spin" />
    {label}…
  </div>
);

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-4">
    {Icon && (
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
    )}
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    {text && <p className="text-xs text-slate-500 mt-1 max-w-sm">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <EmptyState
    title="Could not load this"
    text={typeof error === "string" ? error : error?.message || "Check your connection and try again."}
    action={onRetry && <button className={btnGhost} onClick={onRetry}>Try again</button>}
  />
);

export const Pagination = ({ page, pages, total, onPage }) => {
  if (!pages || pages <= 1) return total ? <p className="text-xs text-slate-400 px-1 py-2">{total} total</p> : null;
  return (
    <div className="flex items-center justify-between px-1 py-3 text-xs text-slate-500">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className={btnSmall} aria-label="Previous page">
          <FiChevronLeft />
        </button>
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className={btnSmall} aria-label="Next page">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export const Drawer = ({ isOpen, onClose, title, subtitle, children, footer, width = "max-w-xl" }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 h-full w-full ${width} bg-white shadow-2xl flex flex-col`}
      >
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500" aria-label="Close">
            <FiX />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">{footer}</footer>}
      </aside>
    </div>
  );
};

/** Small confirm dialog, with an optional reason box. */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  reasonLabel,
  reasonRequired = false,
  busy = false,
}) => {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="pt-4 space-y-3">
        {message && <p className="text-sm text-slate-600">{message}</p>}
        {reasonLabel && (
          <Field label={reasonLabel} required={reasonRequired}>
            <textarea className={inputCls} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button className={btnGhost} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className={danger ? "inline-flex items-center justify-center h-10 px-4 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50" : btnPrimary}
            disabled={busy || (reasonRequired && !reason.trim())}
            onClick={() => onConfirm(reason.trim())}
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/** Preset chips plus a custom from/to. Calls onChange({ from, to }). */
export const DateRangeFilter = ({ value, onChange, fyStartMonth = 4, presets }) => {
  const list = presets || rangePresets(fyStartMonth);
  const active = list.find((p) => p.from === value.from && p.to === value.to)?.key;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1">
        {list.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange({ from: p.from, to: p.to })}
            className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${
              active === p.key ? "bg-[#ECF3FF] text-[#3F8CFF] border-[#3F8CFF]/30" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input type="date" value={value.from} max={value.to} onChange={(e) => onChange({ ...value, from: e.target.value })} className={`${inputCls} !w-auto !py-1.5 !text-xs`} aria-label="From date" />
        <span className="text-xs text-slate-400">to</span>
        <input type="date" value={value.to} min={value.from} onChange={(e) => onChange({ ...value, to: e.target.value })} className={`${inputCls} !w-auto !py-1.5 !text-xs`} aria-label="To date" />
      </div>
    </div>
  );
};

export const SegmentedTabs = ({ tabs, value, onChange }) => (
  <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1 max-w-full overflow-x-auto">
    {tabs.map((t) => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={`px-3 h-8 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
          value === t.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {t.label}
        {t.count !== undefined && <span className="ml-1.5 text-slate-400">{t.count}</span>}
      </button>
    ))}
  </div>
);

/** Plain responsive table wrapper with consistent header styling. */
export const Table = ({ columns, rows, onRowClick, empty, rowKey = (r) => r._id, dense = false }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
          {columns.map((c) => (
            <th key={c.key} className={`px-4 ${dense ? "py-2" : "py-2.5"} font-semibold whitespace-nowrap ${c.align === "right" ? "text-right" : ""} ${c.className || ""}`}>
              {c.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length}>{empty}</td>
          </tr>
        )}
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`border-b border-slate-50 last:border-0 ${onRowClick ? "cursor-pointer hover:bg-slate-50/70" : ""}`}
          >
            {columns.map((c) => (
              <td key={c.key} className={`px-4 ${dense ? "py-2" : "py-3"} ${c.align === "right" ? "text-right tabular-nums" : ""} ${c.className || ""}`}>
                {c.render ? c.render(row) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
