import React from "react";
import { useNavigate } from "react-router-dom";
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
import { useGetCompanyStatsChecking } from "../../../api/hooks/dashboard";

const CompanyProgressStats = ({ taskMonth }) => {
  const { companyId } = useAuth();

  const {
    data: companyStatsCheck,
    isLoading,
    refetch,
  } = useGetCompanyStatsChecking(companyId, taskMonth);

  console.log(companyStatsCheck);
  const navigate = useNavigate();

  // Refetch data when component mounts and when window gains focus
  React.useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);
  // Function to handle overdue tasks click
  const handleOverdueTasksClick = () => {
    navigate("/company-tasks?filter=overdue");
  };

  // Function to handle stats card clicks
  const handleStatsClick = (statType) => {
    switch (statType) {
      case "projects":
        navigate("/projects-analytics?taskMonth=" + taskMonth);
        break;
      case "tasks":
        navigate("/company-tasks?taskMonth=" + taskMonth);
        break;
      case "in-progress":
        navigate("/company-tasks?filter=in-progress&taskMonth=" + taskMonth);
        break;
      case "approved":
        navigate("/company-tasks?filter=approved&taskMonth=" + taskMonth);
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
          <div className="grid grid-cols-8 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
      value: companyStatsCheck?.statistics?.activeProjects || 0,
      subtitle: `${
        companyStatsCheck?.statistics?.activeProjects || 0
      } active projects`,
      icon: FiFolderPlus,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: () => handleStatsClick("projects"),
    },
    {
      title: "Total Tasks",
      value: companyStatsCheck?.statistics?.total || 0,
      subtitle: `${companyStatsCheck?.statistics?.completed || 0} completed`,
      icon: FiTarget,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: () => handleStatsClick("tasks"),
    },
    {
      title: "Team Members",
      value: companyStatsCheck?.statistics?.teamMembers || 0,
      subtitle: `${
        companyStatsCheck?.statistics?.teamMembers || 0
      } total employees`,
      icon: FiUsers,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      onClick: () => handleStatsClick("employees"),
    },
    {
      title: "In Progress",
      value: companyStatsCheck?.statistics?.inProgress || 0,
      subtitle: `${companyStatsCheck?.statistics?.pending || 0} pending`,
      icon: FiClock,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      onClick: () => handleStatsClick("in-progress"),
    },
    {
      title: "On Review",
      value: companyStatsCheck?.statistics?.onReview || 0,
      subtitle: "Awaiting approval",
      icon: FiBarChart2,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      onClick: () => navigate("/task-on-review"),
    },
    {
      title: "Approved Tasks",
      value: companyStatsCheck?.statistics?.approved || 0,
      subtitle: "Ready to proceed",
      icon: FiCheckCircle,
      color: "bg-teal-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      onClick: () => navigate("/company-tasks?filter=approved"),
    },
    {
      title: "Overdue Tasks",
      value: companyStatsCheck?.statistics?.overdue || 0,
      subtitle: "Need attention",
      icon: FiAlertCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      onClick: handleOverdueTasksClick,
    },
    {
      title: "Today's Tasks",
      value: companyStatsCheck?.statistics?.today || 0,
      subtitle: "Due today",
      icon: FiCheckCircle,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      onClick: () => navigate("/company-today-tasks"),
    },
  ];

  // Since the new data structure doesn't have workload distribution,
  // we'll create a simple distribution based on available data
  const workloadData = {
    high: companyStatsCheck?.statistics?.overdue || 0,
    medium: companyStatsCheck?.statistics?.inProgress || 0,
    low: companyStatsCheck?.statistics?.approved || 0,
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
            {companyStatsCheck?.statistics?.completionRate || 0}%
          </div>
          <div className="text-xs text-gray-500">Task Completion</div>
        </div>
      </div>
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Task Completion Progress</span>
          <span>{companyStatsCheck?.statistics?.completionRate || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${companyStatsCheck?.statistics?.completionRate || 0}%`,
            }}
          ></div>
        </div>
      </div>
      {/* Company Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-2 md:gap-4 flex-1">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className={`${stat.bgColor} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer md:hover:shadow-md transition-all duration-200 transform md:hover:scale-105 group relative overflow-hidden`}
            >
              <div className={`${stat.color} p-3 rounded-lg mb-3`}>
                <Icon className="w-4 md:w-6 h-4 md:h-6 text-white" />
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
    </div>
  );
};

export default CompanyProgressStats;
