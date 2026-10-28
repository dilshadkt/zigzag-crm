import { createPortal } from "react-dom";
import { FiX, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { EXTRA_FIELDS, isNameField } from "../utils/leadImport";

const sampleFor = (rows, idx) => {
  if (idx === "" || idx === undefined) return "";
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const cell = rows[i][idx];
    const text = cell instanceof Date ? cell.toLocaleDateString() : String(cell ?? "").trim();
    if (text) return text;
  }
  return "";
};

const MappingRow = ({ field, headers, rows, value, onChange, disabled }) => {
  const sample = sampleFor(rows, value);
  const isMapped = value !== "" && value !== undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </p>
        <p className="text-[11px] text-slate-400 uppercase tracking-wider">
          {field.isExtra ? "optional" : field.type || "text"}
        </p>
      </div>
      <FiArrowRight className="hidden sm:block text-slate-300" size={16} />
      <div className="min-w-0">
        <select
          value={value === undefined ? "" : value}
          onChange={(e) => onChange(field.key, e.target.value === "" ? "" : Number(e.target.value))}
          disabled={disabled}
          className={`w-full h-10 px-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3f8cff]/20 focus:border-[#3f8cff] ${
            isMapped ? "border-[#3f8cff]/40 text-slate-800" : "border-slate-200 text-slate-500"
          }`}
        >
          <option value="">Don&apos;t import</option>
          {headers.map((header, index) => (
            <option key={`${header}-${index}`} value={index}>
              {header}
            </option>
          ))}
        </select>
        {isMapped && (
          <p className="text-[11px] text-slate-400 mt-1 truncate" title={sample}>
            {sample ? `e.g. ${sample}` : "no values in the first rows"}
          </p>
        )}
      </div>
    </div>
  );
};

const LeadImportMapModal = ({
  isOpen,
  onClose,
  onBack,
  projectName,
  fileName,
  headers,
  rows,
  fields,
  mapping,
  onMappingChange,
  validCount,
  skippedCount,
  onImport,
  isImporting,
  progress,
}) => {
  if (!isOpen) return null;

  const nameField = fields.find(isNameField);
  const nameMapped = nameField ? mapping[nameField.key] !== "" && mapping[nameField.key] !== undefined : false;
  const missingRequired = fields.filter(
    (field) => field.required && (mapping[field.key] === "" || mapping[field.key] === undefined)
  );
  const percent = progress?.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const canImport = nameMapped && validCount > 0 && !isImporting;

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-start justify-between gap-4 p-6 pb-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">Map Columns</h2>
            <p className="text-sm text-slate-500 truncate">
              Match the columns in <span className="font-semibold text-slate-700">{fileName}</span> to the
              lead fields of <span className="font-semibold text-slate-700">{projectName}</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isImporting}
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="px-6 overflow-y-auto grow">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
            <span>Lead field</span>
            <span>Excel column</span>
          </div>

          <div className="rounded-2xl border border-slate-200 px-4">
            {fields.map((field) => (
              <MappingRow
                key={field.key}
                field={field}
                headers={headers}
                rows={rows}
                value={mapping[field.key]}
                onChange={onMappingChange}
                disabled={isImporting}
              />
            ))}
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-5 mb-2">
            Additional (optional)
          </p>
          <div className="rounded-2xl border border-slate-200 px-4 mb-4">
            {EXTRA_FIELDS.map((field) => (
              <MappingRow
                key={field.key}
                field={field}
                headers={headers}
                rows={rows}
                value={mapping[field.key]}
                onChange={onMappingChange}
                disabled={isImporting}
              />
            ))}
          </div>

          <div className="space-y-2 pb-4">
            {!nameMapped && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
                <FiAlertTriangle className="mt-0.5 shrink-0" size={14} />
                <span>
                  Map a column to <strong>{nameField?.label || "Full Name"}</strong>. Every lead needs a name.
                </span>
              </div>
            )}
            {nameMapped && missingRequired.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <FiAlertTriangle className="mt-0.5 shrink-0" size={14} />
                <span>
                  Required but not mapped: {missingRequired.map((f) => f.label).join(", ")}. Leads will be
                  imported without these values.
                </span>
              </div>
            )}
            {nameMapped && skippedCount > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <FiAlertTriangle className="mt-0.5 shrink-0" size={14} />
                <span>
                  {skippedCount} row{skippedCount === 1 ? "" : "s"} have no name and will be skipped.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-3 border-t border-slate-100 space-y-3">
          {isImporting && (
            <div>
              <div className="flex justify-between mb-2 text-xs font-semibold text-slate-500">
                <span>
                  Importing {progress?.done || 0} / {progress?.total || 0}
                </span>
                <span>{percent}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#3f8cff] transition-all" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              disabled={isImporting}
              className="flex-1 h-11 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={onImport}
              disabled={!canImport}
              className="flex-[2] h-11 rounded-full bg-[#3f8cff] text-white text-sm font-semibold disabled:bg-slate-200 disabled:text-slate-500"
            >
              {isImporting ? "Importing..." : `Import ${validCount} lead${validCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LeadImportMapModal;
