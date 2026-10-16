import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import DocumentForm from "../components/DocumentForm";
import { ErrorState, Spinner } from "../components/ui";
import { useCreateProposal, useProposal, useUpdateProposal } from "../hooks/useAccounts";

const ProposalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useProposal(id);
  const create = useCreateProposal();
  const update = useUpdateProposal();

  if (id && isLoading) return <Spinner />;
  if (id && isError) return <ErrorState error={error} />;
  if (id && ["accepted", "converted"].includes(data?.proposal?.status)) {
    return <ErrorState error="An accepted proposal is locked. Open it and use “New version” to change it." />;
  }

  const onSubmit = async (payload) => {
    const res = id ? await update.mutateAsync({ id, data: payload }) : await create.mutateAsync(payload);
    navigate(`/accounts/proposals/${res.proposal._id}`);
  };

  return (
    <DocumentForm
      key={id || "new"}
      type="proposal"
      title={id ? `Edit ${data.proposal.number}` : "New proposal"}
      initial={id ? data.proposal : null}
      onSubmit={onSubmit}
      saving={create.isPending || update.isPending}
      onCancel={() => navigate(id ? `/accounts/proposals/${id}` : "/accounts/proposals")}
    />
  );
};

export default ProposalForm;
