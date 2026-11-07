/**
 * Generates src/styles/theme-dark.generated.css.
 *
 * Why this exists: the app was built with hard-coded light colours
 * (bg-white, text-[#0A1629], border-[#D8E0F0] ...). Instead of touching
 * ~1000 class names across the code base, the dark theme re-maps those
 * classes under html[data-theme="dark"].
 *
 * Tailwind palette shades (gray/slate/colour 50-200 etc.) are re-mapped through
 * CSS variables in theme-dark.css. This script covers what variables can't:
 *   - arbitrary-hex classes  (bg-[#F4F9FD], text-[#7D8592] ...)
 *   - bg-white / border-white / gradient stops
 *   - coloured text shades that must get lighter on dark (text-red-600 ...)
 *   - dark-shade backgrounds that must not flip to light (bg-slate-900 ...)
 *
 * It scans the source for the classes that are actually used, including their
 * hover:/focus:/group-hover:/md: variants.
 *
 * Re-run after adding new hard-coded light colours:
 *     npm run theme:gen
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "src");
const OUT = join(SRC, "styles", "theme-dark.generated.css");

/* ------------------------------------------------------------------ palette */
const SURFACE = "#111a2b";
const SURFACE_HOVER = "#1b283e";

const textMap = {
  "0a1629": "#e6ebf4",
  "7d8592": "#9aa6ba",
  "7d8593": "#9aa6ba",
  "7d8594": "#9aa6ba",
  "91929e": "#8491a7",
  "415770": "#b2bccd",
  "4a5568": "#b2bccd",
  "1f1f1f": "#e6ebf4",
  "0b3b2e": "#8fd9ae",
  "3c5a4d": "#9bcbb0",
  "3d5200": "#c6e07a",
  "5b6b2a": "#c6e07a",
};

const LIGHT_FILL = "#172236";
const BLUE_TINT = "rgb(63 140 255 / 0.16)";
const GREEN_TINT = "rgb(34 197 94 / 0.14)";
const bgMap = {
  f4f9fd: ["#0b1220", SURFACE_HOVER], // [rest, hover/focus]
  e6edf5: ["#1e2b42", "#243349"],
  ecf3ff: [BLUE_TINT, "rgb(63 140 255 / 0.22)"],
  e6efff: [BLUE_TINT, "rgb(63 140 255 / 0.22)"],
  f1f8f3: [GREEN_TINT, GREEN_TINT],
  f1faf3: [GREEN_TINT, GREEN_TINT],
  e6f4ea: [GREEN_TINT, GREEN_TINT],
  e0f9f2: [GREEN_TINT, GREEN_TINT],
  f4ffd0: ["rgb(190 230 60 / 0.14)", "rgb(190 230 60 / 0.14)"],
  "0a1629": ["#2a3a57", "#34476b"],
  "1f1f1f": ["#2a3a57", "#34476b"],
};
for (const h of ["f8fafc", "f7f9fc", "f8fbff", "fafcfe", "f5f9ff", "f5f7fa", "f4f6f8", "f4f8f5", "f5f8f6", "ebeff3", "eef2f8"]) {
  bgMap[h] = [LIGHT_FILL, SURFACE_HOVER];
}

const borderMap = {
  d8e0f0: "#2a3a55",
  ced5e0: "#2f4160",
  e4e6e8: "#243349",
  e6ebf5: "#243349",
  e4ebf5: "#243349",
  eef2f8: "#243349",
  e6edf5: "#243349",
  f4f9fd: "#1e2b42",
  e3eee7: "#1f3b2e",
  cfefd3: "#1f3b2e",
};
const ringMap = { "0a1629": "#e6ebf4" };

// Tailwind colour scales that get a lighter text shade in dark mode.
const COLORS = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];
const TEXT_SHADE = { 600: 400, 700: 300, 800: 300, 900: 200 };

