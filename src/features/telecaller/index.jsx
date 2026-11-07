import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiExternalLink,
  FiColumns,
  FiCheckSquare,
  FiEdit3,
  FiPhone,
  FiPlay,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import {
  useGetLeadStatuses,
  useGetMyLeadDesk,
  useLogLeadInteraction,
  useUpdateLead,
} from "../leads/api";import PipelineBoard from "./components/PipelineBoard";
import LeadTaskList from "./components/LeadTaskList";
import KpiScoreCard from "./components/KpiScoreCard";
import CreateLeadTaskModal from "../leadDetails/components/CreateLeadTaskModal";
import LeadInteractionModal from "../leadDetails/components/LeadInteractionModal";
import ClosingFields from "../leadDetails/components/ClosingFields";
import TodaySummary from "./components/TodaySummary";
import WhatsAppMenu from "./components/WhatsAppMenu";
import CallQueue from "./components/CallQueue";

const CALL_TABS = [
  { id: "today", title: "Today", path: "/my-calls", icon: FiCalendar },
  { id: "overdue", title: "Overdue", path: "/my-calls/overdue", icon: FiAlertCircle },
  { id: "upcoming", title: "Upcoming", path: "/my-calls/upcoming", icon: FiClock },
  { id: "leads", title: "My leads", path: "/my-calls/leads", icon: FiUsers },
  { id: "pipeline", title: "Pipeline", path: "/my-calls/pipeline", icon: FiColumns },
  { id: "tasks", title: "Tasks", path: "/my-calls/tasks", icon: FiCheckSquare },
];

const LEAD_FILTERS = [
  { id: "open", label: "Open" },
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

const QuickOutcomes = ({ lead, onQuick, onClose, onTask, disabled }) => (
  <div className="mt-1.5 flex flex-wrap gap-1.5 lg:mt-2">
    <button
      type="button"
      onClick={() => onTask(lead)}
      className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
    >
      + Task
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onQuick(lead, "noAnswer")}
      className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
    >
      No answer · retry in 2h
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onQuick(lead, "tomorrow")}
      className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
    >
      Call tomorrow 10 AM
    </button>
    <button
      type="button"
      onClick={() => onClose(lead, "won")}
      className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
    >
      Won
    </button>
    <button
      type="button"
      onClick={() => onClose(lead, "lost")}
      className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100"
    >
      Lost
    </button>
  </div>
);

