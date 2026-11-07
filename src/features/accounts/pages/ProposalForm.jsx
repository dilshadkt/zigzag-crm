import React, { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DocumentForm from "../components/DocumentForm";
import { ErrorState, Spinner } from "../components/ui";
import { useCreateProposal, useProposal, useUpdateProposal } from "../hooks/useAccounts";
import { useGetLeadById } from "../../leads/api";
import { blankItem } from "../utils/format";

const ProposalForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = !id ? searchParams.get("leadId") : null;
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useProposal(id);
  const { data: leadData, isLoading: leadLoading } = useGetLeadById(leadId);
  const create = useCreateProposal();
  const update = useUpdateProposal();

  // A proposal started from a lead (e.g. right after marking it won) arrives prefilled
  const leadDefaults = useMemo(() => {
    const lead = leadData?.data?.lead;
    if (!leadId || !lead) return {};
    const contact = lead.contact || {};
    const item = blankItem(0);
    if (lead.dealValue) item.rate = lead.dealValue;
    return {
      title: contact.company || contact.name ? `Proposal for ${contact.company || contact.name}` : "",
      client: {
        name: contact.company || contact.name || "",
        contactName: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        gstin: "",
        address: { line1: contact.address || "", city: "", state: "", pincode: "" },
      },
      items: [item],
    };
  }, [leadId, leadData]);

  if (id && isLoading) return <Spinner />;
  if (id && isError) return <ErrorState error={error} />;
  if (leadId && leadLoading) return <Spinner />;
  if (id && ["accepted", "converted"].includes(data?.proposal?.status)) {
    return <ErrorState error="An accepted proposal is locked. Open it and use “New version” to change it." />;
  }

  const onSubmit = async (payload) => {
    const body = leadId ? { ...payload, lead: leadId } : payload;
    const res = id ? await update.mutateAsync({ id, data: payload }) : await create.mutateAsync(body);
    navigate(`/accounts/proposals/${res.proposal._id}`);
  };

  return (
    <DocumentForm
      key={id || leadId || "new"}
      type="proposal"
      title={id ? `Edit ${data.proposal.number}` : "New proposal"}
      initial={id ? data.proposal : null}
      defaults={leadDefaults}
      onSubmit={onSubmit}
      saving={create.isPending || update.isPending}
      onCancel={() => navigate(id ? `/accounts/proposals/${id}` : leadId ? `/leads/${leadId}` : "/accounts/proposals")}
    />
  );
};

export default ProposalForm;
