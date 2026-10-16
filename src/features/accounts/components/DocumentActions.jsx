import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiDownload, FiLayout, FiPrinter } from "react-icons/fi";
import { errorMessage } from "../utils/format";
import { downloadPdf } from "../utils/pdf";
import { printElement } from "../utils/print";
import { selectCls, btnGhost } from "./ui";
import { templatesFor } from "../utils/templates";

/** Download-as-PDF and print buttons for whatever document `getElement` returns. */
export const PdfButtons = ({ getElement, filename, title, compact = false }) => {
  const [busy, setBusy] = useState(false);
  const onPdf = async () => {
    setBusy(true);
    try {
      await downloadPdf(getElement(), filename);
    } catch (error) {
      toast.error(errorMessage(error, "Could not create the PDF. Try Print instead."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button className={btnGhost} onClick={onPdf} disabled={busy} title="Download as PDF">
        <FiDownload /> {busy ? "Preparing…" : compact ? "PDF" : "Download PDF"}
      </button>
      <button className={btnGhost} onClick={() => printElement(getElement(), title)} title="Print">
        <FiPrinter /> {compact ? "" : "Print"}
      </button>
    </>
  );
};

/** Lets the person choose which template a single document prints with. */
export const TemplatePicker = ({ type, value, defaultId, customTemplates, onChange, disabled }) => {
  const options = templatesFor(type, customTemplates);
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
      <FiLayout className="w-4 h-4" />
      <select
        className={`${selectCls} !w-auto !py-2 !text-xs`}
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Document template"
      >
        <option value="">Default ({options.find((t) => t.id === defaultId)?.name || "Classic"})</option>
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
};
