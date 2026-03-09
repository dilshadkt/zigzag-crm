import React from "react";
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

  const sortedSubTasks =
    todaySubTasks?.subTasks?.slice()?.sort((a, b) => {
      const aRank = priorityRank[a?.priority?.toLowerCase()] || 0;
      const bRank = priorityRank[b?.priority?.toLowerCase()] || 0;
      return bRank - aRank;
    }) || [];

  const completedItems = [
    ...(todaySubTasks?.completedTasks || []),
    ...(todaySubTasks?.completedSubTasks || []),
  ].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const formatTime = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    // For other dates, show the full date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-600 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-600";
      case "approved":
        return "bg-emerald-100 text-emerald-600";
      case "on-review":
        return "bg-purple-100 text-purple-600";
      case "in-progress":
        return "bg-blue-100 text-blue-600";
      case "todo":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleSubTaskClick = (item) => {
    // If it's a subtask, it has a parentTask field
    // If it's a task, it doesn't (or it is the parent task)
    const isSubTask = !!item.parentTask;
    const projectId = item.project?._id || item.project;

    if (isSubTask) {
      navigate(
        `/projects/${projectId}/${item.parentTask._id || item.parentTask}?subTaskId=${item._id}`
      );
    } else {
      navigate(`/projects/${projectId}/${item._id}`);
    }
  };

  const TaskCard = ({ item }) => (
    <div
      onClick={() => handleSubTaskClick(item)}
      className="flex items-center justify-between p-4 bg-[#F4F9FD] rounded-2xl hover:bg-[#E6EDF5] transition-colors cursor-pointer"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h5 className="font-medium text-gray-800 text-sm">
            {item.title}
          </h5>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
              item.priority
            )}`}
          >
            {item.priority || "Medium"}
          </span>
        </div>

        {item.description && (
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Due: {formatTime(item.dueDate)}</span>
          {item.project && (
            <span className="text-[#3F8CFF]">
              Project:{" "}
              {item.project.displayName || item.project.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            item.status
          )}`}
        >
          {item.status === "todo"
            ? "Pending"
            : item.status || "Pending"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="px-5 bg-white h-full pb-5 pt-5 flex flex-col rounded-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        {/* Today's Work Section */}
        <div className="flex flex-col h-full">
          <div className="flexBetween mb-4">
            <h4 className="font-semibold text-lg text-gray-800">Today's Work</h4>
            {todaySubTasks?.subTasks?.length > 0 && (
              <Link
                to={"/today-tasks"}
                className="text-[#3F8CFF] cursor-pointer text-sm flexStart gap-x-2"
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
          ) : sortedSubTasks.length > 0 ? (
            <div className="w-full flex flex-col gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {sortedSubTasks.map((subTask, index) => (
                <TaskCard key={subTask._id || index} item={subTask} />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center py-8 bg-[#F4F9FD] rounded-2xl">
              <div className="text-center">
                <div className="text-gray-400 text-3xl mb-2">✅</div>
                <h3 className="text-md font-medium text-gray-500">No work for today</h3>
              </div>
            </div>
          )}
        </div>

        {/* Today's Completed Section */}
        <div className="flex flex-col h-full border-l border-gray-50 pl-2 md:pl-4">
          <div className="flexBetween mb-4">
            <h4 className="font-semibold text-lg text-gray-800">Completed Today</h4>
            <span className="text-gray-400 text-sm">{completedItems.length} tasks</span>
          </div>

          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center py-8">
              <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
          ) : completedItems.length > 0 ? (
            <div className="w-full flex flex-col gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {completedItems.map((item, index) => (
                <TaskCard key={item._id || index} item={item} />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center py-8 bg-[#F4F9FD] rounded-2xl">
              <div className="text-center">
                <div className="text-gray-400 text-3xl mb-2">🕒</div>
                <h3 className="text-md font-medium text-gray-500">No completed tasks yet</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeWorkDetails;
