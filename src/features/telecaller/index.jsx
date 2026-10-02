import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiAlertCircle,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiExternalLink,
  FiPhone,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import {
  useGetLeadStatuses,
  useGetMyLeadDesk,
  useLogLeadInteraction,
} from "../leads/api";
import LeadInteractionModal from "../leadDetails/components/LeadInteractionModal";

const PAGE_COPY = {
  today: {
    title: "Today",
    subtitle: "Follow-ups scheduled for today",
  },
  overdue: {
    title: "Overdue",
    subtitle: "Follow-ups that are past their date",
  },
  upcoming: {
    title: "Upcoming",
    subtitle: "Follow-ups scheduled after today",
  },
  leads: {
    title: "My leads",
    subtitle: "Every lead assigned to you",
  },
};

const CALL_TABS = [
  { id: "today", title: "Today", path: "/my-calls", icon: FiCalendar },
  { id: "overdue", title: "Overdue", path: "/my-calls/overdue", icon: FiAlertCircle },
  { id: "upcoming", title: "Upcoming", path: "/my-calls/upcoming", icon: FiClock },
  { id: "leads", title: "My leads", path: "/my-calls/leads", icon: FiUsers },
];

const LEAD_FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "Not contacted" },
  { id: "hot", label: "Hot" },
];

const dialHref = (phone) => {
  if (!phone) return "";
  return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
};

const followUpWhen = (value) => {
  if (!value) return "No follow-up set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No follow-up set";
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((day - start) / 86400000);
  const time = format(date, "h:mm a");
  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Tomorrow, ${time}`;
  if (diff === -1) return `Yesterday, ${time}`;
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  return format(date, "EEE, d MMM · h:mm a");
};

const lastSpoke = (value) => {
  if (!value) return "Never contacted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never contacted";
  return `Last contact ${format(date, "d MMM, h:mm a")}`;
};

const initial = (name) => (name || "?").trim().charAt(0).toUpperCase();

const StatusPill = ({ status }) => {
  if (!status?.name) return <span className="text-xs text-slate-400">No status</span>;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color: status.color || "#475569", backgroundColor: `${status.color || "#94a3b8"}22` }}
    >
      {status.name}
    </span>
  );
};

const ScorePill = ({ category }) => {
  if (!category) return null;
  const tones = {
    HOT: "bg-rose-50 text-rose-600",
    WARM: "bg-amber-50 text-amber-700",
    COLD: "bg-sky-50 text-sky-700",
    UNQUALIFIED: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${tones[category] || tones.COLD}`}>
      {category}
    </span>
  );
};

