import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { usePayPayslip, usePayslip, useReleasePayslip, useUpdatePayslip } from "../hooks/useAccounts";
import { PAYMENT_METHODS, PAYSLIP_STATUS, errorMessage, monthLabel, toInputDate } from "../utils/format";
import { pdfName } from "../utils/pdf";
import { PdfButtons } from "./DocumentActions";
import PayslipView from "./PayslipView";
import { Drawer, Field, Spinner, StatusBadge, btnPrimary, btnSmall, inputCls, selectCls } from "./ui";

const PayslipDrawer = ({ payslipId, isOpen, onClose }) => {
  const { settings, symbol } = useAccountsContext();
  const { data, isLoading } = usePayslip(isOpen ? payslipId : null);
  const update = useUpdatePayslip();
  const pay = usePayPayslip();
  const release = useReleasePayslip();
  const viewRef = useRef(null);
  const slip = data?.payslip;
  const editable = slip && ["draft", "hold"].includes(slip.status);

  const [adjustments, setAdjustments] = useState([]);
  const [lop, setLop] = useState("");
  const [notes, setNotes] = useState("");
  const [payForm, setPayForm] = useState({ paidOn: toInputDate(new Date()), paymentMode: "bank_transfer", reference: "" });

  useEffect(() => {
    if (!slip) return;
    setAdjustments((slip.adjustments || []).map((a) => ({ type: a.type, name: a.name, amount: a.amount })));
    setLop(slip.lopDaysOverride ?? "");
    setNotes(slip.notes || "");
    setPayForm((f) => ({ ...f, paymentMode: slip.employeeSnapshot?.paymentMode || "bank_transfer" }));
  }, [slip?._id, slip?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveChanges = async (extra = {}) => {
    try {
      await update.mutateAsync({
        id: payslipId,
        data: {
          adjustments: adjustments.filter((a) => a.name.trim() && Number(a.amount) > 0).map((a) => ({ ...a, amount: Number(a.amount) })),
          lopDaysOverride: lop === "" ? null : Number(lop),
          notes,
          ...extra,
        },
      });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const markPaid = async () => {
    try {
      await pay.mutateAsync({ id: payslipId, data: payForm });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const a = slip?.attendance;
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-3xl"
      title={slip ? slip.employeeSnapshot?.name : "Payslip"}
      subtitle={slip ? monthLabel(slip.month, true) : undefined}
      footer={
        slip && (
          <>
            <PdfButtons getElement={() => viewRef.current} filename={pdfName("Payslip", `${slip.employeeSnapshot?.name}-${slip.month}`)} title={`Payslip ${slip.employeeSnapshot?.name} ${slip.month}`} />
            {editable && <button className={btnPrimary} onClick={() => saveChanges()} disabled={update.isPending}>{update.isPending ? "Saving…" : "Save changes"}</button>}
          </>
        )
      }
    >
      {isLoading || !slip ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <StatusBadge status={slip.status} map={PAYSLIP_STATUS} />
            {slip.netPay < 0 && <span className="text-xs text-red-600 font-semibold">Net pay is negative. Reduce deductions.</span>}
          </div>

          {editable && (
            <div className="rounded-2xl border border-slate-200 p-4 space-y-4 bg-slate-50/60">
              <h4 className="text-sm font-bold text-slate-800">Adjust this payslip</h4>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Loss-of-pay days" hint={`Calculated: ${a.unpaidLeaveDays + a.absentDays}. Leave blank to use it.`}>
                  <input type="number" min="0" step="0.5" className={inputCls} value={lop} onChange={(e) => setLop(e.target.value)} placeholder={String(a.unpaidLeaveDays + a.absentDays)} />
                </Field>
                <Field label="Internal / employee note">
                  <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">One-off bonus or deduction</span>
                  <button type="button" className={btnSmall} onClick={() => setAdjustments([...adjustments, { type: "earning", name: "", amount: "" }])}><FiPlus /> Add</button>
                </div>
                <div className="space-y-2">
                  {adjustments.map((adj, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <select className={`${selectCls} col-span-3`} value={adj.type} onChange={(e) => setAdjustments(adjustments.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)))}>
                        <option value="earning">Add</option>
                        <option value="deduction">Deduct</option>
                      </select>
                      <input className={`${inputCls} col-span-5`} placeholder="e.g. Festival bonus, Advance recovery" value={adj.name} onChange={(e) => setAdjustments(adjustments.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      <input type="number" min="0" step="any" className={`${inputCls} col-span-3`} placeholder="Amount" value={adj.amount} onChange={(e) => setAdjustments(adjustments.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} />
                      <button type="button" className="col-span-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" onClick={() => setAdjustments(adjustments.filter((_, j) => j !== i))} aria-label="Remove"><FiTrash2 /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {slip.status === "draft" ? (
                  <button className={btnSmall} onClick={() => saveChanges({ hold: true })}>Put on hold</button>
                ) : (
                  <button className={btnSmall} onClick={() => saveChanges({ hold: false })}>Take off hold</button>
                )}
                <span className="text-[11px] text-slate-400 self-center">A held payslip is skipped when payroll is approved.</span>
              </div>
            </div>
          )}

          {slip.status === "approved" && (
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/60">
              <h4 className="text-sm font-bold text-slate-800">Record payment</h4>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Paid on"><input type="date" className={inputCls} value={payForm.paidOn} onChange={(e) => setPayForm({ ...payForm, paidOn: e.target.value })} /></Field>
                <Field label="Method">
                  <select className={selectCls} value={payForm.paymentMode} onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}>
                    {PAYMENT_METHODS.filter((m) => ["bank_transfer", "upi", "cash", "cheque"].includes(m.value)).map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </Field>
                <Field label="Reference"><input className={inputCls} value={payForm.reference} onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })} /></Field>
              </div>
              <button className={btnPrimary} onClick={markPaid} disabled={pay.isPending}>{pay.isPending ? "Saving…" : "Mark as paid"}</button>
            </div>
          )}

          {slip.status === "hold" && (
            <button className={btnSmall} onClick={() => release.mutate(payslipId)}>Release payslip</button>
          )}

          <div className="bg-slate-100/70 rounded-2xl p-2 sm:p-3 overflow-x-auto">
            <div className="shadow-sm rounded-lg overflow-hidden">
              <PayslipView ref={viewRef} payslip={slip} business={settings?.business} footer={settings?.payroll?.payslipFooter} symbol={symbol} showEmployerCost />
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default PayslipDrawer;
