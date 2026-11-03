import React from "react";
import { FiX, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";
import { useGetFacebookLeadForms, useImportFacebookLeadForm } from "../../../../api/hooks";

export const FacebookFormImportModal = ({ projectId, onClose, onImported }) => {
  const { data: forms, isLoading, error } = useGetFacebookLeadForms(projectId);
  const importForm = useImportFacebookLeadForm();

  const handleImport = async (form) => {
    try {
      const result = await importForm.mutateAsync({
        name: form.name,
        description: `Imported from Facebook form "${form.name}" (${form.pageName})`,
        questions: form.questions,
      });
      toast.success(`Imported "${form.name}"`);
      onImported(result?.data?._id);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to import form");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 p-5 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Import Facebook Lead Form</h3>
            <p className="text-[11px] text-slate-500">
              Forms from the pages behind this project's linked ad account. Importing creates a CRM form with the same questions.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <FiX size={16} />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2">
          {isLoading && <p className="text-xs text-slate-500 py-6 text-center">Loading Facebook forms...</p>}
          {error && (
            <p className="text-xs text-red-500 py-6 text-center">
              {error?.response?.data?.message || "Failed to load Facebook forms"}
            </p>
          )}
          {forms && forms.length === 0 && (
            <p className="text-xs text-slate-500 py-6 text-center">No lead forms found for this ad account.</p>
          )}
          {(forms || []).map((form) => (
            <div key={form.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-xl">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-slate-900 truncate">{form.name}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {form.pageName} · {form.questions.length} questions · {form.status}
                  {form.leadsCount !== null ? ` · ${form.leadsCount} leads` : ""}
                </div>
              </div>
              <button
                onClick={() => handleImport(form)}
                disabled={importForm.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                <FiDownload size={12} /> Import
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
