import { CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TasksTab = ({ project, formatDate }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          onClick={() => navigate(`/projects/${project.name}`)}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="px-4 py-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dt className="text-xs font-medium text-gray-500 truncate">
                  Completed Tasks
                </dt>
                <dd className="text-xl font-semibold text-gray-900">
                  {project?.tasks?.filter((task) => task.status === "completed")
                    .length || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate(`/projects/${project.name}`)}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="px-4 py-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dt className="text-xs font-medium text-gray-500 truncate">
                  In Progress
                </dt>
                <dd className="text-xl font-semibold text-gray-900">
                  {project?.tasks?.filter(
                    (task) => task.status === "in-progress"
                  ).length || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate(`/projects/${project.name}`)}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="px-4 py-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dt className="text-xs font-medium text-gray-500 truncate">
                  Total Tasks
                </dt>
                <dd className="text-xl font-semibold text-gray-900">
                  {project?.tasks?.length || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 sm:px-6">
          <h3 className="text-base font-medium leading-6 text-gray-900">
            Tasks List
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Task
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Due Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assigned To
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {project?.tasks?.map((task) => (
                  <tr key={task._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                      {task.title || "Untitled Task"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full 
                        ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.status?.charAt(0).toUpperCase() +
                          task.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {task.assignedTo?.firstName || "Unassigned"}
                    </td>
                  </tr>
                ))}
                {(!project?.tasks || project.tasks.length === 0) && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-3 text-center text-xs text-gray-500"
                    >
                      No tasks found for this project.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksTab;
