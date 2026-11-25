import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { usePayPayslip, useRemovePayslipPayment } from "../hooks/useAccounts";
import { PAYMENT_METHODS, fmtDate, fmtMoney, methodLabel, payslipBalance, payslipPaid, payslipPayable, toInputDate } from "../utils/format";
import { ConfirmModal, Field, btnPrimary, inputCls, selectCls } from "./ui";

const SALARY_METHODS = PAYMENT_METHODS.filter((m) => ["bank_transfer", "upi", "cash", "cheque"].includes(m.value));

/** What has been paid on an approved or paid payslip, and the form to pay all or part of the rest. */
const PayslipPayments = ({ slip }) => {
  const { symbol } = useAccountsContext();
  const pay = usePayPayslip();
  const remove = useRemovePayslipPayment();
  const [form, setForm] = useState({ amount: "", paidOn: toInputDate(new Date()), paymentMode: "bank_transfer", reference: "" });
  const [toRemove, setToRemove] = useState(null);

  const payable = payslipPayable(slip);
  const paid = payslipPaid(slip);
  const balance = payslipBalance(slip);
  // An API without part payments sends no list and would treat any amount as paid in full
  const partSupported = Array.isArray(slip.payments);

  // Each time the payslip changes, offer the amount still pending
  useEffect(() => {
    setForm((f) => ({ ...f, amount: balance > 0 ? String(balance) : "", reference: "", paymentMode: slip.employeeSnapshot?.paymentMode || "bank_transfer" }));
  }, [slip._id, slip.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const amount = Number(form.amount);
  const isPart = partSupported && balance > 0 && amount > 0 && amount < balance - 0.009;

  const rows = slip.payments?.length
    ? slip.payments
    : slip.status === "paid"
      ? [{ _id: "full", amount: payable, paidOn: slip.paidOn, mode: slip.paymentMode, reference: slip.paymentReference }]
      : [];

  const submit = () => {
    if (pay.isPending) return;
    if (partSupported && balance > 0) {
      if (!(amount > 0)) return toast.error("Enter the amount being paid");
      if (amount > balance + 0.009) return toast.error(`Only ${fmtMoney(balance, symbol)} is pending`);
    }
    // The mutation hook shows any error
    pay.mutate({ id: slip._id, data: { ...form, amount: partSupported && balance > 0 ? amount : undefined } });
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/60">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-800">Salary payments</h4>
        <p className="text-xs text-slate-500">
          To pay <b className="text-slate-800">{fmtMoney(payable, symbol)}</b> · Paid <b className="text-emerald-600">{fmtMoney(paid, symbol)}</b> · Pending <b className={balance > 0 ? "text-amber-600" : "text-slate-800"}>{fmtMoney(balance, symbol)}</b>
        </p>
      </div>

      {rows.length > 0 && (
        <ul className="rounded-xl border border-slate-100 bg-white divide-y divide-slate-100">
          {rows.map((p) => (
            <li key={p._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0 truncate text-slate-600">
                {p.paidOn ? fmtDate(p.paidOn) : "—"} · {methodLabel(p.mode)}{p.reference ? ` · ${p.reference}` : ""}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-slate-800 tabular-nums">{fmtMoney(p.amount, symbol)}</span>
                {partSupported && (
                  <button type="button" className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" aria-label="Remove payment" onClick={() => setToRemove(p)}>
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {slip.status === "approved" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {partSupported && balance > 0 && (
              <Field label="Amount" hint={isPart ? `${fmtMoney(balance - amount, symbol)} will stay pending on this month` : "Lower it to pay only a part"}>
                <input type="number" min="0" step="any" className={inputCls} value={form.amount} onChange={(e) => set({ amount: e.target.value })} />
              </Field>
            )}
            <Field label="Paid on"><input type="date" className={inputCls} value={form.paidOn} onChange={(e) => set({ paidOn: e.target.value })} /></Field>
            <Field label="Method">
              <select className={selectCls} value={form.paymentMode} onChange={(e) => set({ paymentMode: e.target.value })}>
                {SALARY_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Reference"><input className={inputCls} value={form.reference} onChange={(e) => set({ reference: e.target.value })} /></Field>
          </div>
          <button type="button" className={btnPrimary} onClick={submit} disabled={pay.isPending}>
            {pay.isPending ? "Saving…" : isPart ? "Record part payment" : "Mark as paid"}
          </button>
        </>
      )}

      <ConfirmModal
        isOpen={!!toRemove}
        onClose={() => setToRemove(null)}
        title="Remove this salary payment?"
        message={toRemove ? `${fmtMoney(toRemove.amount, symbol)} will be removed and show as pending again.` : ""}
        confirmLabel="Remove"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync({ id: slip._id, paymentId: toRemove._id }).then(() => setToRemove(null)).catch(() => setToRemove(null))}
      />
    </div>
  );
};

export default PayslipPayments;
