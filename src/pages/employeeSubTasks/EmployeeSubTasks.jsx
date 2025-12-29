import React, { useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useGetEmployeeTasks } from "../../api/hooks";
import { format } from "date-fns";

const statusColorMap = {
  completed: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  todo: "bg-gray-100 text-gray-800",
  pending: "bg-gray-100 text-gray-800",
  "on-review": "bg-purple-100 text-purple-800",
  "on-hold": "bg-orange-100 text-orange-800",
  "re-work": "bg-red-100 text-red-800",
  approved: "bg-emerald-100 text-emerald-800",
};

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
    if (!employeeTasksData?.tasks) return [];

    let allTasks = [
      ...(employeeTasksData.tasks || []),
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

    return allTasks;
  }, [employeeTasksData, filter]);

  const handleTaskClick = (task) => {
    if (task.parentTask && task.parentTask._id) {
      if (task.project) {
        navigate(
          `/projects/${task.project._id}/${task.parentTask._id}?subTaskId=${task._id}`
        );
      }
    } else if (task.project) {
      navigate(`/projects/${task.project._id}/${task._id}`);
    } else {
      navigate(`/tasks/${task._id}`);
    }
  };

  return (
    <div className=" mx-auto ">
      <button
        className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm"
        onClick={() => navigate(-1)}
      >
        ← Back to Employee Details
      </button>
      <h2 className="text-2xl font-bold mb-4">
        Employee Tasks {filter ? `- ${filter.replace(/-/g, " ")}` : ""}
      </h2>
      {isLoading ? (
        <div>Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-gray-500">No tasks found for this filter.</div>
      ) : (
        <ul className="space-y-2">
          {filteredTasks.map((task) => (
            <li
              key={task._id}
              className="p-4 bg-white rounded-xl  border border-gray-200 cursor-pointer 
              hover:bg-gray-50 transition-all group"
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold   transition-colors">
                  {task.title}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    statusColorMap[task.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status?.replace(/-/g, " ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-1">
                {task.project && (
                  <span className="bg-blue-50 px-2 py-1 rounded text-blue-700">
                    Project: {task.project.name}
                  </span>
                )}
                {task.parentTask && (
                  <span className="bg-gray-50 px-2 py-1 rounded text-gray-700">
                    Parent Task: {task.parentTask.title}
                  </span>
                )}
                <span className="bg-gray-50 px-2 py-1 rounded text-gray-700">
                  Due:{" "}
                  {task.dueDate
                    ? format(new Date(task.dueDate), "MMM dd, yyyy")
                    : "No due date"}
                </span>
              </div>
              {task.description && (
                <div className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {task.description}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeSubTasks;
