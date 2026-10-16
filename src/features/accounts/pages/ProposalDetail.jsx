import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiCheck, FiCopy, FiEdit2, FiFileText, FiMail, FiX } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import { accountsApi } from "../api/accountsApi";
import { useAccountsContext } from "../context";
import {
  useConvertProposal,
  useDeleteProposal,
  useDuplicateProposal,
  useProposal,
  useSendProposal,
  useSetProposalStatus,
  useSetProposalTemplate,
} from "../hooks/useAccounts";
import { PROPOSAL_STATUS, fmtDate, fmtMoney } from "../utils/format";
import { pdfName } from "../utils/pdf";
import { resolveTemplate } from "../utils/templates";
import { PdfButtons, TemplatePicker } from "../components/DocumentActions";
import DocumentView from "../components/DocumentView";
import SendDocumentModal from "../components/SendDocumentModal";
import { Card, ConfirmModal, ErrorState, Field, PageHeader, Spinner, StatusBadge, btnGhost, btnPrimary, btnSmall, selectCls } from "../components/ui";
import { useClientLookup } from "../hooks/useAccounts";

const ConvertModal = ({ proposal, isOpen, onClose, onDone }) => {
  const convert = useConvertProposal();
  const { data: clients } = useClientLookup(isOpen && !proposal?.project);
  const [milestoneId, setMilestoneId] = useState("");
  const [project, setProject] = useState("");
  const needsClient = !proposal?.project;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await convert.mutateAsync({ id: proposal._id, data: { milestoneId: milestoneId || undefined, project: project || undefined } });
      onDone(res.invoice._id);
    } catch {
      /* toast shown */
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create invoice from proposal">
      <form onSubmit={submit} className="pt-4 space-y-3">
        {proposal?.milestones?.length > 0 && (
          <Field label="What to invoice">
            <select className={selectCls} value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}>
              <option value="">Whole proposal ({fmtMoney(proposal.totals.payable, proposal.currencySymbol)})</option>
              {proposal.milestones.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} · {m.percent}% ({fmtMoney((proposal.totals.payable * m.percent) / 100, proposal.currencySymbol)})
                </option>
              ))}
            </select>
          </Field>
        )}
        {needsClient && (
          <Field label="Bill under client" hint="Optional. Leave empty to bill the prospect as a one-off client.">
            <select className={selectCls} value={project} onChange={(e) => setProject(e.target.value)}>
              <option value="">One-off client ({proposal?.client?.name})</option>
              {(clients?.clients || []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </Field>
        )}
        <p className="text-xs text-slate-500">A draft invoice is created with the same items and tax. Optional items are left out.</p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={convert.isPending}>{convert.isPending ? "Creating…" : "Create invoice"}</button>
        </div>
      </form>
    </Modal>
  );
};

const ProposalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { permissions, settings } = useAccountsContext();
  const { data, isLoading, isError, error, refetch } = useProposal(id);
  const docRef = useRef(null);
  const [modal, setModal] = useState(null);

  const send = useSendProposal();
  const setStatus = useSetProposalStatus();
  const duplicate = useDuplicateProposal();
  const setTemplate = useSetProposalTemplate();
  const remove = useDeleteProposal();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  const proposal = data.proposal;
  const status = proposal.isExpired ? "expired" : proposal.status;
  const locked = ["accepted", "converted"].includes(proposal.status);
  const canEdit = permissions.manageProposals && !locked;
  const defaultTemplateId = settings?.defaultTemplates?.proposal || "classic";
  const template = resolveTemplate(proposal.templateId || defaultTemplateId, settings?.documentTemplates);
  const canConvert = permissions.manageProposals && permissions.manageInvoices && ["draft", "sent", "viewed", "accepted", "converted"].includes(proposal.status) && (!proposal.convertedInvoice || proposal.milestones?.length > 0);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={proposal.title}
        badge={<StatusBadge status={status} map={PROPOSAL_STATUS} />}
        subtitle={`${proposal.number} · ${proposal.client?.name}`}
        onBack={() => navigate("/accounts/proposals")}
        actions={
          <>
            <PdfButtons getElement={() => docRef.current} filename={pdfName("Proposal", proposal.number)} title={`Proposal ${proposal.number}`} />
            {canEdit && <button className={btnGhost} onClick={() => navigate(`/accounts/proposals/${id}/edit`)}><FiEdit2 /> Edit</button>}
            {permissions.manageProposals && <button className={btnGhost} onClick={() => setModal("send")}><FiMail /> {proposal.sentAt ? "Resend" : "Send"}</button>}
            {canConvert && <button className={btnPrimary} onClick={() => setModal("convert")}><FiFileText /> Create invoice</button>}
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 bg-slate-100/70 rounded-2xl p-2 sm:p-4 overflow-x-auto">
          {permissions.manageProposals && (
            <div className="flex justify-end mb-2">
              <TemplatePicker
                type="proposal"
                value={proposal.templateId}
                defaultId={defaultTemplateId}
                customTemplates={settings?.documentTemplates}
                disabled={setTemplate.isPending}
                onChange={(templateId) => setTemplate.mutate({ id, templateId })}
              />
            </div>
          )}
          <div className="shadow-sm rounded-lg overflow-hidden">
            <DocumentView ref={docRef} type="proposal" doc={proposal} business={settings?.business} template={template} />
          </div>
        </div>

        <div className="space-y-4">
          <Card title="Status">
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>Created {fmtDate(proposal.createdAt)}{proposal.createdBy ? ` by ${proposal.createdBy.firstName}` : ""}</li>
              {proposal.sentAt && <li>Emailed {fmtDate(proposal.sentAt)}{proposal.sentTo?.length ? ` to ${proposal.sentTo.join(", ")}` : ""}</li>}
              {proposal.viewedAt && <li>Opened by client {fmtDate(proposal.viewedAt)}</li>}
              {proposal.respondedAt && (
                <li className={proposal.status === "declined" ? "text-red-600" : "text-emerald-600"}>
                  {proposal.status === "declined" ? "Declined" : "Accepted"} {fmtDate(proposal.respondedAt)} by {proposal.response?.by || "client"}
                  {proposal.response?.comment ? `: “${proposal.response.comment}”` : ""}
                </li>
              )}
              <li>Valid until {fmtDate(proposal.validUntil)}</li>
            </ul>
            {proposal.convertedInvoice && (
              <button className={`${btnSmall} mt-3`} onClick={() => navigate(`/accounts/invoices/${proposal.convertedInvoice._id}`)}>
                <FiFileText /> Invoice {proposal.convertedInvoice.number}
              </button>
            )}
          </Card>

          {permissions.manageProposals && (
            <Card title="Actions">
              <div className="flex flex-col gap-2">
                {["sent", "viewed"].includes(proposal.status) && (
                  <>
                    <button className={btnSmall} onClick={() => setStatus.mutate({ id, data: { status: "accepted" } })}><FiCheck /> Client accepted (offline)</button>
                    <button className={btnSmall} onClick={() => setStatus.mutate({ id, data: { status: "declined" } })}><FiX /> Client declined (offline)</button>
                  </>
                )}
                {proposal.status === "draft" && (
                  <button className={btnSmall} onClick={() => setStatus.mutate({ id, data: { status: "sent" } })}>Mark as sent</button>
                )}
                <button className={btnSmall} onClick={() => duplicate.mutateAsync(id).then((r) => navigate(`/accounts/proposals/${r.proposal._id}/edit`)).catch(() => {})}>
                  <FiCopy /> New version
                </button>
                {permissions.delete && !proposal.convertedInvoice && (
                  <button className={`${btnSmall} !text-red-600`} onClick={() => setModal("delete")}>Delete proposal</button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <SendDocumentModal
        isOpen={modal === "send"}
        onClose={() => setModal(null)}
        kind="proposal"
        document={proposal}
        sending={send.isPending}
        onSend={(payload) => send.mutateAsync({ id, data: payload })}
        onCopyLink={async () => (await accountsApi.proposalLink(id)).link}
      />
      <ConvertModal proposal={proposal} isOpen={modal === "convert"} onClose={() => setModal(null)} onDone={(invoiceId) => navigate(`/accounts/invoices/${invoiceId}`)} />
      <ConfirmModal
        isOpen={modal === "delete"}
        onClose={() => setModal(null)}
        title="Delete this proposal?"
        message="It will be removed permanently."
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutateAsync(id).then(() => navigate("/accounts/proposals")).catch(() => {})}
      />
    </div>
  );
};

export default ProposalDetail;
