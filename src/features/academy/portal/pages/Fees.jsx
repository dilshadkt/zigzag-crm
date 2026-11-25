import React from "react";
import { FiAlertCircle, FiCheckCircle, FiCreditCard, FiTag } from "react-icons/fi";
import { usePortal } from "../portalContext";
import { Bar, NoEnrollment, PageTitle, Panel, Pill, StatTile } from "../ui";
import { FEE_STATUS, PAYMENT_MODE_LABELS, fmtDay, fmtMoney } from "../../utils";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Fees = () => {
  const { enrollment: e } = usePortal();
  if (!e) return <NoEnrollment />;
  const fs = e.feeSummary;
  const paidPercent = fs.net ? (fs.paid / fs.net) * 100 : 100;

  return (
    <div>
      <PageTitle title="Fees" subtitle={e.course?.name} actions={<Pill status={fs.status} map={FEE_STATUS} />} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
        <StatTile icon={FiTag} tone="violet" label="Course fee" value={money(e.fee.total)} sub={e.fee.discount > 0 ? `${money(e.fee.discount)} discount` : "No discount"} />
        <StatTile
          icon={FiCreditCard}
          tone="blue"
          label="You pay"
          value={money(fs.net)}
          sub={fs.admission > 0 ? `Includes ${money(fs.admission)} admission` : `${fs.installments.length || 1} instalment${fs.installments.length > 1 ? "s" : ""}`}
        />
        <StatTile icon={FiCheckCircle} tone="green" label="Paid" value={money(fs.paid)} sub={`${Math.round(paidPercent)}% of your fee`} />
        <StatTile
          icon={FiAlertCircle}
          tone={fs.overdueAmount > 0 ? "red" : "amber"}
          label="Balance"
          value={money(fs.balance)}
          sub={
            fs.overdueAmount > 0
              ? `${money(fs.overdueAmount)} overdue`
              : fs.nextDue?.dueDate
              ? `Next due ${fmtDay(fs.nextDue.dueDate)}`
              : fs.nextDue
              ? "To be paid"
              : "Nothing pending"
          }
          alert={fs.overdueAmount > 0}
        />
      </div>

      {fs.net > 0 && (
        <Panel className="mb-3">
          <div className="flex justify-between text-sm font-bold text-[#0A1629] mb-2">
            <span>Payment progress</span>
            <span>{Math.round(paidPercent)}%</span>
          </div>
          <Bar percent={paidPercent} color="bg-emerald-500" label="Fees paid" />
          {fs.overdueAmount > 0 && <p className="mt-3 text-sm text-red-600">{fmtMoney(fs.overdueAmount)} is past its due date. Please pay at the office.</p>}
        </Panel>
      )}

      <div className="grid xl:grid-cols-2 gap-3 items-start">
        <Panel title="Instalments">
          {fs.installments.length === 0 ? (
            <p className="text-sm text-[#91929E]">No instalment plan. Your balance is {fmtMoney(fs.balance)}.</p>
          ) : (
            <ul className="space-y-2">
              {fs.installments.map((i) => (
                <li key={i._id || i.label} className="flex items-center justify-between gap-3 rounded-2xl border border-[#EEF3F9] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0A1629]">{i.label}</p>
                    <p className="text-xs text-[#91929E]">
                      {i.dueDate ? `Due ${fmtDay(i.dueDate)}` : "No fixed date"}
                      {i.pending > 0 && i.paid > 0 ? ` · ${fmtMoney(i.pending)} left` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-[#0A1629] tabular-nums">{fmtMoney(i.amount)}</span>
                    <Pill status={i.status} map={FEE_STATUS} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Payments received">
          {!e.payments?.length ? (
            <p className="text-sm text-[#91929E]">No payments yet.</p>
          ) : (
            <ul className="space-y-2">
              {[...e.payments]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((p) => (
                  <li key={p._id} className="flex items-center gap-3 rounded-2xl border border-[#EEF3F9] px-4 py-3">
                    <span className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flexCenter">
                      <FiCheckCircle />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0A1629]">{fmtDay(p.date)}</p>
                      <p className="text-xs text-[#91929E] truncate">
                        {PAYMENT_MODE_LABELS[p.mode] || p.mode}
                        {p.reference ? ` · ${p.reference}` : ""}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums">{fmtMoney(p.amount)}</span>
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default Fees;
