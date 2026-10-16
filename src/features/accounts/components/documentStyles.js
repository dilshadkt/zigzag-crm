/**
 * Self-contained CSS for printable documents (invoice, proposal, payslip).
 * It uses plain class names rather than Tailwind so the same markup prints
 * identically from an iframe, which has no access to the app's stylesheet.
 */
export const DOC_CSS = `
.acc-doc, .acc-doc * { box-sizing: border-box; }
.acc-doc {
  --ink: #0f172a; --muted: #64748b; --line: #e2e8f0; --soft: #f8fafc; --accent: #3F8CFF; --accent-soft: #eef4ff;
  --pad-x: 44px; --pad-y: 40px;
  font-family: var(--font, "Nunito Sans", "Segoe UI", Arial, sans-serif);
  color: var(--ink); background: #fff; width: 100%; max-width: 794px; margin: 0 auto;
  padding: var(--pad-y) var(--pad-x); font-size: 12.5px; line-height: 1.5;
  position: relative; z-index: 0;
}
.acc-doc h1, .acc-doc h2, .acc-doc h3, .acc-doc p { margin: 0; }
.acc-doc .row { display: flex; justify-content: space-between; gap: 24px; }
.acc-doc .head { padding-bottom: 20px; border-bottom: 2px solid var(--ink); }
.acc-doc .brand { display: flex; gap: 14px; align-items: flex-start; }
.acc-doc .logo { max-height: 56px; max-width: 150px; object-fit: contain; }
.acc-doc .biz-name { font-size: 17px; font-weight: 800; }
.acc-doc .muted { color: var(--muted); }
.acc-doc .small { font-size: 11px; }
.acc-doc .doc-title { text-align: right; }
.acc-doc .doc-title h1 { font-size: 24px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.acc-doc .doc-no { font-size: 13px; font-weight: 700; margin-top: 2px; }
.acc-doc .stamp {
  display: inline-block; margin-top: 8px; padding: 2px 12px; border: 2px solid; border-radius: 6px;
  font-weight: 800; letter-spacing: .08em; text-transform: uppercase; font-size: 12px; transform: rotate(-4deg);
}
.acc-doc .stamp.paid { color: #059669; border-color: #059669; }
.acc-doc .stamp.void, .acc-doc .stamp.declined, .acc-doc .stamp.expired { color: #94a3b8; border-color: #94a3b8; }
.acc-doc .stamp.overdue { color: #dc2626; border-color: #dc2626; }
.acc-doc .stamp.accepted { color: #059669; border-color: #059669; }
.acc-doc .meta { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin-top: 20px; }
.acc-doc .label { font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
.acc-doc .party-name { font-size: 14px; font-weight: 800; }
.acc-doc dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 3px 14px; }
.acc-doc dt { color: var(--muted); }
.acc-doc dd { margin: 0; font-weight: 600; text-align: right; }
.acc-doc .doc-heading { margin-top: 22px; font-size: 17px; font-weight: 800; }
.acc-doc .intro { margin-top: 8px; white-space: pre-wrap; }
.acc-doc table { width: 100%; border-collapse: collapse; }
.acc-doc table.items { margin-top: 18px; }
.acc-doc table.items th {
  background: var(--soft); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  text-align: left; padding: 8px 8px; font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted);
}
.acc-doc table.items td { padding: 9px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
.acc-doc .r { text-align: right; font-variant-numeric: tabular-nums; }
.acc-doc .item-name { font-weight: 700; }
.acc-doc .opt { display: inline-block; margin-left: 6px; padding: 0 6px; border-radius: 99px; background: var(--accent-soft); color: var(--accent); font-size: 10px; font-weight: 700; }
.acc-doc .totals { margin-top: 14px; display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
.acc-doc .totals .words { flex: 1; }
.acc-doc .totals .box { width: 300px; }
.acc-doc .totals td { padding: 4px 0; }
.acc-doc .totals tr.grand td { border-top: 2px solid var(--ink); padding-top: 8px; font-size: 14px; font-weight: 800; }
.acc-doc .totals tr.due td { color: #dc2626; font-weight: 800; }
.acc-doc .totals tr.credit td { color: #059669; }
.acc-doc .section { margin-top: 22px; page-break-inside: avoid; }
.acc-doc .section h3 { font-size: 13px; font-weight: 800; margin-bottom: 4px; }
.acc-doc .section .body { white-space: pre-wrap; }
.acc-doc .bank { background: var(--soft); border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; display: block; width: 320px; max-width: 100%; text-align: left; }
.acc-doc .sign { margin-top: 30px; text-align: right; }
.acc-doc .sign img { max-height: 54px; }
.acc-doc .sign .line { margin-top: 4px; border-top: 1px solid var(--line); display: inline-block; padding-top: 4px; min-width: 180px; text-align: center; font-weight: 700; }
.acc-doc .footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid var(--line); text-align: center; color: var(--muted); font-size: 11px; }
.acc-doc .milestone td { padding: 7px 8px; border-bottom: 1px solid var(--line); }
.acc-doc .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.acc-doc .pay-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 16px; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.acc-doc .pay-cols > div { padding: 0; }
.acc-doc .pay-cols > div + div { border-left: 1px solid var(--line); }
.acc-doc .pay-cols h3 { background: var(--soft); padding: 8px 12px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); }
.acc-doc .pay-cols td { padding: 6px 12px; border-bottom: 1px solid var(--line); }
.acc-doc .pay-cols tr:last-child td { border-bottom: 0; }
.acc-doc .net { margin-top: 16px; border: 2px solid var(--ink); border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 800; }
.acc-doc .kv { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 18px; margin-top: 16px; padding: 12px 14px; background: var(--soft); border: 1px solid var(--line); border-radius: 8px; }
.acc-doc .kv b { display: block; font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); font-weight: 700; }

/* ---- density ---- */
.acc-doc.dens-compact { --pad-x: 34px; --pad-y: 28px; font-size: 11.5px; line-height: 1.4; }
.acc-doc.dens-compact table.items td { padding: 5px 8px; }
.acc-doc.dens-compact .section { margin-top: 14px; }
.acc-doc.dens-compact .meta { margin-top: 14px; }

/* ---- logo position and size ---- */
.acc-doc.logosz-small .logo { max-height: 36px; max-width: 110px; }
.acc-doc.logosz-large .logo { max-height: 88px; max-width: 220px; }
.acc-doc.logo-right .head { flex-direction: row-reverse; }
.acc-doc.logo-right .brand { flex-direction: row-reverse; text-align: right; }
.acc-doc.logo-right .doc-title { text-align: left; }
.acc-doc.logo-center .head { flex-direction: column; align-items: center; text-align: center; gap: 12px; }
.acc-doc.logo-center .brand { flex-direction: column; align-items: center; }
.acc-doc.logo-center .doc-title { text-align: center; }
.acc-doc .header-note { margin-top: 10px; text-align: center; color: var(--muted); font-size: 11px; }

/* ---- logo watermark (first page) ---- */
.acc-doc .wm { position: absolute; top: 0; left: 0; right: 0; height: 1000px; display: flex; align-items: center; justify-content: center; opacity: .07; pointer-events: none; overflow: hidden; }
.acc-doc .doc-body { position: relative; }
.acc-doc .wm img { max-width: 60%; max-height: 45%; object-fit: contain; }

/* ---- table styles ---- */
.acc-doc.tbl-striped table.items tbody tr:nth-child(even) td { background: var(--soft); }
.acc-doc.tbl-boxed table.items th, .acc-doc.tbl-boxed table.items td { border: 1px solid var(--line); }

/* ---- layout: modern (coloured band) ---- */
.acc-doc.tpl-modern .head { background: var(--accent); color: #fff; margin: calc(var(--pad-y) * -1) calc(var(--pad-x) * -1) 0; padding: 28px var(--pad-x); border-bottom: 0; }
.acc-doc.tpl-modern .head .muted, .acc-doc.tpl-modern .head .small { color: rgba(255,255,255,.85); }
.acc-doc.tpl-modern .head b { color: #fff; }
.acc-doc.tpl-modern .doc-title h1 { color: #fff; font-weight: 800; }
.acc-doc.tpl-modern .head .stamp { color: #fff; border-color: #fff; }
.acc-doc.tpl-modern .label { color: var(--accent); }
.acc-doc.tpl-modern table.items th { background: var(--accent-soft); color: var(--accent); border-top: 0; border-bottom: 2px solid var(--accent); }
.acc-doc.tpl-modern .totals tr.grand td { border-top: 2px solid var(--accent); color: var(--accent); }
.acc-doc.tpl-modern .section h3 { color: var(--accent); }

/* ---- layout: minimal ---- */
.acc-doc.tpl-minimal .head { border-bottom: 1px solid var(--line); }
.acc-doc.tpl-minimal .doc-title h1 { font-size: 30px; font-weight: 300; letter-spacing: .01em; text-transform: none; }
.acc-doc.tpl-minimal .biz-name { font-weight: 700; }
.acc-doc.tpl-minimal .label { letter-spacing: .12em; font-weight: 600; }
.acc-doc.tpl-minimal table.items th { background: transparent; border-top: 0; font-weight: 600; }
.acc-doc.tpl-minimal table.items td { border-bottom-color: #f1f5f9; }
.acc-doc.tpl-minimal .totals tr.grand td { border-top: 1px solid var(--ink); font-weight: 700; }
.acc-doc.tpl-minimal .stamp { border-width: 1px; }
.acc-doc.tpl-minimal .footer { border-top: 0; }

/* ---- layout: bold (accent edge) ---- */
.acc-doc.tpl-bold { border-left: 12px solid var(--accent); padding-left: calc(var(--pad-x) - 12px); }
.acc-doc.tpl-bold .head { border-bottom: 0; padding-bottom: 8px; }
.acc-doc.tpl-bold .doc-title h1 { color: var(--accent); font-size: 32px; font-weight: 900; }
.acc-doc.tpl-bold .doc-no { color: var(--ink); }
.acc-doc.tpl-bold .label { color: var(--accent); }
.acc-doc.tpl-bold table.items th { background: var(--accent); color: #fff; border: 0; }
.acc-doc.tpl-bold .totals tr.grand td { background: var(--accent-soft); border-top: 0; padding: 10px 8px; color: var(--ink); }
.acc-doc.tpl-bold .section h3 { color: var(--accent); text-transform: uppercase; font-size: 11px; letter-spacing: .1em; }
.acc-doc.tpl-bold .footer { border-top: 2px solid var(--accent); }

@media (max-width: 640px) {
  .acc-doc { --pad-x: 16px; --pad-y: 20px; }
  .acc-doc .meta, .acc-doc .grid2, .acc-doc .pay-cols, .acc-doc .kv { grid-template-columns: 1fr; }
  .acc-doc .row, .acc-doc .totals { flex-direction: column; }
  .acc-doc .doc-title { text-align: left; }
  .acc-doc .totals .box { width: 100%; }
  .acc-doc .pay-cols > div + div { border-left: 0; border-top: 1px solid var(--line); }
}
@media print {
  .acc-doc { --pad-x: 0px; --pad-y: 0px; max-width: none; }
  .acc-doc.tpl-modern .head { padding: 24px 18px; margin: 0; }
  .acc-doc.tpl-bold { padding-left: 16px; }
  .acc-doc { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .acc-doc .pay-cols > div + div { border-left: 1px solid var(--line); border-top: 0; }
}
`;
