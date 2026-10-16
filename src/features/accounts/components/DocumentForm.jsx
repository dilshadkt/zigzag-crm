import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useAccountsContext } from "../context";
import { useClient, useClientLookup } from "../hooks/useAccounts";
import { INDIAN_STATES, TAX_MODES, blankItem, computeTotals, errorMessage, fmtMoney, toInputDate } from "../utils/format";
import LineItemsEditor from "./LineItemsEditor";
import { Card, Field, PageHeader, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "./ui";

const emptyParty = { name: "", contactName: "", email: "", phone: "", gstin: "", address: { line1: "", city: "", state: "", pincode: "" } };
const norm = (s) => String(s || "").trim().toLowerCase();

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * One form for invoices and proposals. `type` switches the few fields that
 * differ; everything else (client, line items, tax, totals) is shared.
 */
const DocumentForm = ({ type, initial, onSubmit, saving, onCancel, title, defaults = {} }) => {
  const { settings, symbol } = useAccountsContext();
  const navigate = useNavigate();
  const isInvoice = type === "invoice";
  const cfg = settings?.defaults || {};
  const hasGstin = Boolean(settings?.business?.gstin);
  const taxRates = settings?.taxRates?.length ? settings.taxRates : [0, 5, 12, 18, 28];
  const defaultTax = hasGstin ? cfg.taxRate ?? 18 : 0;

  const [form, setForm] = useState(() => {
    const today = new Date();
    const base = {
      project: defaults.project || "",
      client: emptyParty,
      title: "",
      reference: "",
      issueDate: toInputDate(today),
      dueDate: toInputDate(addDays(today, cfg.paymentTermsDays ?? 15)),
      periodStart: "",
      periodEnd: "",
      validUntil: toInputDate(addDays(today, cfg.proposalValidityDays ?? 15)),
      items: [blankItem(defaultTax)],
      discountType: "none",
      discountValue: 0,
      taxMode: hasGstin ? "gst_intra" : "none",
      tdsPercent: 0,
      adjustment: 0,
      notes: isInvoice ? cfg.invoiceNotes || "" : "",
      terms: isInvoice ? cfg.invoiceTerms || "" : cfg.proposalTerms || "",
      intro: cfg.proposalIntro || "",
      sections: [],
      milestones: [],
      timeline: "",
      billableExpenseIds: [],
      ...defaults,
    };
    if (!initial) return base;
    return {
      ...base,
      project: initial.project?._id || initial.project || "",
      client: { ...emptyParty, ...initial.client, address: { ...emptyParty.address, ...(initial.client?.address || {}) } },
      title: initial.title || "",
      reference: initial.reference || "",
      issueDate: toInputDate(initial.issueDate),
      dueDate: initial.dueDate ? toInputDate(initial.dueDate) : base.dueDate,
      periodStart: initial.periodStart ? toInputDate(initial.periodStart) : "",
      periodEnd: initial.periodEnd ? toInputDate(initial.periodEnd) : "",
      validUntil: initial.validUntil ? toInputDate(initial.validUntil) : base.validUntil,
      items: initial.items?.length ? initial.items.map((i) => ({ ...i })) : base.items,
      discountType: initial.discountType || "none",
      discountValue: initial.discountValue || 0,
      taxMode: initial.taxMode || base.taxMode,
      tdsPercent: initial.tdsPercent || 0,
      adjustment: initial.adjustment || 0,
      notes: initial.notes ?? "",
      terms: initial.terms ?? "",
      intro: initial.intro ?? "",
      sections: (initial.sections || []).map((s) => ({ title: s.title, body: s.body })),
      milestones: (initial.milestones || []).map((m) => ({ ...m })),
      timeline: initial.timeline || "",
      billableExpenseIds: [],
    };
  });
  const [errors, setErrors] = useState({});
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setParty = (patch) => setForm((f) => ({ ...f, client: { ...f.client, ...patch } }));
  const setAddress = (patch) => setForm((f) => ({ ...f, client: { ...f.client, address: { ...f.client.address, ...patch } } }));

  const { data: clientList } = useClientLookup();
  const { data: clientDetail } = useClient(form.project);
  const appliedFor = useRef(initial ? form.project : null);

  // When a client is picked, fill in their billing profile once
  useEffect(() => {
    if (!form.project || !clientDetail?.client || appliedFor.current === form.project) return;
    if (String(clientDetail.client._id) !== String(form.project)) return;
    appliedFor.current = form.project;
    const b = clientDetail.billing || {};
    const next = {
      name: b.legalName || clientDetail.client.name,
      contactName: b.contactName || "",
      email: b.email || "",
      phone: b.phone || "",
      gstin: b.gstin || "",
      address: { ...emptyParty.address, ...(b.address || {}) },
    };
    setForm((f) => {
      const mine = norm(settings?.business?.address?.state);
      const theirs = norm(next.address.state);
      const taxMode = !hasGstin ? "none" : mine && theirs && mine !== theirs ? "gst_inter" : "gst_intra";
      const patch = { client: next, taxMode };
      if (isInvoice) {
        patch.tdsPercent = b.defaultTdsPercent || 0;
        const days = b.paymentTermsDays ?? cfg.paymentTermsDays ?? 15;
        patch.dueDate = toInputDate(addDays(f.issueDate, days));
      }
      return { ...f, ...patch };
    });
  }, [form.project, clientDetail, hasGstin, isInvoice, settings, cfg.paymentTermsDays]);

  const totals = useMemo(
    () =>
      computeTotals({
        items: form.items.map((i) => ({ ...i, quantity: Number(i.quantity), rate: Number(i.rate), discountPercent: Number(i.discountPercent), taxRate: Number(i.taxRate) })),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        taxMode: form.taxMode,
        tdsPercent: isInvoice ? Number(form.tdsPercent) : 0,
        adjustment: isInvoice ? Number(form.adjustment) : 0,
        roundTotal: (settings?.currency || "INR") === "INR",
      }),
    [form, isInvoice, settings]
  );

  const billable = clientDetail?.billableExpenses || [];
  const addExpense = (expense) => {
    if (form.billableExpenseIds.includes(expense._id)) return;
    const blank = form.items.length === 1 && !form.items[0].description && !form.items[0].rate;
    const line = { ...blankItem(defaultTax), description: expense.description, details: `${expense.category}${expense.vendor ? ` · ${expense.vendor}` : ""}`, rate: expense.amount };
    set({ items: blank ? [line] : [...form.items, line], billableExpenseIds: [...form.billableExpenseIds, expense._id] });
  };

  const validate = () => {
    const e = {};
    if (!form.client.name.trim()) e.client = "Choose a client or type a name";
    if (!form.items.some((i) => i.description.trim())) e.items = "Add at least one item";
    if (form.items.some((i) => i.description.trim() && !(Number(i.rate) >= 0))) e.items = "Check the item rates";
    if (!isInvoice && !form.title.trim()) e.title = "Give the proposal a title";
    if (isInvoice && form.dueDate < form.issueDate) e.dueDate = "Due date is before the issue date";
    if (!isInvoice && form.validUntil < form.issueDate) e.validUntil = "Valid-until is before the issue date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const payload = {
      project: form.project || null,
      client: form.client,
      title: form.title,
      issueDate: form.issueDate,
      taxMode: form.taxMode,
      discountType: form.discountType,
      discountValue: Number(form.discountValue) || 0,
      items: form.items
        .filter((i) => i.description.trim())
        .map((i) => ({
          ...i,
          quantity: Number(i.quantity) || 0,
          rate: Number(i.rate) || 0,
          discountPercent: Number(i.discountPercent) || 0,
          taxRate: Number(i.taxRate) || 0,
        })),
      notes: form.notes,
      terms: form.terms,
      placeOfSupply: form.client.address?.state || "",
    };
    if (isInvoice) {
      Object.assign(payload, {
        reference: form.reference,
        dueDate: form.dueDate,
        periodStart: form.periodStart || null,
        periodEnd: form.periodEnd || null,
        tdsPercent: Number(form.tdsPercent) || 0,
        adjustment: Number(form.adjustment) || 0,
        billableExpenseIds: form.billableExpenseIds,
      });
    } else {
      Object.assign(payload, {
        validUntil: form.validUntil,
        intro: form.intro,
        sections: form.sections,
        milestones: form.milestones,
        timeline: form.timeline,
      });
    }
    try {
      await onSubmit(payload);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <form onSubmit={submit} className="max-w-6xl mx-auto">
      <PageHeader
        title={title}
        subtitle={isInvoice ? "Taxes and totals are worked out as you type." : "Describe the work, price it, and send it for approval."}
        onBack={() => (onCancel ? onCancel() : navigate(-1))}
        actions={
          <>
            <button type="button" className={btnGhost} onClick={() => (onCancel ? onCancel() : navigate(-1))}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Saving…" : initial ? "Save changes" : isInvoice ? "Save invoice" : "Save proposal"}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          <Card title={isInvoice ? "Bill to" : "Prepare for"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Client" className="md:col-span-2" error={errors.client}>
                <select
                  className={selectCls}
                  value={form.project}
                  onChange={(e) => {
                    appliedFor.current = null;
                    set({ project: e.target.value });
                    if (!e.target.value) setForm((f) => ({ ...f, project: "" }));
                  }}
                >
                  <option value="">{isInvoice ? "One-off client (type details below)" : "New prospect (type details below)"}</option>
                  {(clientList?.clients || []).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Name on document" required>
                <input className={inputCls} value={form.client.name} onChange={(e) => setParty({ name: e.target.value })} />
              </Field>
              <Field label="Contact person">
                <input className={inputCls} value={form.client.contactName} onChange={(e) => setParty({ contactName: e.target.value })} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} value={form.client.email} onChange={(e) => setParty({ email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.client.phone} onChange={(e) => setParty({ phone: e.target.value })} />
              </Field>
              <Field label="GSTIN">
                <input className={inputCls} value={form.client.gstin} onChange={(e) => setParty({ gstin: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="State">
                <select className={selectCls} value={form.client.address.state} onChange={(e) => {
                  const state = e.target.value;
                  setAddress({ state });
                  const mine = norm(settings?.business?.address?.state);
                  if (hasGstin && mine && state) set({ taxMode: norm(state) === mine ? "gst_intra" : "gst_inter" });
                }}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Address" className="md:col-span-2">
                <input className={inputCls} value={form.client.address.line1} onChange={(e) => setAddress({ line1: e.target.value })} placeholder="Street, area" />
              </Field>
              <Field label="City">
                <input className={inputCls} value={form.client.address.city} onChange={(e) => setAddress({ city: e.target.value })} />
              </Field>
              <Field label="PIN code">
                <input className={inputCls} value={form.client.address.pincode} onChange={(e) => setAddress({ pincode: e.target.value })} />
              </Field>
            </div>
          </Card>

          <Card title="Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label={isInvoice ? "Invoice title (optional)" : "Proposal title"} className="md:col-span-2" error={errors.title} required={!isInvoice}>
                <input className={inputCls} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder={isInvoice ? "e.g. Social media retainer, June" : "e.g. Brand launch campaign"} />
              </Field>
              <Field label={isInvoice ? "Invoice date" : "Date"}>
                <input type="date" className={inputCls} value={form.issueDate} onChange={(e) => set({ issueDate: e.target.value })} />
              </Field>
              {isInvoice ? (
                <Field label="Due date" error={errors.dueDate}>
                  <input type="date" className={inputCls} value={form.dueDate} min={form.issueDate} onChange={(e) => set({ dueDate: e.target.value })} />
                </Field>
              ) : (
                <Field label="Valid until" error={errors.validUntil}>
                  <input type="date" className={inputCls} value={form.validUntil} min={form.issueDate} onChange={(e) => set({ validUntil: e.target.value })} />
                </Field>
              )}
              {isInvoice && (
                <>
                  <Field label="Service period from" hint="For retainers">
                    <input type="date" className={inputCls} value={form.periodStart} onChange={(e) => set({ periodStart: e.target.value })} />
                  </Field>
                  <Field label="Service period to">
                    <input type="date" className={inputCls} value={form.periodEnd} min={form.periodStart} onChange={(e) => set({ periodEnd: e.target.value })} />
                  </Field>
                  <Field label="PO / reference number" className="md:col-span-2">
                    <input className={inputCls} value={form.reference} onChange={(e) => set({ reference: e.target.value })} />
                  </Field>
                </>
              )}
            </div>
          </Card>

          <Card title="Items" subtitle={errors.items ? undefined : "Prices exclude tax. Tax is added per item."}>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <LineItemsEditor
              items={form.items}
              onChange={(items) => set({ items })}
              taxRates={taxRates}
              showTax={form.taxMode !== "none"}
              allowOptional={!isInvoice}
              symbol={symbol}
              defaultTaxRate={defaultTax}
            />
            {isInvoice && billable.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-semibold text-amber-800 mb-2">Billable expenses not yet invoiced for this client</p>
                <div className="flex flex-wrap gap-2">
                  {billable.map((e) => (
                    <button
                      key={e._id}
                      type="button"
                      disabled={form.billableExpenseIds.includes(e._id)}
                      onClick={() => addExpense(e)}
                      className={`${btnSmall} !h-auto py-1.5`}
                    >
                      <FiPlus /> {e.description} · {fmtMoney(e.amount, symbol)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {!isInvoice && (
            <>
              <Card title="Introduction">
                <textarea className={inputCls} rows={4} value={form.intro} onChange={(e) => set({ intro: e.target.value })} placeholder="A short note that opens the proposal" />
              </Card>

              <Card
                title="Scope & sections"
                subtitle="Scope of work, deliverables, about us, anything the client should read"
                actions={
                  <button type="button" className={btnSmall} onClick={() => set({ sections: [...form.sections, { title: "", body: "" }] })}>
                    <FiPlus /> Add section
                  </button>
                }
              >
                {form.sections.length === 0 && <p className="text-xs text-slate-400">No sections yet.</p>}
                <div className="space-y-3">
                  {form.sections.map((s, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2">
                      <div className="flex gap-2">
                        <input className={inputCls} placeholder="Section title" value={s.title} onChange={(e) => set({ sections: form.sections.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                        <button type="button" className="w-10 shrink-0 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" onClick={() => set({ sections: form.sections.filter((_, j) => j !== i) })} aria-label="Remove section">
                          <FiTrash2 />
                        </button>
                      </div>
                      <textarea className={inputCls} rows={4} placeholder="Write the section" value={s.body} onChange={(e) => set({ sections: form.sections.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)) })} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card
                title="Payment milestones"
                subtitle={`Percentages should add up to 100%. Currently ${form.milestones.reduce((s, m) => s + (Number(m.percent) || 0), 0)}%.`}
                actions={
                  <button type="button" className={btnSmall} onClick={() => set({ milestones: [...form.milestones, { title: "", percent: 0, dueNote: "" }] })}>
                    <FiPlus /> Add milestone
                  </button>
                }
              >
                {form.milestones.length === 0 && <p className="text-xs text-slate-400">Optional. Each milestone can be turned into its own invoice later.</p>}
                <div className="space-y-2">
                  {form.milestones.map((m, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <input className={`${inputCls} col-span-5`} placeholder="e.g. Advance" value={m.title} onChange={(e) => set({ milestones: form.milestones.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                      <input className={`${inputCls} col-span-4`} placeholder="When (e.g. on approval)" value={m.dueNote || ""} onChange={(e) => set({ milestones: form.milestones.map((x, j) => (j === i ? { ...x, dueNote: e.target.value } : x)) })} />
                      <input type="number" min="0" max="100" className={`${inputCls} col-span-2`} placeholder="%" value={m.percent} onChange={(e) => set({ milestones: form.milestones.map((x, j) => (j === i ? { ...x, percent: e.target.value } : x)) })} />
                      <button type="button" className="col-span-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" onClick={() => set({ milestones: form.milestones.filter((_, j) => j !== i) })} aria-label="Remove milestone">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Timeline">
                <textarea className={inputCls} rows={3} value={form.timeline} onChange={(e) => set({ timeline: e.target.value })} placeholder="e.g. Kick-off within 3 days of approval. First deliverables in week 2." />
              </Card>
            </>
          )}

          <Card title="Notes & terms">
            <div className="space-y-3">
              <Field label={isInvoice ? "Note to client" : "Closing note"}>
                <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
              </Field>
              <Field label="Terms & conditions">
                <textarea className={inputCls} rows={3} value={form.terms} onChange={(e) => set({ terms: e.target.value })} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-0 space-y-4">
          <Card title="Tax & discount">
            <div className="space-y-3">
              <Field label="Tax" hint={!hasGstin ? "Add your GSTIN in Accounts → Settings to charge GST." : undefined}>
                <select className={selectCls} value={form.taxMode} onChange={(e) => set({ taxMode: e.target.value })}>
                  {TAX_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Discount">
                  <select className={selectCls} value={form.discountType} onChange={(e) => set({ discountType: e.target.value })}>
                    <option value="none">None</option>
                    <option value="percent">Percent</option>
                    <option value="flat">Flat amount</option>
                  </select>
                </Field>
                <Field label={form.discountType === "percent" ? "Percent" : "Amount"}>
                  <input type="number" min="0" step="any" disabled={form.discountType === "none"} className={inputCls} value={form.discountValue} onChange={(e) => set({ discountValue: e.target.value })} />
                </Field>
              </div>
              {isInvoice && (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="TDS % (client deducts)">
                    <input type="number" min="0" max="100" step="any" className={inputCls} value={form.tdsPercent} onChange={(e) => set({ tdsPercent: e.target.value })} />
                  </Field>
                  <Field label="Adjustment" hint="+ or −">
                    <input type="number" step="any" className={inputCls} value={form.adjustment} onChange={(e) => set({ adjustment: e.target.value })} />
                  </Field>
                </div>
              )}
            </div>
          </Card>

          <Card title="Summary">
            <dl className="text-sm space-y-1.5">
              <Row label="Subtotal" value={fmtMoney(totals.subtotal, symbol)} />
              {totals.lineDiscount > 0 && <Row label="Item discounts" value={`- ${fmtMoney(totals.lineDiscount, symbol)}`} />}
              {totals.discount > 0 && <Row label="Discount" value={`- ${fmtMoney(totals.discount, symbol)}`} />}
              {form.taxMode === "gst_intra" && (
                <>
                  <Row label="CGST" value={fmtMoney(totals.cgst, symbol)} />
                  <Row label="SGST" value={fmtMoney(totals.sgst, symbol)} />
                </>
              )}
              {form.taxMode === "gst_inter" && <Row label="IGST" value={fmtMoney(totals.igst, symbol)} />}
              {totals.adjustment !== 0 && <Row label="Adjustment" value={fmtMoney(totals.adjustment, symbol)} />}
              {totals.roundOff !== 0 && <Row label="Round off" value={fmtMoney(totals.roundOff, symbol)} />}
              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-base font-bold text-slate-900">
                <dt>Total</dt>
                <dd className="tabular-nums">{fmtMoney(totals.total, symbol)}</dd>
              </div>
              {totals.tds > 0 && (
                <>
                  <Row label={`TDS @ ${form.tdsPercent}%`} value={`- ${fmtMoney(totals.tds, symbol)}`} />
                  <div className="flex justify-between font-semibold text-slate-800"><dt>Net payable</dt><dd className="tabular-nums">{fmtMoney(totals.payable, symbol)}</dd></div>
                </>
              )}
              {totals.optionalTotal > 0 && <p className="text-[11px] text-slate-400 pt-1">Optional items ({fmtMoney(totals.optionalTotal, symbol)}) are not in the total.</p>}
            </dl>
          </Card>
        </div>
      </div>
    </form>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between text-slate-600">
    <dt>{label}</dt>
    <dd className="tabular-nums text-slate-800">{value}</dd>
  </div>
);

export default DocumentForm;
