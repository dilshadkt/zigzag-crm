import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useExpenseReport, useGst, usePayrollReport, usePnl, useProfitability, useReceivables } from "../hooks/useAccounts";
import { downloadCsv, fmtDate, fmtMoney, monthLabel, rangePresets } from "../utils/format";
import { Card, DateRangeFilter, ErrorState, PageHeader, SegmentedTabs, Spinner, StatCard, Table, btnGhost } from "../components/ui";

const Wrap = ({ q, children }) => {
  if (q.isLoading) return <Spinner />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;
  return children(q.data);
};

const ExportButton = ({ onClick }) => (
  <button className={btnGhost} onClick={onClick}><FiDownload /> Export CSV</button>
);

const Pnl = ({ range, symbol }) => {
  const q = usePnl(range);
  return (
    <Wrap q={q}>
      {(d) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard label="Revenue" value={fmtMoney(d.totals.revenue, symbol)} />
            <StatCard label="Expenses" value={fmtMoney(d.totals.expenses, symbol)} />
            <StatCard label="Payroll" value={fmtMoney(d.totals.payroll, symbol)} />
            <StatCard label="Profit" value={fmtMoney(d.totals.profit, symbol)} tone={d.totals.profit >= 0 ? "good" : "bad"} />
            <StatCard label="Margin" value={d.totals.margin === null ? "—" : `${d.totals.margin}%`} />
          </div>
          <Card title="Month by month" padded={false} actions={<ExportButton onClick={() => downloadCsv(`profit-and-loss.csv`, [["Month", "Revenue", "Collected", "Expenses", "Payroll", "Profit"], ...d.months.map((m) => [m.month, m.revenue, m.collected, m.expenses, m.payroll, m.profit])])} />}>
            <Table
              rows={d.months}
              rowKey={(r) => r.month}
              columns={[
                { key: "m", title: "Month", render: (r) => monthLabel(r.month, true) },
                { key: "r", title: "Revenue", align: "right", render: (r) => fmtMoney(r.revenue, symbol) },
                { key: "c", title: "Collected", align: "right", render: (r) => <span className="text-slate-500">{fmtMoney(r.collected, symbol)}</span> },
                { key: "e", title: "Expenses", align: "right", render: (r) => fmtMoney(r.expenses, symbol) },
                { key: "p", title: "Payroll", align: "right", render: (r) => fmtMoney(r.payroll, symbol) },
                { key: "pr", title: "Profit", align: "right", render: (r) => <span className={`font-semibold ${r.profit < 0 ? "text-red-600" : ""}`}>{fmtMoney(r.profit, symbol)}</span> },
              ]}
            />
          </Card>
          <p className="text-xs text-slate-500">Revenue is what you invoiced (before GST) in each month. Expenses count approved and paid expenses. Payroll counts approved payslips plus employer PF and ESI.</p>
        </div>
      )}
    </Wrap>
  );
};

const Receivables = ({ symbol }) => {
  const navigate = useNavigate();
  const q = useReceivables();
  return (
    <Wrap q={q}>
      {(d) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <StatCard label="Total owed" value={fmtMoney(d.totals.total, symbol)} />
            <StatCard label="Not yet due" value={fmtMoney(d.totals.current, symbol)} />
            <StatCard label="1–30 late" value={fmtMoney(d.totals.d1_30, symbol)} tone={d.totals.d1_30 ? "warn" : "default"} />
            <StatCard label="31–60 late" value={fmtMoney(d.totals.d31_60, symbol)} tone={d.totals.d31_60 ? "warn" : "default"} />
            <StatCard label="61–90 late" value={fmtMoney(d.totals.d61_90, symbol)} tone={d.totals.d61_90 ? "bad" : "default"} />
            <StatCard label="90+ late" value={fmtMoney(d.totals.d90plus, symbol)} tone={d.totals.d90plus ? "bad" : "default"} />
          </div>
          <Card title="By client" padded={false} actions={<ExportButton onClick={() => downloadCsv("receivables.csv", [["Client", "Not due", "1-30", "31-60", "61-90", "90+", "Total"], ...d.clients.map((c) => [c.name, c.current, c.d1_30, c.d31_60, c.d61_90, c.d90plus, c.total])])} />}>
            <Table
              rows={d.clients}
              rowKey={(r) => r.name}
              onRowClick={(r) => r.project && navigate(`/accounts/clients/${r.project}`)}
              empty={<p className="p-8 text-center text-sm text-slate-400">Nobody owes you anything right now.</p>}
              columns={[
                { key: "n", title: "Client", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
                { key: "a", title: "Not due", align: "right", render: (r) => fmtMoney(r.current, symbol) },
                { key: "b", title: "1–30", align: "right", render: (r) => fmtMoney(r.d1_30, symbol) },
                { key: "c", title: "31–60", align: "right", render: (r) => fmtMoney(r.d31_60, symbol) },
                { key: "d", title: "61–90", align: "right", render: (r) => fmtMoney(r.d61_90, symbol) },
                { key: "e", title: "90+", align: "right", render: (r) => <span className={r.d90plus ? "text-red-600" : ""}>{fmtMoney(r.d90plus, symbol)}</span> },
                { key: "t", title: "Total", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.total, symbol)}</span> },
              ]}
            />
          </Card>
        </div>
      )}
    </Wrap>
  );
};

