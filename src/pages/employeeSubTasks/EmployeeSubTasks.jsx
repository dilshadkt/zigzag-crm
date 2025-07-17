import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useGetEmployeeSubTasks } from "../../api/hooks";
import { format } from "date-fns";

const statusColorMap = {
  completed: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  todo: "bg-gray-100 text-gray-800",
  "on-review": "bg-purple-100 text-purple-800",
  "on-hold": "bg-orange-100 text-orange-800",
  "re-work": "bg-red-100 text-red-800",
  approved: "bg-emerald-100 text-emerald-800",
};

const EmployeeSubTasks = () => {
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const { data, isLoading } = useGetEmployeeSubTasks(employeeId);
  const navigate = useNavigate();
  const subTasks = data?.subTasks || [];

  // Filtering logic
  const today = new Date();
  let filteredSubTasks = subTasks;
  if (filter === "completed") {
    filteredSubTasks = subTasks.filter((s) => s.status === "completed");
  } else if (filter === "in-progress") {
    filteredSubTasks = subTasks.filter((s) => s.status === "in-progress");
  } else if (filter === "pending") {
    filteredSubTasks = subTasks.filter((s) => s.status === "todo");
  } else if (filter === "overdue") {
    filteredSubTasks = subTasks.filter((s) => {
      if (!s.dueDate) return false;
      const dueDate = new Date(s.dueDate);
      return dueDate < today && s.status !== "completed";
    });
  } else if (filter === "today") {
    filteredSubTasks = subTasks.filter((s) => {
      if (!s.dueDate) return false;
      const dueDate = new Date(s.dueDate);
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      );
    });
  }

  const handleSubTaskClick = (subTask) => {
    if (subTask.project && subTask.parentTask) {
      navigate(`/projects/${subTask.project._id}/${subTask.parentTask._id}?subTaskId=${subTask._id}`);
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
      <h2 className="text-2xl font-bold mb-4">Employee Tasks {filter ? `- ${filter.replace(/-/g, ' ')}` : ''}</h2>
      {isLoading ? (
        <div>Loading tasks...</div>
      ) : filteredSubTasks.length === 0 ? (
        <div className="text-gray-500">No subtasks found for this filter.</div>
      ) : (
        <ul className="space-y-2">
          {filteredSubTasks.map((subTask) => (
            <li
              key={subTask._id}
              className="p-4 bg-white rounded-xl  border border-gray-200 cursor-pointer 
              hover:bg-gray-50 transition-all group"
              onClick={() => handleSubTaskClick(subTask)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold   transition-colors">
                  {subTask.title}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColorMap[subTask.status] || "bg-gray-100 text-gray-800"}`}>
                  {subTask.status.replace(/-/g, " ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-1">
                {subTask.project && (
                  <span className="bg-blue-50 px-2 py-1 rounded text-blue-700">
                    Project: {subTask.project.name}
                  </span>
                )}
                {subTask.parentTask && (
                  <span className="bg-gray-50 px-2 py-1 rounded text-gray-700">
                    Parent Task: {subTask.parentTask.title}
                  </span>
                )}
                <span className="bg-gray-50 px-2 py-1 rounded text-gray-700">
                  Due: {subTask.dueDate ? format(new Date(subTask.dueDate), "MMM dd, yyyy") : "No due date"}
                </span>
              </div>
              {subTask.description && <div className="text-gray-500 text-sm mt-1 line-clamp-2">{subTask.description}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeSubTasks; 