// Dark neutral backgrounds/borders. These are "dark" by intent (buttons,
// tooltips, skeleton bars) so they must not flip to light with the palette.
const NEUTRAL_BG = { 400: "#475a78", 500: "#56698a", 600: "#657a9c", 700: "#3a4d6e", 800: "#30425f", 900: "#293854" };
const NEUTRAL_BORDER = { 400: "#3a4d6e", 500: "#4a5f82", 600: "#5a7096", 700: "#3a4d6e", 800: "#3a4d6e", 900: "#3a4d6e" };
const FAINT_TEXT = { 100: "#3a4a66", 200: "#46577a", 300: "#52637f" };

/* ------------------------------------------------------------------ helpers */
const walk = (dir, files = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if ([".jsx", ".js", ".tsx", ".ts"].includes(extname(p))) files.push(p);
  }
  return files;
};

const hexToRgb = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

/** "#rrggbb" or "rgb(...)" + optional alpha percent -> css colour */
const withAlpha = (color, alpha) => {
  if (alpha == null) return color;
  const a = Number(alpha) / 100;
  if (color.startsWith("rgb(")) {
    const m = color.match(/rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)/);
    return `rgb(${m[1]} ${m[2]} ${m[3]} / ${+(a * (m[4] ? Number(m[4]) : 1)).toFixed(3)})`;
  }
  const [r, g, b] = hexToRgb(color);
  return `rgb(${r} ${g} ${b} / ${a})`;
};

const esc = (s) => s.replace(/[^A-Za-z0-9_-]/g, (c) => `\\${c}`);

