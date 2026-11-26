import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebsite } from "../context";
import { useCreateEntry, useEntries, useEntry, useUpdateEntry } from "../hooks/useWebsite";
import FieldRenderer, { Repeater } from "../components/FieldRenderer";
import { changedData, formValues, toData } from "../formValues";
import { errorMessage } from "../../accounts/utils/format";
import { Card, ConfirmModal, ErrorState, PageHeader, Spinner, btnGhost, btnPrimary } from "../../accounts/components/ui";

/** Neighbouring simple fields share a card; groups and lists get their own. */
const toBlocks = (fields) =>
  fields.reduce((blocks, field) => {
    if (field.type === "group" || field.type === "repeater") return [...blocks, { kind: field.type, title: field.label, field }];
    const title = field.section || "Content";
    const last = blocks[blocks.length - 1];
    if (last?.kind === "plain" && last.title === title) {
      last.fields.push(field);
      return blocks;
    }
    return [...blocks, { kind: "plain", title, fields: [field] }];
  }, []);

const EditorForm = ({ site, typeDef, entry, onReload }) => {
  const { permissions } = useWebsite();
  const navigate = useNavigate();
  const base = `/website/${site._id}/${typeDef.key}`;
  const [initial] = useState(() => formValues(typeDef.fields, entry?.data));
  const [values, setValues] = useState(initial);
  const [leaving, setLeaving] = useState(false);
  const create = useCreateEntry();
  const update = useUpdateEntry();
  // Only needed for the "pick or type" suggestions
  const { data: list } = useEntries({ siteId: site._id, type: typeDef.key, q: "", status: "", page: 1 });

  const changes = useMemo(() => changedData(initial, values), [initial, values]);
  const dirty = Object.keys(changes).length > 0;
  const saving = create.isPending || update.isPending;
  const readOnly = !permissions.manageContent;
  const failure = create.error || update.error;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const back = () => (dirty ? setLeaving(true) : navigate(base));

  const save = (e) => {
    e.preventDefault();
    if (readOnly || saving) return;
    const where = { siteId: site._id, type: typeDef.key };
    const done = { onSuccess: () => navigate(base) };
    if (!entry) create.mutate({ ...where, data: toData(values) }, done);
    else update.mutate({ ...where, id: entry._id, data: changes, updatedAt: entry.updatedAt }, done);
  };

  const render = (field) => (
    <FieldRenderer
      key={field.key}
      field={field}
      value={values[field.key]}
      onChange={(v) => set(field.key, v)}
      disabled={readOnly}
      siteId={site._id}
      suggestions={list?.suggestions}
    />
  );

  return (
    <form onSubmit={save} className="flex flex-col h-full">
      <header className="px-4 md:px-6 pt-4 border-b border-slate-100 shrink-0">
        <PageHeader
          title={`${entry ? (readOnly ? "View" : "Edit") : "Add"} ${typeDef.singular}`}
          subtitle={`${site.name} · ${typeDef.label}`}
          onBack={back}
          actions={
            !readOnly && (
              <>
                <button type="button" className={btnGhost} onClick={back}>
                  Cancel
                </button>
                <button type="submit" className={btnPrimary} disabled={saving || (entry && !dirty)}>
                  {saving ? "Saving…" : entry ? "Save changes" : `Add ${typeDef.singular}`}
                </button>
              </>
            )
          }
        />
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAFCFE]">
        <div className="max-w-4xl mx-auto space-y-4">
          {failure && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{errorMessage(failure)}</span>
              {entry && String(errorMessage(failure)).includes("Reload") && (
                <button type="button" className={btnGhost} onClick={onReload}>
                  Reload
                </button>
              )}
            </div>
          )}
          {toBlocks(typeDef.fields).map((block) => (
            <Card key={`${block.title}-${block.field?.key || block.fields[0].key}`} title={block.title}>
              {block.kind === "plain" && <div className="space-y-4">{block.fields.map(render)}</div>}
              {block.kind === "group" && (
                <div className="space-y-4">
                  {block.field.fields.map((sub) => (
                    <FieldRenderer
                      key={sub.key}
                      field={sub}
                      value={values[block.field.key][sub.key]}
                      onChange={(v) => set(block.field.key, { ...values[block.field.key], [sub.key]: v })}
                      disabled={readOnly}
                      siteId={site._id}
                    />
                  ))}
                </div>
              )}
              {block.kind === "repeater" && (
                <Repeater
                  field={block.field}
                  value={values[block.field.key]}
                  onChange={(v) => set(block.field.key, v)}
                  disabled={readOnly}
                  siteId={site._id}
                />
              )}
            </Card>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={leaving}
        onClose={() => setLeaving(false)}
        title="Leave without saving?"
        message="Your changes to this entry will be lost."
        confirmLabel="Discard changes"
        danger
        onConfirm={() => navigate(base)}
      />
    </form>
  );
};

const EntryEditor = ({ site, typeDef }) => {
  const { entryId } = useParams();
  const isNew = entryId === "new";
  const { permissions } = useWebsite();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useEntry({ siteId: site._id, type: typeDef.key, id: entryId }, !isNew);

  if (isNew) {
    if (!permissions.manageContent) {
      return <ErrorState error="You do not have permission to add content." onRetry={() => navigate(`/website/${site._id}/${typeDef.key}`)} />;
    }
    return <EditorForm site={site} typeDef={typeDef} />;
  }
  if (isLoading) return <Spinner />;
  if (isError || !data) {
    return (
      <div>
        <ErrorState error={error} onRetry={refetch} />
        <div className="flex justify-center">
          <button className={btnGhost} onClick={() => navigate(`/website/${site._id}/${typeDef.key}`)}>
            Back to {typeDef.label.toLowerCase()}
          </button>
        </div>
      </div>
    );
  }
  // A reload brings a newer version, which starts the form again
  return <EditorForm key={data.entry.updatedAt} site={site} typeDef={typeDef} entry={data.entry} onReload={() => refetch()} />;
};

export default EntryEditor;