const CloseLeadModal = ({ target, saving, onCancel, onConfirm }) => {
  const [values, setValues] = useState({});
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setValues({});
    setNote("");
    setError("");
  }, [target]);

  if (!target) return null;
  const won = target.kind === "won";

  const submit = () => {
    if (!won && !values.lostReason) {
      setError("Select a reason");
      return;
    }
    if (won && values.dealValue && Number(values.dealValue) < 0) {
      setError("Deal value cannot be negative");
      return;
    }
    setError("");
    onConfirm({ ...values, note });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <h3 className="text-base font-bold text-slate-800">
          {won ? "Mark as won" : "Mark as lost"} · {target.lead.name || "Lead"}
        </h3>
        <div className="mt-4 space-y-3">
          <ClosingFields
            kind={target.kind}
            values={values}
            onChange={setValues}
            errors={{ lostReason: error && !won ? error : "", dealValue: error && won ? error : "" }}
          />
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Note (optional)"
            className="h-20 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#3f8cff]"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
              won ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {saving ? "Saving…" : won ? "Confirm won" : "Confirm lost"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const FollowUpCard = ({ lead, overdue, onOpen, onLog, onQuick, onClose, onTask, busy, agent }) => {
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
        <WhatsAppMenu phone={phone} name={lead.name} agent={agent} />
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
      <QuickOutcomes lead={lead} onQuick={onQuick} onClose={onClose} onTask={onTask} disabled={busy} />
    </article>
  );
};

const EmptyState = ({ children }) => (
  <div className="rounded-xl border border-slate-200/60 bg-white px-3 py-6 text-center text-sm text-slate-400 lg:px-4 lg:py-10">
    {children}
  </div>
);

const CallerFilter = ({ value, callers, onChange, variant = "default" }) => {
  const isHeader = variant === "header";
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
    <div ref={rootRef} className={isHeader ? "relative" : "relative w-auto max-w-full lg:w-[260px]"}>
      {!isHeader && <p className="mb-1 hidden text-xs font-semibold text-slate-500 lg:block">Employee</p>}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={
          isHeader
            ? "flex h-11 sm:h-12 max-w-[220px] items-center gap-2 rounded-[14px] bg-white px-3 text-left transition-colors hover:bg-gray-50"
            : "flex w-auto max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white py-0.5 pl-0.5 pr-1.5 text-left hover:border-slate-300 lg:w-full lg:gap-2 lg:rounded-xl lg:px-2.5 lg:py-2"
        }
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
        <div
          className={
            isHeader
              ? "absolute right-0 z-50 mt-2 w-[280px] rounded-xl border border-slate-200/70 bg-white p-2 shadow-lg"
              : "absolute right-0 z-30 mt-1 w-56 rounded-xl border border-slate-200/70 bg-white p-1.5 shadow-lg lg:left-0 lg:right-auto lg:mt-1.5 lg:w-[280px] lg:p-2"
          }
        >
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
      <div className="grid h-12 grid-cols-6">
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
  const { pathname } = useLocation();
  // Remember where the lead was opened from so Back returns here, not to the main Leads page
  const goToLead = (leadId) => navigate(`/leads/${leadId}`, { state: { from: pathname } });
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canFilter = user?.role === "company-admin" || hasPermission("leads", "viewAll");
  const [queue, setQueue] = useState("open");
  const [statusFilter, setStatusFilter] = useState("");
  const [closeTarget, setCloseTarget] = useState(null);
  const [queueLeads, setQueueLeads] = useState(null);
  const [taskLead, setTaskLead] = useState(null);
  const [showDoneTasks, setShowDoneTasks] = useState(false);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeLead, setActiveLead] = useState(null);
  const [headerSlot, setHeaderSlot] = useState(null);
  useEffect(() => {
    setHeaderSlot(document.getElementById("header-date-slot"));
  }, []);
  const [employeeId, setEmployeeId] = useState(() => sessionStorage.getItem(EMPLOYEE_FILTER_KEY) || "all");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, queue, statusFilter, view, employeeId]);

  useEffect(() => {
    if (canFilter) sessionStorage.setItem(EMPLOYEE_FILTER_KEY, employeeId);
  }, [canFilter, employeeId]);

  const { data, isLoading, isError } = useGetMyLeadDesk({
    section: view,
    queue: view === "leads" ? queue : "all",
    ...(view === "leads" && statusFilter ? { status: statusFilter } : {}),
    ...(view === "tasks" ? { done: showDoneTasks } : {}),
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
  const { mutate: updateLead } = useUpdateLead();
  const queryClient = useQueryClient();

  const moveToStage = (lead, stage) => {
    if (stage.category === "Won" || stage.category === "Lost") {
      handleCloseRequest(lead, stage.category === "Won" ? "won" : "lost");
      return;
    }
    const projectId = String(lead.project?._id || lead.project || "");
    const match =
      stage.statuses.find((status) => status.project && String(status.project) === projectId) ||
      stage.statuses.find((status) => !status.project) ||
      stage.statuses[0];
    updateLead(
      { leadId: lead._id, leadData: { status: match.id } },
      {
        onSuccess: () => {
          toast.success(`Moved to ${stage.name}`);
          queryClient.invalidateQueries({ queryKey: ["telecallerDesk"] });
        },
        onError: (error) => toast.error(error?.response?.data?.message || "Could not move the lead"),
      }
    );
  };

  const firstLoad = isLoading && !data;
  const statuses = statusesData?.data || [];

  const openLead = (lead) => {
    if (lead?._id) goToLead(lead._id);
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

  const idOf = (status) => status?.id || status?._id;
  const findByCategory = (category) => statuses.find((status) => status.category === category);

  const handleQuick = (lead, kind) => {
    const when = new Date();
    if (kind === "noAnswer") {
      when.setHours(when.getHours() + 2);
    } else {
      when.setDate(when.getDate() + 1);
      when.setHours(10, 0, 0, 0);
    }
    const contacted = findByCategory("Contacted");
    const statusId = idOf(contacted) || idOf(lead.status);
    logInteraction(
      {
        leadId: lead._id,
        interactionData: {
          note: kind === "noAnswer" ? "Called – no answer" : "Asked to call back tomorrow",
          statusId,
          scheduled: when.toISOString(),
          isFollowUp: true,
          // A no-answer attempt is not a conversation, so it must not earn "valid call" points
          ...(kind === "noAnswer" ? { outcome: "no_answer", talkSeconds: 0 } : {}),
        },
      },
      {
        onSuccess: () => toast.success(`Next call: ${format(when, "EEE h:mm a")}`),
        onError: (error) => toast.error(error?.response?.data?.message || "Could not save"),
      }
    );
  };

  const handleCloseRequest = (lead, kind) => {
    if (!findByCategory(kind === "won" ? "Won" : "Lost")) {
      toast.error(`No "${kind === "won" ? "Won" : "Lost"}" status is configured. Add one in Lead Settings.`);
      return;
    }
    setCloseTarget({ lead, kind });
  };

  const confirmClose = ({ dealValue, lostReason, reengageOn, note }) => {
    const { lead, kind } = closeTarget;
    const status = findByCategory(kind === "won" ? "Won" : "Lost");
    logInteraction(
      {
        leadId: lead._id,
        interactionData: {
          note,
          statusId: idOf(status),
          isFollowUp: false,
          ...(kind === "won"
            ? { dealValue: dealValue ? Number(dealValue) : undefined }
            : {
                lostReason,
                reengageOn: reengageOn ? new Date(reengageOn).toISOString() : null,
              }),
        },
      },
      {
        onSuccess: () => {
          setCloseTarget(null);
          if (kind === "won") {
            toast(
              (t) => (
                <span className="flex items-center gap-3 text-sm">
                  Lead marked as won 🎉
                  <button
                    type="button"
                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate(`/accounts/proposals/new?leadId=${lead._id}`);
                    }}
                  >
                    Create proposal
                  </button>
                </span>
              ),
              { duration: 8000 }
            );
          } else {
            toast.success("Lead marked as lost");
          }
        },
        onError: (error) => toast.error(error?.response?.data?.message || "Could not save"),
      }
    );
  };

  const cardsForView = () => {
    if (view === "today") return data?.todayFollowUps || [];
    if (view === "overdue") return data?.overdueFollowUps || [];
    if (view === "upcoming") return data?.upcomingFollowUps || [];
    return [];
  };

  const cards = cardsForView();

  return (
    <div
      className={
        view === "pipeline"
          ? "flex h-full flex-col overflow-hidden px-0 pb-14 pt-0 lg:p-0"
          : "h-full overflow-y-auto px-0 pb-16 pt-0 lg:p-0"
      }
    >
      <DeskNav />
      {canFilter &&
        headerSlot &&
        createPortal(
          <CallerFilter
            variant="header"
            value={employeeId}
            callers={data?.callers || []}
            onChange={setEmployeeId}
          />,
          headerSlot
        )}

      {isError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load your leads. Refresh the page and try again.
        </p>
      )}

      {view === "today" && <TodaySummary summary={data?.summary} />}
      {view === "today" && (!canFilter || employeeId !== "all") && (
        <KpiScoreCard userId={canFilter ? employeeId : undefined} />
      )}

      {(view === "today" || view === "overdue") && cards.length > 0 && (
        <div className="mb-2 flex justify-end lg:mb-3">
          <button
            type="button"
            onClick={() => setQueueLeads(cards)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3F8CFF] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2f6bff]"
          >
            <FiPlay className="h-3.5 w-3.5" />
            Start calling ({cards.length})
          </button>
        </div>
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
                <FollowUpCard
                  key={lead._id}
                  lead={lead}
                  onOpen={openLead}
                  onLog={setActiveLead}
                  onQuick={handleQuick}
                  onClose={handleCloseRequest}
                  onTask={setTaskLead}
                  busy={isPending}
                  agent={user?.firstName}
                />
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
                    onClick={() => call.leadId && goToLead(call.leadId)}
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
                onQuick={handleQuick}
                onClose={handleCloseRequest}
                onTask={setTaskLead}
                busy={isPending}
                agent={user?.firstName}
              />
            ))
          )}
        </div>
      )}

      {view === "tasks" && (
        <LeadTaskList
          tasks={data?.tasks || []}
          summary={data?.summary}
          loading={firstLoad}
          showDone={showDoneTasks}
          onToggleDone={setShowDoneTasks}
          onOpenLead={(leadId) => goToLead(leadId)}
          onOpenTask={(taskId) => navigate(`/tasks/${taskId}`)}
        />
      )}

      {view === "pipeline" && (!canFilter || employeeId !== "all") && (
        <div className="shrink-0">
          <KpiScoreCard userId={canFilter ? employeeId : undefined} />
        </div>
      )}
      {view === "pipeline" && (
        <PipelineBoard pipeline={data?.pipeline} loading={firstLoad} onMove={moveToStage} onOpen={openLead} />
      )}

      {view === "leads" && (
        <section className="overflow-hidden rounded-[24px] bg-white">
          <div className="flex flex-wrap items-center gap-2 px-3 py-3 lg:px-5 lg:py-4">
            <p className="hidden shrink-0 text-xs font-medium text-[#7D8592] lg:block">
              {data?.pagination?.total ?? 0} leads
            </p>
            {LEAD_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setQueue(item.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  queue === item.id ? "bg-[#1F1F1F] text-white" : "bg-[#F4F9FD] text-[#7D8592] hover:text-[#1F1F1F]"
                }`}
              >
                {item.label}
              </button>
            ))}
            {(data?.statusBreakdown || []).length > 0 && (
              <>
                <span className="mx-1 hidden h-5 w-px bg-[#E6EDF5] lg:block" />
                {data.statusBreakdown.map((status) => {
                  const active = statusFilter && statusFilter === String(status.id);
                  return (
                    <button
                      key={status.name}
                      type="button"
                      disabled={!status.id}
                      onClick={() => setStatusFilter(active ? "" : String(status.id))}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        active
                          ? "border-[#3F8CFF] bg-[#3F8CFF]/10 text-[#3F8CFF]"
                          : "border-[#D8E0F0] text-[#7D8592] hover:border-slate-300"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
                      {status.name}
                      <span className="font-bold text-slate-900">{status.count}</span>
                    </button>
                  );
                })}
              </>
            )}
            <label className="flex w-full items-center gap-2 rounded-full bg-[#F4F9FD] px-3.5 py-2 lg:ml-auto lg:w-auto lg:min-w-[260px]">
              <FiSearch className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name, phone, client"
                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
          <div className="space-y-1.5 px-2 pb-2 md:hidden">
            {firstLoad ? (
              <div className="h-20 animate-pulse rounded-xl bg-slate-50" />
            ) : (data?.leads || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No leads in this view.</p>
            ) : (
              data.leads.map((lead) => (
                <div
                  key={lead._id}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => openLead(lead)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                      {initial(lead.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-slate-800">{lead.name || "Untitled lead"}</span>
                        <StatusPill status={lead.status} />
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                        <span className="font-semibold text-emerald-700">{lead.phone || "No phone"}</span>{" "}
                        {followUpWhen(lead.scheduled)}
                      </span>
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {lead.phone && (
                      <a
                        href={dialHref(lead.phone)}
                        aria-label={`Call ${lead.name || "lead"}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white"
                      >
                        <FiPhone className="h-4 w-4" />
                      </a>
                    )}
                    <WhatsAppMenu iconOnly phone={lead.phone} name={lead.name} agent={user?.firstName} />
                    <button
                      type="button"
                      onClick={() => setActiveLead(lead)}
                      aria-label={`Log follow-up for ${lead.name || "lead"}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-blue-600"
                    >
                      <FiEdit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskLead(lead)}
                      aria-label={`Add task for ${lead.name || "lead"}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500/15 text-slate-500"
                    >
                      <FiCheckSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-[#F4F9FD] text-[#7D8592]">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">Lead</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">Phone</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">Client</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">Follow-up</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">Calls</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {firstLoad ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading your leads…</td>
                  </tr>
                ) : (data?.leads || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No leads in this view.</td>
                  </tr>
                ) : (
                  data.leads.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => openLead(lead)}
                      className="cursor-pointer border-t border-[#EEF2F8] transition-colors hover:bg-[#F4F9FD]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3F8CFF]/10 text-[11px] font-bold text-[#3F8CFF]">
                            {initial(lead.name)}
                          </span>
                          <span>
                            <span className="block font-semibold text-[#0A1629]">{lead.name || "Untitled lead"}</span>
                            <span className="block text-[11px] text-slate-400">{lead.source || lead.email || ""}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700" onClick={(event) => event.stopPropagation()}>
                        {lead.phone ? (
                          <a href={dialHref(lead.phone)} className="text-[#3F8CFF] hover:underline">{lead.phone}</a>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{lead.project?.name || "—"}</td>
                      <td className="px-5 py-3.5"><StatusPill status={lead.status} /></td>
                      <td className="px-5 py-3.5 text-slate-600">{followUpWhen(lead.scheduled)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{lead.followUpCount || 0}</td>
                      <td className="px-5 py-3.5" onClick={(event) => event.stopPropagation()}>
                        <div className="flex gap-1.5">
                          <WhatsAppMenu compact phone={lead.phone} name={lead.name} agent={user?.firstName} />
                          <button
                            type="button"
                            onClick={() => setActiveLead(lead)}
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Log
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaskLead(lead)}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200"
                          >
                            Task
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCloseRequest(lead, "won")}
                            className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Won
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCloseRequest(lead, "lost")}
                            className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100"
                          >
                            Lost
                          </button>
                        </div>
                      </td>
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
      {queueLeads && (
        <CallQueue
          leads={queueLeads}
          title={view === "overdue" ? "Overdue calls" : "Today's calls"}
          onExit={() => setQueueLeads(null)}
          renderLead={(lead) => (
            <FollowUpCard
              key={lead._id}
              lead={lead}
              overdue={view === "overdue"}
              onOpen={openLead}
              onLog={setActiveLead}
              onQuick={handleQuick}
              onClose={handleCloseRequest}
              onTask={setTaskLead}
              busy={isPending}
              agent={user?.firstName}
            />
          )}
        />
      )}
      <CreateLeadTaskModal lead={taskLead} isOpen={Boolean(taskLead)} onClose={() => setTaskLead(null)} />
      <CloseLeadModal
        target={closeTarget}
        saving={isPending}
        onCancel={() => setCloseTarget(null)}
        onConfirm={confirmClose}
      />
    </div>
  );
};

export default TelecallerDesk;
