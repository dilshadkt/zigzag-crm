import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { personName } from "../utils";

const MentionPicker = ({ employees = [], value = [], onChange, disabled = false }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedIds = useMemo(() => new Set(value.map(String)), [value]);
  const selected = employees.filter((person) => selectedIds.has(String(person._id)));
  const matches = employees
    .filter((person) => {
      if (selectedIds.has(String(person._id))) return false;
      return personName(person).toLowerCase().includes(query.trim().toLowerCase());
    })
    .sort((a, b) => personName(a).localeCompare(personName(b)));

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const add = (id) => {
    onChange([...value, id]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={rootRef}>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {selected.length === 0 && <span className="text-xs text-slate-400">No one mentioned</span>}
        {selected.map((person) => (
          <span
            key={person._id}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700"
          >
            {personName(person)}
            {!disabled && (
              <button type="button" onClick={() => onChange(value.filter((id) => String(id) !== String(person._id)))} aria-label={`Remove ${personName(person)}`}>
                <FiX className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="relative">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Mention someone"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
          />
          {open && (
            <div className="mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {matches.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">No matching people</p>
              ) : (
                matches.map((person) => (
                  <button
                    key={person._id}
                    type="button"
                    onClick={() => add(person._id)}
                    className="block w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {personName(person)}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentionPicker;
