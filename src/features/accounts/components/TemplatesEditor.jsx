import React, { useMemo, useState } from "react";
import { FiCheck, FiCopy, FiEdit2, FiTrash2 } from "react-icons/fi";
import DocumentView from "./DocumentView";
import ImageUpload from "./ImageUpload";
import { Card, Field, SegmentedTabs, btnGhost, btnSmall, inputCls, selectCls } from "./ui";
import { sampleInvoice, sampleProposal } from "../utils/sampleDocs";
import { ACCENT_SWATCHES, FONTS, LAYOUTS, PRESETS, SHOW_DEFAULTS, SHOW_OPTIONS, customize, resolveTemplate } from "../utils/templates";

// Shown in the preview until the company has a logo, so the position controls have something to move
const PLACEHOLDER_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="56"><rect width="180" height="56" rx="10" fill="#e2e8f0"/><text x="90" y="34" font-family="Arial" font-size="15" font-weight="700" text-anchor="middle" fill="#64748b">YOUR LOGO</text></svg>'
  );

// A labelled group of buttons. Not a <label>, so clicking the text cannot trigger the first button.
const Group = ({ label, children, className = "" }) => (
  <div className={className}>
    <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>
    {children}
  </div>
);

const TABLE_STYLES = [
  { value: "lines", label: "Lines" },
  { value: "striped", label: "Striped rows" },
  { value: "boxed", label: "Boxed grid" },
];

/**
 * Pick, copy and edit document templates. Everything here edits the settings
 * state held by the Settings page; the page's Save button stores it.
 */
