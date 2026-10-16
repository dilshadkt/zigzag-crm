import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useSalary, useSaveSalary } from "../hooks/useAccounts";
import { PAYMENT_METHODS, errorMessage, fmtDate, fmtMoney, toInputDate } from "../utils/format";
import { Drawer, Field, Spinner, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "./ui";

const blank = () => ({
  basic: "",
  hra: "",
  allowances: [],
  otherDeductions: [],
  pfApplicable: false,
  esiApplicable: false,
  professionalTax: "",
  tdsMonthly: "",
  overtimeEligible: false,
  effectiveFrom: toInputDate(new Date()),
  status: "active",
  paymentMode: "bank_transfer",
  bank: { accountHolder: "", accountNumber: "", ifsc: "", bankName: "", branch: "", upiId: "" },
  pan: "",
  uan: "",
  esiNumber: "",
  revisionReason: "",
});

const ComponentList = ({ title, items, onChange, addLabel, placeholder }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-semibold text-slate-600">{title}</span>
      <button type="button" className={btnSmall} onClick={() => onChange([...items, { name: "", amount: "" }])}><FiPlus /> {addLabel}</button>
    </div>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-12 gap-2">
          <input className={`${inputCls} col-span-7`} placeholder={placeholder} value={item.name} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
          <input type="number" min="0" step="any" className={`${inputCls} col-span-4`} placeholder="Amount" value={item.amount} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} />
          <button type="button" className="col-span-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove"><FiTrash2 /></button>
        </div>
      ))}
    </div>
  </div>
);

