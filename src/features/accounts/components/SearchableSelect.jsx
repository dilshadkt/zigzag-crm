import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiPlus, FiSearch } from "react-icons/fi";
import { inputCls } from "./ui";

/**
 * A select box you can search and drive from the keyboard.
 *
 * Closed:  Enter / Space / Arrow Down opens it, or just start typing to search.
 * Open:    Arrow Up/Down (Home/End) move, Enter picks, Esc closes, Tab leaves.
 *
 * options: [{ value, label, hint? }]. Pass `onCreate(query)` to show an
 * "Add new" row at the bottom, and `clearLabel` to allow picking "nothing".
 */
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  clearLabel,
  onCreate,
  createLabel = "Add new",
  emptyText = "No matches",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  // Everything the list can show, in order: clear row, matches, create row
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? options.filter((o) => `${o.label} ${o.hint || ""}`.toLowerCase().includes(q))
      : options;
    const out = [];
    if (clearLabel && !q) out.push({ kind: "clear", value: "", label: clearLabel });
    matches.forEach((o) => out.push({ kind: "option", ...o }));
    if (onCreate) {
      out.push({
        kind: "create",
        label: q ? `${createLabel} "${query.trim()}"` : `${createLabel}…`,
      });
    }
    return out;
  }, [options, query, clearLabel, onCreate, createLabel]);

  const close = (refocus = true) => {
    setOpen(false);
    setQuery("");
    if (refocus) buttonRef.current?.focus();
  };

  const openList = (initialQuery = "") => {
    if (disabled) return;
    setQuery(initialQuery);
    const index = initialQuery ? 0 : Math.max(0, options.findIndex((o) => o.value === value) + (clearLabel ? 1 : 0));
    setActive(index);
    setOpen(true);
  };

  const choose = (row) => {
    if (!row) return;
    if (row.kind === "create") {
      const q = query.trim();
      close(false);
      onCreate(q);
      return;
    }
    onChange(row.value);
    close();
  };

  // Focus the search box on open; close on a click outside
  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlighted row inside the visible part of the list
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open, rows.length]);

  const onButtonKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      openList(e.key);
    }
  };

  const onInputKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % rows.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + rows.length) % rows.length);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(rows.length - 1);
        break;
      case "Enter":
        e.preventDefault(); // don't submit the surrounding form
        choose(rows[active]);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation(); // close this list, not the drawer behind it
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`${inputCls} flex w-full items-center justify-between gap-2 text-left disabled:opacity-60`}
      >
        <span className={`truncate ${selected ? "" : "text-slate-400"}`}>{selected ? selected.label : placeholder}</span>
        <FiChevronDown className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="relative border-b border-slate-100">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder={searchPlaceholder}
              aria-controls={listId}
              aria-activedescendant={`${listId}-${active}`}
              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <ul id={listId} ref={listRef} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {rows.length === 1 && rows[0].kind === "create" && (
              <li className="px-3 py-2 text-xs text-slate-400" aria-hidden="true">{emptyText}</li>
            )}
            {rows.map((row, i) => {
              const isActive = i === active;
              const isSelected = row.kind !== "create" && row.value === value && (row.kind === "option" || !value);
              return (
                <li
                  key={row.kind === "option" ? row.value : row.kind}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(row)}
                  className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm ${
                    isActive ? "bg-blue-50" : ""
                  } ${row.kind === "create" ? "border-t border-slate-100 font-semibold text-[#3F8CFF]" : "text-slate-700"} ${
                    row.kind === "clear" ? "text-slate-400" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {row.kind === "create" && <FiPlus className="shrink-0" />}
                    <span className="truncate">{row.label}</span>
                    {row.hint && <span className="truncate text-xs text-slate-400">{row.hint}</span>}
                  </span>
                  {isSelected && row.kind === "option" && <FiCheck className="shrink-0 text-[#3F8CFF]" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
