import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";

const Overview = ({ subTasks, employeeId, selectedMonth, isLoading }) => {
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
  const todaySubTasks = subTasks.filter((subTask) => {
    if (!subTask.dueDate) return false;
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

  // Navigation handlers for stat cards
  const handleStatsClick = (statType) => {
    switch (statType) {
      case "total":
        navigate(`/employees/${employeeId}/subtasks`);
        break;
      case "completed":
        navigate(`/employees/${employeeId}/subtasks?filter=completed`);
        break;
      case "in-progress":
        navigate(`/employees/${employeeId}/subtasks?filter=in-progress`);
        break;
      case "pending":
        navigate(`/employees/${employeeId}/subtasks?filter=pending`);
        break;
      case "today":
        navigate(`/employees/${employeeId}/subtasks?filter=today`);
        break;
      case "overdue":
        navigate(`/employees/${employeeId}/subtasks?filter=overdue`);
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
          <h4 className="font-semibold text-lg text-gray-800">
            Task Progress
          </h4>
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
      <div className="grid grid-cols-6 gap-4 flex-1">
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
          title="Pending"
          value={pendingSubTasks}
          color="orange"
          percent={
            totalSubTasks > 0
              ? Math.round((pendingSubTasks / totalSubTasks) * 100)
              : 0
          }
          onClick={() => handleStatsClick("pending")}
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
