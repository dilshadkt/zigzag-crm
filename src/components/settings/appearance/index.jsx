import React from "react";
import { FiCheck, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../../hooks/useTheme";

/**
 * Colours for the little previews. They are inline on purpose: each tile must
 * always show its own theme, whichever theme the app is currently in (class
 * based colours would be re-mapped by the dark theme).
 */
const PREVIEW = {
  light: {
    app: "#F4F9FD",
    surface: "#FFFFFF",
    border: "#E4E6E8",
    strong: "#0A1629",
    muted: "#C9D3E0",
    accent: "#3F8CFF",
  },
  dark: {
    app: "#0B1220",
    surface: "#111A2B",
    border: "#243349",
    strong: "#E6EBF4",
    muted: "#33445F",
    accent: "#3F8CFF",
  },
};

const OPTIONS = [
  { value: "light", label: "Light", hint: "Bright and clean", icon: FiSun },
  { value: "dark", label: "Dark", hint: "Easy on the eyes", icon: FiMoon },
];

const ThemePreview = ({ mode }) => {
  const c = PREVIEW[mode];
  return (
    <div
      aria-hidden="true"
      className="flex h-24 w-full overflow-hidden rounded-lg"
      style={{ background: c.app, border: `1px solid ${c.border}` }}
    >
      <div
        className="flex w-1/4 flex-col gap-1.5 p-2"
        style={{ background: c.surface, borderRight: `1px solid ${c.border}` }}
      >
        <span className="h-1.5 w-3/4 rounded-full" style={{ background: c.accent }} />
        <span className="h-1.5 w-full rounded-full" style={{ background: c.muted }} />
        <span className="h-1.5 w-2/3 rounded-full" style={{ background: c.muted }} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <span className="h-1.5 w-1/3 rounded-full" style={{ background: c.strong }} />
        <div className="flex flex-1 gap-1.5">
          <div
            className="flex flex-1 flex-col gap-1 rounded-md p-1.5"
            style={{ background: c.surface, border: `1px solid ${c.border}` }}
          >
            <span className="h-1 w-1/2 rounded-full" style={{ background: c.strong }} />
            <span className="h-1 w-full rounded-full" style={{ background: c.muted }} />
          </div>
          <div
            className="flex flex-1 flex-col gap-1 rounded-md p-1.5"
            style={{ background: c.surface, border: `1px solid ${c.border}` }}
          >
            <span className="h-1 w-2/3 rounded-full" style={{ background: c.strong }} />
            <span className="h-1 w-3/4 rounded-full" style={{ background: c.accent }} />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Full appearance picker with previews. Used on the Account settings page. */
export const AppearanceCard = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-[15px] font-bold text-gray-800">Appearance</h2>
        <p className="text-[12px] text-gray-500">
          Choose how the workspace looks on this device. Your choice is remembered.
        </p>
      </div>

      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        {OPTIONS.map(({ value, label, hint, icon: Icon }) => {
          const selected = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(value)}
              className={`group text-left rounded-xl border-2 p-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3F8CFF] ${
                selected
                  ? "border-[#3F8CFF] bg-[#3F8CFF]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <ThemePreview mode={value} />
              <div className="mt-2.5 flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${selected ? "text-[#3F8CFF]" : "text-gray-500"}`} />
                  <div>
                    <p className="text-[13px] font-bold leading-tight text-gray-800">{label}</p>
                    <p className="text-[11px] leading-tight text-gray-500">{hint}</p>
                  </div>
                </div>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected ? "border-[#3F8CFF] bg-[#3F8CFF] text-white" : "border-gray-300 text-transparent"
                  }`}
                >
                  <FiCheck className="w-3 h-3" strokeWidth={3} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** Compact Light/Dark switch for tight headers. */
export const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center rounded-full bg-[#E6EDF5] p-1 ${className}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selected ? "bg-[#3F8CFF] text-white" : "text-[#7D8592] hover:text-[#0A1629]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default AppearanceCard;
