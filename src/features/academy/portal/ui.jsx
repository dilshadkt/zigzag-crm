import React from "react";
import { Link } from "react-router-dom";

// Same surfaces and type colours as the staff CRM: white 24px cards on
// #F4F9FD, #0A1629 headings, #7D8592 secondary text, #3F8CFF accent.

export const Panel = ({ title, subtitle, action, children, className = "", bodyClassName = "" }) => (
  <section className={`bg-white rounded-[24px] min-w-0 ${className}`}>
    {(title || action) && (
      <div className="flex items-start justify-between gap-3 px-5 md:px-6 pt-5">
        <div className="min-w-0">
          {title && <h2 className="text-base font-bold text-[#0A1629]">{title}</h2>}
          {subtitle && <p className="text-xs text-[#91929E] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className={`p-5 md:p-6 ${title || action ? "!pt-4" : ""} ${bodyClassName}`}>{children}</div>
  </section>
);

export const PanelLink = ({ to, children }) => (
  <Link to={to} className="shrink-0 text-xs font-bold text-[#3F8CFF] hover:underline">
    {children}
  </Link>
);

export const PageTitle = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
    <div className="min-w-0">
      <h1 className="text-2xl md:text-[28px] leading-tight font-bold text-[#0A1629]">{title}</h1>
      {subtitle && <p className="text-sm text-[#7D8592] mt-1">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

const TILE_TONES = {
  blue: "bg-[#ECF3FF] text-[#3F8CFF]",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  red: "bg-red-50 text-red-600",
};

export const StatTile = ({ icon: Icon, tone = "blue", label, value, sub, to, alert = false }) => {
  const body = (
    <>
      {Icon && (
        <span className={`w-12 h-12 shrink-0 rounded-2xl hidden sm:flex items-center justify-center ${TILE_TONES[tone]}`}>
          <Icon className="w-5 h-5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-[#91929E]">{label}</span>
        <span className="block text-xl md:text-2xl font-bold text-[#0A1629] tabular-nums leading-tight mt-0.5">{value}</span>
        {sub && <span className={`block text-xs mt-0.5 ${alert ? "text-red-600 font-semibold" : "text-[#7D8592]"}`}>{sub}</span>}
      </span>
    </>
  );
  const cls = "bg-white rounded-[24px] p-4 md:p-5 flex items-center gap-4 min-w-0";
  return to ? (
    <Link to={to} className={`${cls} ring-1 ring-transparent hover:ring-[#3F8CFF]/30 transition-shadow`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
};

export const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2.5 border-b border-[#F0F4F9] last:border-0">
    <dt className="text-sm text-[#7D8592] shrink-0">{label}</dt>
    <dd className="text-sm font-semibold text-[#0A1629] text-right break-words min-w-0">{value || "—"}</dd>
  </div>
);

export const Bar = ({ percent, color = "bg-[#3F8CFF]", label }) => {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="h-2 rounded-full bg-[#EEF3F9] overflow-hidden" role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
};

export const Pill = ({ status, map }) => {
  const s = map[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${s.cls}`}>{s.label}</span>;
};

/** Circular progress for a 0-100 value (null shows a dash). */
export const Ring = ({ value, size = 72, color = "#3F8CFF", label }) => {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = value === null || value === undefined ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF3F9" strokeWidth="7" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
      </svg>
      <span className="absolute text-base font-bold text-[#0A1629] tabular-nums">{value === null || value === undefined ? "—" : `${Math.round(value)}%`}</span>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
};

export const NoEnrollment = () => (
  <Panel>
    <p className="text-sm text-[#7D8592] text-center py-6">You are not enrolled in a course yet. Please contact the academy office.</p>
  </Panel>
);
