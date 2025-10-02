import React from "react";

const TaskDescription = ({ taskDetails }) => {
  if (!taskDetails) return null;

  return (
    <>
      {/* Parent Recurring Task Info */}
      {taskDetails.parentRecurringTask && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-green-800">
              This is a recurring task instance
            </span>
          </div>
        </div>
      )}

      {/* Task Description */}
      {taskDetails.task_description && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
            Task Description
          </h5>
          <p className="text-gray-600">{taskDetails.task_description}</p>
        </div>
      )}

      {/* Content For Description */}
      {taskDetails.copyOfDescription && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
            Content For Description
          </h5>
          <p className="text-gray-600">{taskDetails.copyOfDescription}</p>
        </div>
      )}

      {/* Copy of Description */}
      {taskDetails.description && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
            Copy of Description
          </h5>
          <p className="text-gray-600">{taskDetails.description}</p>
        </div>
      )}

      {/* Recurring Task Instances */}
      {taskDetails.recurringInstances &&
        taskDetails.recurringInstances.length > 0 && (
          <div className="mt-6">
            <h5 className="text-sm font-medium text-[#91929E] uppercase mb-3">
              Recurring Instances ({taskDetails.recurringInstances.length})
            </h5>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {taskDetails.recurringInstances.map((instance) => (
                <div
                  key={instance._id}
                  className="bg-green-50 rounded-lg p-3 border border-green-200"
                >
                  <div className="flexBetween">
                    <span className="text-sm font-medium text-green-800">
                      {instance.title}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        instance.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : instance.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {instance.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Due:{" "}
                    {instance.dueDate
                      ? new Date(instance.dueDate).toLocaleDateString()
                      : "No date"}
                    {instance.assignedTo &&
                      instance.assignedTo.length > 0 &&
                      ` • Assigned to: ${instance.assignedTo
                        .slice(0, 2)
                        .map((user) => user.firstName)
                        .join(", ")}${
                        instance.assignedTo.length > 2
                          ? ` +${instance.assignedTo.length - 2} more`
                          : ""
                      }`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </>
  );
};

export default TaskDescription;
