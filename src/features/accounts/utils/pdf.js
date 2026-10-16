const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const BOTTOM_MARGIN_MM = 10;
const TOP_MARGIN_MM = 10; // pages after the first
const RENDER_WIDTH = 794; // A4 width at 96 dpi: keeps the layout identical on every screen

const BREAK_SELECTOR = "tr, .section, .totals, .meta, .head, .net, .kv, .pay-cols, .sign, .footer";

const waitForImages = (root) =>
  Promise.all(
    Array.from(root.querySelectorAll("img")).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) return resolve();
          img.addEventListener("load", resolve);
          img.addEventListener("error", resolve);
        })
    )
  );

/**
 * Turns a rendered document into a real A4 PDF file and downloads it.
 * The libraries load on demand, so they only cost anything when someone uses
 * the button. Page breaks fall between rows and sections rather than through
 * the middle of a line of text.
 */
export const downloadPdf = async (element, filename = "document.pdf", { asBlob = false } = {}) => {
  if (!element) throw new Error("Nothing to export");
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  // Render a copy at a fixed width, off screen, so mobile screens get the same A4 layout
  const host = document.createElement("div");
  host.style.cssText = `position:absolute;left:-10000px;top:0;width:${RENDER_WIDTH}px;background:#fff;`;
  const clone = element.cloneNode(true);
  clone.style.width = `${RENDER_WIDTH}px`;
  clone.style.maxWidth = `${RENDER_WIDTH}px`;
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForImages(clone);

    const scale = 2;
    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: RENDER_WIDTH,
    });

    // Where a page may safely end (bottom edges of rows and blocks), in canvas pixels
    const top = clone.getBoundingClientRect().top;
    const breaks = Array.from(clone.querySelectorAll(BREAK_SELECTOR))
      .map((el) => Math.round((el.getBoundingClientRect().bottom - top) * scale))
      .filter((y) => y > 0)
      .sort((a, b) => a - b);

    const mmPerPx = PAGE_W_MM / canvas.width;
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });

    const images = [];
    let start = 0;
    let page = 0;
    while (start < canvas.height - 2) {
      const topMargin = page === 0 ? 0 : TOP_MARGIN_MM;
      const maxPx = Math.floor((PAGE_H_MM - topMargin - BOTTOM_MARGIN_MM) / mmPerPx);
      let end = Math.min(start + maxPx, canvas.height);
      if (end < canvas.height) {
        // Prefer the last block edge in the lower half of the page
        const safe = breaks.filter((y) => y > start + maxPx * 0.5 && y <= end).pop();
        if (safe) end = safe;
      }

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = end - start;
      const ctx = slice.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, start, canvas.width, end - start, 0, 0, canvas.width, end - start);

      if (page > 0) pdf.addPage();
      const image = slice.toDataURL("image/jpeg", 0.95);
      if (asBlob) images.push(image);
      pdf.addImage(image, "JPEG", 0, topMargin, PAGE_W_MM, (end - start) * mmPerPx, undefined, "FAST");
      start = end;
      page += 1;
    }

    if (asBlob) return { blob: pdf.output("blob"), pages: page, images };
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    return { pages: page };
  } finally {
    host.remove();
  }
};

/** "INV/2026-27/0007" -> "Invoice-INV-2026-27-0007.pdf" */
export const pdfName = (kind, number) => `${kind}-${String(number || "").replace(/[^\w.-]+/g, "-")}.pdf`;
