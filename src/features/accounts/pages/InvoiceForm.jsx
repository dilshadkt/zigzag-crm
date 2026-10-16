import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DocumentForm from "../components/DocumentForm";
import { ErrorState, Spinner } from "../components/ui";
import { useCreateInvoice, useInvoice, useUpdateInvoice } from "../hooks/useAccounts";

const InvoiceForm = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useInvoice(id);
  const create = useCreateInvoice();
  const update = useUpdateInvoice();

  if (id && isLoading) return <Spinner />;
  if (id && isError) return <ErrorState error={error} />;
  if (id && data?.invoice?.status === "void") {
    return <ErrorState error="A void invoice cannot be edited." />;
  }

  const onSubmit = async (payload) => {
    if (id) {
      const res = await update.mutateAsync({ id, data: payload });
      navigate(`/accounts/invoices/${res.invoice._id}`);
    } else {
      const res = await create.mutateAsync(payload);
      navigate(`/accounts/invoices/${res.invoice._id}`);
    }
  };

  return (
    <DocumentForm
      key={id || "new"}
      type="invoice"
      title={id ? `Edit ${data.invoice.number}` : "New invoice"}
      initial={id ? data.invoice : null}
      defaults={params.get("client") ? { project: params.get("client") } : {}}
      onSubmit={onSubmit}
      saving={create.isPending || update.isPending}
      onCancel={() => navigate(id ? `/accounts/invoices/${id}` : "/accounts/invoices")}
    />
  );
};

export default InvoiceForm;
