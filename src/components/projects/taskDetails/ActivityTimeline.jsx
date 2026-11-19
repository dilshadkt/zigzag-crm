import React, { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    FiCircle,
    FiCheckCircle,
    FiPlayCircle,
    FiAlertCircle,
    FiClock,
    FiPlusCircle,
    FiEdit3,
    FiTrendingUp,
    FiUser,
    FiTrash2,
    FiPaperclip,
    FiUserPlus,
    FiArrowRight,
    FiAward,
    FiSearch,
    FiPauseCircle,
    FiZap,
    FiLayers,
    FiRepeat,
} from "react-icons/fi";

// Only theme-aware palette classes are used here (slate-*, white, the 50-200
// tints), so the same markup follows light and dark mode.

const STATUS_META = {
    todo: { label: "To Do", chip: "bg-slate-100 text-slate-600 border-slate-200" },
    "in-progress": { label: "In Progress", chip: "bg-blue-50 text-blue-700 border-blue-200" },
    "on-review": { label: "On Review", chip: "bg-purple-50 text-purple-700 border-purple-200" },
    approved: { label: "Approved", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    "re-work": { label: "Re-work", chip: "bg-rose-50 text-rose-700 border-rose-200" },
    completed: { label: "Completed", chip: "bg-green-50 text-green-700 border-green-200" },
    "client-approved": { label: "Client Approved", chip: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    "on-hold": { label: "On Hold", chip: "bg-amber-50 text-amber-700 border-amber-200" },
    paused: { label: "Paused", chip: "bg-amber-50 text-amber-700 border-amber-200" },
};

const CHANGE_LABELS = {
    created: "Created",
    status_change: "Status changed",
    priority_change: "Priority changed",
    due_date_change: "Due date changed",
    assignment_change: "Assignment changed",
    title_change: "Title changed",
    description_change: "Description changed",
    attachments_change: "Attachments updated",
    time_estimate_change: "Estimate changed",
    task_moved: "Task moved",
    task_month_changed: "Month changed",
    deleted: "Deleted",
};

const iconClass = "w-[18px] h-[18px]";
const CARD = "border-slate-200 bg-slate-50";

const isClientApproval = (activity) =>
    activity.changeType === "status_change" && activity.newValue === "client-approved";

const getTheme = (activity) => {
    const { changeType, newValue } = activity;
    if (isClientApproval(activity)) {
        return {
            icon: <FiAward className={iconClass} />,
            marker: "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/30",
            accent: "bg-indigo-500",
            card: "border-indigo-200 bg-indigo-50",
        };
    }
    switch (changeType) {
        case "created":
            return { icon: <FiPlusCircle className={iconClass} />, marker: "bg-green-50 text-green-600 border-green-200", accent: "bg-green-500", card: CARD };
        case "status_change":
            if (newValue === "completed") return { icon: <FiCheckCircle className={iconClass} />, marker: "bg-emerald-50 text-emerald-600 border-emerald-200", accent: "bg-emerald-500", card: CARD };
            if (newValue === "in-progress") return { icon: <FiPlayCircle className={iconClass} />, marker: "bg-blue-50 text-blue-600 border-blue-200", accent: "bg-blue-500", card: CARD };
            if (newValue === "on-review") return { icon: <FiSearch className={iconClass} />, marker: "bg-purple-50 text-purple-600 border-purple-200", accent: "bg-purple-500", card: CARD };
            if (newValue === "re-work") return { icon: <FiRepeat className={iconClass} />, marker: "bg-rose-50 text-rose-600 border-rose-200", accent: "bg-rose-500", card: CARD };
            if (newValue === "on-hold" || newValue === "paused") return { icon: <FiPauseCircle className={iconClass} />, marker: "bg-amber-50 text-amber-600 border-amber-200", accent: "bg-amber-500", card: CARD };
            return { icon: <FiTrendingUp className={iconClass} />, marker: "bg-indigo-50 text-indigo-600 border-indigo-200", accent: "bg-indigo-400", card: CARD };
        case "priority_change":
            return { icon: <FiAlertCircle className={iconClass} />, marker: "bg-purple-50 text-purple-600 border-purple-200", accent: "bg-purple-500", card: CARD };
        case "due_date_change":
        case "time_estimate_change":
            return { icon: <FiClock className={iconClass} />, marker: "bg-orange-50 text-orange-600 border-orange-200", accent: "bg-orange-500", card: CARD };
        case "assignment_change":
            return { icon: <FiUserPlus className={iconClass} />, marker: "bg-cyan-50 text-cyan-600 border-cyan-200", accent: "bg-cyan-500", card: CARD };
        case "title_change":
        case "description_change":
            return { icon: <FiEdit3 className={iconClass} />, marker: "bg-sky-50 text-sky-600 border-sky-200", accent: "bg-sky-500", card: CARD };
        case "attachments_change":
            return { icon: <FiPaperclip className={iconClass} />, marker: "bg-pink-50 text-pink-600 border-pink-200", accent: "bg-pink-500", card: CARD };
        case "task_moved":
        case "task_month_changed":
            return { icon: <FiArrowRight className={iconClass} />, marker: "bg-violet-50 text-violet-600 border-violet-200", accent: "bg-violet-500", card: CARD };
        case "deleted":
            return { icon: <FiTrash2 className={iconClass} />, marker: "bg-slate-100 text-slate-600 border-slate-200", accent: "bg-slate-500", card: CARD };
        default:
            return { icon: <FiCircle className={iconClass} />, marker: "bg-slate-50 text-slate-400 border-slate-200", accent: "bg-slate-400", card: CARD };
    }
};

const statusLabel = (status) => STATUS_META[status]?.label || String(status ?? "-");

const StatusChip = ({ status }) => {
    const meta = STATUS_META[status] || {
        label: String(status ?? "-"),
        chip: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.chip}`}>
            {meta.label}
        </span>
    );
};

const safeDate = (date) => {
    const d = date ? new Date(date) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
};

const msOf = (date) => {
    const d = safeDate(date);
    return d ? d.getTime() : null;
};

const formatTime = (date) => {
    const d = safeDate(date);
    return d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
};

const formatFull = (date) => {
    const d = safeDate(date);
    return d
        ? d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "";
};

const formatDayKey = (date) => {
    const d = safeDate(date);
    return d
        ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
        : "Unknown date";
};

const getTimeAgo = (date) => {
    const d = safeDate(date);
    return d ? formatDistanceToNow(d, { addSuffix: true }) : "";
};

// 45s, 6m 12s, 41m, 2h 2m, 1d 4h
export const formatSpan = (ms) => {
    const total = Math.max(0, Math.round((Number(ms) || 0) / 1000));
    if (total < 60) return `${total}s`;
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    if (minutes < 10 && seconds) return `${minutes}m ${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    if (hours < 24) return `${hours}h ${restMinutes}m`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
};

// Whole minutes as the timer stores them: every session counts at least 1
const sessionMinutes = (ms) => Math.max(1, Math.ceil(ms / 60000));

const formatMinutes = (minutes) => {
    const total = Math.max(0, Math.floor(Number(minutes) || 0));
    const hours = Math.floor(total / 60);
    return hours > 0 ? `${hours}h ${total % 60}m` : `${total % 60}m`;
};

/**
 * Reads the time out of the log itself. A status change away from
 * "in-progress" closes a work session, so the gap since it started is the time
 * worked; any other status change tells how long the item sat in the status it
 * just left. Work after the first rework is flagged as rework.
 */
export const analyzeActivity = (activities, { now = Date.now(), currentStatus } = {}) => {
    const asc = (activities || [])
        .filter((activity) => msOf(activity.createdAt) !== null)
        .sort((a, b) => msOf(a.createdAt) - msOf(b.createdAt));

    const reworkEntry = asc.find(
        (activity) => activity.changeType === "status_change" && activity.newValue === "re-work"
    );
    const firstReworkAt = reworkEntry ? msOf(reworkEntry.createdAt) : null;

    const perEntry = new Map();
    const sessions = [];
    let statusSince = null;
    let sessionStart = null;
    let sessionEntry = null;

    for (const activity of asc) {
        const at = msOf(activity.createdAt);
        if (activity.changeType === "created") {
            statusSince = at;
            continue;
        }
        if (activity.changeType !== "status_change") continue;

        const info = {};
        if (activity.oldValue === "in-progress") {
            const start = sessionStart ?? statusSince;
            if (start !== null) {
                const rework = firstReworkAt !== null && start >= firstReworkAt;
                info.workedMs = at - start;
                info.rework = rework;
                sessions.push({ start, end: at, rework, running: false });
            }
            sessionStart = null;
            sessionEntry = null;
        } else if (statusSince !== null && at - statusSince >= 60000) {
            info.waitedMs = at - statusSince;
        }

        if (activity.newValue === "in-progress" && activity.oldValue !== "in-progress") {
            sessionStart = at;
            sessionEntry = activity;
        }
        statusSince = at;
        perEntry.set(activity, info);
    }

    // A session still open now: the item is being worked on right this minute
    const stillOpen =
        sessionStart !== null && (currentStatus === undefined || currentStatus === "in-progress");
    if (stillOpen && sessionEntry) {
        const rework = firstReworkAt !== null && sessionStart >= firstReworkAt;
        const info = perEntry.get(sessionEntry) || {};
        perEntry.set(sessionEntry, { ...info, running: true, runningMs: Math.max(0, now - sessionStart), rework });
        sessions.push({ start: sessionStart, end: now, rework, running: true });
    }

    return { perEntry, sessions, firstReworkAt };
};

// Totals for the summary strip
export const summarizeTime = (sessions, subTask, activities = [], now = Date.now()) => {
    const derived = sessions.reduce((sum, s) => sum + sessionMinutes(s.end - s.start), 0);
    const stored = Number(subTask?.totalActualTime) || 0;
    const running = sessions.find((s) => s.running);
    const storedWithLive = stored + (running ? Math.floor((now - running.start) / 60000) : 0);
    // The stored total is what scoring uses; the log can be more complete for
    // sessions that were never stored, so show the larger of the two
    const totalMinutes = Math.max(derived, storedWithLive);
    const reworkMinutes = Math.min(
        totalMinutes,
        sessions.filter((s) => s.rework).reduce((sum, s) => sum + sessionMinutes(s.end - s.start), 0)
    );
    const reworkRounds =
        Number(subTask?.reworkCount) ||
        activities.filter((a) => a.changeType === "status_change" && a.newValue === "re-work").length;
    return { totalMinutes, reworkMinutes, sessionCount: sessions.length, reworkRounds, running: Boolean(running) };
};

const Performer = ({ user }) => {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unknown";
    return (
        <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-200 flex items-center justify-center shrink-0">
                {user?.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                    <FiUser className="w-3.5 h-3.5 text-slate-400" />
                )}
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-slate-700">{name}</span>
                <span className="text-[10px] text-slate-400 capitalize">{user?.position || "Member"}</span>
            </div>
        </div>
    );
};

const Stat = ({ icon, label, value, hint, tone = "plain" }) => {
    const tones = {
        plain: "border-slate-200 bg-slate-50",
        brand: "border-blue-200 bg-blue-50",
        rework: "border-rose-200 bg-rose-50",
    };
    const valueTone = { plain: "text-slate-800", brand: "text-blue-700", rework: "text-rose-600" };
    return (
        <div className={`rounded-2xl border px-4 py-3 ${tones[tone]}`}>
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                {icon}
                {label}
            </div>
            <div className={`mt-1 text-xl font-bold leading-tight ${valueTone[tone]}`}>{value}</div>
            {hint && <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div>}
        </div>
    );
};

const TimeSummary = ({ stats }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat
            tone="brand"
            icon={<FiClock className="w-3 h-3" />}
            label="Time worked"
            value={formatMinutes(stats.totalMinutes)}
            hint={stats.running ? "Running now" : "Counted while in progress"}
        />
        <Stat
            tone={stats.reworkMinutes > 0 ? "rework" : "plain"}
            icon={<FiRepeat className="w-3 h-3" />}
            label="Rework time"
            value={formatMinutes(stats.reworkMinutes)}
            hint={stats.reworkMinutes > 0 ? "Part of the total" : "No rework time"}
        />
        <Stat
            icon={<FiZap className="w-3 h-3" />}
            label="Work sessions"
            value={stats.sessionCount}
            hint="Start to stop"
        />
        <Stat
            icon={<FiLayers className="w-3 h-3" />}
            label="Rework rounds"
            value={stats.reworkRounds}
            hint={stats.reworkRounds === 1 ? "Sent back once" : "Times sent back"}
        />
    </div>
);

const DurationChip = ({ tone, icon, children, pulse }) => {
    const tones = {
        work: "bg-blue-50 text-blue-700 border-blue-200",
        rework: "bg-rose-50 text-rose-700 border-rose-200",
        wait: "bg-slate-100 text-slate-500 border-slate-200",
        live: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border ${tones[tone]}`}>
            {pulse ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> : icon}
            {children}
        </span>
    );
};

const ActivityTimeline = ({ activities, subTask = null }) => {
    const { groups, analysis, stats } = useMemo(() => {
        const now = Date.now();
        const list = activities || [];
        const sorted = [...list].sort(
            (a, b) => (safeDate(b.createdAt)?.getTime() || 0) - (safeDate(a.createdAt)?.getTime() || 0)
        );
        const map = new Map();
        sorted.forEach((activity) => {
            const key = formatDayKey(activity.createdAt);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(activity);
        });
        const result = analyzeActivity(list, { now, currentStatus: subTask?.status });
        return {
            groups: Array.from(map, ([day, items]) => ({ day, items })),
            analysis: result,
            stats: subTask ? summarizeTime(result.sessions, subTask, list, now) : null,
        };
    }, [activities, subTask]);

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-slate-100">
                    <FiClock className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No activity recorded yet</p>
                <p className="text-slate-400 text-sm">Task history will appear here as the team works.</p>
            </div>
        );
    }

    return (
        <div className="px-1 pb-2">
            {stats && <TimeSummary stats={stats} />}

            {groups.map(({ day, items }) => (
                <section key={day} className="mb-6 last:mb-0">
                    <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-white/95 backdrop-blur flex items-center gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                            {day}
                        </span>
                        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                            {items.length} {items.length === 1 ? "event" : "events"}
                        </span>
                    </div>

                    <ol className="relative mt-2">
                        {items.map((activity, index) => {
                            const theme = getTheme(activity);
                            const clientApproved = isClientApproval(activity);
                            const isStatus = activity.changeType === "status_change";
                            const isLast = index === items.length - 1;
                            const info = analysis.perEntry.get(activity) || {};
                            const hasDuration = Boolean(info.workedMs !== undefined || info.waitedMs || info.running);
                            const title = clientApproved
                                ? "Client approved"
                                : CHANGE_LABELS[activity.changeType] ||
                                  activity.changeType?.replace(/_/g, " ") ||
                                  "Update";

                            return (
                                <li key={activity._id || `${activity.createdAt}-${index}`} className="relative flex gap-4 pb-5 last:pb-0">
                                    {!isLast && (
                                        <span className="absolute left-[19px] top-11 bottom-0 w-px bg-slate-200" aria-hidden="true" />
                                    )}
                                    <div className={`relative z-10 w-10 h-10 shrink-0 rounded-full border flex items-center justify-center ${theme.marker}`}>
                                        {theme.icon}
                                    </div>

                                    <div className={`relative flex-1 min-w-0 rounded-2xl border p-4 overflow-hidden ${theme.card}`}>
                                        <span className={`absolute left-0 top-0 h-full w-1 ${theme.accent}`} aria-hidden="true" />

                                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-[15px] font-semibold text-slate-800">{title}</h4>
                                                    {clientApproved && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-500 text-white">
                                                            <FiCheckCircle className="w-3 h-3" /> Approved
                                                        </span>
                                                    )}
                                                </div>
                                                <time
                                                    dateTime={safeDate(activity.createdAt)?.toISOString()}
                                                    title={formatFull(activity.createdAt)}
                                                    className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"
                                                >
                                                    <FiClock className="w-3 h-3 text-slate-400" />
                                                    <span className="font-semibold text-slate-600">{formatTime(activity.createdAt)}</span>
                                                    <span className="text-slate-300">·</span>
                                                    <span className="text-slate-400">{getTimeAgo(activity.createdAt)}</span>
                                                </time>
                                            </div>
                                            <Performer user={activity.performedBy} />
                                        </div>

                                        {isStatus ? (
                                            <div className="mt-3.5 flex flex-wrap items-center gap-2">
                                                <StatusChip status={activity.oldValue} />
                                                <FiArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                                <StatusChip status={activity.newValue} />
                                            </div>
                                        ) : (
                                            activity.description && (
                                                <p className="mt-3.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-slate-600">
                                                    {activity.description}
                                                </p>
                                            )
                                        )}

                                        {isStatus && hasDuration && (
                                            <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                                                {info.workedMs !== undefined && (
                                                    <DurationChip
                                                        tone={info.rework ? "rework" : "work"}
                                                        icon={info.rework ? <FiRepeat className="w-3 h-3" /> : <FiClock className="w-3 h-3" />}
                                                    >
                                                        {info.rework ? "Rework session" : "Worked"} · {formatSpan(info.workedMs)}
                                                    </DurationChip>
                                                )}
                                                {info.running && (
                                                    <DurationChip tone="live" pulse>
                                                        {info.rework ? "Rework running" : "Running"} · {formatSpan(info.runningMs)} so far
                                                    </DurationChip>
                                                )}
                                                {info.waitedMs ? (
                                                    <DurationChip tone="wait" icon={<FiPauseCircle className="w-3 h-3" />}>
                                                        Was {statusLabel(activity.oldValue)} for {formatSpan(info.waitedMs)}
                                                    </DurationChip>
                                                ) : null}
                                            </div>
                                        )}

                                        {clientApproved && (
                                            <div className="mt-3.5 rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-[12px] text-slate-600 space-y-1.5">
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-slate-400">Recorded by</span>
                                                    <span className="font-semibold text-slate-700">
                                                        {[activity.performedBy?.firstName, activity.performedBy?.lastName].filter(Boolean).join(" ") || "Unknown"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-slate-400">Approved on</span>
                                                    <span className="font-semibold text-slate-700">
                                                        {safeDate(activity.createdAt)?.toLocaleString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }) || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-3 items-center">
                                                    <span className="text-slate-400">Result</span>
                                                    <span className="font-semibold text-emerald-600">Ready to publish</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>
            ))}
        </div>
    );
};

export default ActivityTimeline;
