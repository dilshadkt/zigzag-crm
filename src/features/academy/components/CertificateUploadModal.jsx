import React, { useEffect, useState } from "react";
import Modal from "../../../components/shared/modal";
import { Field, inputCls, btnGhost, btnPrimary } from "../../accounts/components/ui";
import { useIssueCertificate, useNextCertificateNumber } from "../hooks/useAcademy";
import { todayKey } from "../utils";

/** Upload (or replace) the certificate PDF for one enrollment. */
const CertificateUploadModal = ({ enrollment, studentName, onClose }) => {
  const isOpen = Boolean(enrollment);
  const existing = enrollment?.certificate;
  const { data: next } = useNextCertificateNumber(isOpen && !existing?.number);
  const issue = useIssueCertificate();
  const [file, setFile] = useState(null);
  const [number, setNumber] = useState("");
  const [issuedAt, setIssuedAt] = useState(todayKey());

  useEffect(() => {
    if (!isOpen) return;
    setFile(null);
    setNumber(existing?.number || "");
    setIssuedAt(todayKey());
  }, [isOpen, existing?.number]);

  useEffect(() => {
    if (isOpen && !existing?.number && next?.number) setNumber((n) => n || next.number);
  }, [isOpen, existing?.number, next?.number]);

  if (!isOpen) return null;
  const courseName = enrollment.course?.name || "";

  const submit = () =>
    issue.mutate({ id: enrollment._id, file, number: number.trim(), issuedAt }, { onSuccess: onClose });

  return (
    <Modal isOpen onClose={onClose} title={existing?.number ? "Replace certificate" : "Upload certificate"}>
      <div className="pt-4 space-y-4">
        <p className="text-sm text-slate-600">
          {studentName} · {courseName}
          {enrollment.status !== "completed" && (
            <span className="block text-xs text-amber-600 mt-1">The enrollment will be marked completed.</span>
          )}
        </p>
        <Field label="Certificate number" hint="Use the number printed on the certificate. Students and employers can check it on the verify page." required>
          <input className={inputCls} value={number} onChange={(e) => setNumber(e.target.value)} />
        </Field>
        <Field label="Issue date">
          <input type="date" className={inputCls} value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
        </Field>
        <Field label="Certificate PDF" hint="PDF only, up to 10 MB" required>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:h-9 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button className={btnGhost} onClick={onClose} disabled={issue.isPending}>
            Cancel
          </button>
          <button className={btnPrimary} disabled={!file || !number.trim() || issue.isPending} onClick={submit}>
            {issue.isPending ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateUploadModal;
