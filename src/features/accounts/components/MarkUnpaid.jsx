import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountsContext } from "../context";
import { useSetExpenseStatus } from "../hooks/useAccounts";
import { fmtMoney } from "../utils/format";
import { ConfirmModal } from "./ui";

/**
 * Turning a paid expense, purchase or asset back to unpaid. `ask(record)` takes
 * { id, description, total, linkedPaid } - `linkedPaid` is what Payments entries
 * cover. Render `modal` once on the page.
 */
export const useMarkUnpaid = () => {
  const navigate = useNavigate();
  const { symbol } = useAccountsContext();
  const setStatus = useSetExpenseStatus();
  const [record, setRecord] = useState(null);
  const close = () => setRecord(null);

  // Money recorded under Payments has to be taken back there first
  const covered = !!record && record.linkedPaid > 0 && record.linkedPaid >= record.total - 0.009;

  const modal = (
    <ConfirmModal
      isOpen={!!record}
      onClose={close}
      title={covered ? "Delete the payment first" : "Mark as unpaid?"}
      message={
        !record
          ? ""
          : covered
            ? `"${record.description}" was paid through Payments (${fmtMoney(record.linkedPaid, symbol)}). Delete that payment under Payments and it becomes unpaid again.`
            : `"${record.description}" (${fmtMoney(record.total, symbol)}) will show as unpaid and leave the Cash and Bank reports.`
      }
      confirmLabel={covered ? "Open Payments" : "Mark unpaid"}
      busy={setStatus.isPending}
      onConfirm={() => {
        if (covered) {
          close();
          navigate("/accounts/payments");
          return;
        }
        setStatus.mutateAsync({ id: record.id, data: { status: "approved" } }).then(close).catch(close);
      }}
    />
  );

  return { ask: setRecord, modal };
};
