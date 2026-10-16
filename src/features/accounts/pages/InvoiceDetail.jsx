import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiDollarSign, FiEdit2, FiMail, FiMoreHorizontal, FiRepeat, FiTrash2 } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import { accountsApi } from "../api/accountsApi";
import { useAccountsContext } from "../context";
import {
  useAddPayment,
  useDeleteInvoice,
  useDuplicateInvoice,
  useInvoice,
  useMarkInvoiceSent,
  useRemovePayment,
  useRunRecurring,
  useSendInvoice,
  useSetInvoiceTemplate,
  useSetRecurring,
  useVoidInvoice,
} from "../hooks/useAccounts";
import { INVOICE_STATUS, PAYMENT_METHODS, fmtDate, fmtMoney, methodLabel, toInputDate } from "../utils/format";
import { pdfName } from "../utils/pdf";
import { resolveTemplate } from "../utils/templates";
import { PdfButtons, TemplatePicker } from "../components/DocumentActions";
import DocumentView from "../components/DocumentView";
import SendDocumentModal from "../components/SendDocumentModal";
import { Card, ConfirmModal, ErrorState, Field, PageHeader, Spinner, StatusBadge, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "../components/ui";

const PaymentModal = ({ invoice, isOpen, onClose }) => {
  const add = useAddPayment();
  const [form, setForm] = useState({ amount: "", date: toInputDate(new Date()), method: "bank_transfer", reference: "", notes: "" });
  React.useEffect(() => {
    if (isOpen) setForm({ amount: invoice?.balance || "", date: toInputDate(new Date()), method: "bank_transfer", reference: "", notes: "" });
  }, [isOpen, invoice?.balance]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await add.mutateAsync({ id: invoice._id, data: { ...form, amount: Number(form.amount) } });
      onClose();
    } catch {
      /* toast shown by the hook */
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record payment">
      <form onSubmit={submit} className="pt-4 space-y-3">
        <p className="text-xs text-slate-500">Balance due: <b>{fmtMoney(invoice?.balance, invoice?.currencySymbol)}</b></p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount received" required>
            <input type="number" min="0.01" step="any" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} autoFocus />
          </Field>
          <Field label="Date received">
            <input type="date" className={inputCls} value={form.date} max={toInputDate(new Date())} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Method">
            <select className={selectCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Reference / UTR">
            <input className={inputCls} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </Field>
        </div>
        <Field label="Notes">
          <input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={add.isPending || !(Number(form.amount) > 0)}>
            {add.isPending ? "Saving…" : "Record payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const RecurringModal = ({ invoice, isOpen, onClose }) => {
  const save = useSetRecurring();
  const r = invoice?.recurring || {};
  const [form, setForm] = useState({ enabled: true, frequency: "monthly", nextRunDate: "", endDate: "", action: "draft" });
  React.useEffect(() => {
    if (isOpen) {
      setForm({
        enabled: r.enabled ?? true,
        frequency: r.frequency || "monthly",
        nextRunDate: r.nextRunDate ? toInputDate(r.nextRunDate) : toInputDate(new Date(Date.now() + 30 * 86400000)),
        endDate: r.endDate ? toInputDate(r.endDate) : "",
        action: r.action || "draft",
      });
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    try {
      await save.mutateAsync({ id: invoice._id, data: { ...form, endDate: form.endDate || null } });
      onClose();
    } catch {
      /* toast shown */
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recurring invoice">
      <form onSubmit={submit} className="pt-4 space-y-3">
        <p className="text-xs text-slate-500">This invoice becomes the template. A copy is created automatically on each run date.</p>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          Repeat this invoice
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Repeats">
            <select className={selectCls} disabled={!form.enabled} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              <option value="weekly">Every week</option>
              <option value="monthly">Every month</option>
              <option value="quarterly">Every 3 months</option>
              <option value="yearly">Every year</option>
            </select>
          </Field>
          <Field label="Next invoice on">
            <input type="date" className={inputCls} disabled={!form.enabled} value={form.nextRunDate} onChange={(e) => setForm({ ...form, nextRunDate: e.target.value })} />
          </Field>
          <Field label="Stop after (optional)">
            <input type="date" className={inputCls} disabled={!form.enabled} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Field>
          <Field label="When it is created">
            <select className={selectCls} disabled={!form.enabled} value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
              <option value="draft">Save as draft to review</option>
              <option value="send">Email it to the client</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { permissions, settings } = useAccountsContext();
  const { data, isLoading, isError, error, refetch } = useInvoice(id);
  const docRef = useRef(null);

  const [modal, setModal] = useState(null); // payment | send | recurring | void | delete | removePayment
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentToRemove, setPaymentToRemove] = useState(null);

  const send = useSendInvoice();
  const markSent = useMarkInvoiceSent();
  const voidInvoice = useVoidInvoice();
  const remove = useDeleteInvoice();
  const duplicate = useDuplicateInvoice();
  const removePayment = useRemovePayment();
  const runRecurring = useRunRecurring();
  const setTemplate = useSetInvoiceTemplate();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  const invoice = data.invoice;
  const status = invoice.isOverdue ? "overdue" : invoice.status;
  const editable = permissions.manageInvoices && invoice.status !== "void";
  const canPay = editable && invoice.status !== "paid";
  const sym = invoice.currencySymbol;
  const business = settings?.business || {};

  const defaultTemplateId = settings?.defaultTemplates?.invoice || "classic";
  const template = resolveTemplate(invoice.templateId || defaultTemplateId, settings?.documentTemplates);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={invoice.number}
        badge={<StatusBadge status={status} map={INVOICE_STATUS} />}
        subtitle={`${invoice.client?.name}${invoice.title ? ` · ${invoice.title}` : ""}`}
        onBack={() => navigate("/accounts/invoices")}
        actions={
          <>
            <PdfButtons getElement={() => docRef.current} filename={pdfName("Invoice", invoice.number)} title={`Invoice ${invoice.number}`} />
            {editable && invoice.status !== "paid" && (
              <button className={btnGhost} onClick={() => navigate(`/accounts/invoices/${id}/edit`)}><FiEdit2 /> Edit</button>
            )}
            {editable && (
              <button className={btnGhost} onClick={() => setModal("send")}><FiMail /> {invoice.sentAt ? "Resend" : "Send"}</button>
            )}
            {canPay && <button className={btnPrimary} onClick={() => setModal("payment")}><FiDollarSign /> Record payment</button>}
            {editable && (
              <div className="relative">
                <button className={`${btnGhost} !px-3`} onClick={() => setMenuOpen((o) => !o)} aria-label="More actions" aria-expanded={menuOpen}><FiMoreHorizontal /></button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-100 rounded-xl shadow-lg z-20 py-1 text-sm">
                      {invoice.status === "draft" && (
                        <MenuItem onClick={() => { setMenuOpen(false); markSent.mutate(id); }}>Mark as sent</MenuItem>
                      )}
                      <MenuItem onClick={() => { setMenuOpen(false); duplicate.mutateAsync(id).then((r) => navigate(`/accounts/invoices/${r.invoice._id}`)).catch(() => {}); }}>Duplicate</MenuItem>
                      <MenuItem onClick={() => { setMenuOpen(false); setModal("recurring"); }}>Recurring…</MenuItem>
                      {invoice.status !== "void" && !invoice.payments?.length && (
                        <MenuItem danger onClick={() => { setMenuOpen(false); setModal("void"); }}>Void invoice</MenuItem>
                      )}
                      {invoice.status === "draft" && permissions.delete && (
                        <MenuItem danger onClick={() => { setMenuOpen(false); setModal("delete"); }}>Delete</MenuItem>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 bg-slate-100/70 rounded-2xl p-2 sm:p-4 overflow-x-auto">
          {editable && (
            <div className="flex justify-end mb-2">
              <TemplatePicker
                type="invoice"
                value={invoice.templateId}
                defaultId={defaultTemplateId}
                customTemplates={settings?.documentTemplates}
                disabled={setTemplate.isPending}
                onChange={(templateId) => setTemplate.mutate({ id, templateId })}
              />
            </div>
          )}
          <div className="shadow-sm rounded-lg overflow-hidden">
            <DocumentView ref={docRef} type="invoice" doc={invoice} business={business} template={template} />
          </div>
        </div>

        <div className="space-y-4">
          <Card title="Payment">
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between"><dt className="text-slate-500">Invoice total</dt><dd className="font-semibold tabular-nums">{fmtMoney(invoice.totals.payable, sym)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Received</dt><dd className="tabular-nums text-emerald-600">{fmtMoney(invoice.amountPaid, sym)}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5"><dt className="font-semibold text-slate-700">Balance due</dt><dd className={`font-bold tabular-nums ${invoice.balance > 0 && invoice.status !== "void" ? "text-slate-900" : "text-slate-400"}`}>{fmtMoney(invoice.status === "void" ? 0 : invoice.balance, sym)}</dd></div>
            </dl>
            {invoice.isOverdue && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">Overdue by {invoice.daysOverdue} day{invoice.daysOverdue === 1 ? "" : "s"}.</p>
            )}
            {invoice.status === "void" && (
              <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">Voided {fmtDate(invoice.voidedAt)}{invoice.voidReason ? `: ${invoice.voidReason}` : ""}</p>
            )}
          </Card>

          <Card title="Payments received">
            {invoice.payments?.length ? (
              <ul className="divide-y divide-slate-100">
                {invoice.payments.map((p) => (
                  <li key={p._id} className="py-2.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 tabular-nums">{fmtMoney(p.amount, sym)}</p>
                      <p className="text-xs text-slate-500">{fmtDate(p.date)} · {methodLabel(p.method)}{p.reference ? ` · ${p.reference}` : ""}</p>
                      <p className="text-[11px] text-slate-400">{p.receiptNumber}{p.recordedBy ? ` · by ${p.recordedBy.firstName}` : ""}</p>
                    </div>
                    {editable && (
                      <button className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center" onClick={() => setPaymentToRemove(p)} aria-label="Delete payment">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">No payments yet.</p>
            )}
          </Card>

          <Card title="Activity">
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>Created {fmtDate(invoice.createdAt)}{invoice.createdBy ? ` by ${invoice.createdBy.firstName}` : ""}</li>
              {invoice.sentAt && <li>Emailed {fmtDate(invoice.sentAt)}{invoice.sentTo?.length ? ` to ${invoice.sentTo.join(", ")}` : ""}</li>}
              {invoice.viewedAt && <li>Opened by client {fmtDate(invoice.viewedAt)}</li>}
              {invoice.paidAt && <li className="text-emerald-600">Fully paid {fmtDate(invoice.paidAt)}</li>}
              {invoice.recurring?.enabled && (
                <li className="flex items-center gap-1.5 text-[#3F8CFF]">
                  <FiRepeat /> Repeats {invoice.recurring.frequency}, next {fmtDate(invoice.recurring.nextRunDate)}
                </li>
              )}
            </ul>
            {invoice.recurring?.enabled && editable && (
              <button className={`${btnSmall} mt-3`} disabled={runRecurring.isPending} onClick={() => runRecurring.mutateAsync(id).then((r) => navigate(`/accounts/invoices/${r.invoice._id}`)).catch(() => {})}>
                <FiRepeat /> Create next invoice now
              </button>
            )}
          </Card>

          {data.billableExpenses?.length > 0 && (
            <Card title="Expenses billed here">
              <ul className="text-xs text-slate-600 space-y-1">
                {data.billableExpenses.map((e) => (
                  <li key={e._id} className="flex justify-between"><span>{e.description}</span><span className="tabular-nums">{fmtMoney(e.amount, sym)}</span></li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <PaymentModal invoice={invoice} isOpen={modal === "payment"} onClose={() => setModal(null)} />
      <RecurringModal invoice={invoice} isOpen={modal === "recurring"} onClose={() => setModal(null)} />
      <SendDocumentModal
        isOpen={modal === "send"}
        onClose={() => setModal(null)}
        kind="invoice"
        document={invoice}
        sending={send.isPending}
        onSend={(payload) => send.mutateAsync({ id, data: payload })}
        onCopyLink={async () => (await accountsApi.invoiceLink(id)).link}
      />
      <ConfirmModal
        isOpen={modal === "void"}
        onClose={() => setModal(null)}
        title="Void this invoice?"
        message="A void invoice is kept for your records but no longer counts as money owed. This cannot be undone."
        confirmLabel="Void invoice"
        danger
        reasonLabel="Reason (optional)"
        busy={voidInvoice.isPending}
        onConfirm={(reason) => voidInvoice.mutateAsync({ id, reason }).then(() => setModal(null)).catch(() => {})}
      />
      <ConfirmModal
        isOpen={modal === "delete"}
        onClose={() => setModal(null)}
        title="Delete this draft?"
        message="The draft will be removed permanently."
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(id).then(() => navigate("/accounts/invoices")).catch(() => {})}
      />
      <ConfirmModal
        isOpen={!!paymentToRemove}
        onClose={() => setPaymentToRemove(null)}
        title="Delete this payment?"
        message={paymentToRemove ? `${fmtMoney(paymentToRemove.amount, sym)} received on ${fmtDate(paymentToRemove.date)} will be removed and the balance restored.` : ""}
        confirmLabel="Delete payment"
        danger
        busy={removePayment.isPending}
        onConfirm={() => removePayment.mutateAsync({ id, paymentId: paymentToRemove._id }).then(() => setPaymentToRemove(null)).catch(() => {})}
      />
    </div>
  );
};

const MenuItem = ({ children, onClick, danger }) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-2 hover:bg-slate-50 ${danger ? "text-red-600" : "text-slate-700"}`}>
    {children}
  </button>
);

export default InvoiceDetail;
