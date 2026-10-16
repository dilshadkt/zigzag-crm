import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { useAccountSettings, useSaveSettings } from "../hooks/useAccounts";
import { INDIAN_STATES, errorMessage } from "../utils/format";
import ImageUpload from "../components/ImageUpload";
import TemplatesEditor from "../components/TemplatesEditor";
import { Card, ErrorState, Field, PageHeader, SegmentedTabs, Spinner, btnPrimary, btnSmall, inputCls, selectCls } from "../components/ui";

const SECTIONS = [
  { value: "business", label: "Business profile" },
  { value: "bank", label: "Bank accounts" },
  { value: "invoicing", label: "Invoices & proposals" },
  { value: "templates", label: "Templates" },
  { value: "expenses", label: "Expense categories" },
  { value: "payroll", label: "Payroll rules" },
];

const Settings = () => {
  const { data, isLoading, isError, error, refetch } = useAccountSettings();
  const save = useSaveSettings();
  const [tab, setTab] = useState("business");
  const [s, setS] = useState(null);

  useEffect(() => {
    if (data?.settings) setS(JSON.parse(JSON.stringify(data.settings)));
  }, [data]);

  if (isLoading || !s) return isError ? <ErrorState error={error} onRetry={refetch} /> : <Spinner />;

  const patch = (path, value) =>
    setS((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let node = next;
      keys.slice(0, -1).forEach((k) => {
        node[k] = node[k] || {};
        node = node[k];
      });
      node[keys[keys.length - 1]] = value;
      return next;
    });
  const bind = (path) => {
    const value = path.split(".").reduce((n, k) => n?.[k], s);
    return { value: value ?? "", onChange: (e) => patch(path, e.target.type === "number" ? e.target.value : e.target.value) };
  };
  const checkbox = (path) => ({ checked: Boolean(path.split(".").reduce((n, k) => n?.[k], s)), onChange: (e) => patch(path, e.target.checked) });

  const submit = async () => {
    const numeric = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));
    const payload = {
      business: s.business,
      bankAccounts: s.bankAccounts,
      currency: s.currency,
      currencySymbol: s.currencySymbol,
      financialYearStartMonth: Number(s.financialYearStartMonth),
      numbering: s.numbering,
      defaults: {
        ...s.defaults,
        paymentTermsDays: numeric(s.defaults.paymentTermsDays),
        taxRate: numeric(s.defaults.taxRate),
        proposalValidityDays: numeric(s.defaults.proposalValidityDays),
      },
      taxRates: s.taxRates,
      documentTemplates: s.documentTemplates || [],
      defaultTemplates: s.defaultTemplates || { invoice: "classic", proposal: "classic" },
      expenseCategories: s.expenseCategories,
      payroll: {
        ...s.payroll,
        halfDayHours: numeric(s.payroll.halfDayHours),
        overtimeMultiplier: numeric(s.payroll.overtimeMultiplier),
        hoursPerDay: numeric(s.payroll.hoursPerDay),
        costingHoursPerMonth: numeric(s.payroll.costingHoursPerMonth),
        pf: { ...s.payroll.pf, employeeRate: numeric(s.payroll.pf.employeeRate), employerRate: numeric(s.payroll.pf.employerRate), wageCeiling: numeric(s.payroll.pf.wageCeiling) },
        esi: { ...s.payroll.esi, employeeRate: numeric(s.payroll.esi.employeeRate), employerRate: numeric(s.payroll.esi.employerRate), grossCeiling: numeric(s.payroll.esi.grossCeiling) },
      },
    };
    try {
      await save.mutateAsync(payload);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const banks = s.bankAccounts || [];
  const setBank = (i, p) => patch("bankAccounts", banks.map((b, j) => (j === i ? { ...b, ...p } : b.isDefault && p.isDefault ? { ...b, isDefault: false } : b)));

  return (
    <div className={tab === "templates" ? "max-w-7xl" : "max-w-4xl"}>
      <PageHeader
        title="Accounts settings"
        subtitle="These details print on every invoice, proposal and payslip."
        actions={<button className={btnPrimary} onClick={submit} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save settings"}</button>}
      />
      <div className="mb-4"><SegmentedTabs tabs={SECTIONS} value={tab} onChange={setTab} /></div>

      {tab === "business" && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Legal business name" required><input className={inputCls} {...bind("business.legalName")} /></Field>
            <Field label="Trading / brand name"><input className={inputCls} {...bind("business.tradeName")} /></Field>
            <Field label="Email"><input type="email" className={inputCls} {...bind("business.email")} /></Field>
            <Field label="Phone"><input className={inputCls} {...bind("business.phone")} /></Field>
            <Field label="Website"><input className={inputCls} {...bind("business.website")} /></Field>
            <Field label="GSTIN" hint="Leave empty if you are not GST registered. Invoices then default to no tax."><input className={inputCls} value={s.business.gstin || ""} onChange={(e) => patch("business.gstin", e.target.value.toUpperCase())} /></Field>
            <Field label="PAN"><input className={inputCls} value={s.business.pan || ""} onChange={(e) => patch("business.pan", e.target.value.toUpperCase())} /></Field>
            <div />
            <Field label="Address" className="md:col-span-2"><input className={inputCls} {...bind("business.address.line1")} /></Field>
            <Field label="Address line 2" className="md:col-span-2"><input className={inputCls} {...bind("business.address.line2")} /></Field>
            <Field label="City"><input className={inputCls} {...bind("business.address.city")} /></Field>
            <Field label="State" hint="Compared with the client's state to choose CGST+SGST or IGST">
              <select className={selectCls} {...bind("business.address.state")}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </Field>
            <Field label="PIN code"><input className={inputCls} {...bind("business.address.pincode")} /></Field>
            <div />
            <ImageUpload label="Logo" value={s.business.logoUrl} onChange={(v) => patch("business.logoUrl", v)} />
            <ImageUpload label="Signature" value={s.business.signatureUrl} onChange={(v) => patch("business.signatureUrl", v)} />
          </div>
        </Card>
      )}

      {tab === "bank" && (
        <Card title="Bank accounts" subtitle="The default account is printed on invoices so clients know where to pay"
          actions={<button className={btnSmall} onClick={() => patch("bankAccounts", [...banks, { label: "", accountHolder: "", accountNumber: "", ifsc: "", bankName: "", branch: "", upiId: "", isDefault: banks.length === 0 }])}><FiPlus /> Add account</button>}>
          {banks.length === 0 && <p className="text-sm text-slate-400 py-4">No bank accounts yet.</p>}
          <div className="space-y-4">
            {banks.map((b, i) => (
              <div key={b._id || i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input type="radio" name="defaultBank" checked={b.isDefault} onChange={() => setBank(i, { isDefault: true })} /> Default account
                  </label>
                  <button className="text-slate-400 hover:text-red-500" onClick={() => patch("bankAccounts", banks.filter((_, j) => j !== i))} aria-label="Remove account"><FiTrash2 /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Label"><input className={inputCls} value={b.label} onChange={(e) => setBank(i, { label: e.target.value })} placeholder="e.g. HDFC current account" /></Field>
                  <Field label="Account holder"><input className={inputCls} value={b.accountHolder} onChange={(e) => setBank(i, { accountHolder: e.target.value })} /></Field>
                  <Field label="Account number"><input className={inputCls} value={b.accountNumber} onChange={(e) => setBank(i, { accountNumber: e.target.value })} /></Field>
                  <Field label="IFSC"><input className={inputCls} value={b.ifsc} onChange={(e) => setBank(i, { ifsc: e.target.value.toUpperCase() })} /></Field>
                  <Field label="Bank"><input className={inputCls} value={b.bankName} onChange={(e) => setBank(i, { bankName: e.target.value })} /></Field>
                  <Field label="Branch"><input className={inputCls} value={b.branch} onChange={(e) => setBank(i, { branch: e.target.value })} /></Field>
                  <Field label="UPI ID"><input className={inputCls} value={b.upiId} onChange={(e) => setBank(i, { upiId: e.target.value })} /></Field>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "invoicing" && (
        <div className="space-y-4">
          <Card title="Numbering" subtitle="Numbers go up by one for every document. They restart each financial year if you leave that on.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[["invoice", "Invoices"], ["proposal", "Proposals"], ["receipt", "Payment receipts"]].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">{label}</p>
                  <Field label="Prefix"><input className={inputCls} {...bind(`numbering.${key}.prefix`)} /></Field>
                  <Field label="Digits"><input type="number" min="1" max="8" className={inputCls} {...bind(`numbering.${key}.padding`)} /></Field>
                  <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" {...checkbox(`numbering.${key}.perFinancialYear`)} /> Restart every financial year</label>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <Field label="Financial year starts in">
                <select className={selectCls} value={s.financialYearStartMonth} onChange={(e) => patch("financialYearStartMonth", e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Date(2000, i, 1).toLocaleString("en", { month: "long" })}</option>)}
                </select>
              </Field>
              <Field label="Currency code"><input className={inputCls} {...bind("currency")} /></Field>
              <Field label="Currency symbol"><input className={inputCls} {...bind("currencySymbol")} /></Field>
            </div>
          </Card>
          <Card title="Defaults for new documents">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Payment terms (days)"><input type="number" min="0" className={inputCls} {...bind("defaults.paymentTermsDays")} /></Field>
              <Field label="Default tax rate (%)"><input type="number" min="0" step="any" className={inputCls} {...bind("defaults.taxRate")} /></Field>
              <Field label="Proposal valid for (days)"><input type="number" min="1" className={inputCls} {...bind("defaults.proposalValidityDays")} /></Field>
              <Field label="Rates in the tax dropdown" hint="Comma separated, e.g. 0, 5, 12, 18, 28" className="md:col-span-3">
                <input className={inputCls} value={(s.taxRates || []).join(", ")} onChange={(e) => patch("taxRates", e.target.value.split(",").map((x) => x.trim()).filter((x) => x !== "" && !Number.isNaN(Number(x))).map(Number))} />
              </Field>
              <Field label="Invoice note" className="md:col-span-3"><textarea rows={2} className={inputCls} {...bind("defaults.invoiceNotes")} /></Field>
              <Field label="Invoice terms" className="md:col-span-3"><textarea rows={3} className={inputCls} {...bind("defaults.invoiceTerms")} /></Field>
              <Field label="Proposal introduction" className="md:col-span-3"><textarea rows={3} className={inputCls} {...bind("defaults.proposalIntro")} /></Field>
              <Field label="Proposal terms" className="md:col-span-3"><textarea rows={3} className={inputCls} {...bind("defaults.proposalTerms")} /></Field>
            </div>
          </Card>
        </div>
      )}

      {tab === "templates" && (
        <TemplatesEditor
          templates={s.documentTemplates || []}
          defaults={s.defaultTemplates || { invoice: "classic", proposal: "classic" }}
          business={s.business}
          bankAccounts={s.bankAccounts}
          onTemplatesChange={(list) => patch("documentTemplates", list)}
          onDefaultsChange={(d) => patch("defaultTemplates", d)}
        />
      )}

      {tab === "expenses" && (
        <Card title="Expense categories" subtitle="Used in the expense form and reports. Removing one does not change old expenses.">
          <div className="flex flex-wrap gap-2 mb-4">
            {(s.expenseCategories || []).map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {c}
                <button onClick={() => patch("expenseCategories", s.expenseCategories.filter((x) => x !== c))} className="text-slate-400 hover:text-red-500" aria-label={`Remove ${c}`}><FiX /></button>
              </span>
            ))}
          </div>
          <form className="flex gap-2 max-w-md" onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.category;
            const value = input.value.trim();
            if (value && !s.expenseCategories.includes(value)) patch("expenseCategories", [...s.expenseCategories, value]);
            input.value = "";
          }}>
            <input name="category" className={inputCls} placeholder="Add a category" />
            <button className={btnSmall + " !h-10"}><FiPlus /> Add</button>
          </form>
        </Card>
      )}

      {tab === "payroll" && (
        <div className="space-y-4">
          <Card title="How pay is worked out">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="A day's pay is" hint="Monthly salary divided by this">
                <select className={selectCls} {...bind("payroll.dayBasis")}>
                  <option value="calendar">Calendar days in the month</option>
                  <option value="working">Working days in the month</option>
                </select>
              </Field>
              <Field label="Pay is cut for" hint="Approved unpaid leave always cuts pay">
                <select className={selectCls} {...bind("payroll.lopMode")}>
                  <option value="leave_only">Approved unpaid leave only</option>
                  <option value="attendance">Unpaid leave + working days with no attendance</option>
                </select>
              </Field>
              <Field label="Half-day if hours worked are below" hint="0 turns this off"><input type="number" min="0" step="any" className={inputCls} {...bind("payroll.halfDayHours")} /></Field>
              <Field label="Hours in a working day"><input type="number" min="1" step="any" className={inputCls} {...bind("payroll.hoursPerDay")} /></Field>
              <Field label="Overtime pay multiplier"><input type="number" min="0" step="any" className={inputCls} {...bind("payroll.overtimeMultiplier")} /></Field>
              <Field label="Hours per month for project costing" hint="Divides monthly cost into an hourly cost"><input type="number" min="1" className={inputCls} {...bind("payroll.costingHoursPerMonth")} /></Field>
            </div>
            <p className="text-xs text-slate-500 mt-3">Weekly offs and holidays come from Settings → Company. Approved leave comes from the Leave module.</p>
          </Card>
          <Card title="Provident Fund (PF)">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 pb-2"><input type="checkbox" {...checkbox("payroll.pf.enabled")} /> Calculate PF</label>
              <Field label="Employee %"><input type="number" min="0" step="any" className={inputCls} {...bind("payroll.pf.employeeRate")} /></Field>
              <Field label="Employer %"><input type="number" min="0" step="any" className={inputCls} {...bind("payroll.pf.employerRate")} /></Field>
              <Field label="Wage ceiling"><input type="number" min="0" className={inputCls} {...bind("payroll.pf.wageCeiling")} /></Field>
              <label className="flex items-center gap-2 text-xs text-slate-600 md:col-span-4"><input type="checkbox" {...checkbox("payroll.pf.onActualBasic")} /> Calculate on the full basic pay instead of capping at the ceiling</label>
            </div>
          </Card>
          <Card title="Employee State Insurance (ESI)">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 pb-2"><input type="checkbox" {...checkbox("payroll.esi.enabled")} /> Calculate ESI</label>
              <Field label="Employee %"><input type="number" min="0" step="any" className={inputCls} {...bind("payroll.esi.employeeRate")} /></Field>
              <Field label="Employer %"><input type="number" min="0" step="any" className={inputCls} {...bind("payroll.esi.employerRate")} /></Field>
              <Field label="Applies up to gross of"><input type="number" min="0" className={inputCls} {...bind("payroll.esi.grossCeiling")} /></Field>
            </div>
            <p className="text-xs text-slate-500 mt-3">The PF and ESI rates and limits above are the usual statutory values. Confirm the current figures with your accountant, since they change from time to time.</p>
          </Card>
          <Card title="Payslip footer">
            <textarea rows={2} className={inputCls} {...bind("payroll.payslipFooter")} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Settings;
