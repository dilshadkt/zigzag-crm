import React from "react";
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
    FiUserPlus
} from "react-icons/fi";

const ActivityTimeline = ({ activities }) => {
    const formatDate = (date) => {
        if (!date) return "N/A";
        try {
            return new Date(date).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "N/A";
        }
    };

    const getTimeAgo = (date) => {
        if (!date) return "";
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return "";
        }
    };

    const getIcon = (type, newValue) => {
        const iconClass = "w-4 h-4";
        switch (type) {
            case "created":
                return <FiPlusCircle className={`${iconClass} text-green-600`} />;
            case "status_change":
                if (newValue === "completed") return <FiCheckCircle className={`${iconClass} text-emerald-600`} />;
                if (newValue === "in-progress") return <FiPlayCircle className={`${iconClass} text-blue-600`} />;
                if (newValue === "re-work") return <FiRefreshCw className={`${iconClass} text-rose-600`} />;
                if (newValue === "on-hold") return <FiCircle className={`${iconClass} text-amber-600`} />;
                return <FiTrendingUp className={`${iconClass} text-indigo-600`} />;
            case "priority_change":
                return <FiAlertCircle className={`${iconClass} text-purple-600`} />;
            case "due_date_change":
                return <FiClock className={`${iconClass} text-orange-600`} />;
            case "assignment_change":
                return <FiUserPlus className={`${iconClass} text-cyan-600`} />;
            case "title_change":
            case "description_change":
                return <FiEdit3 className={`${iconClass} text-sky-600`} />;
            case "attachments_change":
                return <FiPaperclip className={`${iconClass} text-pink-600`} />;
            case "deleted":
                return <FiTrash2 className={`${iconClass} text-gray-600`} />;
            default:
                return <FiCircle className={`${iconClass} text-slate-400`} />;
        }
    };

    const getColorConfig = (type, newValue) => {
        switch (type) {
            case "created": return { bg: "bg-green-100", border: "border-green-200", dot: "bg-green-500" };
            case "status_change":
                if (newValue === "completed") return { bg: "bg-emerald-100", border: "border-emerald-200", dot: "bg-emerald-500" };
                if (newValue === "in-progress") return { bg: "bg-blue-100", border: "border-blue-200", dot: "bg-blue-500" };
                if (newValue === "re-work") return { bg: "bg-rose-100", border: "border-rose-200", dot: "bg-rose-500" };
                return { bg: "bg-indigo-100", border: "border-indigo-200", dot: "bg-indigo-500" };
            case "priority_change": return { bg: "bg-purple-100", border: "border-purple-200", dot: "bg-purple-500" };
            case "due_date_change": return { bg: "bg-orange-100", border: "border-orange-200", dot: "bg-orange-500" };
            case "assignment_change": return { bg: "bg-cyan-100", border: "border-cyan-200", dot: "bg-cyan-500" };
            case "attachments_change": return { bg: "bg-pink-100", border: "border-pink-200", dot: "bg-pink-500" };
            default: return { bg: "bg-slate-100", border: "border-slate-200", dot: "bg-slate-400" };
        }
    };

    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 transition-all">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-slate-100">
                    <FiClock className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No activity recorded yet</p>
                <p className="text-slate-400 text-sm">Task history will appear here as the team works.</p>
            </div>
        );
    }

    const reversedActivities = [...activities].reverse();

    return (
        <div className="relative px-2 py-4">
            {/* Central Line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-100 hidden sm:block"></div>

            <div className="space-y-8">
                {reversedActivities.map((activity, index) => {
                    const colors = getColorConfig(activity.changeType, activity.newValue);
                    return (
                        <div key={index} className="relative flex flex-col sm:flex-row gap-4 group">
                            {/* Timeline Marker (Mobile/Desktop) */}
                            <div className="flex items-center sm:block shrink-0 z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border p-3 transition-all group-hover:scale-110 group-hover:shadow-md ${colors.bg} ${colors.border}`}>
                                    {getIcon(activity.changeType, activity.newValue)}
                                </div>
                                {/* Visual Connector for mobile */}
                                <div className="h-px bg-slate-100 flex-1 ml-4 sm:hidden"></div>
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm transition-all hover:shadow-lg hover:border-slate-200 relative overflow-hidden group/card">
                                {/* Subtle Progress Bar Decor */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${colors.dot} opacity-20 group-hover/card:opacity-40 transition-opacity`}></div>

                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                                            <h4 className="text-[15px] font-bold text-slate-800 capitalize tracking-tight leading-none">
                                                {activity.changeType?.replace("_", " ")}
                                            </h4>
                                        </div>
                                        <time className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            {formatDate(activity.createdAt)}
                                        </time>
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">
                                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                            {activity.performedBy?.profileImage ? (
                                                <img src={activity.performedBy.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <FiUser className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-xs font-bold text-slate-700">
                                                {activity.performedBy?.firstName} {activity.performedBy?.lastName}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 capitalize">
                                                {activity.performedBy?.position || "Member"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mb-4 group-hover/card:bg-white transition-colors">
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        {activity.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-end">
                                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-widest">
                                        {getTimeAgo(activity.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
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
