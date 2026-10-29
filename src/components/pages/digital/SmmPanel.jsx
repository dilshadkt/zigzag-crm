import { useState } from "react";
import { FiPlus, FiX, FiExternalLink, FiAlertTriangle, FiCheck, FiFlag } from "react-icons/fi";
import {
  useGetSmmToday,
  useCreateSmmPost,
  useUpdateSmmEngagement,
  useFlagSmmQuality,
  useSaveSmmChecklist,
} from "../../../api/hooks/dashboard";

const PLATFORMS = [
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "FACEBOOK", label: "Facebook" },
  { id: "LINKEDIN", label: "LinkedIn" },
  { id: "YOUTUBE", label: "YouTube" },
];

const CHECKLIST = [
  { key: "storiesDone", label: "Stories posted", hint: "With stickers, links or polls", points: 5 },
  { key: "inboxZero", label: "Inbox Zero", hint: "All comments and DMs answered", points: 10 },
  { key: "assetsReady", label: "Next week's assets ready", hint: "Creatives checked and calendar aligned", points: 10 },
];

const field =
  "h-10 rounded-xl bg-gray-50 border border-gray-100 px-3 text-sm w-full focus:outline-none focus:bg-white";
const label = "text-xs font-medium text-gray-600 mb-1 block";

const compact = (n) =>
  n == null
    ? "—"
    : Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);
