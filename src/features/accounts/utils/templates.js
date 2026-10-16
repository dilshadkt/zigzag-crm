/**
 * Document templates for invoices and proposals.
 *
 * The built-in presets below ship with the app and cannot be edited. A company
 * can copy one ("Customize"), change colours, layout details and which blocks
 * show, and save it as its own template. Saved templates live in the accounts
 * settings; documents point at one by id (or use the company default).
 */

export const SHOW_OPTIONS = [
  { key: "hsn", label: "HSN / SAC column" },
  { key: "discount", label: "Discount column (when items have discounts)" },
  { key: "placeOfSupply", label: "Place of supply" },
  { key: "servicePeriod", label: "Service period" },
  { key: "amountInWords", label: "Amount in words" },
  { key: "bankDetails", label: "Bank & UPI details" },
  { key: "paymentHistory", label: "Payments received" },
  { key: "signature", label: "Signature block" },
  { key: "notes", label: "Notes" },
  { key: "terms", label: "Terms & conditions" },
];

export const SHOW_DEFAULTS = Object.fromEntries(SHOW_OPTIONS.map((o) => [o.key, true]));

const base = {
  forType: "both",
  font: "sans",
  logoPosition: "left",
  logoSize: "medium",
  logoUrl: "",
  showLogo: true,
  logoHeight: 0,
  logoWatermark: false,
  tableStyle: "lines",
  density: "comfortable",
  titleLabel: "",
  headerNote: "",
  footerText: "",
  show: SHOW_DEFAULTS,
};

export const PRESETS = [
  { ...base, id: "classic", name: "Classic", description: "Black and white with strong rules. Safe for any client.", layout: "classic", accent: "#1e293b" },
  { ...base, id: "modern", name: "Modern", description: "Coloured header band and tinted table, in your brand colour.", layout: "modern", accent: "#3f8cff", tableStyle: "striped" },
  { ...base, id: "minimal", name: "Minimal", description: "Light, airy and quiet. Lets the numbers speak.", layout: "minimal", accent: "#475569", font: "helvetica" },
  { ...base, id: "bold", name: "Bold", description: "Accent edge, large coloured title and a solid table header.", layout: "bold", accent: "#0d9488", tableStyle: "striped" },
];

export const LAYOUTS = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
];

export const FONTS = [
  { value: "sans", label: "Nunito Sans (default)", stack: '"Nunito Sans", "Segoe UI", Arial, sans-serif' },
  { value: "serif", label: "Georgia (serif)", stack: 'Georgia, "Times New Roman", serif' },
  { value: "helvetica", label: "Helvetica / Arial", stack: 'Helvetica, Arial, sans-serif' },
];

export const ACCENT_SWATCHES = ["#1e293b", "#3f8cff", "#0d9488", "#7c3aed", "#e8590c", "#dc2626", "#0f766e", "#b45309"];

export const presetIds = PRESETS.map((p) => p.id);

/** The template to use for a document, falling back to Classic when it was deleted. */
export const resolveTemplate = (id, customTemplates = []) => {
  const found = customTemplates.find((t) => t.id === id) || PRESETS.find((p) => p.id === id) || PRESETS[0];
  return { ...found, show: { ...SHOW_DEFAULTS, ...(found.show || {}) } };
};

/** Presets plus the company's templates that apply to this kind of document. */
export const templatesFor = (type, customTemplates = []) => [
  ...PRESETS,
  ...customTemplates.filter((t) => t.forType === "both" || t.forType === type),
];

export const newCustomId = () => `custom_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

/** Copy a template as the starting point for a new custom one. */
export const customize = (template, name) => ({
  ...template,
  id: newCustomId(),
  name: name || `${template.name} (custom)`,
  description: undefined,
  show: { ...SHOW_DEFAULTS, ...(template.show || {}) },
});

/** Blend a hex colour with white, for tinted table headers (no color-mix, so PDFs render it). */
export const tint = (hex, amount = 0.88) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#f1f5f9";
  const n = parseInt(m[1], 16);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

export const templateStyleVars = (template) => ({
  "--accent": template.accent,
  "--accent-soft": tint(template.accent, 0.9),
  "--font": (FONTS.find((f) => f.value === template.font) || FONTS[0]).stack,
});
