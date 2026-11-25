import React, { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FiChevronDown, FiChevronUp, FiDownload, FiPaperclip, FiPlus, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { ConfirmModal, Drawer, Field, btnGhost, btnPrimary, btnSmall, inputCls, selectCls } from "../../accounts/components/ui";
import { useDeleteModuleFile, useSaveSyllabus, useUploadModuleFile } from "../hooks/useAcademy";
import { academyApi } from "../api/academyApi";
import { STUDY_FILE_TYPES, durationText, errorMessage, fmtSize } from "../utils";

let nextKey = 0;
const toForm = (m = {}) => ({
  key: m._id || `new-${(nextKey += 1)}`,
  _id: m._id,
  title: m.title || "",
  description: m.description || "",
  durationValue: m.durationValue || "",
  durationUnit: m.durationUnit || "classes",
  topics: (m.topics || []).join("\n"),
  links: (m.links || []).map((l) => ({ label: l.label || "", url: l.url })),
});

const toPayload = (modules) =>
  modules
    .filter((m) => m.title.trim())
    .map((m) => ({
      _id: m._id,
      title: m.title.trim(),
      description: m.description,
      durationValue: Number(m.durationValue) || 0,
      durationUnit: m.durationUnit,
      topics: m.topics.split("\n"),
      links: m.links.filter((l) => l.url.trim()),
    }));

const hasContent = (m) => Boolean(m._id || m.topics.trim() || m.description.trim() || m.links.some((l) => l.url.trim()));

const iconBtn = "w-8 h-8 shrink-0 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 inline-flex items-center justify-center";

/** Study files of one saved module: upload, open, remove. */
const ModuleFiles = ({ courseId, moduleId, files, canEdit }) => {
  const input = useRef(null);
  const upload = useUploadModuleFile();
  const remove = useDeleteModuleFile();
  const [confirm, setConfirm] = useState(null);

  const open = (file) =>
    academyApi
      .openModuleFile(courseId, moduleId, file._id, { fileName: file.name })
      .catch((error) => toast.error(errorMessage(error, "Could not open the file")));

  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 mb-1.5">Study files</p>
      {files.length > 0 && (
        <ul className="space-y-1.5 mb-2">
          {files.map((f) => (
            <li key={f._id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-1.5">
              <FiPaperclip className="shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{f.name}</span>
              <span className="text-[11px] text-slate-400">{fmtSize(f.size)}</span>
              <button type="button" className={iconBtn} onClick={() => open(f)} aria-label={`Open ${f.name}`}>
                <FiDownload />
              </button>
              {canEdit && (
                <button type="button" className={`${iconBtn} hover:!text-red-600`} onClick={() => setConfirm(f)} aria-label={`Remove ${f.name}`}>
                  <FiTrash2 />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!moduleId ? (
        <p className="text-xs text-slate-400">Save the syllabus first, then you can attach files to this module.</p>
      ) : canEdit ? (
        <>
          <button type="button" className={btnSmall} onClick={() => input.current?.click()} disabled={upload.isPending}>
            <FiUpload /> {upload.isPending ? "Uploading…" : "Upload file"}
          </button>
          <span className="ml-2 text-[11px] text-slate-400">PDF, Office, images or ZIP, up to 20 MB</span>
          <input
            ref={input}
            type="file"
            className="hidden"
            accept={STUDY_FILE_TYPES}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) upload.mutate({ courseId, moduleId, file });
            }}
          />
        </>
      ) : (
        files.length === 0 && <p className="text-xs text-slate-400">No files.</p>
      )}
      <ConfirmModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        danger
        title="Remove file?"
        message={`Students will no longer be able to download "${confirm?.name}".`}
        confirmLabel="Remove"
        busy={remove.isPending}
        onConfirm={() => remove.mutate({ courseId, moduleId, fileId: confirm._id }, { onSuccess: () => setConfirm(null) })}
      />
    </div>
  );
};

const SyllabusEditor = ({ course, canEdit, onClose }) => {
  const [modules, setModules] = useState(() => (course.syllabus || []).map(toForm));
  const [savedState, setSavedState] = useState(() => JSON.stringify(toPayload((course.syllabus || []).map(toForm))));
  const [openKeys, setOpenKeys] = useState(() => new Set(modules.length === 1 ? [modules[0].key] : []));
  const [confirm, setConfirm] = useState(null); // {type: "discard"} | {type: "module", module}
  const save = useSaveSyllabus();

  const untitled = modules.some((m) => !m.title.trim() && hasContent(m));
  const dirty = untitled || JSON.stringify(toPayload(modules)) !== savedState;

  const update = (key, patch) => setModules((list) => list.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  const toggle = (key) =>
    setOpenKeys((keys) => {
      const next = new Set(keys);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const move = (index, by) =>
    setModules((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });
  const addModule = () => {
    const m = toForm();
    setModules((list) => [...list, m]);
    setOpenKeys((keys) => new Set(keys).add(m.key));
  };
  const drop = (key) => setModules((list) => list.filter((m) => m.key !== key));

  const submit = () =>
    save.mutate(
      { id: course._id, syllabus: toPayload(modules) },
      {
        onSuccess: (data) => {
          // reload from the server so new modules get their IDs (needed for files)
          const fresh = (data.course.syllabus || []).map(toForm);
          const openAt = modules.filter((m) => m.title.trim()).map((m) => openKeys.has(m.key));
          setModules(fresh);
          setSavedState(JSON.stringify(toPayload(fresh)));
          setOpenKeys(new Set(fresh.filter((_, i) => openAt[i]).map((m) => m.key)));
        },
      }
    );

  const requestClose = () => (dirty && canEdit ? setConfirm({ type: "discard" }) : onClose());

  return (
    <>
      <Drawer
        isOpen
        onClose={requestClose}
        title="Syllabus"
        subtitle={course.name}
        width="max-w-2xl"
        footer={
          <>
            {canEdit && (
              <span className="mr-auto text-xs text-slate-400">{untitled ? "Every module needs a title" : dirty ? "Unsaved changes" : "All changes saved"}</span>
            )}
            <button className={btnGhost} onClick={requestClose}>
              Close
            </button>
            {canEdit && (
              <button className={btnPrimary} onClick={submit} disabled={!dirty || untitled || save.isPending}>
                {save.isPending ? "Saving…" : "Save syllabus"}
              </button>
            )}
          </>
        }
      >
        <div className="space-y-3">
          {modules.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">
              No modules yet.{canEdit ? " Add the first one, for example “Meta Ads”." : ""}
            </p>
          )}
          {modules.map((m, index) => {
            const isOpen = openKeys.has(m.key);
            const files = course.syllabus?.find((s) => s._id === m._id)?.files || [];
            const topicCount = m.topics.split("\n").filter((t) => t.trim()).length;
            return (
              <section key={m.key} className="rounded-2xl border border-slate-200">
                <header className="flex items-center gap-2 p-3">
                  <span className="w-7 h-7 shrink-0 rounded-lg bg-[#ECF3FF] text-[#3F8CFF] text-xs font-bold inline-flex items-center justify-center">
                    {index + 1}
                  </span>
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => toggle(m.key)} aria-expanded={isOpen}>
                    <span className="block text-sm font-bold text-slate-800 truncate">{m.title || "New module"}</span>
                    <span className="block text-[11px] text-slate-400">
                      {[`${topicCount} topic${topicCount === 1 ? "" : "s"}`, durationText(m), files.length ? `${files.length} file${files.length === 1 ? "" : "s"}` : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </button>
                  {canEdit && (
                    <>
                      <button type="button" className={iconBtn} disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                        <FiChevronUp />
                      </button>
                      <button type="button" className={iconBtn} disabled={index === modules.length - 1} onClick={() => move(index, 1)} aria-label="Move down">
                        <FiChevronDown />
                      </button>
                      <button
                        type="button"
                        className={`${iconBtn} hover:!text-red-600`}
                        onClick={() => (m._id ? setConfirm({ type: "module", module: m }) : drop(m.key))}
                        aria-label="Remove module"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                  <button type="button" className={btnSmall} onClick={() => toggle(m.key)}>
                    {isOpen ? "Hide" : canEdit ? "Edit" : "View"}
                  </button>
                </header>

                {isOpen && (
                  <div className="border-t border-slate-100 p-4 space-y-3">
                    <fieldset disabled={!canEdit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_6rem_8.5rem] gap-3">
                        <Field label="Module title" required>
                          <input className={inputCls} value={m.title} onChange={(e) => update(m.key, { title: e.target.value })} placeholder="e.g. Meta Ads" />
                        </Field>
                        <Field label="Duration">
                          <input type="number" min={0} className={inputCls} value={m.durationValue} onChange={(e) => update(m.key, { durationValue: e.target.value })} />
                        </Field>
                        <Field label="Unit">
                          <select className={selectCls} value={m.durationUnit} onChange={(e) => update(m.key, { durationUnit: e.target.value })}>
                            <option value="classes">Classes</option>
                            <option value="hours">Hours</option>
                          </select>
                        </Field>
                      </div>
                      <Field label="Description">
                        <textarea className={inputCls} rows={2} value={m.description} onChange={(e) => update(m.key, { description: e.target.value })} placeholder="What this module covers" />
                      </Field>
                      <Field label="Topics" hint="One topic per line. Each can be ticked as completed for a batch.">
                        <textarea className={inputCls} rows={4} value={m.topics} onChange={(e) => update(m.key, { topics: e.target.value })} placeholder={"Campaign structure\nAudiences"} />
                      </Field>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1.5">Study links</p>
                        <div className="space-y-2">
                          {m.links.map((link, i) => {
                            const setLink = (patch) => update(m.key, { links: m.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
                            return (
                              <div key={i} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                                <input className={`${inputCls} sm:!w-44`} value={link.label} onChange={(e) => setLink({ label: e.target.value })} placeholder="Name (optional)" aria-label="Link name" />
                                <input className={inputCls} value={link.url} onChange={(e) => setLink({ url: e.target.value })} placeholder="https://youtube.com/…" aria-label="Link address" inputMode="url" />
                                {canEdit && (
                                  <button type="button" className={iconBtn} onClick={() => update(m.key, { links: m.links.filter((_, j) => j !== i) })} aria-label="Remove link">
                                    <FiX />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {canEdit && (
                          <button type="button" className={`${btnSmall} mt-2`} onClick={() => update(m.key, { links: [...m.links, { label: "", url: "" }] })}>
                            <FiPlus /> Add link
                          </button>
                        )}
                        {!canEdit && m.links.length === 0 && <p className="text-xs text-slate-400">No links.</p>}
                      </div>
                    </fieldset>
                    <ModuleFiles courseId={course._id} moduleId={m._id} files={files} canEdit={canEdit} />
                  </div>
                )}
              </section>
            );
          })}
          {canEdit && (
            <button type="button" className={`${btnGhost} w-full !border-dashed`} onClick={addModule}>
              <FiPlus /> Add module
            </button>
          )}
        </div>
      </Drawer>

      <ConfirmModal
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        danger
        title={confirm?.type === "discard" ? "Discard changes?" : "Remove module?"}
        message={
          confirm?.type === "discard"
            ? "Your unsaved syllabus changes will be lost."
            : `"${confirm?.module?.title}" is removed when you save. Its files and completed ticks go with it.`
        }
        confirmLabel={confirm?.type === "discard" ? "Discard" : "Remove"}
        onConfirm={() => {
          if (confirm.type === "discard") onClose();
          else drop(confirm.module.key);
          setConfirm(null);
        }}
      />
    </>
  );
};

/**
 * Edit a course's syllabus. Keyed by course, so unsaved edits survive the
 * course list refreshing underneath (after a file upload, for example).
 */
const SyllabusDrawer = ({ course, canEdit, onClose }) =>
  course ? <SyllabusEditor key={course._id} course={course} canEdit={canEdit} onClose={onClose} /> : null;

export default SyllabusDrawer;