const Gst = ({ range, symbol }) => {
  const q = useGst(range);
  return (
    <Wrap q={q}>
      {(d) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Taxable sales" value={fmtMoney(d.output.taxable, symbol)} />
            <StatCard label="GST collected" value={fmtMoney(d.output.tax, symbol)} sub={`CGST ${fmtMoney(d.output.cgst, symbol)} · SGST ${fmtMoney(d.output.sgst, symbol)} · IGST ${fmtMoney(d.output.igst, symbol)}`} />
            <StatCard label="GST paid on expenses" value={fmtMoney(d.input, symbol)} sub="input tax credit" />
            <StatCard label={d.netPayable >= 0 ? "Net GST payable" : "Net credit"} value={fmtMoney(Math.abs(d.netPayable), symbol)} tone={d.netPayable > 0 ? "warn" : "good"} />
          </div>
          {!d.gstin && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">Add your GSTIN in Accounts → Settings so it prints on invoices.</p>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="By tax rate" padded={false}>
              <Table rows={d.byRate} rowKey={(r) => r.rate} empty={<p className="p-6 text-center text-sm text-slate-400">No sales in this period.</p>} dense columns={[
                { key: "r", title: "Rate", render: (r) => `${r.rate}%` },
                { key: "t", title: "Taxable", align: "right", render: (r) => fmtMoney(r.taxable, symbol) },
                { key: "x", title: "Tax", align: "right", render: (r) => fmtMoney(r.tax, symbol) },
              ]} />
            </Card>
            <Card title="By month" padded={false}>
              <Table rows={d.monthly} rowKey={(r) => r.month} empty={<p className="p-6 text-center text-sm text-slate-400">No sales in this period.</p>} dense columns={[
                { key: "m", title: "Month", render: (r) => monthLabel(r.month, true) },
                { key: "t", title: "Taxable", align: "right", render: (r) => fmtMoney(r.taxable, symbol) },
                { key: "g", title: "GST", align: "right", render: (r) => fmtMoney(r.cgst + r.sgst + r.igst, symbol) },
              ]} />
            </Card>
          </div>
          <Card title="Sales register" subtitle="One row per invoice, ready for your CA" padded={false}
            actions={<ExportButton onClick={() => downloadCsv("gst-sales-register.csv", [["Invoice", "Date", "Client", "GSTIN", "Place of supply", "Taxable", "CGST", "SGST", "IGST", "Total"], ...d.register.map((r) => [r.number, fmtDate(r.date), r.client, r.gstin, r.placeOfSupply, r.taxable, r.cgst, r.sgst, r.igst, r.total])])} />}>
            <Table rows={d.register} rowKey={(r) => r.number} dense empty={<p className="p-6 text-center text-sm text-slate-400">No invoices in this period.</p>} columns={[
              { key: "n", title: "Invoice", render: (r) => <span className="font-semibold">{r.number}</span> },
              { key: "d", title: "Date", render: (r) => fmtDate(r.date) },
              { key: "c", title: "Client", render: (r) => <div>{r.client}<p className="text-[11px] text-slate-400">{r.gstin || "Unregistered"}</p></div> },
              { key: "t", title: "Taxable", align: "right", render: (r) => fmtMoney(r.taxable, symbol) },
              { key: "cg", title: "CGST", align: "right", render: (r) => fmtMoney(r.cgst, symbol) },
              { key: "sg", title: "SGST", align: "right", render: (r) => fmtMoney(r.sgst, symbol) },
              { key: "ig", title: "IGST", align: "right", render: (r) => fmtMoney(r.igst, symbol) },
              { key: "to", title: "Total", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.total, symbol)}</span> },
            ]} />
          </Card>
        </div>
      )}
    </Wrap>
  );
};