const FollowUpCard = ({ lead, overdue, onOpen, onLog }) => {
  const phone = lead.phone || lead.contact?.phone;
  return (
    <article className={`rounded-xl border bg-white p-2.5 lg:p-4 ${overdue ? "border-amber-200" : "border-slate-200/60"}`}>
      <div className="flex items-start gap-2 lg:gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 lg:h-10 lg:w-10 lg:text-sm">
          {initial(lead.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900">{lead.name || "Untitled lead"}</h3>
            <StatusPill status={lead.status} />
            <ScorePill category={lead.scoreCategory} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {lead.project?.name || "No client"}
            {lead.source ? ` · ${lead.source}` : ""}
            {lead.companyName ? ` · ${lead.companyName}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-2 grid gap-0.5 text-xs text-slate-600 lg:mt-3 lg:gap-1">
        <p className={overdue ? "font-semibold text-amber-700" : "font-semibold text-slate-700"}>
          {followUpWhen(lead.scheduled)}
        </p>
        <p>
          <FiClock className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
          {lastSpoke(lead.lastContactDate)}
          <span className="text-slate-400">
            {" "}
            · {lead.followUpCount ? `${lead.followUpCount} call${lead.followUpCount === 1 ? "" : "s"}` : "Not contacted yet"}
          </span>
        </p>
        {phone && <p className="font-medium text-slate-800">{phone}</p>}
        {lead.email && <p className="hidden truncate text-slate-500 lg:block">{lead.email}</p>}
        {lead.notes && <p className="line-clamp-1 text-slate-500 lg:line-clamp-2">{lead.notes}</p>}
      </div>

      <div className="mt-2 flex gap-1.5 lg:mt-3 lg:gap-2">
        {phone && (
          <a
            href={dialHref(phone)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 lg:gap-1.5 lg:px-3 lg:py-2 lg:text-xs"
          >
            <FiPhone className="h-3.5 w-3.5" />
            Call
          </a>
        )}
        <button
          type="button"
          onClick={() => onLog(lead)}
          className="flex-1 rounded-lg bg-blue-50 px-2 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 lg:px-3 lg:py-2 lg:text-xs"
        >
          Log follow-up
        </button>
        <button
          type="button"
          onClick={() => onOpen(lead)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 lg:px-3 lg:py-2 lg:text-xs"
        >
          Open
          <FiExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
};

const EmptyState = ({ children }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white px-3 py-6 text-center text-sm text-slate-400 lg:px-4 lg:py-10">
    {children}
  </div>
);

const CallerFilter = ({ value, callers, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const selected = callers.find((person) => person._id === value);
  const label = selected
    ? `${selected.firstName || ""} ${selected.lastName || ""}`.trim()
    : "All telecallers";
  const people = callers.filter((person) => {
    const haystack = `${person.firstName || ""} ${person.lastName || ""} ${person.position || ""}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const choose = (next) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative w-auto max-w-full lg:w-[260px]">
      <p className="mb-1 hidden text-xs font-semibold text-slate-500 lg:block">Employee</p>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-auto max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white py-0.5 pl-0.5 pr-1.5 text-left hover:border-slate-300 lg:w-full lg:gap-2 lg:rounded-xl lg:px-2.5 lg:py-2"
      >
        {selected?.profileImage ? (
          <img src={selected.profileImage} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover lg:h-7 lg:w-7" />
        ) : (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 lg:h-7 lg:w-7">
            {selected ? (
              <span className="text-[9px] font-bold lg:text-[11px]">{initial(label)}</span>
            ) : (
              <FiUsers className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
            )}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-semibold text-slate-800 lg:text-sm">{label}</span>
          <span className="hidden truncate text-[11px] text-slate-400 lg:block">
            {selected?.position || "Everyone with My Calls access"}
          </span>
        </span>
        <FiChevronDown className={`h-3 w-3 shrink-0 text-slate-400 transition lg:h-4 lg:w-4 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-xl border border-slate-200/70 bg-white p-1.5 shadow-lg lg:left-0 lg:right-auto lg:mt-1.5 lg:w-[280px] lg:p-2">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
            <FiSearch className="h-3.5 w-3.5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search telecallers"
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => choose("all")}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold ${
                value === "all" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FiUsers className="h-3.5 w-3.5" />
              </span>
              All telecallers
            </button>
            {people.map((person) => {
              const name = `${person.firstName || ""} ${person.lastName || ""}`.trim() || "Unnamed";
              const active = person._id === value;
              return (
                <button
                  key={person._id}
                  type="button"
                  onClick={() => choose(person._id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left ${
                    active ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  {person.profileImage ? (
                    <img src={person.profileImage} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                      {initial(name)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className={`block truncate text-xs font-semibold ${active ? "text-blue-700" : "text-slate-800"}`}>
                      {name}
                    </span>
                    <span className="block truncate text-[11px] text-slate-400">{person.position || "My Calls"}</span>
                  </span>
                </button>
              );
            })}
            {people.length === 0 && (
              <p className="px-2 py-3 text-center text-xs text-slate-400">No matching telecallers.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DeskNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return createPortal(
    <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid h-12 grid-cols-4">
        {CALL_TABS.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (!active) navigate(tab.path);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 ${
                active ? "text-[#3F8CFF]" : "text-slate-400"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-semibold">{tab.title}</span>
            </button>
          );
        })}
      </div>
    </nav>,
    document.body
  );
};

const EMPLOYEE_FILTER_KEY = "telecallerEmployee";

const TelecallerDesk = ({ view = "today" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canFilter = user?.role === "company-admin" || hasPermission("leads", "viewAll");
  const copy = PAGE_COPY[view] || PAGE_COPY.today;
  const [queue, setQueue] = useState("all");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeLead, setActiveLead] = useState(null);
  const [employeeId, setEmployeeId] = useState(() => sessionStorage.getItem(EMPLOYEE_FILTER_KEY) || "all");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, queue, view, employeeId]);

  useEffect(() => {
    if (canFilter) sessionStorage.setItem(EMPLOYEE_FILTER_KEY, employeeId);
  }, [canFilter, employeeId]);

  const { data, isLoading, isError } = useGetMyLeadDesk({
    section: view,
    queue: view === "leads" ? queue : "all",
    page: view === "leads" ? page : 1,
    limit: 15,
    search: view === "leads" ? search : "",
    timezoneOffset: new Date().getTimezoneOffset(),
    ...(canFilter ? { employeeId } : {}),
  });
  const callerIds = (data?.callers || []).map((person) => person._id).join(",");
  useEffect(() => {
    if (!data?.canFilter || employeeId === "all") return;
    if (callerIds && !callerIds.split(",").includes(employeeId)) {
      setEmployeeId("all");
    }
  }, [data?.canFilter, callerIds, employeeId]);

  const { data: statusesData } = useGetLeadStatuses(null);
  const { mutate: logInteraction, isPending } = useLogLeadInteraction();

  const firstLoad = isLoading && !data;
  const statuses = statusesData?.data || [];
  const firstName = user?.firstName || "there";
  const selectedCaller = (data?.callers || []).find((person) => person._id === employeeId);
  const viewerLabel = !canFilter
    ? firstName
    : employeeId === "all"
      ? "All telecallers"
      : `${selectedCaller?.firstName || ""} ${selectedCaller?.lastName || ""}`.trim() || "Telecaller";

  const openLead = (lead) => {
    if (lead?._id) navigate(`/leads/${lead._id}`);
  };

  const saveInteraction = ({ interactionData, leadUpdateData }) => {
    if (!activeLead?._id) return;
    logInteraction(
      { leadId: activeLead._id, interactionData, leadUpdateData },
      {
        onSuccess: () => {
          toast.success("Follow-up saved");
          setActiveLead(null);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message || "Failed to save follow-up");
        },
      }
    );
  };

  const cardsForView = () => {
    if (view === "today") return data?.todayFollowUps || [];
    if (view === "overdue") return data?.overdueFollowUps || [];
    if (view === "upcoming") return data?.upcomingFollowUps || [];
    return [];
  };

  const countForView = () => {
    if (view === "today") return data?.summary?.dueToday || 0;
    if (view === "overdue") return data?.summary?.overdue || 0;
    if (view === "upcoming") return data?.summary?.upcoming || 0;
    return data?.pagination?.total || 0;
  };

  const cards = cardsForView();

  return (
    <div className="h-full overflow-y-auto px-0 pb-16 pt-0 lg:p-5 lg:pb-5">
      <DeskNav />
      <div className="mb-2 flex items-center gap-2 lg:mb-4 lg:items-end lg:justify-between">
        <div className="min-w-0 shrink-0">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold text-slate-900 lg:text-lg">{copy.title}</h1>
            {!firstLoad && (
              <span className="text-xs font-semibold text-slate-400 lg:hidden">{countForView()}</span>
            )}
          </div>
          <p className="hidden truncate text-xs text-slate-500 lg:block lg:text-sm">
            {viewerLabel} · {copy.subtitle} · {format(new Date(), "EEE, d MMM")}
            {!firstLoad && view !== "leads" ? ` · ${countForView()}` : ""}
          </p>
        </div>
        {canFilter && (
          <div className="ml-auto min-w-0 max-w-[48%] lg:ml-0 lg:w-[260px] lg:max-w-none">
            <CallerFilter
              value={employeeId}
              callers={data?.callers || []}
              onChange={setEmployeeId}
            />
          </div>
        )}
      </div>

      {isError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load your leads. Refresh the page and try again.
        </p>
      )}

      {view === "today" && (
        <div className="grid gap-2 lg:grid-cols-3 lg:gap-4">
          <section className="space-y-2 lg:col-span-2 lg:space-y-3">
            {firstLoad ? (
              <div className="h-28 animate-pulse rounded-xl bg-white" />
            ) : cards.length === 0 ? (
              <EmptyState>Nothing scheduled for today.</EmptyState>
            ) : (
              cards.map((lead) => (
                <FollowUpCard key={lead._id} lead={lead} onOpen={openLead} onLog={setActiveLead} />
              ))
            )}
          </section>
          <section className="h-fit rounded-xl border border-slate-200/60 bg-white p-2.5 lg:p-4">
            <h2 className="text-sm font-bold text-slate-800">Logged today</h2>
            <p className="mt-1 text-xs text-slate-400">{data?.summary?.callsToday || 0} calls</p>
            <div className="mt-3 space-y-2">
              {(data?.recentCalls || []).length === 0 ? (
                <p className="text-xs text-slate-400">No calls logged yet today.</p>
              ) : (
                data.recentCalls.map((call) => (
                  <button
                    key={call._id}
                    type="button"
                    onClick={() => call.leadId && navigate(`/leads/${call.leadId}`)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-slate-800">{call.name}</span>
                      <span className="block truncate text-[11px] text-slate-400">{call.phone || call.title}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {call.createdAt ? format(new Date(call.createdAt), "h:mm a") : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {(view === "overdue" || view === "upcoming") && (
        <div className="grid gap-2 lg:gap-3">
          {firstLoad ? (
            <div className="h-28 animate-pulse rounded-xl bg-white" />
          ) : cards.length === 0 ? (
            <EmptyState>
              {view === "overdue" ? "No overdue follow-ups." : "No later follow-ups scheduled."}
            </EmptyState>
          ) : (
            cards.map((lead) => (
              <FollowUpCard
                key={lead._id}
                lead={lead}
                overdue={view === "overdue"}
                onOpen={openLead}
                onLog={setActiveLead}
              />
            ))
          )}
        </div>
      )}

      {view === "leads" && (
        <section className="rounded-xl border border-slate-200/60 bg-white">
          {(data?.statusBreakdown || []).length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-2.5 py-1.5 lg:flex-wrap lg:gap-2 lg:px-4 lg:py-3">
              {data.statusBreakdown.map((status) => (
                <span key={status.name} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
                  {status.name}
                  <span className="font-bold text-slate-900">{status.count}</span>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 lg:gap-3 lg:px-4 lg:py-3">
            <p className="hidden text-xs text-slate-400 lg:block">{data?.pagination?.total ?? 0} leads</p>
            <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 lg:w-auto lg:min-w-[220px] lg:px-3 lg:py-2">
              <FiSearch className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name, phone, client"
                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-2.5 pb-2 lg:gap-2 lg:px-4 lg:pb-3">
            {LEAD_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setQueue(item.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  queue === item.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 px-2 pb-2 md:hidden">
            {firstLoad ? (
              <div className="h-20 animate-pulse rounded-xl bg-slate-50" />
            ) : (data?.leads || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No leads in this view.</p>
            ) : (
              data.leads.map((lead) => (
                <button
                  key={lead._id}
                  type="button"
                  onClick={() => openLead(lead)}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5 text-left"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                    {initial(lead.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-slate-800">{lead.name || "Untitled lead"}</span>
                      <StatusPill status={lead.status} />
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                      {lead.phone ? (
                        <a
                          href={dialHref(lead.phone)}
                          onClick={(event) => event.stopPropagation()}
                          className="shrink-0 font-semibold text-emerald-700"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        <span>No phone</span>
                      )}
                      <span className="truncate">{followUpWhen(lead.scheduled)}</span>
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Lead</th>
                  <th className="px-4 py-2.5 font-bold">Phone</th>
                  <th className="px-4 py-2.5 font-bold">Client</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 font-bold">Follow-up</th>
                  <th className="px-4 py-2.5 font-bold">Calls</th>
                </tr>
              </thead>
              <tbody>
                {firstLoad ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading your leads…</td>
                  </tr>
                ) : (data?.leads || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No leads in this view.</td>
                  </tr>
                ) : (
                  data.leads.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => openLead(lead)}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                            {initial(lead.name)}
                          </span>
                          <span>
                            <span className="block font-semibold text-slate-800">{lead.name || "Untitled lead"}</span>
                            <span className="block text-[11px] text-slate-400">{lead.source || lead.email || ""}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700" onClick={(event) => event.stopPropagation()}>
                        {lead.phone ? (
                          <a href={dialHref(lead.phone)} className="text-emerald-700 hover:underline">{lead.phone}</a>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.project?.name || "—"}</td>
                      <td className="px-4 py-3"><StatusPill status={lead.status} /></td>
                      <td className="px-4 py-3 text-slate-600">{followUpWhen(lead.scheduled)}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.followUpCount || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {(data?.pagination?.pages || 1) > 1 && (
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>
              <span className="text-xs text-slate-500">
                {page} / {data.pagination.pages}
              </span>
              <button
                type="button"
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </section>
      )}

      <LeadInteractionModal
        isOpen={Boolean(activeLead)}
        onClose={() => !isPending && setActiveLead(null)}
        onSave={saveInteraction}
        lead={activeLead}
        statuses={statuses}
        interactionType="followup"
      />
    </div>
  );
};

export default TelecallerDesk;
