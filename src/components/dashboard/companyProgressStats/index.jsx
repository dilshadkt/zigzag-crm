import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetCompanyStats } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import {
  FiTrendingUp,
  FiUsers,
  FiFolderPlus,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBarChart2,
} from "react-icons/fi";

const CompanyProgressStats = () => {
  const { companyId } = useAuth();
  const { data: companyStats, isLoading } = useGetCompanyStats(companyId);
  const navigate = useNavigate();

  // Function to handle overdue tasks click
  const handleOverdueTasksClick = () => {
    navigate("/company-tasks?filter=overdue");
  };

  // Function to handle stats card clicks
  const handleStatsClick = (statType) => {
    switch (statType) {
      case "projects":
        navigate("/projects-analytics");
        break;
      case "tasks":
        navigate("/company-tasks");
        break;
      case "in-progress":
        navigate("/company-tasks?filter=in-progress");
        break;
      case "employees":
        navigate("/employees");
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 col-span-7 bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Projects",
      value: companyStats?.projects?.total || 0,
      subtitle: `${companyStats?.projects?.dueThisMonth || 0} due this month`,
      icon: FiFolderPlus,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: () => handleStatsClick("projects"),
    },
    {
      title: "Total Tasks",
      value: companyStats?.tasks?.total || 0,
      subtitle: `${companyStats?.tasks?.completed || 0} completed`,
      icon: FiTarget,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: () => handleStatsClick("tasks"),
    },
    {
      title: "Team Members",
      value: companyStats?.employees?.active || 0,
      subtitle: `${companyStats?.employees?.total || 0} total employees`,
      icon: FiUsers,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      onClick: () => handleStatsClick("employees"),
    },
    {
      title: "In Progress",
      value: companyStats?.tasks?.inProgress || 0,
      subtitle: `${companyStats?.tasks?.pending || 0} pending`,
      icon: FiClock,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      onClick: () => handleStatsClick("in-progress"),
    },
    {
      title: "Overdue Tasks",
      value: companyStats?.tasks?.overdue || 0,
      subtitle: "Need attention",
      icon: FiAlertCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      onClick: handleOverdueTasksClick,
    },
    {
      title: "Today's Tasks",
      value: companyStats?.tasks?.today || 0,
      subtitle: "Due today",
      icon: FiCheckCircle,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      onClick: () => navigate("/company-tasks?filter=today"),
    },
  ];

  const workloadData = companyStats?.overview?.workloadDistribution || {
    high: 0,
    medium: 0,
    low: 0,
  };
  const totalWorkload =
    workloadData.high + workloadData.medium + workloadData.low;

  return (
    <div className="px-4 col-span-7 bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
      <div className="flexBetween mb-4">
        <h4 className="font-semibold text-lg text-gray-800">
          Company Overview
        </h4>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">
            {companyStats?.overview?.taskCompletionRate || 0}%
          </div>
          <div className="text-xs text-gray-500">Task Completion</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Project Progress Average</span>
          <span>{companyStats?.overview?.projectProgressAvg || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${companyStats?.overview?.projectProgressAvg || 0}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Company Statistics Grid */}
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
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
              {/* Hover indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-gray-400">→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workload Distribution */}
      {totalWorkload > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4" />
              Task Priority Distribution
            </h5>
            <span className="text-xs text-gray-500">
              {totalWorkload} total tasks
            </span>
          </div>
          <div className="flex gap-4 text-center">
            <div className="flex-1">
              <div className="text-lg font-bold text-red-600">
                {workloadData.high}
              </div>
              <div className="text-xs text-gray-500">High Priority</div>
              <div className="text-xs text-red-500">
                {Math.round((workloadData.high / totalWorkload) * 100)}%
              </div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-yellow-600">
                {workloadData.medium}
              </div>
              <div className="text-xs text-gray-500">Medium Priority</div>
              <div className="text-xs text-yellow-500">
                {Math.round((workloadData.medium / totalWorkload) * 100)}%
              </div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-green-600">
                {workloadData.low}
              </div>
              <div className="text-xs text-gray-500">Low Priority</div>
              <div className="text-xs text-green-500">
                {Math.round((workloadData.low / totalWorkload) * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProgressStats;
