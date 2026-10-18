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
} from "react-icons/fi";

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

const iconClass = "w-4 h-4";

const isClientApproval = (activity) =>
    activity.changeType === "status_change" && activity.newValue === "client-approved";

const getTheme = (activity) => {
    const { changeType, newValue } = activity;
    if (isClientApproval(activity)) {
        return {
            icon: <FiAward className={iconClass} />,
            marker: "bg-indigo-500 text-white border-indigo-500 shadow-indigo-200",
            accent: "bg-indigo-500",
            card: "border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white",
        };
    }
    switch (changeType) {
        case "created":
            return { icon: <FiPlusCircle className={iconClass} />, marker: "bg-green-50 text-green-600 border-green-200", accent: "bg-green-500", card: "border-slate-200 bg-white" };
        case "status_change":
            if (newValue === "completed") return { icon: <FiCheckCircle className={iconClass} />, marker: "bg-emerald-50 text-emerald-600 border-emerald-200", accent: "bg-emerald-500", card: "border-slate-200 bg-white" };
            if (newValue === "in-progress") return { icon: <FiPlayCircle className={iconClass} />, marker: "bg-blue-50 text-blue-600 border-blue-200", accent: "bg-blue-500", card: "border-slate-200 bg-white" };
            if (newValue === "on-review") return { icon: <FiSearch className={iconClass} />, marker: "bg-purple-50 text-purple-600 border-purple-200", accent: "bg-purple-500", card: "border-slate-200 bg-white" };
            if (newValue === "re-work") return { icon: <FiRefreshCw className={iconClass} />, marker: "bg-rose-50 text-rose-600 border-rose-200", accent: "bg-rose-500", card: "border-slate-200 bg-white" };
            if (newValue === "on-hold" || newValue === "paused") return { icon: <FiPauseCircle className={iconClass} />, marker: "bg-amber-50 text-amber-600 border-amber-200", accent: "bg-amber-500", card: "border-slate-200 bg-white" };
            return { icon: <FiTrendingUp className={iconClass} />, marker: "bg-indigo-50 text-indigo-600 border-indigo-200", accent: "bg-indigo-400", card: "border-slate-200 bg-white" };
        case "priority_change":
            return { icon: <FiAlertCircle className={iconClass} />, marker: "bg-purple-50 text-purple-600 border-purple-200", accent: "bg-purple-500", card: "border-slate-200 bg-white" };
        case "due_date_change":
        case "time_estimate_change":
            return { icon: <FiClock className={iconClass} />, marker: "bg-orange-50 text-orange-600 border-orange-200", accent: "bg-orange-500", card: "border-slate-200 bg-white" };
        case "assignment_change":
            return { icon: <FiUserPlus className={iconClass} />, marker: "bg-cyan-50 text-cyan-600 border-cyan-200", accent: "bg-cyan-500", card: "border-slate-200 bg-white" };
        case "title_change":
        case "description_change":
            return { icon: <FiEdit3 className={iconClass} />, marker: "bg-sky-50 text-sky-600 border-sky-200", accent: "bg-sky-500", card: "border-slate-200 bg-white" };
        case "attachments_change":
            return { icon: <FiPaperclip className={iconClass} />, marker: "bg-pink-50 text-pink-600 border-pink-200", accent: "bg-pink-500", card: "border-slate-200 bg-white" };
        case "task_moved":
        case "task_month_changed":
            return { icon: <FiArrowRight className={iconClass} />, marker: "bg-violet-50 text-violet-600 border-violet-200", accent: "bg-violet-500", card: "border-slate-200 bg-white" };
        case "deleted":
            return { icon: <FiTrash2 className={iconClass} />, marker: "bg-gray-100 text-gray-600 border-gray-200", accent: "bg-gray-500", card: "border-slate-200 bg-white" };
        default:
            return { icon: <FiCircle className={iconClass} />, marker: "bg-slate-50 text-slate-400 border-slate-200", accent: "bg-slate-400", card: "border-slate-200 bg-white" };
    }
};

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

const formatTime = (date) => {
    const d = safeDate(date);
    return d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
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

const Performer = ({ user }) => {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unknown";
    return (
        <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-white ring-1 ring-slate-200 flex items-center justify-center shrink-0">
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

const ActivityTimeline = ({ activities }) => {
    const groups = useMemo(() => {
        const sorted = [...(activities || [])].sort(
            (a, b) => (safeDate(b.createdAt)?.getTime() || 0) - (safeDate(a.createdAt)?.getTime() || 0)
        );
        const map = new Map();
        sorted.forEach((activity) => {
            const key = formatDayKey(activity.createdAt);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(activity);
        });
        return Array.from(map, ([day, items]) => ({ day, items }));
    }, [activities]);

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
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
            {groups.map(({ day, items }) => (
                <section key={day} className="mb-5 last:mb-0">
                    <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-white/90 backdrop-blur">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            {day}
                        </span>
                    </div>

                    <ol className="relative">
                        {items.map((activity, index) => {
                            const theme = getTheme(activity);
                            const clientApproved = isClientApproval(activity);
                            const isStatus = activity.changeType === "status_change";
                            const isLast = index === items.length - 1;
                            const title = clientApproved
                                ? "Client approved"
                                : CHANGE_LABELS[activity.changeType] ||
                                  activity.changeType?.replace(/_/g, " ") ||
                                  "Update";

                            return (
                                <li key={activity._id || `${activity.createdAt}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                                    {!isLast && (
                                        <span className="absolute left-[17px] top-9 bottom-0 w-px bg-slate-200" aria-hidden="true" />
                                    )}
                                    <div className={`relative z-10 w-9 h-9 shrink-0 rounded-full border flex items-center justify-center shadow-sm ${theme.marker}`}>
                                        {theme.icon}
                                    </div>

                                    <div className={`relative flex-1 min-w-0 rounded-xl border p-3.5 shadow-sm overflow-hidden ${theme.card}`}>
                                        <span className={`absolute left-0 top-0 h-full w-1 ${theme.accent}`} aria-hidden="true" />

                                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                                                    {clientApproved && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-500 text-white">
                                                            <FiCheckCircle className="w-3 h-3" /> Approved
                                                        </span>
                                                    )}
                                                </div>
                                                <time className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                                    <FiClock className="w-3 h-3" />
                                                    {formatTime(activity.createdAt)}
                                                    <span className="text-slate-300">·</span>
                                                    {getTimeAgo(activity.createdAt)}
                                                </time>
                                            </div>
                                            <Performer user={activity.performedBy} />
                                        </div>

                                        {isStatus ? (
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <StatusChip status={activity.oldValue} />
                                                <FiArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                                <StatusChip status={activity.newValue} />
                                            </div>
                                        ) : (
                                            activity.description && (
                                                <p className="mt-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-[12.5px] leading-relaxed text-slate-600">
                                                    {activity.description}
                                                </p>
                                            )
                                        )}

                                        {clientApproved && (
                                            <div className="mt-3 rounded-lg border border-indigo-100 bg-white/80 px-3 py-2 text-[12px] text-slate-600 space-y-1">
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

// Helper for Missing Refresh icon
const FiRefreshCw = ({ className }) => (
    <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
);

export default ActivityTimeline;
