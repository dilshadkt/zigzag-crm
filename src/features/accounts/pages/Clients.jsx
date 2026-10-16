import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUsers } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useClients } from "../hooks/useAccounts";
import { fmtMoney } from "../utils/format";
import { EmptyState, ErrorState, PageHeader, Spinner, Table, inputCls } from "../components/ui";

const Clients = () => {
  const navigate = useNavigate();
  const { symbol } = useAccountsContext();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useClients({ search: debounced });
  const clients = data?.clients || [];
  const totals = clients.reduce(
    (a, c) => ({ outstanding: a.outstanding + c.outstanding, overdue: a.overdue + c.overdue, invoiced: a.invoiced + c.invoiced }),
    { outstanding: 0, overdue: 0, invoiced: 0 }
  );

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} clients · ${fmtMoney(totals.outstanding, symbol)} outstanding${totals.overdue ? `, ${fmtMoney(totals.overdue, symbol)} overdue` : ""}`}
      />
      <div className="bg-white border border-slate-100 rounded-2xl">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input className={`${inputCls} !pl-9`} placeholder="Search clients" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <Table
            rows={clients}
            onRowClick={(row) => navigate(`/accounts/clients/${row._id}`)}
            empty={<EmptyState icon={FiUsers} title="No clients found" text="Clients come from the Clients section of the CRM." />}
            columns={[
              { key: "name", title: "Client", render: (r) => (
                <div className="flex items-center gap-3">
                  {r.thumbImg ? (
                    <img src={r.thumbImg} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-lg bg-[#ECF3FF] text-[#3F8CFF] text-xs font-bold flex items-center justify-center">{r.name?.[0]?.toUpperCase()}</span>
                  )}
                  <div>
                    <p className="font-semibold text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.hasBilling ? r.billing?.legalName || "Billing profile set" : "No billing details yet"}</p>
                  </div>
                </div>
              ) },
              { key: "retainer", title: "Retainer", align: "right", render: (r) => (r.billing?.retainerAmount ? `${fmtMoney(r.billing.retainerAmount, symbol)} / ${r.billing.billingCycle?.replace("_", " ")}` : <span className="text-slate-300">—</span>) },
              { key: "invoiced", title: "Invoiced", align: "right", render: (r) => fmtMoney(r.invoiced, symbol) },
              { key: "collected", title: "Collected", align: "right", render: (r) => <span className="text-emerald-600">{fmtMoney(r.collected, symbol)}</span> },
              { key: "outstanding", title: "Outstanding", align: "right", render: (r) => <span className={r.overdue > 0 ? "text-red-600 font-semibold" : ""}>{fmtMoney(r.outstanding, symbol)}</span> },
              { key: "expenses", title: "Expenses", align: "right", render: (r) => (r.expenses ? fmtMoney(r.expenses, symbol) : <span className="text-slate-300">—</span>) },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default Clients;