const PayrollReport = ({ range, symbol }) => {
  const q = usePayrollReport(range);
  return (
    <Wrap q={q}>
      {(d) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard label="Gross pay" value={fmtMoney(d.totals.gross, symbol)} />
            <StatCard label="Net pay" value={fmtMoney(d.totals.net, symbol)} />
            <StatCard label="PF (both shares)" value={fmtMoney(d.totals.pf, symbol)} />
            <StatCard label="ESI (both shares)" value={fmtMoney(d.totals.esi, symbol)} />
            <StatCard label="PT + TDS" value={fmtMoney(d.totals.pt + d.totals.tds, symbol)} sub={`PT ${fmtMoney(d.totals.pt, symbol)} · TDS ${fmtMoney(d.totals.tds, symbol)}`} />
          </div>
          <Card title="By month" subtitle="Approved and paid payroll only" padded={false} actions={<ExportButton onClick={() => downloadCsv("payroll-summary.csv", [["Month", "Employees", "Gross", "Deductions", "Net", "Employer cost", "PF", "ESI", "PT", "TDS"], ...d.months.map((m) => [m.month, m.employees, m.gross, m.deductions, m.net, m.employerCost, m.pf, m.esi, m.pt, m.tds])])} />}>
            <Table rows={d.months} rowKey={(r) => r.month} empty={<p className="p-8 text-center text-sm text-slate-400">No approved payroll in this period.</p>} columns={[
              { key: "m", title: "Month", render: (r) => monthLabel(r.month, true) },
              { key: "e", title: "Staff", align: "right", render: (r) => r.employees },
              { key: "g", title: "Gross", align: "right", render: (r) => fmtMoney(r.gross, symbol) },
              { key: "n", title: "Net pay", align: "right", render: (r) => fmtMoney(r.net, symbol) },
              { key: "pf", title: "PF", align: "right", render: (r) => fmtMoney(r.pf, symbol) },
              { key: "esi", title: "ESI", align: "right", render: (r) => fmtMoney(r.esi, symbol) },
              { key: "pt", title: "PT", align: "right", render: (r) => fmtMoney(r.pt, symbol) },
              { key: "tds", title: "TDS", align: "right", render: (r) => fmtMoney(r.tds, symbol) },
              { key: "c", title: "Cost to company", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.employerCost, symbol)}</span> },
            ]} />
          </Card>
        </div>
      )}
    </Wrap>
  );
};

const ExpenseReport = ({ range, symbol }) => {
  const q = useExpenseReport(range);
  return (
    <Wrap q={q}>
      {(d) => (
        <div className="space-y-4">
          <StatCard label="Total spent" value={fmtMoney(d.total, symbol)} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="By category" padded={false} actions={<ExportButton onClick={() => downloadCsv("expenses-by-category.csv", [["Category", "Count", "GST", "Total"], ...d.byCategory.map((c) => [c.category, c.count, c.tax, c.total])])} />}>
              <Table rows={d.byCategory} rowKey={(r) => r.category} dense empty={<p className="p-6 text-center text-sm text-slate-400">No expenses.</p>} columns={[
                { key: "c", title: "Category", render: (r) => r.category },
                { key: "n", title: "Count", align: "right", render: (r) => r.count },
                { key: "t", title: "Total", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.total, symbol)}</span> },
              ]} />
            </Card>
            <Card title="Top vendors" padded={false}>
              <Table rows={d.byVendor} rowKey={(r) => r.vendor} dense empty={<p className="p-6 text-center text-sm text-slate-400">No vendors recorded.</p>} columns={[
                { key: "v", title: "Vendor", render: (r) => r.vendor },
                { key: "n", title: "Bills", align: "right", render: (r) => r.count },
                { key: "t", title: "Total", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.total, symbol)}</span> },
              ]} />
            </Card>
            <Card title="By client" padded={false}>
              <Table rows={d.byClient} rowKey={(r) => r.project} dense empty={<p className="p-6 text-center text-sm text-slate-400">No expenses charged to clients.</p>} columns={[
                { key: "c", title: "Client", render: (r) => r.name },
                { key: "t", title: "Total", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.total, symbol)}</span> },
              ]} />
            </Card>
            <Card title="By month" padded={false}>
              <Table rows={d.byMonth} rowKey={(r) => r.month} dense empty={<p className="p-6 text-center text-sm text-slate-400">No expenses.</p>} columns={[
                { key: "m", title: "Month", render: (r) => monthLabel(r.month, true) },
                { key: "t", title: "Total", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.total, symbol)}</span> },
              ]} />
            </Card>
          </div>
        </div>
      )}
    </Wrap>
  );
};

