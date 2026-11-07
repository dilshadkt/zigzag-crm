import { useCallback, useSyncExternalStore } from "react";

/**
 * App-wide light/dark theme.
 *
 * The chosen theme lives in localStorage and is mirrored onto
 * <html data-theme="light|dark">. All dark styling is keyed off that
 * attribute (see styles/theme-dark.css). Light is the default, so users who
 * never touch the setting see the app exactly as before.
 *
 * index.html applies the stored theme before first paint; this module keeps it
 * in sync afterwards (including across browser tabs).
 */

export const THEME_STORAGE_KEY = "zigzag-theme";
export const THEMES = ["light", "dark"];

const META_COLOR = { light: "#2155A3", dark: "#0B1220" };

const listeners = new Set();

const readStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

let currentTheme = readStoredTheme();

const applyToDocument = (theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", META_COLOR[theme]);
};

const emit = () => listeners.forEach((listener) => listener());

export const setTheme = (next) => {
  const theme = next === "dark" ? "dark" : "light";
  if (theme === currentTheme) return;
  currentTheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode) - the theme still applies for this session */
  }
  applyToDocument(theme);
  emit();
};

/** Call once at startup so the document matches the stored preference. */
export const initTheme = () => {
  currentTheme = readStoredTheme();
  applyToDocument(currentTheme);

  if (typeof window !== "undefined") {
    // Keep multiple open tabs/windows in step.
    window.addEventListener("storage", (event) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      currentTheme = event.newValue === "dark" ? "dark" : "light";
      applyToDocument(currentTheme);
      emit();
    });
  }
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentTheme;

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light");
  const toggleTheme = useCallback(
    () => setTheme(currentTheme === "dark" ? "light" : "dark"),
    []
  );
  return { theme, isDark: theme === "dark", setTheme, toggleTheme };
};

export default useTheme;
