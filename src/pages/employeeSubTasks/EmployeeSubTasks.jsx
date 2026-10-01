import React, { useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useGetEmployeeTasks } from "../../api/hooks";
import { FiArrowLeft } from "react-icons/fi";
import Header from "../../components/shared/header";
import TaskList from "../../components/tasks/TaskList";

// Map URL filter to backend status filter, similar to MyTasks
const getStatusFromFilter = (filter) => {
  const statusMap = {
    "in-progress": "in-progress",
    pending: "pending", // backend accepts both "pending" and "todo"
    completed: "completed",
    approved: "approved",
    "client-approved": "client-approved",
    "on-review": "on-review",
    "re-work": "re-work",
    overdue: "overdue",
    upcoming: "upcoming",
    "monthly-rework": "monthly-rework",
  };
  return statusMap[filter] || null;
};

const EmployeeSubTasks = () => {
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const taskMonth = searchParams.get("taskMonth");
  const navigate = useNavigate();

  // Fetch employee tasks (tasks + subtasks) using the same hook as MyTasks
  const { data: employeeTasksData, isLoading } = useGetEmployeeTasks(
    employeeId,
    {
      taskMonth,
      status: getStatusFromFilter(filter),
    }
  );

  // Combine tasks and subtasks, then apply any special client-side filters
  const filteredTasks = useMemo(() => {
    if (!employeeTasksData) return [];

    let allTasks = [
      ...(employeeTasksData.subTasks || []),
    ];

    // Special client-side filter for "today" (backend handles most others)
    if (filter === "today") {
      const today = new Date();
      allTasks = allTasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return (
          dueDate.getDate() === today.getDate() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getFullYear() === today.getFullYear() &&
          task.status !== "approved" &&
          task.status !== "completed" &&
          task.status !== "client-approved"
        );
      });
    }

    // Filter out 'on-review' tasks unless explicitly requested
    if (filter !== "on-review") {
      allTasks = allTasks.filter(task => task.status !== "on-review");
    }

    return allTasks;
  }, [employeeTasksData, filter]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50/50">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0 bg-white shadow-sm"
              aria-label="Go back"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Task List Skeleton */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-2 md:p-0">
                <div className="flex flex-col gap-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="p-4 bg-white rounded-lg border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 animate-pulse"
                    >
                      <div className="flex-1 w-full space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="flex gap-3 mt-2">
                          <div className="h-5 w-16 bg-gray-100 rounded-full"></div>
                          <div className="h-5 w-20 bg-gray-100 rounded-full"></div>
                        </div>
                        <div className="flex gap-4 mt-3">
                          <div className="h-4 w-24 bg-gray-100 rounded"></div>
                          <div className="h-4 w-24 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center justify-end gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                        <div className="h-6 w-20 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0 bg-white shadow-sm"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <Header>Employee Tasks {filter ? `- ${filter.replace(/-/g, " ")}` : ""} - ({filteredTasks.length})</Header>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-2 md:p-0">
              <TaskList
                tasks={filteredTasks}
                filter={filter}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSubTasks;
