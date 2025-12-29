import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";

const Overview = ({ employeeId, selectedMonth, isLoading, statistics }) => {
  const navigate = useNavigate();

  const monthLabel = useMemo(() => {
    if (!selectedMonth) return "All subtasks";
    const [year, month] = selectedMonth.split("-");
    if (!year || !month) return "All subtasks";
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString(
      "default",
      { month: "long", year: "numeric" }
    );
  }, [selectedMonth]);

  console.log(statistics)

  // Use statistics from API if available, otherwise default to 0
  const totalSubTasks = statistics?.total || 0;
  const completedSubTasks = statistics?.completed || 0;
  const inProgressSubTasks = statistics?.inProgress || 0;
  const pendingSubTasks = statistics?.pending || 0;
  const overdueSubTasks = statistics?.overdue || 0;
  const todaySubTasks = statistics?.today || 0;
  const onReviewSubTasks = statistics?.onReview || 0;
  const reworkSubTasks = statistics?.rework || 0;
  const upcoming3DaysSubTasks = statistics?.upcoming3Days || 0;
  const completionRate = statistics?.completionRate || 0;
  const approvedSubTasks = statistics?.approved || 0;

  // Navigation handlers for stat cards
  const handleStatsClick = (statType) => {
    // Keep task listing in sync with the selected month on the overview
    const monthQuery = selectedMonth ? `&taskMonth=${selectedMonth}` : "";

    switch (statType) {
      case "total":
        navigate(
          `/employees/${employeeId}/subtasks${selectedMonth ? `?taskMonth=${selectedMonth}` : ""
          }`
        );
        break;
      case "completed":
        navigate(
          `/employees/${employeeId}/subtasks?filter=completed${monthQuery}`
        );
        break;
      case "in-progress":
        navigate(
          `/employees/${employeeId}/subtasks?filter=in-progress${monthQuery}`
        );
        break;

      case "approved":
        navigate(
          `/employees/${employeeId}/subtasks?filter=approved${monthQuery}`
        );
        break;
      case "pending":
        navigate(
          `/employees/${employeeId}/subtasks?filter=pending${monthQuery}`
        );
        break;
      case "today":
        navigate(`/employees/${employeeId}/subtasks?filter=today${monthQuery}`);
        break;
      case "overdue":
        navigate(
          `/employees/${employeeId}/subtasks?filter=overdue${monthQuery}`
        );
        break;
      case "on-review":
        navigate(
          `/employees/${employeeId}/subtasks?filter=on-review${monthQuery}`
        );
        break;
      case "rework":
        navigate(
          `/employees/${employeeId}/subtasks?filter=re-work${monthQuery}`
        );
        break;
      case "upcoming":
        navigate(
          `/employees/${employeeId}/subtasks?filter=upcoming${monthQuery}`
        );
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#E6EBF5] border-t-[#3F8CFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flexBetween mb-4">
        <div className="flex flex-col">
          <h4 className="font-semibold text-lg text-gray-800">Task Progress</h4>
          <span className="text-xs text-gray-500">{monthLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">
            {completionRate}%
          </div>
          <div className="text-xs text-gray-500">Task Completion</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Subtask Completion Rate</span>
          <span>
            {completedSubTasks} of {totalSubTasks} tasks completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
      {/* Subtask Statistics */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        <StatCard
          title="Total task"
          value={totalSubTasks}
          color="blue"
          onClick={() => handleStatsClick("total")}
        />
        <StatCard
          title="Today's tasks"
          value={todaySubTasks}
          color="purple"
          onClick={() => handleStatsClick("today")}
        />
        <StatCard
          title="Upcoming (3 days)"
          value={upcoming3DaysSubTasks}
          color="cyan"
          onClick={() => handleStatsClick("upcoming")}
        />
        <StatCard
          title="Completed"
          value={completedSubTasks}
          color="green"
          percent={
            totalSubTasks > 0
              ? Math.round((completedSubTasks / totalSubTasks) * 100)
              : 0
          }
          onClick={() => handleStatsClick("completed")}
        />
        <StatCard
          title="In Progress"
          value={inProgressSubTasks}
          color="yellow"
          percent={
            totalSubTasks > 0
              ? Math.round((inProgressSubTasks / totalSubTasks) * 100)
              : 0
          }
          onClick={() => handleStatsClick("in-progress")}
        />
        <StatCard
          title="Approved"
          value={approvedSubTasks}
          color="green"
          percent={
            totalSubTasks > 0
              ? Math.round((approvedSubTasks / totalSubTasks) * 100)
              : 0
          }
          onClick={() => handleStatsClick("approved")}
        />
        <StatCard
          title="On Review"
          value={onReviewSubTasks}
          color="indigo"
          percent={
            totalSubTasks > 0
              ? Math.round((onReviewSubTasks / totalSubTasks) * 100)
              : 0
          }
          onClick={() => handleStatsClick("on-review")}
        />
        <StatCard
          title="Rework"
          value={reworkSubTasks}
          color="pink"
          percent={
            totalSubTasks > 0
              ? Math.round((reworkSubTasks / totalSubTasks) * 100)
              : 0
          }
          onClick={() => handleStatsClick("rework")}
        />
        <StatCard
          title="Overdue"
          value={overdueSubTasks}
          color="red"
          onClick={() => handleStatsClick("overdue")}
        />
      </div>
      {/* Overdue Subtasks Alert */}
      {overdueSubTasks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-red-700">
              {overdueSubTasks} overdue subtask
              {overdueSubTasks > 1 ? "s" : ""} - Please review and update these
              subtasks
            </span>
          </div>
        </div>
      )}
      {/* No Subtasks Message */}
      {totalSubTasks === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📊</div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No subtasks assigned yet
          </h3>
          <p className="text-gray-500 text-sm">
            Subtask statistics will appear here once subtasks are assigned.
          </p>
        </div>
      )}
    </div>
  );
};

export default Overview;