const fullName = (u) => `${u?.firstName || ""} ${u?.lastName || ""}`.trim();
const when = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// datetime-local wants "YYYY-MM-DDTHH:mm" in the browser's local time.
const toLocalInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-3xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-[#0A1629]">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center" aria-label="Close">
          <FiX />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ------------------------------------------------------------------ log a post
const LogPostModal = ({ projects, graceMinutes, onClose }) => {
  const create = useCreateSmmPost();
  const now = toLocalInput(new Date());
  const [form, setForm] = useState({
    projectId: projects[0]?._id || "",
    platform: "INSTAGRAM",
    contentType: "POST",
    livePostUrl: "",
    scheduledTime: now,
    publishedTime: now,
    initialViews: "",
    initialLikes: "",
  });
  const [error, setError] = useState("");
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Same rule the server applies, shown before saving.
  const lateBy = Math.round((new Date(form.publishedTime) - new Date(form.scheduledTime)) / 60000);
  const isLate = Number.isFinite(lateBy) && lateBy > graceMinutes;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await create.mutateAsync({
        ...form,
        scheduledTime: new Date(form.scheduledTime).toISOString(),
        publishedTime: new Date(form.publishedTime).toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err?.message || "Could not log the post");
    }
  };

  return (
    <Modal title="Log a post" subtitle="Add the live link right after publishing" onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={label}>Client</label>
          <select className={field} value={form.projectId} onChange={set("projectId")} required>
            {projects.length === 0 && <option value="">No clients assigned</option>}
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Platform</label>
          <select className={field} value={form.platform} onChange={set("platform")}>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Type</label>
          <select className={field} value={form.contentType} onChange={set("contentType")}>
            <option value="POST">Post</option>
            <option value="REEL">Reel</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={label}>Live post link</label>
          <input
            type="url"
            required
            className={field}
            value={form.livePostUrl}
            onChange={set("livePostUrl")}
            placeholder="https://www.instagram.com/reel/…"
          />
        </div>
        <div>
          <label className={label}>Scheduled time</label>
          <input type="datetime-local" required className={field} value={form.scheduledTime} onChange={set("scheduledTime")} />
        </div>
        <div>
          <label className={label}>Published time</label>
          <input type="datetime-local" required className={field} value={form.publishedTime} onChange={set("publishedTime")} />
        </div>
        {Number.isFinite(lateBy) && (
          <p
            className={`col-span-2 text-xs rounded-xl px-3 py-2 ${
              isLate ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isLate
              ? `Late by ${lateBy} min. This post earns no points and costs 5.`
              : lateBy > 0
                ? `${lateBy} min after schedule, within the ${graceMinutes} min allowance.`
                : "On time."}
          </p>
        )}
        <div>
          <label className={label}>Views so far</label>
          <input type="number" min="0" className={field} value={form.initialViews} onChange={set("initialViews")} />
        </div>
        <div>
          <label className={label}>Likes so far</label>
          <input type="number" min="0" className={field} value={form.initialLikes} onChange={set("initialLikes")} />
        </div>
        <p className="col-span-2 text-[11px] text-gray-500 -mt-1">
          Views and likes can be added later, but the 10-point reporting credit needs initial views on every post by end of day.
        </p>
        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
        <div className="col-span-2 flex justify-end gap-2 mt-1">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending || !projects.length}
            className="h-10 px-4 rounded-xl bg-[#3F8CFF] text-white text-sm font-medium disabled:opacity-60"
          >
            {create.isPending ? "Saving…" : "Log post"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ------------------------------------------------------ reach / T+24H engagement
const EngagementModal = ({ post, onClose }) => {
  const update = useUpdateSmmEngagement();
  const t24Open = Date.now() - new Date(post.publishedTime).getTime() >= 24 * 3600 * 1000;
  const [form, setForm] = useState({
    initialViews: post.initialViews ?? "",
    initialLikes: post.initialLikes ?? "",
    views: post.t24?.views ?? "",
    likes: post.t24?.likes ?? "",
    shares: post.t24?.shares ?? "",
  });
  const [error, setError] = useState("");
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    // Only send what was filled in; T+24H fields are blocked by the server before 24h.
    const body = { id: post._id };
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && (t24Open || !["views", "likes", "shares"].includes(k))) body[k] = Number(v);
    });
    try {
      await update.mutateAsync(body);
      onClose();
    } catch (err) {
      setError(err?.message || "Could not save");
    }
  };

  return (
    <Modal title="Reach & engagement" subtitle={`${post.project?.name || "Client"} · ${when(post.publishedTime)}`} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-3 gap-3">
        <p className="col-span-3 text-xs font-semibold text-gray-700">First look</p>
        <div className="col-span-3 sm:col-span-1">
          <label className={label}>Views</label>
          <input type="number" min="0" className={field} value={form.initialViews} onChange={set("initialViews")} />
        </div>
        <div className="col-span-3 sm:col-span-1">
          <label className={label}>Likes</label>
          <input type="number" min="0" className={field} value={form.initialLikes} onChange={set("initialLikes")} />
        </div>
        <div className="hidden sm:block" />

        <p className="col-span-3 text-xs font-semibold text-gray-700 mt-2">
          T+24H check {!t24Open && <span className="font-normal text-gray-400">· opens 24h after publishing</span>}
        </p>
        {["views", "likes", "shares"].map((k) => (
          <div key={k}>
            <label className={`${label} capitalize`}>{k}</label>
            <input type="number" min="0" disabled={!t24Open} className={`${field} disabled:opacity-50`} value={form[k]} onChange={set(k)} />
          </div>
        ))}
        {error && <p className="col-span-3 text-sm text-red-600">{error}</p>}
        <div className="col-span-3 flex justify-end gap-2 mt-1">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700">
            Cancel
          </button>
          <button type="submit" disabled={update.isPending} className="h-10 px-4 rounded-xl bg-[#3F8CFF] text-white text-sm font-medium disabled:opacity-60">
            {update.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --------------------------------------------------------------------- list rows
const PostRow = ({ post, canFlag, canEdit, onEdit }) => {
  const flag = useFlagSmmQuality();
  const flagged = !!post.qualityError?.flagged;

  const toggleFlag = () => {
    if (flagged) return flag.mutate({ id: post._id, flagged: false });
    const note = window.prompt("What is wrong with this post? (branding, link, copy or tags)");
    if (note !== null) flag.mutate({ id: post._id, flagged: true, note });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#0A1629] truncate">{post.project?.name || "Client"}</p>
          <p className="text-[11px] text-gray-500 capitalize">
            {post.platform.toLowerCase()} · {post.contentType.toLowerCase()} · {when(post.publishedTime)}
            {post.staff && ` · ${fullName(post.staff)}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
              post.isOnTime ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {post.isOnTime ? "On time" : `Late ${post.minutesLate}m`}
          </span>
          {flagged && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-red-50 text-red-600">Error</span>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-2">
        <p className="text-[11px] text-gray-500">
          {compact(post.initialViews)} views · {compact(post.initialLikes)} likes
          {post.t24?.checkedAt && ` · T+24H ${compact(post.t24.views)} views`}
        </p>
        <div className="flex items-center gap-1">
          <a href={post.livePostUrl} target="_blank" rel="noreferrer" title="Open post" className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-[#3F8CFF]">
            <FiExternalLink />
          </a>
          {canEdit && (
            <button onClick={() => onEdit(post)} className="h-7 px-2 rounded-lg hover:bg-white text-[11px] text-gray-700">
              Reach
            </button>
          )}
          {canFlag && (
            <button
              onClick={toggleFlag}
              disabled={flag.isPending}
              title={flagged ? "Clear quality error" : "Flag quality error"}
              className={`w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center ${flagged ? "text-red-600" : "text-gray-500"}`}
            >
              <FiFlag />
            </button>
          )}
        </div>
      </div>
      {flagged && post.qualityError?.note && <p className="text-[11px] text-red-600 mt-1">{post.qualityError.note}</p>}
    </div>
  );
};

// ------------------------------------------------------------------------ panel
const SmmPanel = ({ viewer }) => {
  const [day, setDay] = useState("");
  const [logging, setLogging] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data, isLoading } = useGetSmmToday(day || undefined);
  const saveChecklist = useSaveSmmChecklist();

  if (isLoading || !data) return <div className="animate-pulse bg-gray-100 rounded-3xl h-40" />;

  const { posts, t24Pending, checklist, canLog, projects, score, lateGraceMinutes } = data;
  const isToday = !day;
  const mine = (p) => String(p.staff?._id) === String(viewer?._id);
  const isAdmin = viewer?.role === "company-admin";
  const done = CHECKLIST.filter((c) => checklist[c.key]).length;

  // Nothing to show to someone who neither logs posts nor oversees any.
  if (!canLog && posts.length === 0 && t24Pending.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-[#0A1629]">Posting log</h3>
          <p className="text-xs md:text-sm text-gray-500">
            {isToday ? "Today" : day} · {posts.length} post{posts.length === 1 ? "" : "s"}
            {canLog && score ? ` · ${score.total}/${score.target} pts` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={day}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDay(e.target.value)}
            className="h-9 rounded-xl bg-gray-50 border border-gray-100 px-2 text-xs text-gray-700 focus:outline-none"
            aria-label="Day"
          />
          {canLog && isToday && (
            <button onClick={() => setLogging(true)} className="h-9 px-3 rounded-xl bg-[#3F8CFF] text-white text-xs font-medium inline-flex items-center gap-1.5">
              <FiPlus /> Log post
            </button>
          )}
        </div>
      </div>

      {canLog && isToday && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          {CHECKLIST.map((c) => (
            <button
              key={c.key}
              onClick={() => saveChecklist.mutate({ [c.key]: !checklist[c.key] })}
              disabled={saveChecklist.isPending}
              className={`text-left rounded-2xl border p-3 transition-colors ${
                checklist[c.key] ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-gray-50 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#0A1629]">{c.label}</p>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                    checklist[c.key] ? "bg-emerald-500 text-white" : "bg-white border border-gray-200 text-transparent"
                  }`}
                >
                  <FiCheck />
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {c.hint} · {c.points} pts
              </p>
            </button>
          ))}
          <p className="sm:col-span-3 text-[11px] text-gray-400 -mt-1">{done}/3 daily checks done. These are confirmed by you, so tick them honestly.</p>
        </div>
      )}

      {t24Pending.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2.5 mb-3">
          <p className="text-xs font-medium text-amber-800 inline-flex items-center gap-1.5">
            <FiAlertTriangle /> {t24Pending.length} post{t24Pending.length === 1 ? "" : "s"} waiting for the T+24H engagement check
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {t24Pending.slice(0, 8).map((p) => (
              <button
                key={p._id}
                onClick={() => (isAdmin || mine(p)) && setEditing(p)}
                className="text-[11px] rounded-lg bg-white border border-amber-100 px-2 py-1 text-amber-900"
              >
                {p.project?.name} · {p.platform.toLowerCase()} · {when(p.publishedTime)}
              </button>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No posts logged for this day.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {posts.map((p) => (
            <PostRow key={p._id} post={p} canEdit={isAdmin || mine(p)} canFlag={!!p.canFlag} onEdit={setEditing} />
          ))}
        </div>
      )}

      {logging && <LogPostModal projects={projects} graceMinutes={lateGraceMinutes} onClose={() => setLogging(false)} />}
      {editing && <EngagementModal post={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};

export default SmmPanel;
