import React from "react";

const TaskFlowSection = ({
  taskFlows,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const getTaskTypeColor = (taskType) => {
    const colors = {
      content: "bg-purple-100 text-purple-800 border-purple-200",
      design: "bg-pink-100 text-pink-800 border-pink-200",
      publish: "bg-green-100 text-green-800 border-green-200",
      campaign: "bg-orange-100 text-orange-800 border-orange-200",
      motion: "bg-blue-100 text-blue-800 border-blue-200",
      "video editing": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "video shooting": "bg-teal-100 text-teal-800 border-teal-200",
    };
    return colors[taskType] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="mt-4">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-32 bg-white rounded-xl border border-gray-200 shadow-sm">
          <img
            src="/icons/loading.svg"
            alt="Loading"
            className="w-8 h-8 mb-2"
          />
          <p className="text-gray-500 text-xs">Loading task flows...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-red-800">
              Error loading task flows: {error.message}
            </div>
          </div>
        </div>
      ) : !taskFlows || taskFlows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No task flows found
          </h3>
          <p className="text-xs text-gray-500 text-center max-w-sm">
            Create your first task flow to streamline your workflow and assign
            tasks efficiently.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Task Flow Name
                </h3>
              </div>
              <div className="col-span-5">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Workflow Steps
                </h3>
              </div>
              <div className="col-span-2">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </h3>
              </div>
              <div className="col-span-2">
                <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider text-right">
                  Actions
                </h3>
              </div>
            </div>
          </div>

          {/* Task Flow Rows */}
          <div className="divide-y divide-gray-100">
            {taskFlows.map((flow) => (
              <div
                key={flow._id}
                className={`px-4 py-4 hover:bg-gray-50 transition-colors duration-150 ${!flow.isActive ? "bg-gray-25 opacity-75" : ""
                  }`}
              >
                <div className="grid grid-cols-12 gap-4 items-start">
                  {/* Flow Name */}
                  <div className="col-span-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {flow.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {flow.flows?.length || 0} step
                          {(flow.flows?.length || 0) !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Steps */}
                  <div className="col-span-5">
                    <div className="space-y-2">
                      {flow.flows && flow.flows.length > 0 ? (
                        <div className="flex flex-col space-y-2">
                          {flow.flows.slice(0, 3).map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2"
                            >
                              <div className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 flex-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getTaskTypeColor(
                                    step.taskName
                                  )}`}
                                >
                                  {step.taskName}
                                </span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                  W{step.weightage !== undefined ? step.weightage : 1}
                                </span>
                                <svg
                                  className="w-3 h-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                                  {step.assignee?.name ||
                                    `${step.assignee?.firstName || ""} ${step.assignee?.lastName || ""
                                      }`.trim() ||
                                    "Unassigned"}
                                </span>
                              </div>
                            </div>
                          ))}
                          {flow.flows.length > 3 && (
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-400">
                                  ...
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                +{flow.flows.length - 3} more steps
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          No steps defined
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border ${flow.isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${flow.isActive ? "bg-green-400" : "bg-red-400"
                          }`}
                      ></span>
                      {flow.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {flow.isActive && (
                        <button
                          onClick={() => onEdit(flow)}
                          className="inline-flex items-center p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors duration-150"
                          title="Edit task flow"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {flow.isActive ? (
                        <button
                          onClick={() => onDelete(flow)}
                          className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                          title="Delete task flow"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => onRestore(flow)}
                          className="inline-flex items-center p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-150"
                          title="Restore task flow"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Flow Footer */}
      {taskFlows && taskFlows.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Showing {taskFlows.length} task flow
              {taskFlows.length !== 1 ? "s" : ""}
            </span>
            <span>
              {taskFlows.filter((f) => f.isActive).length} active,{" "}
              {taskFlows.filter((f) => !f.isActive).length} inactive
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFlowSection;