const SalaryDrawer = ({ employee, isOpen, onClose }) => {
  const { settings, symbol } = useAccountsContext();
  const { data, isLoading } = useSalary(isOpen ? employee?._id : null);
  const save = useSaveSalary();
  const [form, setForm] = useState(blank());

  useEffect(() => {
    if (!isOpen || isLoading) return;
    const s = data?.salary;
    setForm(
      s
        ? {
            ...blank(),
            ...s,
            effectiveFrom: toInputDate(s.effectiveFrom),
            basic: s.basic,
            hra: s.hra || "",
            professionalTax: s.professionalTax || "",
            tdsMonthly: s.tdsMonthly || "",
            allowances: (s.allowances || []).map((a) => ({ ...a })),
            otherDeductions: (s.otherDeductions || []).map((a) => ({ ...a })),
            bank: { ...blank().bank, ...(s.bank || {}) },
            revisionReason: "",
          }
        : blank()
    );
  }, [isOpen, isLoading, data]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setBank = (patch) => setForm((f) => ({ ...f, bank: { ...f.bank, ...patch } }));

  const num = (v) => Number(v) || 0;
  const gross = num(form.basic) + num(form.hra) + form.allowances.reduce((s, a) => s + num(a.amount), 0);
  const pf = settings?.payroll?.pf;
  const esi = settings?.payroll?.esi;
  const pfBase = pf?.onActualBasic ? num(form.basic) : Math.min(num(form.basic), pf?.wageCeiling || num(form.basic));
  const employerPf = form.pfApplicable && pf?.enabled ? Math.round((pfBase * (pf.employerRate || 0)) / 100) : 0;
  const employerEsi = form.esiApplicable && esi?.enabled && gross <= (esi.grossCeiling || 0) ? Math.ceil((gross * (esi.employerRate || 0)) / 100 - 1e-9) : 0;
  const employeePf = form.pfApplicable && pf?.enabled ? Math.round((pfBase * (pf.employeeRate || 0)) / 100) : 0;
  const employeeEsi = form.esiApplicable && esi?.enabled && gross <= (esi.grossCeiling || 0) ? Math.ceil((gross * (esi.employeeRate || 0)) / 100 - 1e-9) : 0;
  const deductions = employeePf + employeeEsi + num(form.professionalTax) + num(form.tdsMonthly) + form.otherDeductions.reduce((s, a) => s + num(a.amount), 0);

  const submit = async (e) => {
    e?.preventDefault();
    if (!(num(form.basic) > 0)) {
      toast.error("Enter the basic salary");
      return;
    }
    try {
      await save.mutateAsync({ employeeId: employee._id, data: form });
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const name = `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim();
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-2xl"
      title={`Salary: ${name}`}
      subtitle={employee?.position}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button className={btnPrimary} onClick={submit} disabled={save.isPending || isLoading}>{save.isPending ? "Saving…" : "Save salary"}</button>
        </>
      }
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Monthly earnings</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Basic salary" required><input type="number" min="0" step="any" className={inputCls} value={form.basic} onChange={(e) => set({ basic: e.target.value })} /></Field>
              <Field label="House rent allowance (HRA)"><input type="number" min="0" step="any" className={inputCls} value={form.hra} onChange={(e) => set({ hra: e.target.value })} /></Field>
            </div>
            <ComponentList title="Other allowances" items={form.allowances} onChange={(allowances) => set({ allowances })} addLabel="Add allowance" placeholder="e.g. Conveyance" />
            <div className="flex items-center justify-between rounded-xl bg-[#ECF3FF] px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">Gross monthly salary</span>
              <span className="text-base font-bold text-[#3F8CFF] tabular-nums">{fmtMoney(gross, symbol)}</span>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Deductions &amp; statutory</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2 text-sm text-slate-700 p-3 border border-slate-200 rounded-xl">
                <input type="checkbox" className="mt-0.5" checked={form.pfApplicable} onChange={(e) => set({ pfApplicable: e.target.checked })} />
                <span><b>Provident Fund</b><span className="block text-xs text-slate-500">{pf?.employeeRate}% of basic{pf?.onActualBasic ? "" : `, capped at ${fmtMoney(pf?.wageCeiling, symbol)}`}</span></span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 p-3 border border-slate-200 rounded-xl">
                <input type="checkbox" className="mt-0.5" checked={form.esiApplicable} onChange={(e) => set({ esiApplicable: e.target.checked })} />
                <span><b>ESI</b><span className="block text-xs text-slate-500">{esi?.employeeRate}% if gross is up to {fmtMoney(esi?.grossCeiling, symbol)}</span></span>
              </label>
              <Field label="Professional tax (per month)"><input type="number" min="0" step="any" className={inputCls} value={form.professionalTax} onChange={(e) => set({ professionalTax: e.target.value })} /></Field>
              <Field label="Income tax / TDS (per month)"><input type="number" min="0" step="any" className={inputCls} value={form.tdsMonthly} onChange={(e) => set({ tdsMonthly: e.target.value })} /></Field>
            </div>
            <ComponentList title="Other fixed deductions" items={form.otherDeductions} onChange={(otherDeductions) => set({ otherDeductions })} addLabel="Add deduction" placeholder="e.g. Loan EMI" />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.overtimeEligible} onChange={(e) => set({ overtimeEligible: e.target.checked })} />
              Eligible for overtime pay (from attendance overtime hours)
            </label>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 py-2"><p className="text-[11px] text-slate-500">Take-home (full month)</p><p className="text-sm font-bold tabular-nums">{fmtMoney(gross - deductions, symbol)}</p></div>
              <div className="rounded-xl bg-slate-50 py-2"><p className="text-[11px] text-slate-500">Employer contributions</p><p className="text-sm font-bold tabular-nums">{fmtMoney(employerPf + employerEsi, symbol)}</p></div>
              <div className="rounded-xl bg-slate-50 py-2"><p className="text-[11px] text-slate-500">Cost to company / yr</p><p className="text-sm font-bold tabular-nums">{fmtMoney((gross + employerPf + employerEsi) * 12, symbol)}</p></div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Payment &amp; identity</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pay by">
                <select className={selectCls} value={form.paymentMode} onChange={(e) => set({ paymentMode: e.target.value })}>
                  {PAYMENT_METHODS.filter((m) => ["bank_transfer", "upi", "cash", "cheque"].includes(m.value)).map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </Field>
              <Field label="Account holder"><input className={inputCls} value={form.bank.accountHolder} onChange={(e) => setBank({ accountHolder: e.target.value })} /></Field>
              <Field label="Account number"><input className={inputCls} value={form.bank.accountNumber} onChange={(e) => setBank({ accountNumber: e.target.value })} /></Field>
              <Field label="IFSC"><input className={inputCls} value={form.bank.ifsc} onChange={(e) => setBank({ ifsc: e.target.value.toUpperCase() })} placeholder="HDFC0001234" /></Field>
              <Field label="Bank"><input className={inputCls} value={form.bank.bankName} onChange={(e) => setBank({ bankName: e.target.value })} /></Field>
              <Field label="UPI ID"><input className={inputCls} value={form.bank.upiId} onChange={(e) => setBank({ upiId: e.target.value })} /></Field>
              <Field label="PAN"><input className={inputCls} value={form.pan} onChange={(e) => set({ pan: e.target.value.toUpperCase() })} /></Field>
              <Field label="UAN (PF)"><input className={inputCls} value={form.uan} onChange={(e) => set({ uan: e.target.value })} /></Field>
              <Field label="ESI number"><input className={inputCls} value={form.esiNumber} onChange={(e) => set({ esiNumber: e.target.value })} /></Field>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Effective</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Effective from"><input type="date" className={inputCls} value={form.effectiveFrom} onChange={(e) => set({ effectiveFrom: e.target.value })} /></Field>
              <Field label="Payroll status">
                <select className={selectCls} value={form.status} onChange={(e) => set({ status: e.target.value })}>
                  <option value="active">Include in payroll</option>
                  <option value="inactive">Exclude from payroll</option>
                </select>
              </Field>
              {data?.salary && <Field label="Reason for change" className="col-span-2" hint="Saved in the revision history if the amounts changed"><input className={inputCls} value={form.revisionReason} onChange={(e) => set({ revisionReason: e.target.value })} placeholder="e.g. Annual appraisal" /></Field>}
            </div>
          </section>

          {data?.salary?.revisions?.length > 0 && (
            <section>
              <h4 className="text-sm font-bold text-slate-800 mb-2">Revision history</h4>
              <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
                {[...data.salary.revisions].reverse().map((r) => (
                  <li key={r._id} className="px-3 py-2 text-xs flex justify-between gap-3">
                    <span className="text-slate-600">{fmtDate(r.effectiveFrom)} → {fmtDate(r.revisedAt)}{r.reason ? ` · ${r.reason}` : ""}</span>
                    <span className="tabular-nums text-slate-800 font-semibold">{fmtMoney(r.grossMonthly, symbol)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </form>
      )}
    </Drawer>
  );
};

export default SalaryDrawer;
