import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { Card, EmptyState, ErrorState, PageHeader, Spinner, btnPrimary, inputCls } from "../../accounts/components/ui";
import { useLeadClients, useSaveLeadClients } from "../hooks/useAcademy";

/** Which clients' leads belong to the academy and can become students. */
const Settings = () => {
  const { data, isLoading, isError, error, refetch } = useLeadClients();
  const save = useSaveLeadClients();
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const saved = useMemo(() => data?.selected || [], [data]);
  useEffect(() => setSelected(saved), [saved]);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const dirty = selected.length !== saved.length || selected.some((id) => !saved.includes(id));
  const q = search.trim().toLowerCase();
  // ticked clients stay on top
  const clients = (data.clients || [])
    .filter((c) => c.name.toLowerCase().includes(q))
    .sort((a, b) => Number(saved.includes(b._id)) - Number(saved.includes(a._id)));
  const toggle = (id) => setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Connect the academy to your lead screens" />
      <Card
        title="Academy lead clients"
        subtitle="Leads of the clients ticked here get a “Convert” button in Leads and My Calls, for staff who can manage students."
        actions={
          <button className={btnPrimary} onClick={() => save.mutate(selected)} disabled={!dirty || save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </button>
        }
      >
        <div className="relative mb-3">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${inputCls} pl-9`} placeholder="Search clients" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {clients.length === 0 ? (
          <EmptyState icon={FiUserPlus} title="No clients found" />
        ) : (
          <ul className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {clients.map((c) => (
              <li key={c._id}>
                <label className="flex items-center gap-3 px-1 py-2.5 cursor-pointer text-sm text-slate-700">
                  <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} className="w-4 h-4 accent-[#3F8CFF]" />
                  <span className={selected.includes(c._id) ? "font-semibold" : ""}>{c.name}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-400 mt-3">
          {selected.length ? `${selected.length} selected` : "None selected: no lead shows the button."}
        </p>
      </Card>
    </div>
  );
};

export default Settings;
