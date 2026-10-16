import React, { forwardRef } from "react";
import { DOC_CSS } from "./documentStyles";
import { amountInWords, fmtDate, fmtMoney, methodLabel } from "../utils/format";
import { PRESETS, SHOW_DEFAULTS, templateStyleVars } from "../utils/templates";

const addressLines = (a = {}) =>
  [a.line1, a.line2, [a.city, a.state, a.pincode].filter(Boolean).join(", "), a.country && a.country !== "India" ? a.country : ""]
    .filter(Boolean);

const TITLES = {
  invoice: (doc) => (doc.taxMode === "none" ? "Invoice" : "Tax Invoice"),
  proposal: () => "Proposal",
};

const stampFor = (type, doc) => {
  if (type === "invoice") {
    if (doc.status === "paid") return "paid";
    if (doc.status === "void") return "void";
    if (doc.isOverdue) return "overdue";
    return null;
  }
  if (["accepted", "converted"].includes(doc.status)) return "accepted";
  if (["declined", "expired"].includes(doc.status) || doc.isExpired) return doc.status === "declined" ? "declined" : "expired";
  return null;
};

/**
 * The printable invoice / proposal. Uses only the document stylesheet so it
 * looks the same on screen, in the share page and on paper.
 */
const DocumentView = forwardRef(function DocumentView({ type, doc, business = {}, template }, ref) {
  if (!doc) return null;
  const tpl = template || PRESETS[0];
  const show = { ...SHOW_DEFAULTS, ...(tpl.show || {}) };
  const logoSrc = tpl.logoUrl || business.logoUrl;
  const showLogo = tpl.showLogo !== false && Boolean(logoSrc);
  const logoStyle = tpl.logoHeight ? { maxHeight: tpl.logoHeight, maxWidth: tpl.logoHeight * 3 } : undefined;
  const hasDiscountColumn = show.discount && doc.items?.some((i) => i.discountPercent > 0);
  const sym = doc.currencySymbol || "₹";
  const t = doc.totals || {};
  const showTax = doc.taxMode !== "none";
  const stamp = stampFor(type, doc);
  const biz = business;
  const bankAccount = type === "invoice" ? doc.bankAccount : null;

  return (
    <div
      ref={ref}
      className={`acc-doc tpl-${tpl.layout} tbl-${tpl.tableStyle} dens-${tpl.density} logo-${tpl.logoPosition} logosz-${tpl.logoSize}`}
      style={templateStyleVars(tpl)}
    >
      <style>{DOC_CSS}</style>
      {showLogo && tpl.logoWatermark && (
        <div className="wm" aria-hidden="true">
          <img src={logoSrc} alt="" />
        </div>
      )}

      <div className="doc-body">
      <div className="head row">
        <div className="brand">
          {showLogo && <img className="logo" src={logoSrc} alt="" style={logoStyle} />}
          <div>
            <div className="biz-name">{biz.tradeName || biz.legalName || "Your business"}</div>
            {biz.tradeName && biz.legalName && biz.tradeName !== biz.legalName && <div className="small muted">{biz.legalName}</div>}
            {addressLines(biz.address).map((l) => (
              <div key={l} className="small muted">{l}</div>
            ))}
            <div className="small muted">
              {[biz.phone, biz.email].filter(Boolean).join("  ·  ")}
            </div>
            {(biz.gstin || biz.pan) && (
              <div className="small">
                {biz.gstin && <span>GSTIN: <b>{biz.gstin}</b></span>}
                {biz.gstin && biz.pan && "   "}
                {biz.pan && <span>PAN: <b>{biz.pan}</b></span>}
              </div>
            )}
          </div>
        </div>
        <div className="doc-title">
          <h1>{tpl.titleLabel || TITLES[type](doc)}</h1>
          <div className="doc-no">{doc.number}</div>
          {type === "proposal" && doc.version > 1 && <div className="small muted">Version {doc.version}</div>}
          {stamp && <div className={`stamp ${stamp}`}>{stamp}</div>}
        </div>
      </div>

      {tpl.headerNote && <div className="header-note">{tpl.headerNote}</div>}

      <div className="meta">
        <div>
          <div className="label">{type === "invoice" ? "Billed to" : "Prepared for"}</div>
          <div className="party-name">{doc.client?.name}</div>
          {doc.client?.contactName && <div>Attn: {doc.client.contactName}</div>}
          {addressLines(doc.client?.address).map((l) => (
            <div key={l} className="muted">{l}</div>
          ))}
          {doc.client?.email && <div className="muted">{doc.client.email}</div>}
          {doc.client?.phone && <div className="muted">{doc.client.phone}</div>}
          {doc.client?.gstin && <div className="small">GSTIN: <b>{doc.client.gstin}</b></div>}
        </div>
        <dl>
          <dt>{type === "invoice" ? "Invoice date" : "Date"}</dt>
          <dd>{fmtDate(doc.issueDate)}</dd>
          {type === "invoice" ? (
            <>
              <dt>Due date</dt>
              <dd>{fmtDate(doc.dueDate)}</dd>
              {show.servicePeriod && doc.periodStart && doc.periodEnd && (
                <>
                  <dt>Service period</dt>
                  <dd>{fmtDate(doc.periodStart)} – {fmtDate(doc.periodEnd)}</dd>
                </>
              )}
              {doc.reference && (
                <>
                  <dt>Reference</dt>
                  <dd>{doc.reference}</dd>
                </>
              )}
            </>
          ) : (
            <>
              <dt>Valid until</dt>
              <dd>{fmtDate(doc.validUntil)}</dd>
            </>
          )}
          {show.placeOfSupply && showTax && doc.placeOfSupply && (
            <>
              <dt>Place of supply</dt>
              <dd>{doc.placeOfSupply}</dd>
            </>
          )}
        </dl>
      </div>

      {(doc.title || doc.intro) && (
        <>
          {doc.title && <h2 className="doc-heading">{doc.title}</h2>}
          {type === "proposal" && doc.intro && <p className="intro">{doc.intro}</p>}
        </>
      )}

      <table className="items">
        <thead>
          <tr>
            <th style={{ width: 28 }}>#</th>
            <th>Description</th>
            {show.hsn && <th>HSN/SAC</th>}
            <th className="r">Qty</th>
            <th className="r">Rate</th>
            {hasDiscountColumn && <th className="r">Disc.</th>}
            {showTax && <th className="r">Tax</th>}
            <th className="r">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(doc.items || []).map((item, idx) => {
            const net = item.amount - (item.amount * (item.discountPercent || 0)) / 100;
            return (
              <tr key={item._id || idx}>
                <td>{idx + 1}</td>
                <td>
                  <span className="item-name">{item.description}</span>
                  {item.optional && <span className="opt">Optional</span>}
                  {item.details && <div className="small muted" style={{ whiteSpace: "pre-wrap" }}>{item.details}</div>}
                </td>
                {show.hsn && <td>{item.hsnSac || "—"}</td>}
                <td className="r">{item.quantity}{item.unit ? ` ${item.unit}` : ""}</td>
                <td className="r">{fmtMoney(item.rate, sym)}</td>
                {hasDiscountColumn && <td className="r">{item.discountPercent ? `${item.discountPercent}%` : "—"}</td>}
                {showTax && <td className="r">{item.taxRate}%</td>}
                <td className="r">{fmtMoney(net, sym)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="totals">
        <div className="words">
          {show.amountInWords && (
            <>
              <div className="label">Amount in words</div>
              <div style={{ fontWeight: 700 }}>{amountInWords(t.payable, doc.currency)}</div>
            </>
          )}
          {t.optionalTotal > 0 && (
            <p className="small muted" style={{ marginTop: 8 }}>
              Optional items worth {fmtMoney(t.optionalTotal, sym)} (incl. tax) are not included in the total.
            </p>
          )}
        </div>
        <div className="box">
          <table>
            <tbody>
              <tr><td className="muted">Subtotal</td><td className="r">{fmtMoney(t.subtotal, sym)}</td></tr>
              {t.lineDiscount > 0 && <tr><td className="muted">Item discounts</td><td className="r">- {fmtMoney(t.lineDiscount, sym)}</td></tr>}
              {t.discount > 0 && (
                <tr>
                  <td className="muted">Discount{doc.discountType === "percent" ? ` (${doc.discountValue}%)` : ""}</td>
                  <td className="r">- {fmtMoney(t.discount, sym)}</td>
                </tr>
              )}
              {showTax && t.discount + t.lineDiscount > 0 && <tr><td className="muted">Taxable amount</td><td className="r">{fmtMoney(t.taxable, sym)}</td></tr>}
              {doc.taxMode === "gst_intra" && (
                <>
                  <tr><td className="muted">CGST</td><td className="r">{fmtMoney(t.cgst, sym)}</td></tr>
                  <tr><td className="muted">SGST</td><td className="r">{fmtMoney(t.sgst, sym)}</td></tr>
                </>
              )}
              {doc.taxMode === "gst_inter" && <tr><td className="muted">IGST</td><td className="r">{fmtMoney(t.igst, sym)}</td></tr>}
              {t.adjustment !== 0 && <tr><td className="muted">Adjustment</td><td className="r">{fmtMoney(t.adjustment, sym)}</td></tr>}
              {t.roundOff !== 0 && <tr><td className="muted">Round off</td><td className="r">{fmtMoney(t.roundOff, sym)}</td></tr>}
              <tr className="grand"><td>Total</td><td className="r">{fmtMoney(t.total, sym)}</td></tr>
              {t.tds > 0 && (
                <>
                  <tr><td className="muted">TDS @ {doc.tdsPercent}% (deducted by client)</td><td className="r">- {fmtMoney(t.tds, sym)}</td></tr>
                  <tr><td><b>Net payable</b></td><td className="r"><b>{fmtMoney(t.payable, sym)}</b></td></tr>
                </>
              )}
              {type === "invoice" && doc.amountPaid > 0 && (
                <tr className="credit"><td>Paid</td><td className="r">- {fmtMoney(doc.amountPaid, sym)}</td></tr>
              )}
              {type === "invoice" && doc.status !== "void" && (
                <tr className={doc.balance > 0 ? "due" : "credit"}>
                  <td>Balance due</td>
                  <td className="r">{fmtMoney(doc.balance, sym)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {type === "proposal" && doc.milestones?.length > 0 && (
        <div className="section">
          <h3>Payment schedule</h3>
          <table className="milestone">
            <tbody>
              {doc.milestones.map((m) => (
                <tr key={m._id || m.title}>
                  <td>
                    <b>{m.title}</b>
                    {m.description && <div className="small muted">{m.description}</div>}
                  </td>
                  <td className="muted">{m.dueNote}</td>
                  <td className="r">{m.percent}%</td>
                  <td className="r">{fmtMoney((t.payable * m.percent) / 100, sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {type === "proposal" && doc.timeline && (
        <div className="section">
          <h3>Timeline</h3>
          <div className="body">{doc.timeline}</div>
        </div>
      )}

      {type === "proposal" &&
        (doc.sections || []).map((s) => (
          <div className="section" key={s._id || s.title}>
            <h3>{s.title}</h3>
            <div className="body">{s.body}</div>
          </div>
        ))}

      {show.paymentHistory && type === "invoice" && doc.payments?.length > 0 && (
        <div className="section">
          <h3>Payments received</h3>
          <table className="milestone">
            <tbody>
              {doc.payments.map((p) => (
                <tr key={p._id || p.receiptNumber}>
                  <td>{fmtDate(p.date)}</td>
                  <td>{methodLabel(p.method)}</td>
                  <td className="muted">{p.receiptNumber}</td>
                  <td className="r">{fmtMoney(p.amount, sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {show.bankDetails && bankAccount && (bankAccount.accountNumber || bankAccount.upiId) && doc.balance > 0 && (
        <div className="section">
          <h3>Pay by bank transfer</h3>
          <div className="bank">
            {bankAccount.accountHolder && <div>Account name: <b>{bankAccount.accountHolder}</b></div>}
            {bankAccount.accountNumber && <div>Account no: <b>{bankAccount.accountNumber}</b></div>}
            {bankAccount.ifsc && <div>IFSC: <b>{bankAccount.ifsc}</b></div>}
            {(bankAccount.bankName || bankAccount.branch) && (
              <div>{[bankAccount.bankName, bankAccount.branch].filter(Boolean).join(", ")}</div>
            )}
            {bankAccount.upiId && <div>UPI: <b>{bankAccount.upiId}</b></div>}
          </div>
        </div>
      )}

      {show.notes && doc.notes && (
        <div className="section">
          <h3>Notes</h3>
          <div className="body">{doc.notes}</div>
        </div>
      )}
      {show.terms && doc.terms && (
        <div className="section">
          <h3>Terms &amp; conditions</h3>
          <div className="body muted">{doc.terms}</div>
        </div>
      )}

      {type === "proposal" && doc.status === "accepted" && doc.response?.by && (
        <div className="section">
          <h3>Accepted</h3>
          <div className="body">
            Accepted by <b>{doc.response.by}</b> on {fmtDate(doc.respondedAt)}.
            {doc.response.comment ? ` "${doc.response.comment}"` : ""}
          </div>
        </div>
      )}

      {show.signature && (
        <div className="sign">
          {biz.signatureUrl && <img src={biz.signatureUrl} alt="" />}
          <div><span className="line">Authorised signatory</span></div>
        </div>
      )}

      <div className="footer">
        {tpl.footerText || (type === "invoice" ? "Thank you for your business." : "We look forward to working with you.")}
        {biz.website ? `  ·  ${biz.website}` : ""}
      </div>
      </div>
    </div>
  );
});

export default DocumentView;