const Profitability = ({ range, symbol }) => {
  const navigate = useNavigate();
  const q = useProfitability(range);
  return (
    <Wrap q={q}>
      {(d) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Revenue" value={fmtMoney(d.totals.revenue, symbol)} />
            <StatCard label="Direct expenses" value={fmtMoney(d.totals.expenses, symbol)} />
            <StatCard label="Team cost" value={fmtMoney(d.totals.laborCost, symbol)} sub={`${d.totals.laborHours} hrs logged`} />
            <StatCard label="Profit on clients" value={fmtMoney(d.totals.profit, symbol)} tone={d.totals.profit >= 0 ? "good" : "bad"} />
          </div>
          <Card title="Which clients make money" subtitle="Revenue minus direct expenses minus the salary cost of time logged on their tasks" padded={false}
            actions={<ExportButton onClick={() => downloadCsv("client-profitability.csv", [["Client", "Revenue", "Expenses", "Hours", "Team cost", "Profit", "Margin %"], ...d.clients.map((c) => [c.name, c.revenue, c.expenses, c.laborHours, c.laborCost, c.profit, c.margin])])} />}>
            <Table rows={d.clients} rowKey={(r) => r.project} onRowClick={(r) => navigate(`/accounts/clients/${r.project}`)} empty={<p className="p-8 text-center text-sm text-slate-400">No client activity in this period.</p>} columns={[
              { key: "n", title: "Client", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
              { key: "r", title: "Revenue", align: "right", render: (r) => fmtMoney(r.revenue, symbol) },
              { key: "e", title: "Expenses", align: "right", render: (r) => fmtMoney(r.expenses, symbol) },
              { key: "h", title: "Hours", align: "right", render: (r) => r.laborHours },
              { key: "l", title: "Team cost", align: "right", render: (r) => fmtMoney(r.laborCost, symbol) },
              { key: "p", title: "Profit", align: "right", render: (r) => <span className={`font-semibold ${r.profit < 0 ? "text-red-600" : "text-emerald-600"}`}>{fmtMoney(r.profit, symbol)}</span> },
              { key: "m", title: "Margin", align: "right", render: (r) => (r.margin === null ? "—" : `${r.margin}%`) },
            ]} />
          </Card>
          <p className="text-xs text-slate-500">Team cost uses each person's monthly cost to company divided by the costing hours per month in Settings. It only covers time logged with the task timer.</p>
        </div>
      )}
    </Wrap>
  );
};

const REPORTS = [
  { value: "pnl", label: "Profit & loss" },
  { value: "profit", label: "Client profitability" },
  { value: "receivables", label: "Receivables" },
  { value: "gst", label: "GST" },
  { value: "payroll", label: "Payroll" },
  { value: "expenses", label: "Expenses" },
];

const Reports = () => {
  const { settings, symbol, permissions } = useAccountsContext();
  const presets = useMemo(() => rangePresets(settings?.financialYearStartMonth || 4), [settings]);
  const [tab, setTab] = useState("pnl");
  const [range, setRange] = useState({ from: presets[3].from, to: presets[3].to });
  const tabs = REPORTS.filter((r) => (r.value === "payroll" ? permissions.viewReports || permissions.managePayroll : true));

  return (
    <div>
      <PageHeader title="Reports" subtitle="Numbers for you, your CA and your tax filings." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />
      </div>
      {tab !== "receivables" && <div className="mb-4"><DateRangeFilter value={range} onChange={setRange} fyStartMonth={settings?.financialYearStartMonth} /></div>}
      {tab === "pnl" && <Pnl range={range} symbol={symbol} />}
      {tab === "profit" && <Profitability range={range} symbol={symbol} />}
      {tab === "receivables" && <Receivables symbol={symbol} />}
      {tab === "gst" && <Gst range={range} symbol={symbol} />}
      {tab === "payroll" && <PayrollReport range={range} symbol={symbol} />}
      {tab === "expenses" && <ExpenseReport range={range} symbol={symbol} />}
    </div>
  );
};

export default Reports;
