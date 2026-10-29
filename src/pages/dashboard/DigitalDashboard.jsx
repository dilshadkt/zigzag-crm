import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiDollarSign,
  FiUsers,
  FiTarget,
  FiActivity,
  FiRefreshCcw,
  FiExternalLink,
  FiSettings,
  FiAlertTriangle,
  FiInstagram,
  FiHeart,
  FiEye,
  FiX,
  FiFolder,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import SmmPanel from "../../components/pages/digital/SmmPanel";
import RadarPanel from "../../components/pages/digital/RadarPanel";
import { useAuth } from "../../hooks/useAuth";
import {
  useGetDigitalDashboard,
  useGetDigitalPoints,
  useGetDigitalRadar,
  useSyncDigitalNow,
  useUpdateClientAdConfig,
} from "../../api/hooks/dashboard";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "performance", label: "Performance Marketing" },
  { id: "social", label: "Social Media" },
  { id: "radar", label: "Radar" },
  { id: "points", label: "KPI Points" },
];

const DAY_OPTIONS = [7, 30, 90];

const STATUS_STYLES = {
  green: { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", label: "On target" },
  amber: { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700", label: "Watch" },
  red: { dot: "bg-red-500", chip: "bg-red-50 text-red-600", label: "Over target" },
  none: { dot: "bg-gray-300", chip: "bg-gray-100 text-gray-500", label: "No target" },
};

const inr = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const inr2 = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const compact = (n) =>
  Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);

const initials = (u) =>
  `${(u?.firstName || "")[0] || ""}${(u?.lastName || "")[0] || ""}`.toUpperCase();
const fullName = (u) => `${u?.firstName || ""} ${u?.lastName || ""}`.trim();

const Card = ({ title, subtitle, right, children, className = "" }) => (
  <div className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0">
        <h3 className="text-base md:text-lg font-semibold text-[#0A1629]">{title}</h3>
        {subtitle && <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const StatTile = ({ icon: Icon, value, title, subtitle, bg, text }) => (
  <div className="rounded-2xl p-3 md:p-4 flex flex-col items-start text-left bg-gray-50 border border-gray-100 min-w-0">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${text}`}>
      <Icon className="w-[18px] h-[18px]" />
    </div>
    <div className="text-2xl md:text-[28px] font-bold text-[#0A1629] mt-4 leading-none">{value}</div>
    <p className="text-xs md:text-sm font-semibold text-gray-800 mt-2 leading-tight line-clamp-1 w-full">{title}</p>
    <p className="text-[11px] md:text-xs text-gray-500 mt-0.5 leading-tight line-clamp-1 w-full">{subtitle}</p>
  </div>
);

const EmptyState = ({ children }) => (
  <div className="py-10 text-center text-sm text-gray-500">{children}</div>
);

const Shimmer = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />
);

const StatusPill = ({ status, variancePct }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.none;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg ${s.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
      {variancePct != null && ` (${variancePct > 0 ? "+" : ""}${variancePct}%)`}
    </span>
  );
};

const Avatar = ({ user, size = "w-7 h-7" }) =>
  user?.profileImage ? (
    <img src={user.profileImage} alt={fullName(user)} className={`${size} rounded-full object-cover`} />
  ) : (
    <span className={`${size} rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold flex items-center justify-center`}>
      {initials(user)}
    </span>
  );

const ClientThumb = ({ client }) =>
  client.thumbImg ? (
    <img src={client.thumbImg} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0 bg-white border border-gray-100" />
  ) : (
    <span className="w-9 h-9 rounded-xl shrink-0 bg-blue-50 text-blue-600 flex items-center justify-center">
      <FiFolder />
    </span>
  );

// ---------------------------------------------------------------- config modal
const AdConfigModal = ({ client, team, onClose }) => {
  const update = useUpdateClientAdConfig();
  const [form, setForm] = useState({
    facebookAdAccountId: client.metaAccountId || "",
    googleAdsCustomerId: client.googleCustomerId || "",
    dailyBudgetLimit: client.dailyBudgetLimit || "",
    targetCpl: client.targetCpl || "",
    maxAllowedCpl: client.maxAllowedCpl || "",
    assignedMarketer: client.marketer?._id || "",
  });
  const [error, setError] = useState("");
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = { projectId: client._id, ...form };
      // Only admins get the marketer list, so don't overwrite it for others.
      if (!team.length) delete body.assignedMarketer;
      await update.mutateAsync(body);
      onClose();
    } catch (err) {
      setError(err?.message || "Could not save changes");
    }
  };

  const field = "h-10 rounded-xl bg-gray-50 border border-gray-100 px-3 text-sm w-full focus:outline-none focus:bg-white";
  const label = "text-xs font-medium text-gray-600 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A1629]">Ad settings</h3>
            <p className="text-sm text-gray-500">{client.name}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={label}>Meta ad account ID</label>
            <input className={field} value={form.facebookAdAccountId} onChange={set("facebookAdAccountId")} placeholder="act_1234567890" />
          </div>
          <div className="col-span-2">
            <label className={label}>Google Ads customer ID</label>
            <input className={field} value={form.googleAdsCustomerId} onChange={set("googleAdsCustomerId")} placeholder="123-456-7890" />
          </div>
          <div>
            <label className={label}>Daily budget limit (₹)</label>
            <input type="number" min="0" step="any" className={field} value={form.dailyBudgetLimit} onChange={set("dailyBudgetLimit")} />
          </div>
          <div>
            <label className={label}>Target CPL (₹)</label>
            <input type="number" min="0" step="any" className={field} value={form.targetCpl} onChange={set("targetCpl")} />
          </div>
          <div className="col-span-2">
            <label className={label}>Max allowed CPL (₹)</label>
            <input type="number" min="0" step="any" className={field} value={form.maxAllowedCpl} onChange={set("maxAllowedCpl")} />
          </div>
          {team.length > 0 && (
            <div className="col-span-2">
              <label className={label}>Assigned marketer</label>
              <select className={field} value={form.assignedMarketer} onChange={set("assignedMarketer")}>
                <option value="">Unassigned</option>
                {team.map((u) => (
                  <option key={u._id} value={u._id}>
                    {fullName(u)} · {u.position}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700">
            Cancel
          </button>
          <button type="submit" disabled={update.isPending} className="h-10 px-4 rounded-xl bg-[#3F8CFF] text-white text-sm font-medium disabled:opacity-60">
            {update.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ------------------------------------------------------------------- tabs
const Overview = ({ data }) => {
  const { ads, social, leadTrend, leadPlatforms, clients, statusCounts } = data;
  const attention = clients.filter((c) => c.status === "red" || c.status === "amber").slice(0, 6);

  const tiles = [
    { icon: FiDollarSign, value: inr(ads.spend), title: "Ad Spend", subtitle: `of ${inr(ads.budget)} budget`, bg: "bg-blue-50", text: "text-blue-600" },
    { icon: FiUsers, value: compact(ads.leads), title: "Leads", subtitle: `${ads.leadsInRange} in last ${data.days} days`, bg: "bg-emerald-50", text: "text-emerald-600" },
    { icon: FiTarget, value: inr(ads.cpl), title: "Blended CPL", subtitle: ads.cpr != null ? `${inr(ads.cpr)} per result` : "Spend ÷ leads", bg: "bg-purple-50", text: "text-purple-600" },
    { icon: FiActivity, value: `${ads.activeCampaigns}/${ads.totalCampaigns}`, title: "Active Campaigns", subtitle: `CTR ${ads.ctr}%`, bg: "bg-orange-50", text: "text-orange-600" },
    { icon: FiInstagram, value: social.published, title: "Posts Published", subtitle: `${social.scheduled} scheduled`, bg: "bg-pink-50", text: "text-pink-600" },
    { icon: FiEye, value: compact(social.reach), title: "Social Reach", subtitle: `${compact(social.impressions)} impressions`, bg: "bg-indigo-50", text: "text-indigo-600" },
    { icon: FiHeart, value: compact(social.likes + social.comments), title: "Engagement", subtitle: `${compact(social.likes)} likes · ${compact(social.comments)} comments`, bg: "bg-rose-50", text: "text-rose-600" },
    { icon: FiAlertTriangle, value: statusCounts.red + statusCounts.amber, title: "Clients Off Target", subtitle: `${statusCounts.green} on target`, bg: "bg-red-50", text: "text-red-600" },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          {tiles.map((t) => (
            <StatTile key={t.title} {...t} />
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3 px-1">
          Spend, results and CPL are campaign totals from Meta; leads are counted from the CRM.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <Card className="xl:col-span-3" title="Leads per day" subtitle={`Last ${data.days} days, all ad campaigns`}>
          {leadTrend.length === 0 ? (
            <EmptyState>No leads in this period.</EmptyState>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadTrend} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3f8cff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3f8cff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7D8592" }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7D8592" }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="leads" stroke="#3f8cff" strokeWidth={2} fill="url(#leadFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="xl:col-span-2" title="Leads by platform" subtitle={`Last ${data.days} days`}>
          {leadPlatforms.length === 0 ? (
            <EmptyState>No leads in this period.</EmptyState>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadPlatforms} layout="vertical" margin={{ top: 5, right: 12, left: 10, bottom: 0 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#7D8592" }} />
                  <YAxis type="category" dataKey="platform" width={80} tick={{ fontSize: 12, fill: "#0A1629" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3f8cff" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card title="Needs attention" subtitle="Clients whose CPL is above target">
        {attention.length === 0 ? (
          <EmptyState>
            {statusCounts.none === clients.length
              ? "Set a target CPL on your clients to start tracking."
              : "All clients with a target are on track."}
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {attention.map((c) => (
              <div key={c._id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <ClientThumb client={c} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0A1629] truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    CPL {inr2(c.cpl)} vs target {inr2(c.targetCpl)}
                  </p>
                </div>
                <StatusPill status={c.status} variancePct={c.variancePct} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};

const TodayCell = ({ client }) => {
  const t = client.today;
  if (!t) return <span className="text-gray-400 text-xs">{client.metaAccountId ? "Not synced" : "—"}</span>;
  return (
    <div className="text-xs leading-tight">
      <p className="font-medium text-[#0A1629]">{inr(t.spend)}</p>
      <p className="text-gray-500">
        {t.leads} lead{t.leads === 1 ? "" : "s"}
        {t.cpl != null ? ` · CPL ${inr2(t.cpl)}` : ""}
      </p>
    </div>
  );
};

// Result of the 10:00 health check: account status and disapproved ads.
const HealthCell = ({ client }) => {
  const t = client.today;
  if (!client.metaAccountId) return <span className="text-gray-400 text-xs">Not linked</span>;
  if (!t || t.healthy == null) {
    return <span className="text-gray-400 text-xs">{t ? "Not checked" : "No access / not synced"}</span>;
  }
  return t.healthy ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg bg-red-50 text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      {t.hasDisapprovedAds ? "Disapproved ads" : "Account issue"}
    </span>
  );
};

const SYNC_LABELS = { daily: "Sync today", backfill: "Backfill 30 days" };

const SyncButtons = () => {
  const sync = useSyncDigitalNow();
  const [message, setMessage] = useState("");
  const run = async (job) => {
    setMessage("");
    try {
      const res = await sync.mutateAsync({ job });
      const r = res.result || {};
      setMessage(`${r.rows ?? 0} rows · ${r.ok ?? 0} accounts ok${r.failed ? `, ${r.failed} failed` : ""}`);
    } catch (err) {
      setMessage(err?.message || "Sync failed");
    }
  };
  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {message && <span className="text-xs text-gray-500">{message}</span>}
      {Object.entries(SYNC_LABELS).map(([job, label]) => (
        <button
          key={job}
          onClick={() => run(job)}
          disabled={sync.isPending}
          className="h-9 px-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 hover:bg-white disabled:opacity-60"
        >
          {sync.isPending && sync.variables?.job === job ? "Syncing…" : label}
        </button>
      ))}
    </div>
  );
};

const Performance = ({ data, onConfigure }) => {
  const { clients, canConfigure } = data;
  const configurable = new Set(canConfigure);

  if (clients.length === 0) {
    return (
      <Card title="Clients">
        <EmptyState>No clients are assigned to you yet.</EmptyState>
      </Card>
    );
  }

  return (
    <Card
      title="Client performance"
      subtitle="Spend, leads and CPL are campaign totals. Today and Account come from the automated checks."
      right={data.isAdmin ? <SyncButtons /> : null}
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm min-w-[1080px]">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="font-medium px-2 py-2">Client</th>
              <th className="font-medium px-2 py-2">Marketer</th>
              <th className="font-medium px-2 py-2">Today</th>
              <th className="font-medium px-2 py-2">Account</th>
              <th className="font-medium px-2 py-2 text-right">Spend</th>
              <th className="font-medium px-2 py-2 text-right">Leads</th>
              <th className="font-medium px-2 py-2 text-right">CPL</th>
              <th className="font-medium px-2 py-2 text-right">Target</th>
              <th className="font-medium px-2 py-2">Status</th>
              <th className="font-medium px-2 py-2">Ads Manager</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c._id} className="border-t border-gray-100">
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ClientThumb client={c} />
                    <div className="min-w-0">
                      <p className="font-medium text-[#0A1629] truncate max-w-[180px]">{c.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {c.campaigns.active}/{c.campaigns.total} campaigns active
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  {c.marketer ? (
                    <div className="flex items-center gap-2">
                      <Avatar user={c.marketer} />
                      <span className="text-gray-700 truncate max-w-[120px]">{fullName(c.marketer)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="px-2 py-2.5">
                  <TodayCell client={c} />
                </td>
                <td className="px-2 py-2.5">
                  <HealthCell client={c} />
                </td>
                <td className="px-2 py-2.5 text-right font-medium">{inr(c.spend)}</td>
                <td className="px-2 py-2.5 text-right">{c.leads}</td>
                <td className="px-2 py-2.5 text-right">{inr2(c.cpl)}</td>
                <td className="px-2 py-2.5 text-right text-gray-500">{c.targetCpl ? inr2(c.targetCpl) : "—"}</td>
                <td className="px-2 py-2.5">
                  <StatusPill status={c.status} variancePct={c.variancePct} />
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    {c.metaLink && (
                      <a href={c.metaLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#3F8CFF] hover:underline">
                        Meta <FiExternalLink />
                      </a>
                    )}
                    {c.googleLink && (
                      <a href={c.googleLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#3F8CFF] hover:underline">
                        Google <FiExternalLink />
                      </a>
                    )}
                    {!c.metaLink && !c.googleLink && <span className="text-gray-400">Not linked</span>}
                  </div>
                </td>
                <td className="px-2 py-2.5 text-right">
                  {configurable.has(String(c._id)) && (
                    <button onClick={() => onConfigure(c)} title="Ad settings" className="w-8 h-8 rounded-lg hover:bg-gray-100 inline-flex items-center justify-center text-gray-500">
                      <FiSettings />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const Social = ({ data, viewer }) => {
  const { social, clients, recentPosts } = data;
  const platforms = Object.entries(social.byPlatform);
  const rows = clients.filter((c) => c.social.platforms.length || c.social.published || c.social.reels.total || c.social.posters.total);

  const pct = (q) => (q.total ? Math.min(100, Math.round((q.completed / q.total) * 100)) : 0);

  return (
    <>
      <SmmPanel viewer={viewer} />
      <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
          <StatTile icon={FiInstagram} value={social.published} title="Published" subtitle={`Last ${data.days} days`} bg="bg-pink-50" text="text-pink-600" />
          <StatTile icon={FiActivity} value={social.scheduled} title="Scheduled" subtitle="Waiting to publish" bg="bg-blue-50" text="text-blue-600" />
          <StatTile icon={FiAlertTriangle} value={social.failed} title="Failed" subtitle="Needs a retry" bg="bg-red-50" text="text-red-600" />
          <StatTile icon={FiEye} value={compact(social.reach)} title="Reach" subtitle={`${compact(social.impressions)} impressions`} bg="bg-indigo-50" text="text-indigo-600" />
          <StatTile icon={FiHeart} value={compact(social.likes)} title="Likes" subtitle={`${compact(social.comments)} comments · ${compact(social.saved)} saved`} bg="bg-rose-50" text="text-rose-600" />
        </div>
        {platforms.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 px-1">
            {platforms.map(([name, v]) => (
              <span key={name} className="text-xs rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-gray-700">
                {name}: {v.published} published{v.failed ? ` · ${v.failed} failed` : ""}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <Card className="xl:col-span-3" title="Content delivery by client" subtitle="This month's reels and posters against the package">
          {rows.length === 0 ? (
            <EmptyState>No social media work configured for these clients.</EmptyState>
          ) : (
            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
              {rows.map((c) => (
                <div key={c._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-2.5">
                    <ClientThumb client={c} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0A1629] truncate">{c.name}</p>
                      <p className="text-[11px] text-gray-500 capitalize">
                        {c.social.platforms.length ? c.social.platforms.join(", ") : "No platforms marked"} · {c.social.published} posts published
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2.5">
                    {[
                      ["Reels", c.social.reels],
                      ["Posters", c.social.posters],
                    ].map(([label, q]) => (
                      <div key={label}>
                        <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                          <span>{label}</span>
                          <span>
                            {q.completed}/{q.total}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#3F8CFF]" style={{ width: `${pct(q)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="xl:col-span-2" title="Recent posts" subtitle="Latest scheduled or published">
          {recentPosts.length === 0 ? (
            <EmptyState>No posts yet.</EmptyState>
          ) : (
            <div className="flex flex-col gap-2">
              {recentPosts.map((p) => (
                <div key={p._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[#0A1629] truncate">{p.project?.name || "No client"}</p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white border border-gray-100 text-gray-600">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.caption}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {p.platform} · {new Date(p.scheduledAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    {p.status === "PUBLISHED" && ` · ${compact(p.metrics?.reach)} reach`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

const LINE_STYLES = {
  earned: "bg-emerald-50 text-emerald-700",
  missed: "bg-red-50 text-red-600",
  pending: "bg-gray-100 text-gray-500",
  na: "bg-gray-100 text-gray-400",
  penalty: "bg-red-50 text-red-600",
};

const LineRow = ({ line }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-t border-gray-100 first:border-t-0">
    <div className="min-w-0">
      <p className="text-sm text-[#0A1629]">{line.label}</p>
      {line.note && <p className="text-[11px] text-gray-500 mt-0.5">{line.note}</p>}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md capitalize ${LINE_STYLES[line.status] || LINE_STYLES.pending}`}>
        {line.status === "na" ? "n/a" : line.status}
      </span>
      <span className="text-sm font-semibold w-14 text-right text-[#0A1629]">
        {line.points > 0 ? "+" : ""}
        {line.points}
        {line.max ? <span className="text-gray-400 font-normal">/{line.max}</span> : null}
      </span>
    </div>
  </div>
);

const MarketerPointsCard = ({ marketer, target }) => {
  const t = marketer.today;
  const pct = t ? Math.max(0, Math.min(100, Math.round((t.total / target) * 100))) : 0;
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <Avatar user={marketer.user} size="w-10 h-10" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0A1629] truncate">{fullName(marketer.user)}</p>
          <p className="text-xs text-gray-500 truncate">
            {marketer.role === "smm" ? "Social media" : "Performance"} · {marketer.user?.position}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#0A1629] leading-none">
            {t ? t.total : "—"}
            <span className="text-sm font-normal text-gray-400">/{target}</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">today</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden mt-3">
        <div className="h-full rounded-full bg-[#3F8CFF]" style={{ width: `${pct}%` }} />
      </div>

      {t ? (
        <div className="mt-3">
          {t.breakdown.map((l) => (
            <LineRow key={l.key} line={l} />
          ))}
          {t.penalties.map((l, i) => (
            <LineRow key={`${l.key}-${i}`} line={l} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 mt-3">No points calculated yet today. Checks run at 10:00, 12:00, 15:00 and 23:59.</p>
      )}

      {marketer.history.length > 0 && (
        <div className="mt-3 h-[90px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketer.history} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7D8592" }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "#7D8592" }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3f8cff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const Points = () => {
  const [days, setDays] = useState(7);
  const { data, isLoading } = useGetDigitalPoints(days);

  return (
    <Card
      title="KPI points"
      subtitle={`Performance and social media marketers, daily target ${data?.target ?? 60}. Shown here only; the company Leaderboard is not affected.`}
      right={
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="h-9 rounded-xl bg-gray-50 border border-gray-100 px-3 text-xs text-gray-700 focus:outline-none"
          aria-label="Points range"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      }
    >
      {isLoading ? (
        <Shimmer className="h-48" />
      ) : !data?.marketers.length ? (
        <EmptyState>
          No points yet. For performance marketers, assign a marketer and set a target CPL and budget on a client
          (Performance Marketing tab). Social media marketers earn points as they log posts and tick the daily checks
          (Social Media tab).
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {data.marketers.map((m) => (
            <MarketerPointsCard key={m.user?._id} marketer={m} target={data.target} />
          ))}
        </div>
      )}
    </Card>
  );
};

// ------------------------------------------------------------------- page
const DigitalDashboard = () => {
  const { user } = useAuth();
  // Notifications link here with ?tab=radar.
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [tab, setTabState] = useState(TABS.some((t) => t.id === requestedTab) ? requestedTab : "overview");
  const setTab = (id) => {
    setTabState(id);
    setSearchParams(id === "overview" ? {} : { tab: id }, { replace: true });
  };
  const { data: radar } = useGetDigitalRadar();
  const criticalAlerts = radar?.summary?.critical || 0;
  const [days, setDays] = useState(30);
  const [configuring, setConfiguring] = useState(null);
  const { data, isLoading, isError, refetch, isFetching } = useGetDigitalDashboard(days);

  return (
    <section className="flex flex-col gap-3 pb-4">
      <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-semibold text-[#0A1629]">Digital & Social Dashboard</h2>
            <p className="text-xs md:text-sm text-gray-500">
              {data
                ? `${data.clients.length} client${data.clients.length === 1 ? "" : "s"}${data.isAdmin ? "" : " assigned to you"}`
                : "Loading…"}
              {data?.lastSyncedAt &&
                ` · Ad data synced ${new Date(data.lastSyncedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-10 rounded-xl bg-gray-50 border border-gray-100 px-3 text-sm text-gray-700 focus:outline-none"
              aria-label="Date range"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  Last {d} days
                </option>
              ))}
            </select>
            <button onClick={() => refetch()} title="Refresh" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-white">
              <FiRefreshCcw className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        <div className="flex gap-1 mt-3 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-9 px-3.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
                tab === t.id ? "bg-[#3F8CFF] text-white font-medium" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
              {t.id === "radar" && criticalAlerts > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
                  {criticalAlerts}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <>
          <Shimmer className="h-40" />
          <Shimmer className="h-72" />
        </>
      )}
      {isError && !data && (
        <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
          Could not load the dashboard. Try refreshing.
        </div>
      )}
      {data && tab === "overview" && <Overview data={data} />}
      {data && tab === "performance" && <Performance data={data} onConfigure={setConfiguring} />}
      {data && tab === "social" && <Social data={data} viewer={user} />}
      {data && tab === "radar" && <RadarPanel />}
      {data && tab === "points" && <Points />}

      {configuring && (
        <AdConfigModal client={configuring} team={data?.team || []} onClose={() => setConfiguring(null)} />
      )}
    </section>
  );
};

export default DigitalDashboard;
