import React, { useState } from "react";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import {
  useGetPositions,
  useDeletePosition,
  useRestorePosition,
  useGetTaskFlows,
  useCreateTaskFlow,
  useUpdateTaskFlow,
  useDeleteTaskFlow,
  useRestoreTaskFlow,
} from "../../../api/hooks";
import AddPosition from "../../../components/settings/positions/addPosition";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import PositionAccessInfo from "../../../components/settings/PositionAccessInfo";
import { useEmpoyees } from "../../../api/hooks";

const TaskFlowModal = ({ isOpen, onClose, companyId, taskFlow = null }) => {
  const [name, setName] = useState(taskFlow?.name || "");
  const [flows, setFlows] = useState(
    taskFlow?.flows?.length > 0 
      ? taskFlow.flows.map(flow => ({
          taskName: flow.taskName || "",
          assignee: flow.assignee?._id || flow.assignee || ""
        }))
      : [{ taskName: "", assignee: "" }]
  );
  const { data: employeesData } = useEmpoyees(1);
  const employees = employeesData?.employees || [];
  
  // Available task types for dropdown
  const taskTypes = ["content", "design", "publish", "campaign"];
  
  console.log('Employees data:', employeesData);
  console.log('Employees array:', employees);
  console.log('Company ID:', companyId);
  console.log('TaskFlow for edit:', taskFlow);

  const createTaskFlow = useCreateTaskFlow(companyId, () => {
    console.log('Task flow created successfully');
    // Reset form
    setName("");
    setFlows([{ taskName: "", assignee: "" }]);
    onClose();
  });

  const updateTaskFlow = useUpdateTaskFlow(companyId, () => {
    console.log('Task flow updated successfully');
    onClose();
  });

  // Add error handling
  if (createTaskFlow.error) {
    console.error('Task flow creation error:', createTaskFlow.error);
  }
  if (updateTaskFlow.error) {
    console.error('Task flow update error:', updateTaskFlow.error);
  }

  const handleFlowChange = (idx, field, value) => {
    setFlows((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  };
  const addFlow = () => setFlows((prev) => [...prev, { taskName: "", assignee: "" }]);
  const removeFlow = (idx) => setFlows((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit clicked:', { name, flows, companyId, taskFlow });
    
    if (!name.trim()) {
      console.log('Name is empty');
      return;
    }
    
    if (flows.some(f => !f.taskName.trim() || !f.assignee)) {
      console.log('Some flows are incomplete:', flows);
      return;
    }
    
    console.log('Submitting task flow:', { name, flows });
    
    if (taskFlow) {
      // Update existing task flow
      updateTaskFlow.mutate({ 
        taskFlowId: taskFlow._id, 
        taskFlowData: { name, flows } 
      });
    } else {
      // Create new task flow
      createTaskFlow.mutate({ name, flows });
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">{taskFlow ? 'Edit Task Flow' : 'Add New Task Flow'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Task Flow Name</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Flow Steps</label>
            <div className="space-y-2">
              {flows.map((flow, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    className="border rounded px-2 py-1 text-xs flex-1"
                    value={flow.taskName}
                    onChange={e => handleFlowChange(idx, "taskName", e.target.value)}
                    required
                  >
                    <option value="">Select Task Type</option>
                    {taskTypes.map(taskType => (
                      <option key={taskType} value={taskType} className="text-gray-800 capitalize">
                        {taskType}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1 text-xs flex-1"
                    value={flow.assignee}
                    onChange={e => handleFlowChange(idx, "assignee", e.target.value)}
                    required
                  >
                    <option value="">Select Assignee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id} className="text-gray-800">
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {flows.length > 1 && (
                    <button type="button" className="text-red-500 px-2" onClick={() => removeFlow(idx)}>-</button>
                  )}
                  {idx === flows.length - 1 && (
                    <button type="button" className="text-green-500 px-2" onClick={addFlow}>+</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {(createTaskFlow.error || updateTaskFlow.error) && (
            <div className="text-red-500 text-xs">
              Error: {(createTaskFlow.error || updateTaskFlow.error)?.response?.data?.message || (createTaskFlow.error || updateTaskFlow.error)?.message}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-xs disabled:opacity-50"
              disabled={createTaskFlow.isLoading || updateTaskFlow.isLoading}
            >
              {createTaskFlow.isLoading || updateTaskFlow.isLoading 
                ? "Saving..." 
                : taskFlow ? "Update Task Flow" : "Save Task Flow"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Company = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { user } = useAuth();
  const companyId = user?.company;

  const { data: positions, isLoading, error: positionsError } = useGetPositions(companyId);
  console.log('Positions data:', positions);
  console.log('Positions loading:', isLoading);
  console.log('Positions error:', positionsError);
  console.log('Company ID:', companyId);
  const { mutate: deletePosition } = useDeletePosition(companyId);
  const { mutate: restorePosition } = useRestorePosition(companyId);
  const [showTaskFlowModal, setShowTaskFlowModal] = useState(false);
  const [selectedTaskFlow, setSelectedTaskFlow] = useState(null);
  const { data: taskFlows, isLoading: isTaskFlowsLoading, error: taskFlowsError } = useGetTaskFlows(companyId);
  const { mutate: deleteTaskFlow } = useDeleteTaskFlow(companyId);
  const { mutate: restoreTaskFlow } = useRestoreTaskFlow(companyId);
  

  const handleEdit = (position) => {
    setSelectedPosition(position);
    setShowAddModal(true);
  };

  const handleDelete = (position) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      deletePosition(position._id, {
        onSuccess: () => {
          toast.success("Position deleted successfully");
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Error deleting position"
          );
        },
      });
    }
  };

  const handleRestore = (position) => {
    restorePosition(position._id, {
      onSuccess: () => {
        toast.success("Position restored successfully");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Error restoring position"
        );
      },
    });
  };

  const handleDeleteTaskFlow = (taskFlow) => {
    if (window.confirm("Are you sure you want to delete this task flow?")) {
      deleteTaskFlow(taskFlow._id, {
        onSuccess: () => {
          toast.success("Task flow deleted successfully");
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Error deleting task flow"
          );
        },
      });
    }
  };

  const handleRestoreTaskFlow = (taskFlow) => {
    restoreTaskFlow(taskFlow._id, {
      onSuccess: () => {
        toast.success("Task flow restored successfully");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Error restoring task flow"
        );
      },
    });
  };

  const handleEditTaskFlow = (taskFlow) => {
    setSelectedTaskFlow(taskFlow);
    setShowTaskFlowModal(true);
  };

  const handleClose = () => {
    setShowAddModal(false);
    setSelectedPosition(null);
  };

  const handleTaskFlowModalClose = () => {
    setShowTaskFlowModal(false);
    setSelectedTaskFlow(null);
  };

  const isDefaultPosition = (name) => {
    const defaultPositions = [
      "Admin",
      "Project Manager",
      "Team Lead",
      "Employee",
      "Designer",
      "Developer",
    ];
    return defaultPositions.includes(name);
  };

  return (
    <div className="h-full  overflow-y-auto flex flex-col">
      {/* Position Access Info */}
      {/* <div className="px-2 py-2">
        <PositionAccessInfo />
      </div> */}
      
      {/* Header Section */}
      <div className="  mb-2 px-2 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Position Management
            </h1>
            <p className="mt-0.5 text-xs text-gray-600">
              Manage company positions and their access permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              {positions?.positions?.length || 0} positions
            </div>
            <PrimaryButton
              title="Add New Position"
              className="text-xs text-white px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow"
              onclick={() => setShowAddModal(true)}
            />
          </div>
        </div>
      </div>

              {/* Content Section */}
      <div className="flex-1  overflow-y-auto min-h-[500px]  max-h-[300px] ">
        {/* Debug Info */}
        <div className="bg-yellow-100 p-2 mb-2 text-xs">
          Debug: Positions count: {positions?.positions?.length || 0}, Loading: {isLoading ? 'true' : 'false'}
        </div>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-full bg-white rounded-xl border border-gray-200 shadow-sm">
            <img
              src="/icons/loading.svg"
              alt="Loading"
              className="w-10 h-10 mb-3"
            />
            <p className="text-gray-500 text-xs">Loading positions...</p>
          </div>
        ) : (
          <div
            className="bg-white rounded-xl border border-gray-200 
          shadow-sm h-full flex flex-col overflow-hidden"
          >
            {/* Table Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                    Position Name
                  </h3>
                </div>
                <div className="col-span-6">
                  <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                    Allowed Routes
                  </h3>
                </div>
                <div className="col-span-2">
                  <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </h3>
                </div>
                <div className="col-span-1">
                  <h3 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider text-right">
                    Actions
                  </h3>
                </div>
              </div>
            </div>

            {/* Scrollable Table Body */}
            <div className="flex-1 overflow-y-auto">
              {console.log('Rendering table with positions:', positions?.positions?.length, 'positions')}
              {/* Debug: Show positions count */}
              <div className="bg-blue-100 p-2 text-xs">
                Found {positions?.positions?.length || 0} positions to display
              </div>
              {positions?.positions?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No positions found
                  </h3>
                  <p className="text-xs text-gray-500 text-center max-w-sm">
                    Get started by creating your first position to manage team
                    access and permissions.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {positions?.positions?.map((position, index) => (
                    <div
                      key={position._id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                        !position.isActive ? "bg-gray-25 opacity-75" : ""
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Position Name */}
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center mr-2">
                              <span className="text-white text-xs font-semibold">
                                {position.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900 flex items-center">
                                {position.name}
                                {isDefaultPosition(position.name) && (
                                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                Position #{index + 1}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Allowed Routes */}
                        <div className="col-span-6">
                          <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                            {position.allowedRoutes.slice(0, 4).map((route) => (
                              <span
                                key={route}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                              >
                                {route}
                              </span>
                            ))}
                            {position.allowedRoutes.length > 4 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                +{position.allowedRoutes.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              position.isActive
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full mr-1 ${
                                position.isActive
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              }`}
                            ></span>
                            {position.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleEdit(position)}
                              className="inline-flex items-center p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors duration-150"
                              title="Edit position"
                            >
                              <svg
                                className="w-3 h-3"
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
                            {position.isActive ? (
                              <button
                                onClick={() => handleDelete(position)}
                                className="inline-flex items-center p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-150"
                                title="Delete position"
                              >
                                <svg
                                  className="w-3 h-3"
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
                                onClick={() => handleRestore(position)}
                                className="inline-flex items-center p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-150"
                                title="Restore position"
                              >
                                <svg
                                  className="w-3 h-3"
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
              )}
            </div>

            {/* Footer */}
            {positions?.positions?.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>
                    Showing {positions.positions.length} position
                    {positions.positions.length !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {positions.positions.filter((p) => p.isActive).length}{" "}
                    active,{" "}
                    {positions.positions.filter((p) => !p.isActive).length}{" "}
                    inactive
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddPosition
          isOpen={showAddModal}
          setShowModal={handleClose}
          initialValues={selectedPosition}
          companyId={companyId}
        />
      )}

      {/* Task Flow Section */}
      <div className=" mb-2 px-2 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Task Flow</h1>
            <p className="mt-0.5 text-xs text-gray-600">Define and manage your company task flows</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">{taskFlows ? taskFlows.length : 0} flows</div>
            <PrimaryButton
              title="Add New Task Flow"
              className="text-xs text-white px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow"
              onclick={() => setShowTaskFlowModal(true)}
            />
          </div>
        </div>
        <div className="mt-4">
          {isTaskFlowsLoading ? (
            <div className="text-xs text-gray-500">Loading task flows...</div>
          ) : taskFlowsError ? (
            <div className="text-xs text-red-500">Error loading task flows: {taskFlowsError.message}</div>
          ) : !taskFlows || taskFlows.length === 0 ? (
            <div className="text-xs text-gray-500">No task flows found. Add your first task flow.</div>
          ) : (
            <div className="divide-y divide-gray-200 bg-white rounded-xl border border-gray-200 shadow-sm">
              {taskFlows && taskFlows.map((flow) => (
                <div key={flow._id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{flow.name}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {flow.flows && flow.flows.map((step, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {step.taskName} → {step.assignee?.name || `${step.assignee?.firstName || ''} ${step.assignee?.lastName || ''}`.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${flow.isActive ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
                        {flow.isActive ? "Active" : "Inactive"}
                      </span>
                      <div className="flex items-center space-x-1">
                        {flow.isActive && (
                          <button
                            onClick={() => handleEditTaskFlow(flow)}
                            className="inline-flex items-center p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors duration-150"
                            title="Edit task flow"
                          >
                            <svg
                              className="w-3 h-3"
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
                            onClick={() => handleDeleteTaskFlow(flow)}
                            className="inline-flex items-center p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-150"
                            title="Delete task flow"
                          >
                            <svg
                              className="w-3 h-3"
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
                            onClick={() => handleRestoreTaskFlow(flow)}
                            className="inline-flex items-center p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-150"
                            title="Restore task flow"
                          >
                            <svg
                              className="w-3 h-3"
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
          )}
          
          {/* Task Flow Footer */}
          {taskFlows && taskFlows.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
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
      </div>
      {showTaskFlowModal && (
        <TaskFlowModal 
          isOpen={showTaskFlowModal} 
          onClose={handleTaskFlowModalClose} 
          companyId={companyId} 
          taskFlow={selectedTaskFlow}
        />
      )}
    </div>
  );
};

export default Company;
