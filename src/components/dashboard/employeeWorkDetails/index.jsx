import React from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useGetEmployeeTasksToday } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

const EmployeeWorkDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: todayTasks, isLoading } = useGetEmployeeTasksToday(
    user?._id ? user._id : null
  );

  const formatTime = (dateString) => {
    if (!dateString) return "No due time";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
      case "pending":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleTaskClick = (task) => {
    // Navigate to the task details page using the correct route structure
    if (task.project?.name && task._id) {
      navigate(`/projects/${task.project.name}/${task._id}`);
    } else {
      // Fallback to projects page if task data is incomplete
      navigate("/projects");
    }
  };

  return (
    <div className="px-4 col-span-5  bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-lg text-gray-800">Today's Work</h4>
        {todayTasks?.tasks?.length > 0 && (
          <Link
            to={"/my-tasks"}
            className="text-[#3F8CFF] cursor-pointer text-sm flexStart gap-x-2"
          >
            <span>View all tasks</span>
            <MdOutlineKeyboardArrowRight />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-500">
            Loading today's tasks...
          </div>
        </div>
      ) : todayTasks?.tasks?.length > 0 ? (
        <div className="w-full flex flex-col gap-3 mt-3 max-h-96 overflow-y-auto">
          {todayTasks.tasks.map((task, index) => (
            <div
              onClick={() => handleTaskClick(task)}
              key={task._id || index}
              className="flex items-center justify-between p-4 bg-[#F4F9FD] rounded-2xl hover:bg-[#E6EDF5] transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h5 className="font-medium text-gray-800 text-sm">
                    {task.title}
                  </h5>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority || "Medium"}
                  </span>
                </div>

                {task.description && (
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Due: {formatTime(task.dueDate)}</span>
                  {task.project && (
                    <span className="text-[#3F8CFF]">
                      Project: {task.project.displayName || task.project.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status || "Pending"}
                </span>

                {task.estimatedHours && (
                  <span className="text-xs text-gray-500">
                    {task.estimatedHours}h estimated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-3">✅</div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              No tasks for today
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
