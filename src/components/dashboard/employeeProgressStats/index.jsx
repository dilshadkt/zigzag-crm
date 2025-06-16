import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployeeTasks } from "../../../api/hooks";
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
  const { data: employeeTasksData, isLoading } = useGetEmployeeTasks(
    user?._id ? user._id : null
  );

  const tasks = employeeTasksData?.tasks || [];

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const overdueTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== "completed";
  }).length;

  // Calculate today's tasks
  const todayTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Function to handle stats card clicks
  const handleStatsClick = (statType) => {
    switch (statType) {
      case "total":
        navigate("/my-tasks"); // Show all employee tasks
        break;
      case "completed":
        navigate("/my-tasks?filter=completed");
        break;
      case "in-progress":
        navigate("/my-tasks?filter=in-progress");
        break;
      case "pending":
        navigate("/my-tasks?filter=pending");
        break;
      default:
        break;
    }
  };

  // Function to handle overdue tasks click
  const handleOverdueTasksClick = () => {
    navigate("/my-tasks?filter=overdue");
  };

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: FiTrendingUp,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: () => handleStatsClick("total"),
    },
    {
      title: "Today's Tasks",
      value: todayTasks,
      icon: FiClock,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: () => navigate("/today-tasks"),
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: FiCheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      onClick: () => handleStatsClick("completed"),
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: FiClock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      onClick: () => handleStatsClick("in-progress"),
    },
    {
      title: "Pending",
      value: pendingTasks,
      icon: FiAlertCircle,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      onClick: () => handleStatsClick("pending"),
    },
    {
      title: "Overdue",
      value: overdueTasks,
      icon: FiAlertCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      onClick: handleOverdueTasksClick,
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
        <h4 className="font-semibold text-lg text-gray-800">My Progress</h4>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">
            {completionRate}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Overall Progress</span>
          <span>
            {completedTasks} of {totalTasks} tasks
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Task Statistics - Now in horizontal grid with click handlers */}
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
                {stat.title === "Completed" && totalTasks > 0
                  ? `${Math.round((stat.value / totalTasks) * 100)}% of total`
                  : stat.title === "In Progress" && totalTasks > 0
                  ? `${Math.round((stat.value / totalTasks) * 100)}% active`
                  : stat.title === "Pending" && totalTasks > 0
                  ? `${Math.round((stat.value / totalTasks) * 100)}% waiting`
                  : "Tasks assigned"}
              </p>
              {/* Hover indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-gray-400">→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overdue Tasks Alert - Now positioned at the bottom with click handler */}
      {overdueTasks > 0 && (
        <div
          onClick={handleOverdueTasksClick}
          className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 cursor-pointer hover:bg-red-100 transition-colors duration-200"
        >
          <div className="flex items-center justify-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {overdueTasks} overdue task{overdueTasks > 1 ? "s" : ""} - Please
              review and update these tasks
            </span>
            <span className="text-xs text-red-600 ml-2">→ Click to view</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {totalTasks === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📊</div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No tasks assigned yet
          </h3>
          <p className="text-gray-500 text-sm">
            Your task statistics will appear here once tasks are assigned.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeProgressStats;
