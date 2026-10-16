import { DOC_CSS } from "../components/documentStyles";

/**
 * Prints (or saves as PDF through the print dialog) the HTML of a rendered
 * document. It goes through a hidden iframe so the app chrome never ends up on
 * the page and the document's own stylesheet is all that applies.
 */
export const printElement = (element, title = "Document") => {
  if (!element) return;
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
  document.body.appendChild(frame);

  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${String(title).replace(/[<>&]/g, "")}</title>
<style>@page { size: A4; margin: 14mm; } html, body { margin: 0; background: #fff; } ${DOC_CSS}</style></head>
<body>${element.outerHTML}</body></html>`);
  doc.close();

  const cleanup = () => setTimeout(() => frame.remove(), 1000);
  const run = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } finally {
      cleanup();
    }
  };

  // Wait for the logo / signature images before opening the dialog
  const images = Array.from(doc.images);
  const pending = images.filter((img) => !img.complete);
  if (!pending.length) {
    setTimeout(run, 150);
    return;
  }
  let left = pending.length;
  const done = () => {
    left -= 1;
    if (left <= 0) run();
  };
  pending.forEach((img) => {
    img.addEventListener("load", done);
    img.addEventListener("error", done);
  });
  setTimeout(() => left > 0 && run(), 3000);
};
