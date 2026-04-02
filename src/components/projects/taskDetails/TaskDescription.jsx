import React from "react";

const TaskDescription = ({ taskDetails, subTasks = [] }) => {
  if (!taskDetails) return null;

  const contentSubTask = subTasks?.find(
    (st) => st.title?.toLowerCase() === "content"
  );

  const hasContentSubTaskData =
    contentSubTask &&
    (contentSubTask.copyOfDescription ||
      contentSubTask.description ||
      contentSubTask.ideas);

  const isWorkLinkRequired = (task) => {
    return (
      task?.requiresWorkLink ||
      task?.taskFlow?.flows?.some((flow) => flow.requiresWorkLink)
    );
  };

  const isWorkLinkField = (field) => {
    const label = field.label?.toLowerCase() || "";
    return (
      label.includes("work link") ||
      label.includes("google drive") ||
      label.includes("link")
    );
  };

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

      {/* Content from Subtask (Priority) */}
      {hasContentSubTaskData ? (
        <div className="mt-4 space-y-5">
          {contentSubTask.copyOfDescription && (
            <div>
              <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
                Content For Description
              </h5>
              <div className="flex flex-col gap-y-0.5">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {contentSubTask.copyOfDescription}
                </p>
              </div>
            </div>
          )}

          {contentSubTask.description && (
            <div>
              <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
                Description for publishing
              </h5>
              <div className="flex flex-col gap-y-0.5">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {contentSubTask.description}
                </p>
              </div>
            </div>
          )}

          {contentSubTask.ideas && (
            <div>
              <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 3a1 1 0 012 0v2a1 1 0 11-2 0V5zM9 9a1 1 0 000 2v3a1 1 0 102 0v-3a1 1 0 00-2 0z" />
                </svg>
                Ideas List
              </h5>
              <div className="flex flex-col gap-y-0.5">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {contentSubTask.ideas}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Fallback to Task Description */}
          {taskDetails.task_description && (
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
                Task Description
              </h5>
              <p className="text-gray-600">{taskDetails.task_description}</p>
            </div>
          )}

          {/* Fallback to Content For Description */}
          {taskDetails.copyOfDescription && (
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
                Content For Description
              </h5>
              <p className="text-gray-600">{taskDetails.copyOfDescription}</p>
            </div>
          )}

          {/* Fallback to Copy of Description */}
          {taskDetails.description && (
            <div className="mt-4">
              <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
                Copy of Description
              </h5>
              <p className="text-gray-600">{taskDetails.description}</p>
            </div>
          )}
        </>
      )}

      {/* Dynamic Custom Fields */}
      {taskDetails.customFields &&
        taskDetails.customFields.filter((f) => {
          if (!f.value || f.value.trim() === "") return false;
          if (isWorkLinkField(f)) return isWorkLinkRequired(taskDetails);
          return true;
        }).length > 0 && (
          <div className="mt-6 flex flex-wrap gap-4">
            {taskDetails.customFields
              .filter((f) => {
                if (!f.value || f.value.trim() === "") return false;
                if (isWorkLinkField(f)) return isWorkLinkRequired(taskDetails);
                return true;
              })
              .map((field, index) => (
                <div
                  key={index}
                  className="flex-1 min-w-[200px] bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 transition-all hover:bg-blue-50"
                >
                  <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                    {field.label}
                  </h5>
                  <div className="flex items-center gap-2">
                    {field.label.toLowerCase().includes("url") ||
                      field.value?.toString().startsWith("http") ? (
                      <a
                        href={
                          field.value.startsWith("http")
                            ? field.value
                            : `https://${field.value}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium hover:underline flex items-center gap-1.5 break-all text-sm"
                      >
                        <span>{field.value}</span>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ) : (
                      <p className="text-gray-700 font-medium text-sm">
                        {field.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
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
                      className={`px-2 py-1 rounded-full text-xs font-medium ${instance.status === "completed"
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
                        .join(", ")}${instance.assignedTo.length > 2
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
