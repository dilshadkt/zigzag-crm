import React from "react";
import { toast } from "react-hot-toast";
import { FiCopy } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Modal from "../../../components/shared/modal";
import { btnGhost, btnPrimary } from "../../accounts/components/ui";
import { portalUrl, whatsappCredentialsLink } from "../utils";

/**
 * Shows a student's portal login once, right after it is created or reset.
 * The password is not stored in readable form, so this is the only chance to copy it.
 */
const CredentialsModal = ({ credentials, student, onClose }) => {
  if (!credentials) return null;
  const text = `Student portal: ${portalUrl()}\nLogin: ${credentials.login}\nPassword: ${credentials.password}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy. Select the text instead.");
    }
  };
  return (
    <Modal isOpen onClose={onClose} title="Student portal login">
      <div className="pt-4 space-y-4">
        <p className="text-sm text-slate-600">
          Share these details with <b>{student?.name || "the student"}</b>. The password is shown only now. You can create a new one later
          with <i>Reset password</i>.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm space-y-1 select-all break-all">
          <div>
            <span className="text-slate-400">Portal: </span>
            {portalUrl()}
          </div>
          <div>
            <span className="text-slate-400">Login: </span>
            {credentials.login}
          </div>
          <div>
            <span className="text-slate-400">Password: </span>
            <b>{credentials.password}</b>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button className={btnGhost} onClick={copy}>
            <FiCopy /> Copy
          </button>
          {student?.phone && (
            <a
              className={`${btnPrimary} !bg-[#25D366] hover:!bg-[#1ebe5b]`}
              href={whatsappCredentialsLink({ name: student.name, phone: student.phone, ...credentials })}
              target="_blank"
              rel="noreferrer"
            >
              <FaWhatsapp /> Share on WhatsApp
            </a>
          )}
          <button className={btnGhost} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CredentialsModal;
