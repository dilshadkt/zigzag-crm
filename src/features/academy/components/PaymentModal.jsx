import React, { useEffect, useState } from "react";
import Modal from "../../../components/shared/modal";
import { Field, inputCls, selectCls, btnGhost, btnPrimary } from "../../accounts/components/ui";
import { useAddPayment } from "../hooks/useAcademy";
import { PAYMENT_MODE_LABELS, fmtMoney, todayKey } from "../utils";

/** Record a fee payment against an enrollment. */
const PaymentModal = ({ enrollment, onClose }) => {
  const add = useAddPayment();
  const balance = enrollment?.feeSummary?.balance || 0;
  const suggested = enrollment?.feeSummary?.nextDue?.pending || balance;
  const [form, setForm] = useState({ amount: "", date: todayKey(), mode: "upi", reference: "", note: "" });

  useEffect(() => {
    if (enrollment) setForm({ amount: suggested ? String(suggested) : "", date: todayKey(), mode: "upi", reference: "", note: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment?._id]);

  if (!enrollment) return null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const amount = Number(form.amount) || 0;
  const tooMuch = amount - balance > 0.005;

  return (
    <Modal isOpen onClose={onClose} title="Record payment">
      <div className="pt-4 space-y-3">
        <p className="text-sm text-slate-600">
          {enrollment.course?.name} · balance <b>{fmtMoney(balance)}</b>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" required error={tooMuch ? "More than the balance" : undefined}>
            <input type="number" min={0} step="0.01" className={inputCls} value={form.amount} onChange={set("amount")} autoFocus />
          </Field>
          <Field label="Date">
            <input type="date" className={inputCls} value={form.date} onChange={set("date")} max={todayKey()} />
          </Field>
          <Field label="Mode">
            <select className={selectCls} value={form.mode} onChange={set("mode")}>
              {Object.entries(PAYMENT_MODE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reference" hint="UPI / cheque / receipt no.">
            <input className={inputCls} value={form.reference} onChange={set("reference")} />
          </Field>
        </div>
        <Field label="Note">
          <input className={inputCls} value={form.note} onChange={set("note")} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button className={btnGhost} onClick={onClose} disabled={add.isPending}>
            Cancel
          </button>
          <button
            className={btnPrimary}
            disabled={amount <= 0 || tooMuch || add.isPending}
            onClick={() => add.mutate({ id: enrollment._id, ...form, amount }, { onSuccess: onClose })}
          >
            {add.isPending ? "Saving…" : `Record ${amount ? fmtMoney(amount) : ""}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
