import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiCopy } from "react-icons/fi";
import Modal from "../../../components/shared/modal";
import { errorMessage } from "../utils/format";
import { Field, btnGhost, btnPrimary, inputCls } from "./ui";

/**
 * Email an invoice or proposal. If email is not configured on the server the
 * user can still copy the private link and send it themselves.
 */
const SendDocumentModal = ({ isOpen, onClose, kind, document, onSend, onCopyLink, sending }) => {
  const [form, setForm] = useState({ to: "", cc: "", subject: "", message: "" });

  useEffect(() => {
    if (!isOpen || !document) return;
    setForm({
      to: document.client?.email || "",
      cc: "",
      subject: "",
      message: "",
    });
  }, [isOpen, document]);

  const split = (s) => s.split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    const to = split(form.to);
    if (!to.length) {
      toast.error("Add at least one recipient");
      return;
    }
    try {
      await onSend({ to, cc: split(form.cc), subject: form.subject || undefined, message: form.message || undefined });
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const copy = async () => {
    try {
      const link = await onCopyLink();
      await navigator.clipboard.writeText(link);
      toast.success("Link copied");
    } catch (error) {
      toast.error(errorMessage(error, "Could not copy the link"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Email ${kind}`} maxWidth="sm:max-w-xl">
      <form onSubmit={submit} className="pt-4 space-y-3">
        <Field label="To" hint="Separate several addresses with commas" required>
          <input className={inputCls} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="client@example.com" />
        </Field>
        <Field label="Cc">
          <input className={inputCls} value={form.cc} onChange={(e) => setForm({ ...form, cc: e.target.value })} />
        </Field>
        <Field label="Subject" hint="Leave blank to use the default">
          <input className={inputCls} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </Field>
        <Field label="Message" hint="Leave blank to use the default message">
          <textarea className={inputCls} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </Field>
        <p className="text-xs text-slate-500">
          The client gets a button that opens a private online copy{kind === "proposal" ? " where they can accept or decline" : " they can print or save as PDF"}.
        </p>
        <div className="flex items-center justify-between gap-2 pt-2">
          <button type="button" className={btnGhost} onClick={copy}>
            <FiCopy /> Copy link
          </button>
          <div className="flex gap-2">
            <button type="button" className={btnGhost} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={sending}>
              {sending ? "Sending…" : "Send email"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SendDocumentModal;
