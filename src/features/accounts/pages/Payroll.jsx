import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiCalendar, FiPlus, FiSearch } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import { useAccountsContext } from "../context";
import { useCreateRun, useRuns, useSalaries } from "../hooks/useAccounts";
import { RUN_STATUS, currentMonthKey, errorMessage, fmtDate, fmtMoney, monthLabel } from "../utils/format";
import SalaryDrawer from "../components/SalaryDrawer";
import { EmptyState, ErrorState, Field, PageHeader, SegmentedTabs, Spinner, StatCard, StatusBadge, Table, btnGhost, btnPrimary, btnSmall, inputCls } from "../components/ui";

const NewRunModal = ({ isOpen, onClose, existing }) => {
  const navigate = useNavigate();
  const create = useCreateRun();
  const [month, setMonth] = useState(() => {
    // Default to last month, the month people normally run payroll for
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const exists = existing.find((r) => r.month === month);

  const submit = async (e) => {
    e.preventDefault();
    if (exists) {
      navigate(`/accounts/payroll/runs/${exists._id}`);
      return;
    }
    try {
      const res = await create.mutateAsync(month);
      navigate(`/accounts/payroll/runs/${res.run._id}`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Run payroll">
      <form onSubmit={submit} className="pt-4 space-y-3">
        <Field label="Month" hint="Salaries are worked out from each employee's structure, approved leave and attendance.">
          <input type="month" className={inputCls} value={month} max={currentMonthKey()} onChange={(e) => setMonth(e.target.value)} />
        </Field>
        {exists && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">Payroll for {monthLabel(month, true)} already exists ({exists.status}). It will be opened instead.</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={create.isPending || !month}>
            {create.isPending ? "Calculating…" : exists ? "Open" : "Generate payroll"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Payroll = () => {
  const navigate = useNavigate();
  const { symbol } = useAccountsContext();
  const [tab, setTab] = useState("runs");
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const runsQ = useRuns();
  const salariesQ = useSalaries();
  const employees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (salariesQ.data?.employees || []).filter((e) => !q || `${e.firstName} ${e.lastName} ${e.position || ""}`.toLowerCase().includes(q));
  }, [salariesQ.data, search]);

  const all = salariesQ.data?.employees || [];
  const configured = all.filter((e) => e.salary).length;
  const monthlyGross = all.reduce((s, e) => s + (e.salary?.status === "active" ? e.salary.grossMonthly : 0), 0);
  const latest = runsQ.data?.runs?.[0];

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle="Set up salaries, run payroll each month and give employees their payslips."
        actions={<button className={btnPrimary} onClick={() => setShowNew(true)}><FiPlus /> Run payroll</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Monthly salary bill" value={fmtMoney(monthlyGross, symbol)} sub="gross, all active structures" />
        <StatCard label="Salaries set up" value={`${configured} / ${all.length}`} sub={all.length - configured ? `${all.length - configured} still missing` : "everyone is set up"} tone={all.length - configured ? "warn" : "good"} />
        <StatCard label="Latest payroll" value={latest ? monthLabel(latest.month, true) : "—"} sub={latest ? latest.status : "none yet"} />
        <StatCard label="Latest net pay" value={latest ? fmtMoney(latest.totals.net, symbol) : "—"} sub={latest ? `${latest.totals.employees} employees` : undefined} />
      </div>

      <div className="mb-4"><SegmentedTabs tabs={[{ value: "runs", label: "Payroll runs" }, { value: "salaries", label: "Salary structures" }]} value={tab} onChange={setTab} /></div>

      {tab === "runs" && (
        <div className="bg-white border border-slate-100 rounded-2xl">
          {runsQ.isLoading ? (
            <Spinner />
          ) : runsQ.isError ? (
            <ErrorState error={runsQ.error} onRetry={runsQ.refetch} />
          ) : (
            <Table
              rows={runsQ.data.runs}
              onRowClick={(r) => navigate(`/accounts/payroll/runs/${r._id}`)}
              empty={<EmptyState icon={FiCalendar} title="No payroll run yet" text={configured ? "Run payroll for last month to generate payslips." : "Set up employee salaries first, then run payroll."} action={<button className={btnPrimary} onClick={() => (configured ? setShowNew(true) : setTab("salaries"))}>{configured ? "Run payroll" : "Set up salaries"}</button>} />}
              columns={[
                { key: "month", title: "Month", render: (r) => <span className="font-semibold text-slate-800">{monthLabel(r.month, true)}</span> },
                { key: "status", title: "Status", render: (r) => <StatusBadge status={r.status} map={RUN_STATUS} /> },
                { key: "emp", title: "Employees", align: "right", render: (r) => r.totals.employees },
                { key: "gross", title: "Gross", align: "right", render: (r) => fmtMoney(r.totals.gross, symbol) },
                { key: "ded", title: "Deductions", align: "right", render: (r) => fmtMoney(r.totals.deductions, symbol) },
                { key: "net", title: "Net pay", align: "right", render: (r) => <span className="font-semibold">{fmtMoney(r.totals.net, symbol)}</span> },
                { key: "ap", title: "Approved", render: (r) => <span className="text-xs text-slate-500">{r.approvedAt ? fmtDate(r.approvedAt) : "—"}</span> },
              ]}
            />
          )}
        </div>
      )}

      {tab === "salaries" && (
        <div className="bg-white border border-slate-100 rounded-2xl">
          <div className="p-4 border-b border-slate-100">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input className={`${inputCls} !pl-9`} placeholder="Search employees" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {salariesQ.isLoading ? (
            <Spinner />
          ) : salariesQ.isError ? (
            <ErrorState error={salariesQ.error} onRetry={salariesQ.refetch} />
          ) : (
            <Table
              rows={employees}
              onRowClick={(e) => setEditing(e)}
              empty={<EmptyState title="No employees found" />}
              columns={[
                { key: "name", title: "Employee", render: (e) => (
                  <div className="flex items-center gap-3">
                    {e.profileImage ? <img src={e.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="w-8 h-8 rounded-full bg-[#ECF3FF] text-[#3F8CFF] text-xs font-bold flex items-center justify-center">{e.firstName?.[0]}</span>}
                    <div><p className="font-semibold text-slate-800">{e.firstName} {e.lastName}</p><p className="text-xs text-slate-400">{e.position || (e.role === "company-admin" ? "Admin" : "—")}</p></div>
                  </div>
                ) },
                { key: "joined", title: "Joined", render: (e) => <span className="text-slate-500">{fmtDate(e.joiningDate)}</span> },
                { key: "gross", title: "Gross / month", align: "right", render: (e) => (e.salary ? <span className="font-semibold">{fmtMoney(e.salary.grossMonthly, symbol)}</span> : <span className="text-slate-300">—</span>) },
                { key: "ctc", title: "CTC / year", align: "right", render: (e) => (e.salary ? fmtMoney(e.salary.annualCtc, symbol) : <span className="text-slate-300">—</span>) },
                { key: "bank", title: "Bank", render: (e) => (e.salary ? (e.salary.hasBank ? <span className="text-xs text-emerald-600">Added</span> : <span className="text-xs text-amber-600">Missing</span>) : "") },
                { key: "status", title: "Payroll", render: (e) => (e.salary ? <span className={`text-xs font-semibold ${e.salary.status === "active" ? "text-emerald-600" : "text-slate-400"}`}>{e.salary.status === "active" ? "Included" : "Excluded"}</span> : <span className="text-xs text-amber-600 font-semibold">Not set up</span>) },
                { key: "act", title: "", align: "right", render: (e) => <button className={btnSmall} onClick={(ev) => { ev.stopPropagation(); setEditing(e); }}>{e.salary ? "Edit" : "Set up"}</button> },
              ]}
            />
          )}
        </div>
      )}

      <NewRunModal isOpen={showNew} onClose={() => setShowNew(false)} existing={runsQ.data?.runs || []} />
      <SalaryDrawer employee={editing} isOpen={!!editing} onClose={() => setEditing(null)} />
    </div>
  );
};

export default Payroll;
