import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiUser,
  FiCalendar,
  FiFlag,
  FiPlay,
  FiPause,
  FiCheckCircle,
} from "react-icons/fi";

const TaskCard = ({ task, filter }) => {
  const navigate = useNavigate();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "in-progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "approved":
        return "text-teal-600 bg-teal-50 border-teal-200";
      case "re-work":
        return "text-red-600 bg-red-50 border-red-200";
      case "on-review":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTaskClick = (task) => {
    // Check if it's a subtask (either has parentTask or isSubTask flag)
    if (task.parentTask && task.parentTask._id) {
      // If it's a subtask, navigate to the parent task
      if (task.project) {
        navigate(`/projects/${task.project._id}/${task.parentTask._id}`);
      } else {
        navigate(`/tasks/${task.parentTask._id}`);
      }
    } else {
      // Regular task navigation
      if (task.project) {
        navigate(`/projects/${task.project._id}/${task._id}`);
      } else {
        // For tasks without project, navigate to task details directly
        navigate(`/tasks/${task._id}`);
      }
    }
  };

  const renderFilterSpecificBadge = () => {
    switch (filter) {
      case "overdue":
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg">
            <FiClock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {getDaysOverdue(task.dueDate)} days overdue
            </span>
          </div>
        );
      case "in-progress":
        return (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            <FiPlay className="w-4 h-4" />
            <span className="text-sm font-medium">In Progress</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
            <FiPause className="w-4 h-4" />
            <span className="text-sm font-medium">Pending</span>
          </div>
        );
      case "completed":
        const completedAt = task.completedAt || task.updatedAt;
        const isUsingCompletedAt = !!task.completedAt;
        const formatDateTime = (dateString) => {
          if (!dateString) return "Completed";
          return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
        };
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
            <FiCheckCircle className="w-4 h-4" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">
                {isUsingCompletedAt ? "Completed" : "Updated"}
              </span>
              <span className="text-xs text-green-700">
                {formatDateTime(completedAt)}
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleProfileClick = (e, user) => {
    e.stopPropagation();
    navigate(`/employees/${user._id}`);
  };

  return (
    <div
      onClick={() => handleTaskClick(task)}
      className="bg-white rounded-xl p-6 cursor-pointer border border-gray-100
       transition-shadow duration-200  hover:border-gray-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {task.title}
            </h3>
            {task.isSubTask && (
              <span className="px-2 py-1 rounded-md text-xs font-medium border bg-purple-50 text-purple-600 border-purple-200">
                SUBTASK
              </span>
            )}
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority?.toUpperCase()}
            </span>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                task.status
              )}`}
            >
              {task.status?.replace("-", " ").toUpperCase()}
            </span>
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              {task.assignedTo?.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {task.assignedTo.slice(0, 2).map((user, index) => (
                      <div
                        key={user._id || index}
                        onClick={(e) => handleProfileClick(e, user)}
                        className="w-5 h-5 rounded-full overflow-hidden hover:scale-125
                        transition-all duration-300 cursor-pointer border border-white"
                        title={`${user.firstName} ${user.lastName}`}
                      >
                        <img
                          src={user?.profileImage}
                          alt={user?.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span>
                    {task.assignedTo
                      .slice(0, 2)
                      .map((user) => `${user.firstName} ${user.lastName}`)
                      .join(", ")}
                    {task.assignedTo.length > 2 &&
                      ` +${task.assignedTo.length - 2} more`}
                  </span>
                </div>
              ) : (
                <span>Unassigned</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>

            {task.project && (
              <div className="flex items-center gap-2">
                <FiFlag className="w-4 h-4" />
                <span>{task.project.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          {renderFilterSpecificBadge()}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Created by {task.creator?.firstName} {task.creator?.lastName}
        </div>
        <button className="text-gray-400 text-sm font-medium hover:cursor-pointer hover:text-gray-700">
          View Details →
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