const TemplatesEditor = ({ templates, defaults, business, bankAccounts, onTemplatesChange, onDefaultsChange }) => {
  const [editingId, setEditingId] = useState(null);
  const [previewType, setPreviewType] = useState("invoice");
  const [previewId, setPreviewId] = useState(defaults?.invoice || "classic");

  const all = useMemo(() => [...PRESETS, ...templates], [templates]);
  const editing = templates.find((t) => t.id === editingId) || null;
  const shown = editing || resolveTemplate(previewId, templates);

  const previewBusiness = useMemo(() => ({ ...business, logoUrl: business?.logoUrl || PLACEHOLDER_LOGO }), [business]);

  const doc = useMemo(
    () => (previewType === "invoice" ? sampleInvoice(bankAccounts?.find((b) => b.isDefault) || bankAccounts?.[0]) : sampleProposal()),
    [previewType, bankAccounts]
  );

  const update = (patch) => onTemplatesChange(templates.map((t) => (t.id === editingId ? { ...t, ...patch } : t)));
  const updateShow = (key, value) => update({ show: { ...SHOW_DEFAULTS, ...editing.show, [key]: value } });

  const copyOf = (template) => {
    const copy = customize(template);
    onTemplatesChange([...templates, copy]);
    setEditingId(copy.id);
    setPreviewId(copy.id);
  };

  const remove = (template) => {
    onTemplatesChange(templates.filter((t) => t.id !== template.id));
    ["invoice", "proposal"].forEach((type) => {
      if (defaults?.[type] === template.id) onDefaultsChange({ ...defaults, [type]: "classic" });
    });
    if (editingId === template.id) setEditingId(null);
    if (previewId === template.id) setPreviewId("classic");
  };

  const isDefaultFor = (template, type) => (defaults?.[type] || "classic") === template.id;
  const appliesTo = (template, type) => template.forType === "both" || template.forType === type || !template.forType;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-start">
      <div className="xl:col-span-2 space-y-4">
        <Card title="Templates" subtitle="Choose how invoices and proposals look. Copy one to change its colours and what it shows.">
          <ul className="space-y-2">
            {all.map((t) => {
              const builtIn = PRESETS.some((p) => p.id === t.id);
              const active = (editing?.id || previewId) === t.id;
              return (
                <li key={t.id}>
                  <div
                    onClick={() => { setPreviewId(t.id); if (!builtIn) setEditingId(t.id); else setEditingId(null); }}
                    className={`border rounded-xl p-3 cursor-pointer transition-colors ${active ? "border-[#3F8CFF] bg-[#F5F9FF]" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg shrink-0 border border-black/5" style={{ background: t.accent }} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-800">{t.name}</p>
                          {builtIn ? <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Built-in</span> : <span className="text-[10px] font-semibold text-[#3F8CFF] uppercase tracking-wide">Custom</span>}
                        </div>
                        <p className="text-xs text-slate-500">{t.description || `${LAYOUTS.find((l) => l.value === t.layout)?.label} layout`}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                          {["invoice", "proposal"].map((type) =>
                            appliesTo(t, type) ? (
                              <button
                                key={type}
                                onClick={() => onDefaultsChange({ ...defaults, [type]: t.id })}
                                className={`inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold border ${isDefaultFor(t, type) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                              >
                                {isDefaultFor(t, type) && <FiCheck className="w-3 h-3" />}
                                {isDefaultFor(t, type) ? `Default for ${type}s` : `Use for ${type}s`}
                              </button>
                            ) : null
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                        <button className={btnSmall} onClick={() => copyOf(t)} title="Make an editable copy"><FiCopy /> Copy</button>
                        {!builtIn && <button className={btnSmall} onClick={() => setEditingId(t.id)}><FiEdit2 /> Edit</button>}
                        {!builtIn && <button className={`${btnSmall} !text-red-600`} onClick={() => remove(t)} aria-label={`Delete ${t.name}`}><FiTrash2 /></button>}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-slate-400 mt-3">Remember to press Save settings at the top to keep your changes.</p>
        </Card>

        {editing && (
          <Card
            title={`Customize: ${editing.name}`}
            actions={<button className={btnGhost + " !h-8 !px-3 !text-xs"} onClick={() => setEditingId(null)}>Done</button>}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Template name"><input className={inputCls} value={editing.name} onChange={(e) => update({ name: e.target.value })} maxLength={60} /></Field>
                <Field label="Available for">
                  <select className={selectCls} value={editing.forType || "both"} onChange={(e) => update({ forType: e.target.value })}>
                    <option value="both">Invoices and proposals</option>
                    <option value="invoice">Invoices only</option>
                    <option value="proposal">Proposals only</option>
                  </select>
                </Field>
              </div>

              <Group label="Layout">
                <SegmentedTabs tabs={LAYOUTS} value={editing.layout} onChange={(layout) => update({ layout })} />
              </Group>

              <Group label="Brand colour">
                <div className="flex items-center gap-2 flex-wrap">
                  {ACCENT_SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ accent: c })}
                      aria-label={`Use colour ${c}`}
                      className={`w-7 h-7 rounded-full border-2 ${editing.accent.toLowerCase() === c ? "border-slate-800" : "border-white shadow ring-1 ring-slate-200"}`}
                      style={{ background: c }}
                    />
                  ))}
                  <input type="color" value={editing.accent} onChange={(e) => update({ accent: e.target.value })} className="w-9 h-8 p-0 border border-slate-200 rounded-lg bg-white cursor-pointer" aria-label="Custom colour" />
                  <span className="text-xs text-slate-500 tabular-nums">{editing.accent}</span>
                </div>
              </Group>

              <div className="rounded-xl border border-slate-200 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">Logo</p>
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={editing.showLogo !== false} onChange={(e) => update({ showLogo: e.target.checked })} />
                    Show logo
                  </label>
                </div>
                {editing.showLogo !== false && (
                  <>
                    <ImageUpload
                      value={editing.logoUrl}
                      onChange={(logoUrl) => update({ logoUrl })}
                      hint={editing.logoUrl ? "This logo is used only on this template." : business?.logoUrl ? "Using your company logo. Upload one to use a different logo on this template." : "No company logo yet. Upload one here or in Business profile."}
                    />
                    <Group label="Position in the header">
                      <SegmentedTabs
                        tabs={[{ value: "left", label: "Left" }, { value: "center", label: "Centre" }, { value: "right", label: "Right" }]}
                        value={editing.logoPosition}
                        onChange={(logoPosition) => update({ logoPosition })}
                      />
                    </Group>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-600">Logo height</span>
                        <span className="text-xs text-slate-500 tabular-nums">{editing.logoHeight || { small: 36, medium: 56, large: 88 }[editing.logoSize] || 56}px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="140"
                        step="2"
                        className="w-full accent-[#3F8CFF]"
                        value={editing.logoHeight || { small: 36, medium: 56, large: 88 }[editing.logoSize] || 56}
                        onChange={(e) => update({ logoHeight: Number(e.target.value) })}
                        aria-label="Logo height"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={Boolean(editing.logoWatermark)} onChange={(e) => update({ logoWatermark: e.target.checked })} />
                      Also show a faint watermark behind the first page
                    </label>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Font">
                  <select className={selectCls} value={editing.font} onChange={(e) => update({ font: e.target.value })}>
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </Field>
                <Field label="Spacing">
                  <select className={selectCls} value={editing.density} onChange={(e) => update({ density: e.target.value })}>
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact (fits more per page)</option>
                  </select>
                </Field>
                <Group label="Item table" className="col-span-2">
                  <SegmentedTabs tabs={TABLE_STYLES} value={editing.tableStyle} onChange={(tableStyle) => update({ tableStyle })} />
                </Group>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Field label="Document heading" hint="Replaces “Tax Invoice” / “Proposal”. Leave blank for the default.">
                  <input className={inputCls} value={editing.titleLabel} onChange={(e) => update({ titleLabel: e.target.value })} maxLength={40} placeholder="e.g. Invoice, Quotation, Statement of work" />
                </Field>
                <Field label="Line under the header (optional)">
                  <input className={inputCls} value={editing.headerNote} onChange={(e) => update({ headerNote: e.target.value })} maxLength={200} placeholder="e.g. CIN U12345KL2020PTC000000" />
                </Field>
                <Field label="Footer text" hint="Leave blank for the default thank-you line">
                  <input className={inputCls} value={editing.footerText} onChange={(e) => update({ footerText: e.target.value })} maxLength={300} />
                </Field>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Show on the document</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {SHOW_OPTIONS.map((o) => (
                    <label key={o.key} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={(editing.show || SHOW_DEFAULTS)[o.key] !== false} onChange={(e) => updateShow(o.key, e.target.checked)} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="xl:col-span-3 xl:sticky xl:top-0">
        <div className="flex items-center justify-between gap-3 mb-2">
          <SegmentedTabs tabs={[{ value: "invoice", label: "Invoice preview" }, { value: "proposal", label: "Proposal preview" }]} value={previewType} onChange={setPreviewType} />
          <span className="text-xs text-slate-400">Sample data</span>
        </div>
        <div className="bg-slate-100/70 rounded-2xl p-3 overflow-auto max-h-[78vh]">
          <div className="shadow-sm rounded-lg overflow-hidden bg-white" style={{ zoom: 0.72 }}>
            <DocumentView type={previewType} doc={doc} business={previewBusiness} template={shown} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesEditor;
