import React, { useState } from "react";
import { useEmpoyees } from "../../../api/hooks";
import { useCreateTaskFlow, useUpdateTaskFlow } from "../../../api/hooks";

const TaskFlowModal = ({ isOpen, onClose, companyId, taskFlow = null }) => {
  const [name, setName] = useState(taskFlow?.name || "");
  const [localError, setLocalError] = useState("");
  const [flows, setFlows] = useState(
    taskFlow?.flows?.length > 0
      ? taskFlow.flows.map((flow) => ({
        taskName: flow.taskName || "",
        assignee: flow.assignee?._id || flow.assignee || "",
        weightage: flow.weightage !== undefined ? flow.weightage : 1,
      }))
      : [{ taskName: "", assignee: "", weightage: 1 }]
  );
  const { data: employeesData } = useEmpoyees(1);
  const employees = employeesData?.employees || [];

  // Available task types for dropdown
  const taskTypes = [
    "content",
    "design",
    "publish",
    "campaign",
    "motion",
    "video editing",
    "video shooting",
  ];

  const createTaskFlow = useCreateTaskFlow(companyId, () => {
    console.log("Task flow created successfully");
    // Reset form
    setName("");
    setFlows([{ taskName: "", assignee: "", weightage: 1 }]);
    onClose();
  });

  const updateTaskFlow = useUpdateTaskFlow(companyId, () => {
    console.log("Task flow updated successfully");
    onClose();
  });

  // Add error handling
  if (createTaskFlow.error) {
    console.error("Task flow creation error:", createTaskFlow.error);
  }
  if (updateTaskFlow.error) {
    console.error("Task flow update error:", updateTaskFlow.error);
  }

  const handleFlowChange = (idx, field, value) => {
    setFlows((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  };
  const addFlow = () =>
    setFlows((prev) => [...prev, { taskName: "", assignee: "", weightage: 1 }]);
  const removeFlow = (idx) =>
    setFlows((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!name.trim()) {
      setLocalError("Task flow name is required");
      return;
    }

    for (let i = 0; i < flows.length; i++) {
      const f = flows[i];
      if (
        !f.taskName.trim() ||
        !f.assignee ||
        f.weightage === undefined ||
        f.weightage === null
      ) {
        setLocalError(
          `Flow ${i + 1} must have taskName, assignee, and weightage`
        );
        return;
      }
    }

    console.log("Submitting task flow:", { name, flows });

    if (taskFlow) {
      // Update existing task flow
      updateTaskFlow.mutate({
        taskFlowId: taskFlow._id,
        taskFlowData: { name, flows },
      });
    } else {
      // Create new task flow
      createTaskFlow.mutate({ name, flows });
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {taskFlow ? "Edit Task Flow" : "Create Task Flow"}
            </h2>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Flow Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Enter task flow name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Flow Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Steps
                </label>
                <span className="text-xs text-gray-500">
                  {flows.length} step{flows.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2">
                {flows.map((flow, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Task Type */}
                    <select
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      value={flow.taskName}
                      onChange={(e) =>
                        handleFlowChange(idx, "taskName", e.target.value)
                      }
                      required
                    >
                      <option value="">Task Type</option>
                      {taskTypes.map((taskType) => (
                        <option
                          key={taskType}
                          value={taskType}
                          className="capitalize"
                        >
                          {taskType}
                        </option>
                      ))}
                    </select>

                    {/* Weightage */}
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="w-16 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-center"
                      value={flow.weightage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        handleFlowChange(
                          idx,
                          "weightage",
                          isNaN(val) ? 0 : val
                        );
                      }}
                      placeholder="Weight"
                      title="Task weightage (0-10)"
                    />

                    {/* Arrow */}
                    <div className="text-gray-400">
                      <svg
                        className="w-4 h-4"
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
                    </div>

                    {/* Assignee */}
                    <select
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      value={flow.assignee}
                      onChange={(e) =>
                        handleFlowChange(idx, "assignee", e.target.value)
                      }
                      required
                    >
                      <option value="">Assignee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      {flows.length > 1 && (
                        <button
                          type="button"
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          onClick={() => removeFlow(idx)}
                          title="Remove step"
                        >
                          <svg
                            className="w-4 h-4"
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
                      )}
                      {idx === flows.length - 1 && (
                        <button
                          type="button"
                          className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          onClick={addFlow}
                          title="Add step"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {(createTaskFlow.error || updateTaskFlow.error || localError) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-red-400 mr-2"
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
                    {localError ||
                      (createTaskFlow.error || updateTaskFlow.error)?.response
                        ?.data?.message ||
                      (createTaskFlow.error || updateTaskFlow.error)?.message}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                disabled={createTaskFlow.isLoading || updateTaskFlow.isLoading}
              >
                {createTaskFlow.isLoading || updateTaskFlow.isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
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
                    Saving...
                  </>
                ) : taskFlow ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskFlowModal;
