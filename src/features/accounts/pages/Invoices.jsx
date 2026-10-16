import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiFileText, FiPlus, FiSearch } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useInvoiceStats, useInvoices } from "../hooks/useAccounts";
import { INVOICE_STATUS, fmtDate, fmtMoney } from "../utils/format";
import { EmptyState, ErrorState, PageHeader, Pagination, SegmentedTabs, Spinner, StatCard, StatusBadge, Table, btnPrimary, inputCls } from "../components/ui";

const TABS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "unpaid", label: "Unpaid" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
];

const Invoices = () => {
  const navigate = useNavigate();
  const { permissions, symbol } = useAccountsContext();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [page, setPage] = useState(1);
  const tab = params.get("status") || "";
  const project = params.get("project") || "";

  // Debounce typing so we do not query on every keystroke
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [debounced, tab, project]);

  const query = {
    page,
    limit: 20,
    search: debounced,
    project,
    ...(tab === "overdue" ? { overdue: "true" } : tab ? { status: tab } : {}),
  };
  const { data, isLoading, isError, error, refetch } = useInvoices(query);
  const { data: statsData } = useInvoiceStats();
  const stats = statsData?.stats;

  const setTab = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("status", value);
    else next.delete("status");
    setParams(next, { replace: true });
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Bill clients, track what is owed and record payments."
        actions={
          permissions.manageInvoices && (
            <button className={btnPrimary} onClick={() => navigate("/accounts/invoices/new")}>
              <FiPlus /> New invoice
            </button>
          )
        }
      />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Outstanding" value={fmtMoney(stats.outstanding.amount, symbol)} sub={`${stats.outstanding.count} unpaid`} onClick={() => setTab("unpaid")} />
          <StatCard label="Overdue" value={fmtMoney(stats.overdue.amount, symbol)} sub={`${stats.overdue.count} late`} tone={stats.overdue.count ? "bad" : "default"} onClick={() => setTab("overdue")} />
          <StatCard label="Collected this month" value={fmtMoney(stats.collectedThisMonth, symbol)} tone="good" />
          <StatCard label="Drafts" value={fmtMoney(stats.draft.amount, symbol)} sub={`${stats.draft.count} not sent`} onClick={() => setTab("draft")} />
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100">
          <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search number or client" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              rows={data?.invoices || []}
              onRowClick={(row) => navigate(`/accounts/invoices/${row._id}`)}
              empty={
                <EmptyState
                  icon={FiFileText}
                  title={tab || search ? "No invoices match" : "No invoices yet"}
                  text={tab || search ? "Try a different filter." : "Create your first invoice to start tracking payments."}
                  action={!tab && !search && permissions.manageInvoices && <button className={btnPrimary} onClick={() => navigate("/accounts/invoices/new")}><FiPlus /> New invoice</button>}
                />
              }
              columns={[
                { key: "number", title: "Invoice", render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800">{r.number}</p>
                    {r.title && <p className="text-xs text-slate-400 truncate max-w-[220px]">{r.title}</p>}
                  </div>
                ) },
                { key: "client", title: "Client", render: (r) => <span className="text-slate-700">{r.client?.name}</span> },
                { key: "issueDate", title: "Date", render: (r) => <span className="text-slate-500">{fmtDate(r.issueDate)}</span> },
                { key: "dueDate", title: "Due", render: (r) => (
                  <span className={r.isOverdue ? "text-red-600 font-semibold" : "text-slate-500"}>
                    {fmtDate(r.dueDate)}
                    {r.isOverdue && <span className="block text-[11px] font-normal">{r.daysOverdue}d late</span>}
                  </span>
                ) },
                { key: "status", title: "Status", render: (r) => <StatusBadge status={r.isOverdue ? "overdue" : r.status} map={INVOICE_STATUS} /> },
                { key: "total", title: "Amount", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.totals?.payable, r.currencySymbol)}</span> },
                { key: "balance", title: "Balance", align: "right", render: (r) => (
                  <span className={r.balance > 0 && r.status !== "draft" && r.status !== "void" ? "text-slate-800" : "text-slate-300"}>{fmtMoney(r.status === "draft" ? 0 : r.balance, r.currencySymbol)}</span>
                ) },
              ]}
            />
            <Pagination page={data?.page} pages={data?.pages} total={data?.total} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Invoices;
