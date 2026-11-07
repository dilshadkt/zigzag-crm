import { useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  useDeleteWhatsappTemplate,
  useGetWhatsappTemplates,
  useSaveWhatsappTemplate,
} from "../../leads/api";

const emptyDraft = { templateId: null, name: "", text: "" };

const WhatsappTemplates = () => {
  const { data, isLoading } = useGetWhatsappTemplates();
  const save = useSaveWhatsappTemplate();
  const remove = useDeleteWhatsappTemplate();
  const [draft, setDraft] = useState(null);

  const templates = data?.data || [];
  const failure = (error) => toast.error(error?.response?.data?.message || "Something went wrong");

  const submit = (event) => {
    event.preventDefault();
    save.mutate(draft, {
      onSuccess: () => {
        toast.success("Template saved");
        setDraft(null);
      },
      onError: failure,
    });
  };

  const confirmDelete = (template) => {
    if (!window.confirm(`Delete "${template.name}"?`)) return;
    remove.mutate(template._id, {
      onSuccess: () => toast.success("Template deleted"),
      onError: failure,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">WhatsApp templates</h3>
          <p className="mt-1 text-xs text-slate-500">
            Quick messages your sales team can send from My Calls. Use <code className="rounded bg-slate-100 px-1">{"{name}"}</code>{" "}
            for the lead&apos;s first name and <code className="rounded bg-slate-100 px-1">{"{agent}"}</code> for the sender&apos;s name.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft(emptyDraft)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          <FiPlus /> New template
        </button>
      </div>

      {draft && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Template name, e.g. Follow-up"
            maxLength={60}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#3f8cff]"
          />
          <textarea
            value={draft.text}
            onChange={(event) => setDraft({ ...draft, text: event.target.value })}
            placeholder="Hi {name}, this is {agent}…"
            maxLength={1000}
            required
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#3f8cff]"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{draft.text.length}/1000</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={save.isPending}
                className="rounded-xl bg-[#3f8cff] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
              >
                {save.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-slate-400">No templates yet.</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((template) => (
            <li key={template._id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{template.name}</p>
                <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">{template.text}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label={`Edit ${template.name}`}
                  onClick={() => setDraft({ templateId: template._id, name: template.name, text: template.text })}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${template.name}`}
                  onClick={() => confirmDelete(template)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WhatsappTemplates;
