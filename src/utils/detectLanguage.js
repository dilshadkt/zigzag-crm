const MALAYALAM = /[ഀ-ൿ]/g;
const LATIN = /[A-Za-z]/g;

/**
 * Guess the language of a text from its script.
 * Returns a BCP-47 tag we have speech support for ("ml-IN" | "en-IN"),
 * or null when the text has no letters (e.g. only digits/emoji).
 */
export const detectLanguage = (text = "") => {
  const ml = (text.match(MALAYALAM) || []).length;
  const latin = (text.match(LATIN) || []).length;
  if (!ml && !latin) return null;
  return ml > latin * 0.5 ? "ml-IN" : "en-IN";
};

/** The browser's UI language, narrowed to one we support. */
export const browserLanguage = () => {
  const lang = (typeof navigator !== "undefined" && navigator.language) || "";
  return lang.toLowerCase().startsWith("ml") ? "ml-IN" : "en-IN";
};