const BREAKPOINTS = { sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem", "2xl": "96rem" };
const PSEUDO = {
  hover: ":hover",
  focus: ":focus",
  active: ":active",
  disabled: ":disabled",
  "focus-within": ":focus-within",
  "focus-visible": ":focus-visible",
  first: ":first-child",
  last: ":last-child",
  placeholder: "::placeholder",
};
const ANCESTOR = { "group-hover": ".group:hover ", "group-focus-within": ".group:focus-within ", "group-focus": ".group:focus " };

// original palette values from Tailwind (for text-blue-100 etc., which the
// variable re-map would otherwise turn dark)
const themeCss = readFileSync(join(root, "node_modules/tailwindcss/theme.css"), "utf8");
const original = (name) => themeCss.match(new RegExp(`--color-${name}:\\s*([^;]+);`))?.[1].trim();

/* ------------------------------------------------------------ resolve rules */
// Returns { prop, value } or null for a utility (variants already stripped).
const resolve = (utility, variants) => {
  const interactive = variants.some((v) => ["hover", "focus", "group-hover", "active", "focus-within", "group-focus-within", "focus-visible"].includes(v));
  let m;

  // arbitrary hex: bg-[#F4F9FD]/80
  if ((m = utility.match(/^(bg|text|border|ring)-\[#([0-9a-fA-F]{3,8})\](?:\/(\d{1,3}))?$/))) {
    const [, kind, hexRaw, alpha] = m;
    const hex = hexRaw.toLowerCase();
    if (kind === "text" && textMap[hex]) return { prop: "color", value: withAlpha(textMap[hex], alpha) };
    if (kind === "bg" && bgMap[hex]) return { prop: "background-color", value: withAlpha(bgMap[hex][interactive ? 1 : 0], alpha) };
    if (kind === "border" && borderMap[hex]) return { prop: "border-color", value: withAlpha(borderMap[hex], alpha) };
    if (kind === "ring" && ringMap[hex]) return { prop: "--tw-ring-color", value: withAlpha(ringMap[hex], alpha) };
    return null;
  }

  // white surfaces. Low-opacity whites (<40%) are overlays on coloured areas: keep.
  if ((m = utility.match(/^(bg|border|ring|from|to|via)-white(?:\/(\d{1,3}))?$/))) {
    const [, kind, alpha] = m;
    if (alpha != null && Number(alpha) < 40) return null;
    // Shimmer sweeps (via-white/60 over a grey block): a faint light band, not a dark one.
    if (alpha != null && ["from", "to", "via"].includes(kind)) return { prop: `--tw-gradient-${kind}`, value: `rgb(255 255 255 / ${(Number(alpha) / 100 * 0.14).toFixed(3)})` };
    const value = withAlpha(SURFACE, alpha);
    const prop = { bg: "background-color", border: "border-color", ring: "--tw-ring-color", from: "--tw-gradient-from", to: "--tw-gradient-to", via: "--tw-gradient-via" }[kind];
    return { prop, value };
  }

  // coloured text must get lighter on dark
  if ((m = utility.match(new RegExp(`^text-(${COLORS.join("|")})-(600|700|800|900)(?:\\/(\\d{1,3}))?$`)))) {
    const [, c, shade, alpha] = m;
    const v = `var(--color-${c}-${TEXT_SHADE[shade]})`;
    return { prop: "color", value: alpha != null ? `color-mix(in oklab, ${v} ${alpha}%, transparent)` : v };
  }

  // light text shades on coloured banners (text-blue-100 on bg-blue-600): keep original
  if ((m = utility.match(new RegExp(`^text-(${COLORS.join("|")})-(50|100|200)(?:\\/(\\d{1,3}))?$`)))) {
    const [, c, shade, alpha] = m;
    const v = original(`${c}-${shade}`);
    if (!v) return null;
    return { prop: "color", value: alpha != null ? `color-mix(in oklab, ${v} ${alpha}%, transparent)` : v };
  }

  // dark neutral backgrounds / borders keep a dark tone
  if ((m = utility.match(/^(bg|border)-(gray|slate)-(400|500|600|700|800|900)(?:\/(\d{1,3}))?$/))) {
    const [, kind, , shade, alpha] = m;
    if (kind === "bg") {
      // overlays like bg-slate-900/40 should still dim the page
      if (alpha != null && Number(shade) >= 700) return { prop: "background-color", value: `rgb(2 6 14 / ${Math.min(1, (Number(alpha) / 100) * 1.4).toFixed(2)})` };
      return { prop: "background-color", value: withAlpha(NEUTRAL_BG[shade], alpha) };
    }
    return { prop: "border-color", value: withAlpha(NEUTRAL_BORDER[shade], alpha) };
  }

  // faint text (icons, empty states) must stay faint but visible
  if ((m = utility.match(/^text-(gray|slate)-(100|200|300)$/))) {
    return { prop: "color", value: FAINT_TEXT[m[2]] };
  }

  return null;
};

/* ----------------------------------------------------------------- scanning */
const tokens = new Set();
for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  for (const t of text.match(/[^\s"'`<>{}(),;=]+/g) || []) {
    if (/-(white|gray|slate|\[#|(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-)/.test(t)) tokens.add(t);
  }
}

const base = [];
const media = {};
const skipped = new Set();

for (const token of [...tokens].sort()) {
  const parts = token.split(":");
  const rawUtility = parts.pop();
  const important = rawUtility.startsWith("!");
  const utility = rawUtility.replace(/^!/, "");
  const variants = parts;
  const rule = resolve(utility, variants);
  if (!rule) continue;

  let selector = `.${esc(token)}`;
  let ancestor = "";
  let pseudo = "";
  let query = null;
  let ok = true;
  for (const v of variants) {
    if (PSEUDO[v]) pseudo += PSEUDO[v];
    else if (ANCESTOR[v]) ancestor += ANCESTOR[v];
    else if (BREAKPOINTS[v]) query = BREAKPOINTS[v];
    else ok = false;
  }
  if (!ok) {
    skipped.add(token);
    continue;
  }
  selector = `:where(html[data-theme="dark"]) ${ancestor}${selector}${pseudo}`;
  const line = `${selector} { ${rule.prop}: ${rule.value}${important ? " !important" : ""}; }`;
  if (query) (media[query] ||= []).push(line);
  else base.push(line);
}

const css = [
  "/* AUTO-GENERATED by scripts/gen-theme-dark.mjs - do not edit by hand. */",
  "/* Run `npm run theme:gen` after adding new hard-coded light colours.  */",
  "",
  ...base,
  ...Object.entries(media).flatMap(([q, lines]) => [``, `@media (min-width: ${q}) {`, ...lines.map((l) => `  ${l}`), `}`]),
  "",
].join("\n");

writeFileSync(OUT, css);
console.log(`theme-dark.generated.css: ${base.length + Object.values(media).flat().length} rules`);
if (skipped.size) console.warn("Skipped (unsupported variant):", [...skipped].join(" "));
