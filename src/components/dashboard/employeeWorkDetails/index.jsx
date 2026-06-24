import React, { useMemo } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useGetEmployeeSubTasksToday } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

const EmployeeWorkDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: todaySubTasks, isLoading } = useGetEmployeeSubTasksToday(
    user?._id ? user._id : null
  );

  const priorityRank = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedSubTasks = useMemo(() =>
    todaySubTasks?.subTasks?.slice()?.sort((a, b) => {
      const aRank = priorityRank[a?.priority?.toLowerCase()] || 0;
      const bRank = priorityRank[b?.priority?.toLowerCase()] || 0;
      return bRank - aRank;
    }) || []
    , [todaySubTasks]);

  const completedItems = [
    ...(todaySubTasks?.completedTasks || []),
    ...(todaySubTasks?.completedSubTasks || []),
  ].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const pendingWithReasonSubTasks = useMemo(() =>
    sortedSubTasks.filter(task => task.hasPendingReasonToday)
    , [sortedSubTasks]);

  const activeSubTasks = useMemo(() =>
    sortedSubTasks.filter(task => !task.hasPendingReasonToday)
    , [sortedSubTasks]);

  const formatTime = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-600 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "low": return "bg-green-100 text-green-600 border-green-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-600";
      case "approved": return "bg-emerald-100 text-emerald-600";
      case "on-review": return "bg-purple-100 text-purple-600";
      case "in-progress": return "bg-blue-100 text-blue-600";
      case "todo": return "bg-orange-100 text-orange-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const handleSubTaskClick = (item) => {
    const isSubTask = !!item.parentTask;
    const projectId = item.project?._id || item.project;

    if (isSubTask) {
      const parentTaskId = item.parentTask._id || item.parentTask;
      if (projectId) {
        navigate(`/projects/${projectId}/${parentTaskId}?subTaskId=${item._id}`);
      } else {
        navigate(`/tasks/${parentTaskId}?subTaskId=${item._id}`);
      }
    } else {
      if (projectId) {
        navigate(`/projects/${projectId}/${item._id}`);
      } else {
        navigate(`/tasks/${item._id}`);
      }
    }
  };

  const TaskCard = ({ item }) => {
    const isFinished = ["on-review", "approved", "completed", "client-approved"].includes(item.status?.toLowerCase());
    const showPendingBadge = item.hasPendingReasonToday && !isFinished;

    return (
      <div
        onClick={() => handleSubTaskClick(item)}
        className="flex items-center justify-between p-4 bg-[#F4F9FD] rounded-2xl hover:bg-[#E6EDF5] transition-colors cursor-pointer border border-transparent hover:border-[#3F8CFF]/20"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h5 className="font-medium text-gray-800 text-sm truncate max-w-[200px]">
              {item.title}
            </h5>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(
                item.priority
              )}`}
            >
              {item.priority || "Medium"}
            </span>
            {showPendingBadge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-600 border border-orange-200">
                Reason Provided
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-gray-600 text-xs mb-2 line-clamp-1 italic">
              {item.description}
            </p>
          )}

          {showPendingBadge && item.pendingReasonToday && (
            <div className="mb-2 p-2 bg-white/60 rounded-lg border-l-2 border-orange-400 text-[11px] text-gray-700 italic">
              " {item.pendingReasonToday} "
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Due: {formatTime(item.dueDate)}</span>
            {item.project && (
              <span className="text-[#3F8CFF] font-medium">
                {item.project.displayName || item.project.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${showPendingBadge ? "bg-orange-500 text-white shadow-sm" : getStatusColor(item.status)
              }`}
          >
            {showPendingBadge ? "Pending" : (item.status === "todo" ? "To Do" : item.status?.replace("-", " ") || "To Do")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="px-5 bg-white h-full pb-5 pt-5 flex
     flex-col rounded-2xl  min-h-[340px]
     border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
        {/* Today's Work Section */}
        <div className="flex flex-col h-full">
          <div className="flexBetween mb-4">
            <h4 className="font-semibold text-gray-800">Assigned Tasks</h4>
            {todaySubTasks?.subTasks?.length > 0 && (
              <Link
                to={"/today-tasks"}
                className="text-[#3F8CFF] cursor-pointer text-sm flexStart gap-x-2 font-medium"
              >
                <span>View all</span>
                <MdOutlineKeyboardArrowRight />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center py-8">
              <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
              {/* Pending Reason Tasks - SHOW TOP IF ANY */}
              {pendingWithReasonSubTasks.length > 0 && (
                <div className="space-y-3 h-full">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Pending for Today (Reasons Provided)
                    </h5>
                    <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold ml-auto">
                      {pendingWithReasonSubTasks.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {pendingWithReasonSubTasks.map((subTask, index) => (
                      <TaskCard key={`pending-${subTask._id || index}`} item={subTask} />
                    ))}
                  </div>
                </div>
              )}

              {/* Active Tasks */}
              <div className="space-y-3 h-full">
                {pendingWithReasonSubTasks.length > 0 && activeSubTasks.length > 0 && (
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                    Active Tasks
                  </h5>
                )}
                {activeSubTasks.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {activeSubTasks.map((subTask, index) => (
                      <TaskCard key={`active-${subTask._id || index}`} item={subTask} />
                    ))}
                  </div>
                ) : pendingWithReasonSubTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 h-full rounded-2xl border-2 border-dashed border-gray-100">
                    <div className="text-4xl mb-3">✨</div>
                    <p className="text-xs font-medium text-gray-500">You're all caught up for today!</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Today's Completed Section */}
        <div className="flex flex-col h-full border-l border-gray-100 pl-2 md:pl-4">
          <div className="flexBetween mb-4">
            <h4 className="font-semibold text-gray-800">Completed Today</h4>
            <div className="flex items-center gap-2">
              <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-bold">
                {completedItems.length}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center py-8">
              <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
          ) : completedItems.length > 0 ? (
            <div className="w-full flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {completedItems.map((item, index) => (
                <TaskCard key={`completed-${item._id || index}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-12
             h-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
              <div className="text-4xl mb-3">🕒</div>
              <h3 className="text-xs font-medium text-gray-500">No completed tasks yet</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeWorkDetails;
