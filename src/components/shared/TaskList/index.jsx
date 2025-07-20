import React from "react";
import { FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const TaskList = ({ tasks }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <FiClock className="w-4 h-4" />;
      case "pending":
        return <FiAlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleTaskClick = (task) => {
    if (task.project?._id && task._id) {
      navigate(`/projects/${task.project._id}/${task._id}`);
    } else if (task._id) {
      // For tasks without project, navigate to task details directly
      navigate(`/tasks/${task._id}`);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => handleTaskClick(task)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {task.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{task.description}</p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <FiClock className="w-4 h-4" />
                  <span>
                    Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(
                    task.status
                  )}`}
                >
                  {getStatusIcon(task.status)}
                  <span className="capitalize">{task.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
