import React from "react";

const EmptyState = ({ filter }) => {
  const getEmptyStateMessage = () => {
    switch (filter) {
      case "overdue":
        return {
          emoji: "🎉",
          title: "Great! No overdue tasks",
          message: "All tasks are on track. Keep up the excellent work!",
        };
      case "in-progress":
        return {
          emoji: "💼",
          title: "No tasks in progress",
          message: "Start working on pending tasks to see them here.",
        };
      case "pending":
        return {
          emoji: "📝",
          title: "No pending tasks",
          message: "All tasks have been started or completed.",
        };
      case "completed":
        return {
          emoji: "🚀",
          title: "No completed tasks yet",
          message: "Complete some tasks to see them here.",
        };
      case "approved":
        return {
          emoji: "✅",
          title: "No approved tasks yet",
          message: "Tasks that have been approved will appear here.",
        };
      case "re-work":
        return {
          emoji: "🔧",
          title: "No re-work tasks",
          message: "Tasks that need revision will appear here.",
        };
      case "unscheduled":
        return {
          emoji: "📅",
          title: "No unscheduled tasks",
          message: "All tasks have been scheduled with start and due dates.",
        };
      case "upcoming":
        return {
          emoji: "🎯",
          title: "No upcoming tasks",
          message: "No tasks are due in the next 3 days. Great planning!",
        };
      default:
        return {
          emoji: "📋",
          title: "No tasks found",
          message: "Create some tasks to get started.",
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="bg-white h-full flex items-center justify-center flex-col rounded-xl p-8 text-center">
      <div className="text-6xl mb-4">{emptyState.emoji}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {emptyState.title}
      </h3>
      <p className="text-gray-600">{emptyState.message}</p>
    </div>
  );
};

export default EmptyState;
