import React from "react";
import { FiEdit3, FiTrash2, FiRotateCcw, FiLayers, FiArrowRight, FiUser } from "react-icons/fi";

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
      content: "bg-purple-50 text-purple-600 border-purple-100",
      design: "bg-pink-50 text-pink-600 border-pink-100",
      publish: "bg-green-50 text-green-600 border-green-100",
      campaign: "bg-orange-50 text-orange-600 border-orange-100",
      motion: "bg-blue-50 text-blue-600 border-blue-100",
      "video editing": "bg-indigo-50 text-indigo-600 border-indigo-100",
      "video shooting": "bg-teal-50 text-teal-600 border-teal-100",
    };
    return colors[taskType?.toLowerCase()] || "bg-gray-50 text-gray-500 border-gray-100";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-[13px] font-medium text-gray-400">Loading pipelines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <FiTrash2 className="text-red-500 w-5 h-5" />
        </div>
        <h3 className="text-[14px] font-bold text-red-900 mb-1">Failed to load flows</h3>
        <p className="text-[12px] text-red-600/70 max-w-xs">{error.message}</p>
      </div>
    );
  }

  const flowsList = taskFlows || [];

  if (flowsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed px-6 text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <FiLayers className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-800 mb-1">No Task Flows</h3>
        <p className="text-[12px] text-gray-500 max-w-xs">
          Pipeline flows help you automate task assignment across different departments.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Section */}
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 uppercase">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-tight">
              Pipeline Name
            </h3>
          </div>
          <div className="col-span-6">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-tight">
              Workflow Chain & Assignees
            </h3>
          </div>
          <div className="col-span-2">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-tight">
              Status
            </h3>
          </div>
          <div className="col-span-1 text-right">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-tight pr-1">
              Cmd
            </h3>
          </div>
        </div>
      </div>

      {/* Pipeline List */}
      <div className="divide-y divide-gray-50">
        {flowsList.map((flow) => (
          <div
            key={flow._id}
            className={`px-4 py-3 hover:bg-gray-50/50 transition-all duration-200 group ${
              !flow.isActive ? "bg-gray-50/30 opacity-60" : ""
            }`}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Flow Name */}
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
                    <FiLayers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <div className="text-[13px] font-bold text-gray-800 truncate leading-tight mb-0.5">
                      {flow.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-tighter opacity-70">
                      {flow.flows?.length || 0} stages defined
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Chain */}
              <div className="col-span-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {flow.flows?.slice(0, 3).map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex items-center gap-1.5 bg-gray-50/50 border border-gray-100 pl-1 pr-2 py-0.5 rounded-md max-w-[140px]">
                        <span className={`text-[9px] font-bold uppercase py-0.5 px-1 rounded-sm border ${getTaskTypeColor(step.taskName)}`}>
                          {step.taskName?.substring(0, 3)}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-gray-700 truncate">
                            {step.assignee?.name || "Unassigned"}
                          </span>
                        </div>
                      </div>
                      {idx < Math.min(flow.flows.length - 1, 2) && (
                        <FiArrowRight className="text-gray-300 w-3 h-3 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                  {flow.flows?.length > 3 && (
                    <span className="text-[10px] font-bold text-gray-400 ml-1">
                      +{flow.flows.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight border ${
                    flow.isActive
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-red-50 text-red-500 border-red-100"
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full mr-1.5 ${flow.isActive ? "bg-green-500" : "bg-red-500"}`} />
                  {flow.isActive ? "Active" : "Paused"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="col-span-1 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(flow)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit pipeline"
                  >
                    <FiEdit3 className="w-3.5 h-3.5" />
                  </button>
                  {flow.isActive ? (
                    <button
                      onClick={() => onDelete(flow)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Archive pipeline"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onRestore(flow)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Restore pipeline"
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer statistics */}
      <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/20 flex justify-between items-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          Configured pipelines: {flowsList.length}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-400 font-bold uppercase">{flowsList.filter(f => f.isActive).length} Production</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-[10px] text-gray-400 font-bold uppercase">{flowsList.filter(f => !f.isActive).length} Testing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFlowSection;
