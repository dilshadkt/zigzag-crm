import React, { useMemo } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { AccountsContext } from "./context";
import { useAccountsMeta } from "./hooks/useAccounts";
import { ErrorState, Spinner } from "./components/ui";
import Overview from "./pages/Overview";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceDetail from "./pages/InvoiceDetail";
import Proposals from "./pages/Proposals";
import ProposalForm from "./pages/ProposalForm";
import ProposalDetail from "./pages/ProposalDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Expenses from "./pages/Expenses";
import Payroll from "./pages/Payroll";
import PayrollRun from "./pages/PayrollRun";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const Accounts = () => {
  const { data, isLoading, isError, error, refetch } = useAccountsMeta();

  const value = useMemo(
    () => ({
      settings: data?.settings || null,
      permissions: data?.permissions || {},
      symbol: data?.settings?.currencySymbol || "₹",
      financialYear: data?.financialYear,
    }),
    [data]
  );

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    return (
      <section className="rounded-2xl bg-white h-full">
        <ErrorState error={error?.message ? error : "You do not have access to the accounts module."} onRetry={refetch} />
      </section>
    );
  }

  const p = value.permissions;
  const tabs = [
    { to: "/accounts", label: "Overview", end: true, show: p.view },
    { to: "/accounts/invoices", label: "Invoices", show: p.view },
    { to: "/accounts/proposals", label: "Proposals", show: p.view },
    { to: "/accounts/clients", label: "Clients", show: p.view },
    { to: "/accounts/expenses", label: "Expenses", show: p.view },
    { to: "/accounts/payroll", label: "Payroll", show: p.managePayroll },
    { to: "/accounts/reports", label: "Reports", show: p.viewReports },
    { to: "/accounts/settings", label: "Settings", show: p.manageSettings },
  ].filter((t) => t.show);

  return (
    <AccountsContext.Provider value={value}>
      <section className="flex flex-col rounded-2xl overflow-hidden h-full bg-white">
        <header className="px-4 md:px-6 pt-4 border-b border-slate-100 shrink-0">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <h1 className="text-base md:text-lg font-bold text-slate-800">Accounts</h1>
            {value.financialYear && <span className="text-xs text-slate-400">FY {value.financialYear}</span>}
          </div>
          <nav className="flex gap-1 overflow-x-auto hide-scrollbar -mb-px" aria-label="Accounts sections">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    isActive ? "border-[#3F8CFF] text-[#3F8CFF]" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAFCFE]">
          <Routes>
            <Route index element={p.view ? <Overview /> : <Navigate to="/accounts/payroll" replace />} />
            {p.view && (
              <>
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/new" element={p.manageInvoices ? <InvoiceForm /> : <Navigate to="/accounts/invoices" replace />} />
                <Route path="invoices/:id" element={<InvoiceDetail />} />
                <Route path="invoices/:id/edit" element={p.manageInvoices ? <InvoiceForm /> : <Navigate to="/accounts/invoices" replace />} />
                <Route path="proposals" element={<Proposals />} />
                <Route path="proposals/new" element={p.manageProposals ? <ProposalForm /> : <Navigate to="/accounts/proposals" replace />} />
                <Route path="proposals/:id" element={<ProposalDetail />} />
                <Route path="proposals/:id/edit" element={p.manageProposals ? <ProposalForm /> : <Navigate to="/accounts/proposals" replace />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:projectId" element={<ClientDetail />} />
                <Route path="expenses" element={<Expenses />} />
              </>
            )}
            {p.managePayroll && (
              <>
                <Route path="payroll" element={<Payroll />} />
                <Route path="payroll/runs/:id" element={<PayrollRun />} />
              </>
            )}
            {p.viewReports && <Route path="reports" element={<Reports />} />}
            {p.manageSettings && <Route path="settings" element={<Settings />} />}
            <Route path="*" element={<Navigate to="/accounts" replace />} />
          </Routes>
        </div>
      </section>
    </AccountsContext.Provider>
  );
};

export default Accounts;
