import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FiFileText, FiPlus } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useDashboard } from "../hooks/useAccounts";
import { fmtCompact, fmtDate, fmtMoney, methodLabel, monthLabel, rangePresets } from "../utils/format";
import { Card, DateRangeFilter, ErrorState, PageHeader, Spinner, StatCard, btnGhost, btnPrimary } from "../components/ui";

// Categorical slots 1-3 of the reference palette (light), validated as adjacent pairs
const C = { revenue: "#2a78d6", expenses: "#eb6834", payroll: "#1baf7a", profit: "#0b0b0b", axis: "#64748b", grid: "#e2e8f0" };

const TrendTooltip = ({ active, payload, label, symbol }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-800 mb-1">{monthLabel(label, true)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center justify-between gap-4 text-slate-600">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: p.color }} />{p.name}</span>
          <span className="font-semibold tabular-nums text-slate-800">{fmtMoney(p.value, symbol)}</span>
        </p>
      ))}
    </div>
  );
};

const BarList = ({ rows, valueKey, labelKey, symbol, color = C.revenue, onClick }) => {
  const max = Math.max(...rows.map((r) => r[valueKey]), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r[labelKey]} className={onClick ? "cursor-pointer" : ""} onClick={() => onClick?.(r)}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-700 truncate pr-2">{r[labelKey] || "Unknown"}</span>
            <span className="font-semibold text-slate-800 tabular-nums">{fmtMoney(r[valueKey], symbol)}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.max((r[valueKey] / max) * 100, 2)}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const AGING = [
  { key: "current", label: "Not yet due" },
  { key: "d1_30", label: "1–30 days late" },
  { key: "d31_60", label: "31–60 days late" },
  { key: "d61_90", label: "61–90 days late" },
  { key: "d90plus", label: "Over 90 days late" },
];

