import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  CalendarCheck,
  Zap,
} from "lucide-react";

const CATEGORY_META = {
  attendance: {
    label: "Attendance",
    icon: CalendarCheck,
    earnedClass: "bg-emerald-50 border-emerald-200 text-emerald-600",
    lostClass: "bg-emerald-50 border-emerald-200 text-emerald-600",
  },
  attendance_penalty: {
    label: "Late Arrival",
    icon: Clock,
    earnedClass: "bg-red-50 border-red-200 text-red-600",
    lostClass: "bg-red-50 border-red-200 text-red-600",
  },
  task: {
    label: "Task",
    icon: CheckSquare,
    earnedClass: "bg-blue-50 border-blue-200 text-blue-600",
    lostClass: "bg-blue-50 border-blue-200 text-blue-600",
  },
  task_penalty: {
    label: "Deadline",
    icon: AlertCircle,
    earnedClass: "bg-red-50 border-red-200 text-red-600",
    lostClass: "bg-red-50 border-red-200 text-red-600",
  },
  rework_penalty: {
    label: "Rework",
    icon: AlertCircle,
    earnedClass: "bg-orange-50 border-orange-200 text-orange-600",
    lostClass: "bg-orange-50 border-orange-200 text-orange-600",
  },
  bonus: {
    label: "Bonus",
    icon: Zap,
    earnedClass: "bg-purple-50 border-purple-200 text-purple-600",
    lostClass: "bg-red-50 border-red-200 text-red-600",
  },
};

const getCategoryMeta = (entry) => {
  const key = entry.category || (entry.type === "earned" ? "task" : "task_penalty");
  return CATEGORY_META[key] || CATEGORY_META.task;
};

const PointsLedgerList = ({
  entries = [],
  emptyMessage = "No point history available for this period.",
  layout = "grid",
  onEntryClick,
}) => {
  const navigate = useNavigate();

  const handleClick = (entry) => {
    if (onEntryClick) {
      onEntryClick(entry);
      return;
    }

    if (entry.projectId && entry.parentTaskId && entry.taskId) {
      navigate(
        `/projects/${entry.projectId}/${entry.parentTaskId}?subTaskId=${entry.taskId}`
      );
    } else if (entry.projectId && entry.taskId) {
      navigate(`/projects/${entry.projectId}?subtask=${entry.taskId}`);
    }
  };

  const isClickable = (entry) =>
    Boolean(entry.projectId && entry.taskId);

  if (!entries.length) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">{emptyMessage}</div>
    );
  }

  const containerClass =
    layout === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      : "space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar";

  return (
    <div className={containerClass}>
      {entries.map((entry, idx) => {
        const meta = getCategoryMeta(entry);
        const Icon = meta.icon;
        const clickable = isClickable(entry);
        const isEarned = entry.type === "earned";
        const stubClass = isEarned
          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
          : "bg-red-50 border-red-200 text-red-600";

        return (
          <motion.div
            key={`${entry.id}-${idx}`}
            initial={{ opacity: 0, scale: layout === "grid" ? 0.95 : 1, y: layout === "list" ? 8 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => clickable && handleClick(entry)}
            className={`group flex rounded-xl border border-gray-200 bg-white transition-all duration-300 overflow-hidden ${
              clickable
                ? "cursor-pointer hover:border-blue-300 hover:shadow-md"
                : "hover:border-gray-300"
            } ${layout === "list" ? "w-full" : ""}`}
          >
            <div
              className={`flex flex-col items-center justify-center p-3 border-r-2 border-dashed ${stubClass} w-20 flex-shrink-0`}
            >
              {isEarned ? (
                <TrendingUp className="w-4 h-4 mb-1 opacity-80" />
              ) : (
                <TrendingDown className="w-4 h-4 mb-1 opacity-80" />
              )}
              <span className="text-xl font-black leading-none">
                {entry.points > 0 ? `+${entry.points}` : entry.points}
              </span>
              <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">
                Pts
              </span>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isEarned
                        ? meta.earnedClass
                        : meta.lostClass
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors">
                  {entry.title}
                </h4>

                {(entry.projectName || entry.parentTaskName || entry.taskName) && (
                  <div className="space-y-0.5">
                    {entry.projectName && (
                      <p className="text-[11px] text-gray-700 font-semibold flex items-center gap-1 truncate">
                        <FolderKanban className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{entry.projectName}</span>
                      </p>
                    )}
                    {entry.parentTaskName && (
                      <p className="text-[11px] text-gray-600 truncate pl-4">
                        Task: {entry.parentTaskName}
                      </p>
                    )}
                    {entry.taskName && entry.taskName !== entry.parentTaskName && (
                      <p className="text-[11px] text-gray-500 truncate pl-4">
                        Subtask: {entry.taskName}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {entry.reason}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded w-fit">
                  <Clock className="w-2.5 h-2.5 mr-1 text-gray-400" />
                  {format(new Date(entry.date), "MMM do yyyy, h:mm a")}
                </div>
                {clickable && (
                  <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View task →
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PointsLedgerList;
