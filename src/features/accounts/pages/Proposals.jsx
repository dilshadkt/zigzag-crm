import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiPlus, FiSearch } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useProposalStats, useProposals } from "../hooks/useAccounts";
import { PROPOSAL_STATUS, fmtDate, fmtMoney } from "../utils/format";
import { EmptyState, ErrorState, PageHeader, Pagination, SegmentedTabs, Spinner, StatCard, StatusBadge, Table, btnPrimary, inputCls } from "../components/ui";

const TABS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
];

const Proposals = () => {
  const navigate = useNavigate();
  const { permissions, symbol } = useAccountsContext();
  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [debounced, tab]);

  const { data, isLoading, isError, error, refetch } = useProposals({ page, limit: 20, search: debounced, status: tab });
  const { data: statsData } = useProposalStats();
  const stats = statsData?.stats;

  return (
    <div>
      <PageHeader
        title="Proposals"
        subtitle="Quote the work, send it to the client and turn the accepted one into an invoice."
        actions={
          permissions.manageProposals && (
            <button className={btnPrimary} onClick={() => navigate("/accounts/proposals/new")}>
              <FiPlus /> New proposal
            </button>
          )
        }
      />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Awaiting response" value={fmtMoney(stats.open.value, symbol)} sub={`${stats.open.count} proposal${stats.open.count === 1 ? "" : "s"}`} />
          <StatCard label="Won" value={fmtMoney(stats.won.value, symbol)} sub={`${stats.won.count} accepted`} tone="good" />
          <StatCard label="Win rate" value={stats.winRate === null ? "—" : `${stats.winRate}%`} sub="of decided proposals" />
          <StatCard label="Drafts" value={fmtMoney(stats.draft.value, symbol)} sub={`${stats.draft.count} not sent`} />
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100">
          <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search title, number or client" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <>
            <Table
              rows={data?.proposals || []}
              onRowClick={(row) => navigate(`/accounts/proposals/${row._id}`)}
              empty={
                <EmptyState
                  icon={FiFileText}
                  title={tab || search ? "No proposals match" : "No proposals yet"}
                  text={tab || search ? "Try a different filter." : "Create a proposal to quote a new client or a new piece of work."}
                  action={!tab && !search && permissions.manageProposals && <button className={btnPrimary} onClick={() => navigate("/accounts/proposals/new")}><FiPlus /> New proposal</button>}
                />
              }
              columns={[
                { key: "number", title: "Proposal", render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800">{r.title}</p>
                    <p className="text-xs text-slate-400">{r.number}{r.version > 1 ? ` · v${r.version}` : ""}</p>
                  </div>
                ) },
                { key: "client", title: "Client", render: (r) => <span className="text-slate-700">{r.client?.name}</span> },
                { key: "issueDate", title: "Date", render: (r) => <span className="text-slate-500">{fmtDate(r.issueDate)}</span> },
                { key: "validUntil", title: "Valid until", render: (r) => <span className={r.isExpired ? "text-amber-600 font-semibold" : "text-slate-500"}>{fmtDate(r.validUntil)}</span> },
                { key: "status", title: "Status", render: (r) => <StatusBadge status={r.isExpired ? "expired" : r.status} map={PROPOSAL_STATUS} /> },
                { key: "value", title: "Value", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.totals?.payable, r.currencySymbol)}</span> },
              ]}
            />
            <Pagination page={data?.page} pages={data?.pages} total={data?.total} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default Proposals;
