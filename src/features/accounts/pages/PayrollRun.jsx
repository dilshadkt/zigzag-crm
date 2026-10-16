import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiCheckCircle, FiDownload, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import { accountsApi } from "../api/accountsApi";
import { useAccountsContext } from "../context";
import { useApproveRun, useDeleteRun, usePayRun, useRegenerateRun, useRun } from "../hooks/useAccounts";
import { PAYMENT_METHODS, PAYSLIP_STATUS, RUN_STATUS, downloadCsv, errorMessage, fmtMoney, monthLabel, toInputDate } from "../utils/format";
import PayslipDrawer from "../components/PayslipDrawer";
import { ConfirmModal, ErrorState, Field, PageHeader, Spinner, StatCard, StatusBadge, Table, btnGhost, btnPrimary, inputCls, selectCls } from "../components/ui";

const PayAllModal = ({ isOpen, onClose, onPay, busy, count }) => {
  const [form, setForm] = useState({ paidOn: toInputDate(new Date()), paymentMode: "bank_transfer", reference: "" });
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark payroll as paid">
      <form className="pt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); onPay(form); }}>
        <p className="text-sm text-slate-600">{count} approved payslip{count === 1 ? "" : "s"} will be marked as paid.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Paid on"><input type="date" className={inputCls} value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} /></Field>
          <Field label="Method">
            <select className={selectCls} value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
              {PAYMENT_METHODS.filter((m) => ["bank_transfer", "upi", "cash", "cheque"].includes(m.value)).map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Batch reference" className="col-span-2"><input className={inputCls} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Bulk transfer reference (optional)" /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={busy}>{busy ? "Saving…" : "Mark all paid"}</button>
        </div>
      </form>
    </Modal>
  );
};

const PayrollRun = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { symbol } = useAccountsContext();
  const { data, isLoading, isError, error, refetch } = useRun(id);
  const [open, setOpen] = useState(null);
  const [modal, setModal] = useState(null);

  const regenerate = useRegenerateRun();
  const approve = useApproveRun();
  const payRun = usePayRun();
  const remove = useDeleteRun();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  const { run, payslips } = data;
  const draft = run.status === "draft";
  const approvedCount = payslips.filter((p) => p.status === "approved").length;
  const heldCount = payslips.filter((p) => p.status === "hold").length;
  const negative = payslips.filter((p) => p.netPay < 0);

  const exportBank = async () => {
    try {
      const res = await accountsApi.bankSheet(run.month);
      downloadCsv(`salary-transfer-${run.month}.csv`, [
        ["Employee", "Account holder", "Account number", "IFSC", "Bank", "UPI ID", "Mode", "Net pay", "Status"],
        ...res.rows.map((r) => [r.name, r.accountHolder, r.accountNumber, r.ifsc, r.bankName, r.upiId, r.paymentMode, r.netPay, r.status]),
      ]);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div>
      <PageHeader
        title={`Payroll · ${monthLabel(run.month, true)}`}
        badge={<StatusBadge status={run.status} map={RUN_STATUS} />}
        subtitle={draft ? "Review each payslip, then approve to release them to employees." : run.status === "approved" ? "Approved. Employees can see their payslips." : "All payslips paid."}
        onBack={() => navigate("/accounts/payroll")}
        actions={
          <>
            {!draft && <button className={btnGhost} onClick={exportBank}><FiDownload /> Bank transfer sheet</button>}
            {draft && (
              <>
                <button className={btnGhost} disabled={regenerate.isPending} onClick={() => regenerate.mutate(id)}><FiRefreshCw className={regenerate.isPending ? "animate-spin" : ""} /> Recalculate</button>
                <button className={btnGhost} onClick={() => setModal("delete")}><FiTrash2 /> Delete</button>
                <button className={btnPrimary} disabled={approve.isPending || !payslips.some((p) => p.status === "draft")} onClick={() => setModal("approve")}><FiCheckCircle /> Approve payroll</button>
              </>
            )}
            {run.status === "approved" && approvedCount > 0 && <button className={btnPrimary} onClick={() => setModal("pay")}>Mark all as paid</button>}
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Employees" value={run.totals.employees} sub={heldCount ? `${heldCount} on hold` : undefined} />
        <StatCard label="Gross earnings" value={fmtMoney(run.totals.gross, symbol)} />
        <StatCard label="Deductions" value={fmtMoney(run.totals.deductions, symbol)} />
        <StatCard label="Net pay" value={fmtMoney(run.totals.net, symbol)} tone="good" sub={`+ ${fmtMoney(run.totals.employerContributions, symbol)} employer PF/ESI`} />
      </div>

      {negative.length > 0 && draft && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          {negative.map((p) => p.employeeSnapshot.name).join(", ")} {negative.length === 1 ? "has" : "have"} a negative net pay. Fix it before approving.
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl">
        <Table
          rows={payslips}
          onRowClick={(p) => setOpen(p._id)}
          empty={<p className="p-8 text-center text-sm text-slate-400">No payslips in this run.</p>}
          columns={[
            { key: "name", title: "Employee", render: (p) => <div><p className="font-semibold text-slate-800">{p.employeeSnapshot.name}</p><p className="text-xs text-slate-400">{p.employeeSnapshot.position || "—"}</p></div> },
            { key: "days", title: "Paid days", align: "right", render: (p) => (
              <div>
                <span className="font-semibold">{p.attendance.payableDays}</span>
                <span className="text-slate-400"> / {p.attendance.basisDays}</span>
                {p.attendance.lopDays > 0 && <p className="text-[11px] text-amber-600">{p.attendance.lopDays} LOP</p>}
              </div>
            ) },
            { key: "gross", title: "Gross", align: "right", render: (p) => fmtMoney(p.grossEarnings, symbol) },
            { key: "ded", title: "Deductions", align: "right", render: (p) => fmtMoney(p.totalDeductions, symbol) },
            { key: "net", title: "Net pay", align: "right", render: (p) => <span className={`font-semibold ${p.netPay < 0 ? "text-red-600" : ""}`}>{fmtMoney(p.netPay, symbol)}</span> },
            { key: "status", title: "Status", render: (p) => <StatusBadge status={p.status} map={PAYSLIP_STATUS} /> },
          ]}
        />
      </div>

      <PayslipDrawer payslipId={open} isOpen={!!open} onClose={() => setOpen(null)} />

      <ConfirmModal
        isOpen={modal === "approve"}
        onClose={() => setModal(null)}
        title="Approve payroll?"
        message={`Payslips are locked and ${payslips.filter((p) => p.status === "draft").length} employee(s) are notified that their payslip is ready.${heldCount ? ` ${heldCount} held payslip(s) are skipped.` : ""}`}
        confirmLabel="Approve"
        busy={approve.isPending}
        onConfirm={() => approve.mutateAsync(id).then(() => setModal(null)).catch((e) => { toast.error(errorMessage(e)); setModal(null); })}
      />
      <ConfirmModal
        isOpen={modal === "delete"}
        onClose={() => setModal(null)}
        title="Delete this draft payroll?"
        message="The draft payslips and any adjustments you made will be removed."
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(id).then(() => navigate("/accounts/payroll")).catch(() => {})}
      />
      <PayAllModal isOpen={modal === "pay"} onClose={() => setModal(null)} busy={payRun.isPending} count={approvedCount} onPay={(form) => payRun.mutateAsync({ id, data: form }).then(() => setModal(null)).catch(() => {})} />
    </div>
  );
};

export default PayrollRun;
