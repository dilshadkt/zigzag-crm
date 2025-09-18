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
  FiCalendar,
} from "react-icons/fi";
import { useGetCompanyStatsChecking } from "../../../api/hooks/dashboard";
import { MdBusinessCenter } from "react-icons/md";

const CompanyProgressStats = ({ taskMonth }) => {
  const { companyId } = useAuth();

  const {
    data: companyStatsCheck,
    isLoading,
    refetch,
  } = useGetCompanyStatsChecking(companyId, taskMonth);

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
    navigate("/company-tasks?filter=overdue&taskMonth=" + taskMonth);
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
      case "on-review":
        navigate("/task-on-review?taskMonth=" + taskMonth);
        break;
      case "approved":
        navigate("/client-review?taskMonth=" + taskMonth);
        break;
      case "client-approved":
        navigate("/task-on-publish");
        break;
      case "re-work":
        navigate("/company-tasks?filter=re-work&taskMonth=" + taskMonth);
        break;
      case "completed":
        navigate("/company-tasks?filter=completed&taskMonth=" + taskMonth);
        break;
      case "client-review":
        navigate("/client-review?taskMonth=" + taskMonth);
        break;
      case "employees":
        navigate("/employees");
        break;
      case "unscheduled":
        navigate("/company-tasks?filter=unscheduled&taskMonth=" + taskMonth);
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
      borderColor: "hover:border-blue-500",
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
      borderColor: "hover:border-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: () => handleStatsClick("tasks"),
    },
    // {
    //   title: "Team Members",
    //   value: companyStatsCheck?.statistics?.teamMembers || 0,
    //   subtitle: `${
    //     companyStatsCheck?.statistics?.teamMembers || 0
    //   } total employees`,
    //   icon: FiUsers,
    //   color: "bg-green-500",
    //   bgColor: "bg-green-50",
    //   textColor: "text-green-600",
    //   onClick: () => handleStatsClick("employees"),
    // },
    {
      title: "In Progress",
      value: companyStatsCheck?.statistics?.inProgress || 0,
      subtitle: `${companyStatsCheck?.statistics?.pending || 0} pending`,
      icon: FiClock,
      color: "bg-orange-500",
      borderColor: "hover:border-orange-500",
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
      borderColor: "hover:border-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      onClick: () => handleStatsClick("on-review"),
    },
    {
      title: "Content Approved",
      value: companyStatsCheck?.statistics?.approved || 0,
      subtitle: "Awaiting client review",
      icon: FiCheckCircle,
      color: "bg-teal-500",
      borderColor: "hover:border-teal-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      onClick: () => handleStatsClick("client-review"),
    },
    {
      title: "Client Approved ",
      value: companyStatsCheck?.statistics?.clientApproved || 0,
      subtitle: "Ready to publish",
      icon: MdBusinessCenter,
      color: "bg-indigo-500",
      borderColor: "hover:border-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      onClick: () => navigate("/task-on-publish"),
    },
    {
      title: "Re-work",
      value: companyStatsCheck?.statistics?.rework || 0,
      subtitle: "Needs revision",
      icon: FiAlertCircle,
      color: "bg-red-500",
      borderColor: "hover:border-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      onClick: () => handleStatsClick("re-work"),
    },
    {
      title: "Completed ",
      value: companyStatsCheck?.statistics?.completed || 0,
      subtitle: "Work completed",
      icon: FiCheckCircle,
      color: "bg-green-500",
      borderColor: "hover:border-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      onClick: () => handleStatsClick("completed"),
    },
    {
      title: "Overdue Tasks",
      value: companyStatsCheck?.statistics?.overdue || 0,
      subtitle: "Need attention",
      icon: FiAlertCircle,
      color: "bg-red-500",
      borderColor: "hover:border-red-500",
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
      borderColor: "hover:border-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      onClick: () => navigate("/company-today-tasks?taskMonth=" + taskMonth),
    },
    {
      title: "Unscheduled Tasks",
      value: companyStatsCheck?.statistics?.unscheduled || 0,
      subtitle: "Need scheduling",
      icon: FiCalendar,
      color: "bg-gray-500",
      borderColor: "hover:border-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
      onClick: () => handleStatsClick("unscheduled"),
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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-2 flex-1">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className={`${stat.bgColor} rounded-xl p-4 flex flex-col items-center
               justify-center text-center cursor-pointer border-1 border-transparent
                 ${stat.borderColor} transform  group relative overflow-hidden`}
            >
              <div className={`${stat.color} p-3 rounded-lg mb-3`}>
                <Icon className="w-4  h-4  text-white" />
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-2`}>
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
