import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { Briefcase, Check, ChevronDown, Search, X } from "lucide-react";
import { useLeadClientAccess, useSaveLeadClientAccess } from "../leads/api";
import { initials } from "./helpers";

const sameSet = (a = [], b = []) => a.length === b.length && a.every((id) => b.includes(id));

// Pick which clients each salesperson works on. Their own Lead Dashboard then lists only
// those clients. A person with none picked sees the clients their leads are already in.
const ClientsModal = ({ isOpen, onClose }) => {
  const { data, isLoading: firstLoad, isFetching } = useLeadClientAccess(isOpen);
  // Also treat a refetch as loading, so a reopened modal never shows (or saves against) out-of-date picks
  const isLoading = firstLoad || isFetching;
  const save = useSaveLeadClientAccess();
  const [values, setValues] = useState({}); // userId -> picked project ids
  const [openId, setOpenId] = useState(null); // person whose picker is open
  const [query, setQuery] = useState("");

  const projects = useMemo(() => data?.projects || [], [data]);
  const nameOf = useMemo(() => new Map(projects.map((project) => [project._id, project.name])), [projects]);
  const people = useMemo(() => data?.people || [], [data]);
  const canEdit = data?.canEdit !== false;

  useEffect(() => {
    if (!isOpen || !data) return;
    setValues(Object.fromEntries((data.people || []).map((person) => [person.userId, person.projectIds])));
    setOpenId(null);
    setQuery("");
  }, [isOpen, data]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggle = (userId, projectId) =>
    setValues((current) => {
      const now = current[userId] || [];
      return {
        ...current,
        [userId]: now.includes(projectId) ? now.filter((id) => id !== projectId) : [...now, projectId],
      };
    });

  const clear = (userId) => setValues((current) => ({ ...current, [userId]: [] }));

  const submit = async () => {
    const entries = people
      .filter((person) => !sameSet(values[person.userId], person.projectIds))
      .map((person) => ({ userId: person.userId, projects: values[person.userId] || [] }));
    if (!entries.length) {
      onClose();
      return;
    }
    try {
      await save.mutateAsync(entries);
      toast.success("Clients saved");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save the clients");
    }
  };

  const needle = query.trim().toLowerCase();
  const shownProjects = needle ? projects.filter((project) => project.name.toLowerCase().includes(needle)) : projects;

  // A plain function (not a component) so typing in the search box never remounts the row
  const renderRow = (person) => {
    const picked = values[person.userId] || [];
    const open = openId === person.userId;
    return (
      <div key={person.userId} className="rounded-2xl border border-slate-100 bg-white p-3">
        <div className="flex items-start gap-3">
          {person.profileImage ? (
            <img src={person.profileImage} alt="" className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#3f8cff]">
              {initials(person.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-800">{person.name}</p>
            <p className="truncate text-[10px] text-slate-400">{person.position || "Sales"}</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {picked.length > 0 ? (
                picked.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#3f8cff]"
                  >
                    {nameOf.get(id) || "Client"}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => toggle(person.userId, id)}
                        aria-label={`Remove ${nameOf.get(id) || "client"}`}
                        className="rounded-full p-0.5 hover:bg-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400">
                  {person.autoProjectIds.length > 0
                    ? `Automatic: ${person.autoProjectIds
                        .map((id) => nameOf.get(id))
                        .filter(Boolean)
                        .join(", ")}`
                    : "Automatic: no leads yet, so no clients"}
                </span>
              )}
            </div>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setOpenId(open ? null : person.userId);
                setQuery("");
              }}
              aria-expanded={open}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
            >
              {open ? "Done" : "Choose clients"}
              <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {open && (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2">
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search clients"
                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
              {picked.length > 0 && (
                <button type="button" onClick={() => clear(person.userId)} className="shrink-0 text-[11px] font-semibold text-slate-400 hover:text-rose-500">
                  Clear all
                </button>
              )}
            </div>
            <div className="max-h-52 overflow-y-auto">
              {shownProjects.length === 0 && <p className="px-2 py-3 text-center text-xs text-slate-400">No matching clients.</p>}
              {shownProjects.map((project) => {
                const on = picked.includes(project._id);
                return (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() => toggle(person.userId, project._id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs ${
                      on ? "bg-blue-50 font-semibold text-[#3f8cff]" : "text-slate-700 hover:bg-white"
                    }`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-[#3f8cff] bg-[#3f8cff] text-white" : "border-slate-300 bg-white"}`}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <span className="truncate">{project.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Clients for each salesperson"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-[#0A1629]">
              <Briefcase className="h-4 w-4 text-[#3f8cff]" />
              Clients for each salesperson
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Pick the clients whose leads a salesperson works on. Their own Lead Dashboard lists only those clients. Leave it empty
              and it shows the clients their leads are already in.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50/60 px-5 py-4">
          {isLoading && <div className="h-40 animate-pulse rounded-2xl bg-white" />}
          {!isLoading && people.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-400">
              No one is on the sales team yet. Give a position access to My Calls in Settings → Positions.
            </p>
          )}
          {!isLoading && people.map(renderRow)}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
          <p className="hidden text-[11px] text-slate-400 sm:block">This limits what their dashboard shows; it does not change which leads they own.</p>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">
              Cancel
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={submit}
                disabled={save.isPending || isLoading}
                className="rounded-xl bg-[#3f8cff] px-5 py-2 text-xs font-bold text-white hover:bg-[#337ae6] disabled:opacity-60"
              >
                {save.isPending ? "Saving…" : "Save clients"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default ClientsModal;
