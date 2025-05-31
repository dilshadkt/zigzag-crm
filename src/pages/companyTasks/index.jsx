import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAllCompanyTasks } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/shared/header";
import Navigator from "../../components/shared/navigator";
import {
  FiClock,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiFlag,
  FiPlay,
  FiPause,
  FiCheckCircle,
} from "react-icons/fi";

const CompanyTasks = () => {
  const { user, companyId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter"); // Can be: 'overdue', 'in-progress', 'pending', 'completed'

  // Get all company tasks and filter based on URL parameter
  const { data: allTasksData, isLoading } = useGetAllCompanyTasks(companyId);
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    if (allTasksData?.tasks) {
      const today = new Date();
      let filtered = [];

      switch (filter) {
        case "overdue":
          filtered = allTasksData.tasks.filter((task) => {
            const dueDate = new Date(task.dueDate);
            return dueDate < today && task.status !== "completed";
          });
          break;
        case "in-progress":
          filtered = allTasksData.tasks.filter(
            (task) => task.status === "in-progress"
          );
          break;
        case "pending":
          filtered = allTasksData.tasks.filter(
            (task) => task.status === "pending"
          );
          break;
        case "completed":
          filtered = allTasksData.tasks.filter(
            (task) => task.status === "completed"
          );
          break;
        default:
          filtered = allTasksData.tasks; // Show all tasks if no filter
      }

      setFilteredTasks(filtered);
    }
  }, [allTasksData, filter]);

  const getFilterTitle = () => {
    switch (filter) {
      case "overdue":
        return "Overdue Tasks";
      case "in-progress":
        return "In Progress Tasks";
      case "pending":
        return "Pending Tasks";
      case "completed":
        return "Completed Tasks";
      default:
        return "All Tasks";
    }
  };

  const getFilterIcon = () => {
    switch (filter) {
      case "overdue":
        return FiAlertCircle;
      case "in-progress":
        return FiPlay;
      case "pending":
        return FiPause;
      case "completed":
        return FiCheckCircle;
      default:
        return FiFlag;
    }
  };

  const getFilterColor = () => {
    switch (filter) {
      case "overdue":
        return "text-red-600";
      case "in-progress":
        return "text-blue-600";
      case "pending":
        return "text-orange-600";
      case "completed":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

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
      default:
        return {
          emoji: "📋",
          title: "No tasks found",
          message: "Create some tasks to get started.",
        };
    }
  };

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
    // Navigate to task details within project context
    navigate(`/projects/${task.project?.name}/${task._id}`);
  };

  if (isLoading) {
    return (
      <section className="flex flex-col">
        <Navigator path={"/"} title={"Back to Dashboard"} />
        <Header>{getFilterTitle()}</Header>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const FilterIcon = getFilterIcon();
  const emptyState = getEmptyStateMessage();

  return (
    <section className="flex flex-col">
      <Navigator path={"/"} title={"Back to Dashboard"} />
      <div className="flexBetween mb-6">
        <Header>{getFilterTitle()}</Header>
        <div className={`flex items-center gap-2 ${getFilterColor()}`}>
          <FilterIcon className="w-5 h-5" />
          <span className="font-medium">{filteredTasks.length} tasks</span>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">{emptyState.emoji}</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {emptyState.title}
          </h3>
          <p className="text-gray-600">{emptyState.message}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              onClick={() => handleTaskClick(task)}
              className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {task.title}
                    </h3>
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
                      <span>
                        {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                      </span>
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
                  {filter === "overdue" && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {getDaysOverdue(task.dueDate)} days overdue
                      </span>
                    </div>
                  )}

                  {filter === "in-progress" && (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      <FiPlay className="w-4 h-4" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                  )}

                  {filter === "pending" && (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                      <FiPause className="w-4 h-4" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                  )}

                  {filter === "completed" && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                      <FiCheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Created by {task.creator?.firstName} {task.creator?.lastName}
                </div>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CompanyTasks;
