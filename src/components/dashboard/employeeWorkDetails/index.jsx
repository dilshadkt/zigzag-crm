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
      case "in-progress":
        return "bg-blue-100 text-blue-600";
      case "todo":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleSubTaskClick = (subTask) => {
    // Navigate to the parent task detail page with the correct URL structure
    navigate(
      `/projects/${subTask.project._id}/${subTask.parentTask._id}?subTaskId=${subTask._id}`
    );
  };

  return (
    <div className="px-4 col-span-5  bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-lg text-gray-800">Today's Work</h4>
        {todaySubTasks?.subTasks?.length > 0 && (
          <Link
            to={"/today-tasks"}
            className="text-[#3F8CFF] cursor-pointer text-sm flexStart gap-x-2"
          >
            <span>View all subtasks</span>
            <MdOutlineKeyboardArrowRight />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-500">
            Loading today's subtasks...
          </div>
        </div>
      ) : todaySubTasks?.subTasks?.length > 0 ? (
        <div className="w-full flex flex-col gap-3 mt-3 max-h-96 overflow-y-auto">
          {sortedSubTasks.map((subTask, index) => (
            <div
              onClick={() => handleSubTaskClick(subTask)}
              key={subTask._id || index}
              className="flex items-center justify-between p-4 bg-[#F4F9FD] rounded-2xl hover:bg-[#E6EDF5] transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h5 className="font-medium text-gray-800 text-sm">
                    {subTask.title}
                  </h5>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      subTask.priority
                    )}`}
                  >
                    {subTask.priority || "Medium"}
                  </span>
                </div>

                {subTask.description && (
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                    {subTask.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Due: {formatTime(subTask.dueDate)}</span>
                  {subTask.project && (
                    <span className="text-[#3F8CFF]">
                      Project:{" "}
                      {subTask.project.displayName || subTask.project.name}
                    </span>
                  )}
                  {subTask.parentTask && (
                    <span className="text-gray-600">
                      Task: {subTask.parentTask.title}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    subTask.status
                  )}`}
                >
                  {subTask.status === "todo"
                    ? "Pending"
                    : subTask.status || "Pending"}
                </span>

                {/* {subTask.timeEstimate && (
                  <span className="text-xs text-gray-500">
                    {subTask.timeEstimate}h estimated
                  </span>
                )} */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-3">✅</div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No subtasks for today
            </h3>
            <p className="text-gray-500 text-sm">
              You're all caught up! Enjoy your day.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWorkDetails;
