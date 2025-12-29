import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiUser, FiCalendar, FiFlag } from "react-icons/fi";
import { format } from "date-fns";

const Tasks = ({ employeeId, subTasks = [], isLoading, selectedMonth }) => {
  const navigate = useNavigate();

  // For this view we want to focus on today's subtasks for the employee
  const todaySubTasks = useMemo(() => {
    if (!subTasks || subTasks.length === 0) return [];

    const today = new Date();
    return subTasks.filter((s) => {
      if (!s.dueDate) return false;
      const dueDate = new Date(s.dueDate);
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear() &&
        s.status !== "approved"
      );
    });
  }, [subTasks]);

  const label = useMemo(() => {
    return "Today's subtasks";
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-review":
        return "bg-purple-100 text-purple-800";
      case "on-hold":
        return "bg-orange-100 text-orange-800";
      case "re-work":
        return "bg-red-100 text-red-800";
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleTaskClick = (subTask) => {
    // Navigate to project detail page with task and subtask IDs
    navigate(
      `/projects/${subTask.project._id}/${subTask.parentTask._id}?subTaskId=${subTask._id}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#E6EBF5] border-t-[#3F8CFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!todaySubTasks || todaySubTasks.length === 0) {
    return (
      <div className="text-center w-full h-full flex items-center justify-center text-gray-500">
        <div>
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No subtasks due today
          </h3>
          <p className="text-gray-500">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <div className="rounded-lg">
        <div className="divide-y flex flex-col gap-y-2 divide-gray-200">
          {todaySubTasks.map((subTask) => {
            const isOverdue = (() => {
              const dueDate = new Date(subTask.dueDate);
              const today = new Date();

              // Reset time to start of day for accurate date comparison
              const dueDateOnly = new Date(
                dueDate.getFullYear(),
                dueDate.getMonth(),
                dueDate.getDate()
              );
              const todayOnly = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );

              // Task is overdue if due date has passed AND task is not completed
              return dueDateOnly < todayOnly && subTask.status !== "completed";
            })();
            const daysOverdue = isOverdue ? getDaysOverdue(subTask.dueDate) : 0;

            return (
              <div
                key={subTask._id}
                onClick={() => handleTaskClick(subTask)}
                className="p-4 bg-white hover:bg-gray-50 cursor-pointer
                rounded-xl border border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {subTask.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            subTask.priority
                          )}`}
                        >
                          {subTask.priority}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            subTask.status
                          )}`}
                        >
                          {subTask.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    {subTask.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {subTask.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {subTask.project && (
                        <div className="flex items-center gap-1">
                          <FiFlag className="w-4 h-4" />
                          <span>{subTask.project.name}</span>
                        </div>
                      )}
                      {subTask.parentTask && (
                        <div className="flex items-center gap-1">
                          <FiUser className="w-4 h-4" />
                          <span>Parent: {subTask.parentTask.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Due {formatDate(subTask.dueDate)}</span>
                        {isOverdue && (
                          <span className="text-red-600 font-medium">
                            ({daysOverdue} day{daysOverdue > 1 ? "s" : ""}{" "}
                            overdue)
                          </span>
                        )}
                      </div>
                      {subTask.timeEstimate && (
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>{subTask.timeEstimate}h</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {subTask.assignedTo && subTask.assignedTo.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FiUser className="w-4 h-4" />
                        <span>{subTask.assignedTo.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
