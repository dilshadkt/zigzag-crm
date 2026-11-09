import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { Target, X } from "lucide-react";
import { useLeadTargets, useSaveLeadTargets } from "../leads/api";

const FIELDS = [
  { key: "dailyCalls", label: "Calls / day", hint: "Calls and logged follow-ups" },
  { key: "dailyScore", label: "Score / day", hint: "KPI points" },
  { key: "monthlyWon", label: "Deals / month", hint: "Leads marked Won" },
  { key: "monthlyRevenue", label: "Revenue / month (₹)", hint: "Value of won deals" },
];

const asText = (value) => (value === null || value === undefined ? "" : String(value));

// Set the numbers the team is measured against. The team row is the default; anyone with their own
// number uses that instead, and a blank box means "use the team number".
const TargetsModal = ({ isOpen, onClose, focusUserId }) => {
  const { data, isLoading } = useLeadTargets(isOpen);
  const save = useSaveLeadTargets();
  const [values, setValues] = useState({});

  const original = useMemo(() => {
    if (!data) return {};
    const map = { team: { ...data.team } };
    (data.people || []).forEach((person) => {
      map[person.userId] = Object.fromEntries(FIELDS.map((field) => [field.key, person[field.key]]));
    });
    return map;
  }, [data]);

  useEffect(() => {
    if (!isOpen || !data) return;
    const next = {};
    Object.entries(original).forEach(([id, row]) => {
      next[id] = Object.fromEntries(FIELDS.map((field) => [field.key, asText(row[field.key])]));
    });
    setValues(next);
  }, [isOpen, data, original]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setValue = (id, field, text) =>
    setValues((current) => ({ ...current, [id]: { ...current[id], [field]: text } }));

  const placeholderFor = (id, field) => {
    if (id === "team") return field === "dailyScore" ? `${data?.ruleDailyTarget ?? ""} (rules)` : "No target";
    const team = values.team?.[field];
    if (team) return `${team} (team)`;
    return field === "dailyScore" ? `${data?.ruleDailyTarget ?? ""} (rules)` : "No target";
  };

  const submit = async () => {
    const entries = [];
    for (const [id, row] of Object.entries(values)) {
      const changed = {};
      for (const field of FIELDS) {
        const now = row[field.key].trim();
        const before = asText(original[id]?.[field.key]);
        if (now === before) continue;
        if (now !== "" && (!Number.isFinite(Number(now)) || Number(now) < 0)) {
          toast.error(`${field.label}: enter a number, or leave it blank`);
          return;
        }
        changed[field.key] = now === "" ? null : Number(now);
      }
      if (Object.keys(changed).length) entries.push({ userId: id === "team" ? null : id, ...changed });
    }
    if (!entries.length) {
      onClose();
      return;
    }
    try {
      await save.mutateAsync(entries);
      toast.success("Targets saved");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save the targets");
    }
  };

  const people = data?.people || [];

  // A plain function (not a component) so typing in a box never remounts the row and drops focus
  const renderRow = ({ id, title, subtitle, highlight }) => (
    <div
      key={id}
      className={`rounded-2xl border p-3 ${highlight ? "border-[#3f8cff]/40 bg-blue-50/40" : "border-slate-100 bg-white"}`}
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="truncate text-xs font-bold text-slate-800">{title}</p>
        {subtitle && <p className="truncate text-[10px] text-slate-400">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-0.5 block text-[10px] font-semibold text-slate-500">{field.label}</span>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={values[id]?.[field.key] ?? ""}
              onChange={(event) => setValue(id, field.key, event.target.value)}
              placeholder={placeholderFor(id, field.key)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-300 focus:border-[#3f8cff] focus:bg-white"
            />
          </label>
        ))}
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Sales team targets"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-[#0A1629]">
              <Target className="h-4 w-4 text-[#3f8cff]" />
              Sales team targets
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              The team row applies to everyone. Fill a person&apos;s own row to give them a different number; leave it blank to
              use the team one.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50/60 px-5 py-4">
          {isLoading && <div className="h-40 animate-pulse rounded-2xl bg-white" />}
          {!isLoading && (
            <>
              {renderRow({
                id: "team",
                title: "Team default",
                subtitle: "Applies to each person without their own target",
                highlight: true,
              })}
              {people.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-400">
                  No one is on the sales team yet. Give a position access to My Calls in Settings → Positions.
                </p>
              )}
              {[...people]
                .sort((a, b) => (a.userId === focusUserId ? -1 : b.userId === focusUserId ? 1 : 0))
                .map((person) => renderRow({ id: person.userId, title: person.name, subtitle: person.position }))}
            </>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
          <p className="hidden text-[11px] text-slate-400 sm:block">
            Revenue and deals are monthly. Calls and score are per working day.
          </p>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={save.isPending || isLoading}
              className="rounded-xl bg-[#3f8cff] px-5 py-2 text-xs font-bold text-white hover:bg-[#337ae6] disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save targets"}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default TargetsModal;
