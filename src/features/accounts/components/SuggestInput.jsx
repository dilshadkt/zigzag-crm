import React, { useEffect, useMemo, useRef, useState } from "react";
import { inputCls } from "./ui";

/**
 * A text box that suggests earlier entries as you type. It is still free text:
 * anything can be typed, and picking a suggestion just fills it in.
 *
 * suggestions: [{ label, hint?, ...anything }] - `onPick` gets the whole item.
 * Arrow Up/Down move, Enter or click picks, Esc closes. Enter with nothing
 * highlighted behaves like a normal input (submits the form).
 */
const SuggestInput = ({ value, onChange, onPick, suggestions, placeholder, maxShown = 8, ...rest }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const shown = useMemo(() => {
    const q = value.trim().toLowerCase();
    const matches = q ? suggestions.filter((s) => s.label.toLowerCase().includes(q)) : suggestions;
    // Nothing to offer once the box already holds exactly that entry
    return matches.filter((s) => s.label.toLowerCase() !== q).slice(0, maxShown);
  }, [value, suggestions, maxShown]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const pick = (item) => {
    onPick(item);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (!open || !shown.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % shown.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? shown.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(shown[active]);
    } else if (e.key === "Escape") {
      e.stopPropagation(); // close the list, not the drawer behind it
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <input
        {...rest}
        className={inputCls}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && shown.length > 0}
        aria-autocomplete="list"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && shown.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {shown.map((s, i) => (
            <li
              key={s.label}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(s)}
              className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm text-slate-700 ${
                i === active ? "bg-blue-50" : ""
              }`}
            >
              <span className="truncate">{s.label}</span>
              {s.hint && <span className="shrink-0 truncate text-xs text-slate-400">{s.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SuggestInput;
