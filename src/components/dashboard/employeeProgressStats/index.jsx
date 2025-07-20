import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployeeSubTasks } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import {
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const EmployeeProgressStats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: employeeSubTasksData, isLoading } = useGetEmployeeSubTasks(
    user?._id ? user._id : null
  );

  const subTasks = employeeSubTasksData?.subTasks || [];

  // Calculate subtask statistics
  const totalSubTasks = subTasks.length;
  const completedSubTasks = subTasks.filter(
    (subTask) => subTask.status === "completed"
  ).length;
  const inProgressSubTasks = subTasks.filter(
    (subTask) => subTask.status === "in-progress"
  ).length;
  const pendingSubTasks = subTasks.filter(
    (subTask) => subTask.status === "todo"
  ).length;
  const overdueSubTasks = subTasks.filter((subTask) => {
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
  }).length;

  // Calculate today's subtasks
  const todaySubTasks = subTasks.filter((subTask) => {
    const dueDate = new Date(subTask.dueDate);
    const today = new Date();
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const completionRate =
    totalSubTasks > 0
      ? Math.round((completedSubTasks / totalSubTasks) * 100)
      : 0;

  // Function to handle stats card clicks
  const handleStatsClick = (statType) => {
    switch (statType) {
      case "total":
        navigate("/my-subtasks"); // Show all employee subtasks
        break;
      case "completed":
        navigate("/my-subtasks?filter=completed");
        break;
      case "in-progress":
        navigate("/my-subtasks?filter=in-progress");
        break;
      case "pending":
        navigate("/my-subtasks?filter=pending");
        break;
      default:
        break;
    }
  };

  // Function to handle overdue subtasks click
  const handleOverdueSubTasksClick = () => {
    navigate("/my-subtasks?filter=overdue");
  };

  const stats = [
    {
      title: "Total Tasks",
      value: totalSubTasks,
      icon: FiTrendingUp,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: () => handleStatsClick("total"),
    },
    {
      title: "Today's Tasks",
      value: todaySubTasks,
      icon: FiClock,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: () => navigate("/today-subtasks"),
    },
    {
      title: "Completed",
      value: completedSubTasks,
      icon: FiCheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      onClick: () => handleStatsClick("completed"),
    },
    {
      title: "In Progress",
      value: inProgressSubTasks,
      icon: FiClock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      onClick: () => handleStatsClick("in-progress"),
    },
    {
      title: "Pending",
      value: pendingSubTasks,
      icon: FiAlertCircle,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      onClick: () => handleStatsClick("pending"),
    },
    {
      title: "Overdue",
      value: overdueSubTasks,
      icon: FiAlertCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      onClick: handleOverdueSubTasksClick,
    },
  ];

  if (isLoading) {
    return (
      <div className="px-4 col-span-7 bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 col-span-7 bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
      <div className="flexBetween mb-4">
        <h4 className="font-semibold text-lg text-gray-800">
          My Subtask Progress
        </h4>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">
            {completionRate}%
          </div>
          <div className="text-xs text-gray-500">Subtask Completion</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Subtask Completion Rate</span>
          <span>
            {completedSubTasks} of {totalSubTasks} subtasks completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Subtask Statistics - Now in horizontal grid with click handlers */}
      <div className="grid grid-cols-6 gap-4 flex-1">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className={`${stat.bgColor} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105 group relative overflow-hidden`}
            >
              <div className={`${stat.color} p-3 rounded-lg mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`text-3xl font-bold ${stat.textColor} mb-2`}>
                {stat.value}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {stat.title}
              </p>
              <p className="text-xs text-gray-500">
                {stat.title === "Completed" && totalSubTasks > 0
                  ? `${Math.round(
                      (stat.value / totalSubTasks) * 100
                    )}% of total`
                  : stat.title === "In Progress" && totalSubTasks > 0
                  ? `${Math.round((stat.value / totalSubTasks) * 100)}% active`
                  : stat.title === "Pending" && totalSubTasks > 0
                  ? `${Math.round((stat.value / totalSubTasks) * 100)}% waiting`
                  : "Subtasks assigned"}
              </p>
              {/* Hover indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-gray-400">→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overdue Subtasks Alert - Now positioned at the bottom with click handler */}
      {overdueSubTasks > 0 && (
        <div
          onClick={handleOverdueSubTasksClick}
          className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 cursor-pointer hover:bg-red-100 transition-colors duration-200"
        >
          <div className="flex items-center justify-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {overdueSubTasks} overdue subtask{overdueSubTasks > 1 ? "s" : ""}{" "}
              - Please review and update these subtasks
            </span>
            <span className="text-xs text-red-600 ml-2">→ Click to view</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {totalSubTasks === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📊</div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No subtasks assigned yet
          </h3>
          <p className="text-gray-500 text-sm">
            Your subtask statistics will appear here once subtasks are assigned.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeProgressStats;