const Overview = () => {
  const navigate = useNavigate();
  const { permissions, settings, symbol } = useAccountsContext();
  const presets = useMemo(() => rangePresets(settings?.financialYearStartMonth || 4), [settings]);
  const [range, setRange] = useState({ from: presets[0].from, to: presets[0].to });
  const { data, isLoading, isError, error, refetch } = useDashboard(range);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const { kpis, trend, aging, topClients, expensesByCategory, dueSoon, recentPayments, proposals, payrollVisible } = data;
  const agingRows = AGING.map((a) => ({ label: a.label, value: aging[a.key] })).filter((a) => a.value > 0);

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="How the business is doing."
        actions={
          <>
            {permissions.manageExpenses && <button className={btnGhost} onClick={() => navigate("/accounts/expenses")}><FiPlus /> Expense</button>}
            {permissions.manageProposals && <button className={btnGhost} onClick={() => navigate("/accounts/proposals/new")}><FiPlus /> Proposal</button>}
            {permissions.manageInvoices && <button className={btnPrimary} onClick={() => navigate("/accounts/invoices/new")}><FiPlus /> Invoice</button>}
          </>
        }
      />
      <div className="mb-4"><DateRangeFilter value={range} onChange={setRange} fyStartMonth={settings?.financialYearStartMonth} /></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Revenue" value={fmtMoney(kpis.revenue, symbol)} sub="invoiced, before tax" />
        <StatCard label="Collected" value={fmtMoney(kpis.collected, symbol)} tone="good" sub="payments received" />
        <StatCard label="Expenses" value={fmtMoney(kpis.expenses, symbol)} />
        {payrollVisible ? (
          <StatCard label="Payroll cost" value={fmtMoney(kpis.payroll, symbol)} sub="approved payslips + employer PF/ESI" />
        ) : (
          <StatCard label="Invoiced (with tax)" value={fmtMoney(kpis.invoiced, symbol)} />
        )}
        <StatCard label="Profit" value={fmtMoney(kpis.profit, symbol)} tone={kpis.profit >= 0 ? "good" : "bad"} sub={payrollVisible ? "revenue − expenses − payroll" : "revenue − expenses"} />
        <StatCard label="Outstanding" value={fmtMoney(kpis.outstanding, symbol)} sub={`${kpis.outstandingCount} unpaid invoice${kpis.outstandingCount === 1 ? "" : "s"}`} onClick={() => navigate("/accounts/invoices?status=unpaid")} />
        <StatCard label="Overdue" value={fmtMoney(kpis.overdue, symbol)} tone={kpis.overdueCount ? "bad" : "default"} sub={`${kpis.overdueCount} late`} onClick={() => navigate("/accounts/invoices?status=overdue")} />
        <StatCard label="Proposals open" value={fmtMoney(proposals.value, symbol)} sub={`${proposals.open} waiting for an answer`} onClick={() => navigate("/accounts/proposals")} />
      </div>

      <Card title="Last 12 months" subtitle="Revenue against what it cost to earn it" className="mb-4">
        <div className="h-72 -ml-2" role="img" aria-label="Monthly revenue, expenses, payroll and profit for the last 12 months">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="22%">
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tickFormatter={(m) => monthLabel(m)} tick={{ fill: C.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => fmtCompact(v, symbol)} tick={{ fill: C.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
              <Tooltip content={<TrendTooltip symbol={symbol} />} cursor={{ fill: "#f1f5f9" }} />
              <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="revenue" name="Revenue" fill={C.revenue} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="expenses" name="Expenses" fill={C.expenses} radius={[4, 4, 0, 0]} maxBarSize={18} />
              {payrollVisible && <Bar dataKey="payroll" name="Payroll" fill={C.payroll} radius={[4, 4, 0, 0]} maxBarSize={18} />}
              <Line type="monotone" dataKey="profit" name="Profit" stroke={C.profit} strokeWidth={2} dot={{ r: 3, strokeWidth: 2, stroke: "#fff", fill: C.profit }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card title="Money owed to you" subtitle={`${fmtMoney(kpis.outstanding, symbol)} outstanding`}>
          {agingRows.length ? (
            <BarList rows={agingRows} labelKey="label" valueKey="value" symbol={symbol} />
          ) : (
            <p className="text-sm text-slate-400 py-6 text-center">Nothing outstanding.</p>
          )}
        </Card>
        <Card title="Top clients" subtitle="By revenue in this period">
          {topClients.length ? (
            <BarList rows={topClients} labelKey="name" valueKey="revenue" symbol={symbol} onClick={(r) => r.project && navigate(`/accounts/clients/${r.project}`)} />
          ) : (
            <p className="text-sm text-slate-400 py-6 text-center">No invoices in this period.</p>
          )}
        </Card>
        <Card title="Where the money goes" subtitle="Expenses by category">
          {expensesByCategory.length ? (
            <BarList rows={expensesByCategory} labelKey="category" valueKey="total" symbol={symbol} color={C.expenses} />
          ) : (
            <p className="text-sm text-slate-400 py-6 text-center">No expenses in this period.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Next to collect" padded={false}>
          {dueSoon.length ? (
            <ul className="divide-y divide-slate-50">
              {dueSoon.map((i) => (
                <li key={i._id} onClick={() => navigate(`/accounts/invoices/${i._id}`)} className="px-5 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{i.client?.name}</p>
                    <p className="text-xs text-slate-400">{i.number} · due {fmtDate(i.dueDate)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{fmtMoney(i.balance, i.currencySymbol)}</p>
                    {i.isOverdue && <p className="text-[11px] text-red-600 font-semibold">Overdue</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">Nothing waiting for payment.</p>
          )}
        </Card>
        <Card title="Recent payments" padded={false}>
          {recentPayments.length ? (
            <ul className="divide-y divide-slate-50">
              {recentPayments.map((p, idx) => (
                <li key={idx} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.client}</p>
                    <p className="text-xs text-slate-400">{p.number} · {fmtDate(p.date)} · {methodLabel(p.method)}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 tabular-nums shrink-0">+ {fmtMoney(p.amount, p.currencySymbol)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm"><FiFileText className="mx-auto mb-2" />No payments recorded yet.</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Overview;
