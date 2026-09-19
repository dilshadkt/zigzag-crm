import React, { useState } from "react";
import { format } from "date-fns";
import { RiErrorWarningLine, RiNotification3Line, RiCheckLine, RiCheckboxCircleFill, RiCheckboxBlankCircleLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { useGetOverlappingTasks, useNotifyReporter } from "../hooks/useVacations";

const OverlappingTasks = ({ vacationId, showHeading = true }) => {
  const { data, isLoading } = useGetOverlappingTasks(vacationId);
  const notifyReporter = useNotifyReporter();
  const [notifiedTasks, setNotifiedTasks] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isBulkNotifying, setIsBulkNotifying] = useState(false);

  const handleNotify = async (taskId) => {
    try {
      await notifyReporter.mutateAsync({ vacationId, taskId });
      setNotifiedTasks((prev) => new Set(prev).add(taskId));
    } catch (error) {
      console.error("Failed to notify reporter", error);
    }
  };

  const handleBulkNotify = async () => {
    if (selectedTasks.size === 0) return;
    
    setIsBulkNotifying(true);
    try {
      const promises = Array.from(selectedTasks).map((taskId) => 
        notifyReporter.mutateAsync({ vacationId, taskId })
      );
      
      await Promise.all(promises);
      
      setNotifiedTasks((prev) => {
        const newSet = new Set(prev);
        selectedTasks.forEach(id => newSet.add(id));
        return newSet;
      });
      setSelectedTasks(new Set()); // Clear selection after successful notify
    } catch (error) {
      console.error("Failed to notify reporters", error);
    } finally {
      setIsBulkNotifying(false);
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <div className="text-[10px] text-gray-400 mt-2 px-2">Checking tasks...</div>;
  }

  const tasks = data?.tasks || [];

  if (tasks.length === 0) {
    return null; // No overlapping tasks
  }

  const unnotifiedTasks = tasks.filter(t => !notifiedTasks.has(t._id) && !t.isReportedConflict);
  const isAllSelected = unnotifiedTasks.length > 0 && selectedTasks.size === unnotifiedTasks.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(unnotifiedTasks.map(t => t._id)));
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="mt-2 bg-red-50/80 hover:bg-red-100/80 cursor-pointer rounded-lg p-2 border border-red-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-wider">
          <RiErrorWarningLine size={12} />
          Overlapping Tasks
        </div>
        <div className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded shadow-sm">
          {tasks.length}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-xl shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <RiErrorWarningLine className="text-red-500" /> Overlapping Tasks
                </h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  The employee has {tasks.length} tasks scheduled during this leave period.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-all"
              >
                <RxCross2 size={18} />
              </button>
            </div>

            {/* Select All Bar */}
            {unnotifiedTasks.length > 0 && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <button 
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  {isAllSelected ? (
                    <RiCheckboxCircleFill className="text-indigo-600" size={16} />
                  ) : (
                    <RiCheckboxBlankCircleLine className="text-slate-300" size={16} />
                  )}
                  Select All Unnotified
                </button>
              </div>
            )}

            <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0 custom-scrollbar">
              {tasks.map((task) => {
                const isNotified = notifiedTasks.has(task._id) || task.isReportedConflict;
                const isSelected = selectedTasks.has(task._id);
                const isNotifyLoading = notifyReporter.isPending && notifyReporter.variables?.taskId === task._id;

                return (
                  <div 
                    key={task._id} 
                    onClick={() => !isNotified && toggleTaskSelection(task._id)}
                    className={`flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all ${
                      isNotified 
                        ? 'bg-slate-50 border-slate-100 opacity-75' 
                        : isSelected 
                          ? 'bg-indigo-50/50 border-indigo-200 cursor-pointer' 
                          : 'bg-white border-gray-100 hover:border-indigo-100 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 mr-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {isNotified ? (
                          <RiCheckLine className="text-green-500" size={16} />
                        ) : isSelected ? (
                          <RiCheckboxCircleFill className="text-indigo-600" size={16} />
                        ) : (
                          <RiCheckboxBlankCircleLine className="text-slate-300 group-hover:text-indigo-300" size={16} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[12px] font-bold line-clamp-2 ${isNotified ? 'text-slate-500 line-through' : 'text-gray-800'}`} title={task.parentTask?.title ? `${task.parentTask.title} - ${task.title}` : task.title}>
                          {task.parentTask?.title ? `${task.parentTask.title} - ${task.title}` : task.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-medium text-gray-500">
                          <span className={`font-bold px-1.5 py-0.5 rounded ${isNotified ? 'bg-slate-200 text-slate-500' : 'text-red-500 bg-red-50'}`}>
                            Due: {format(new Date(task.dueDate), "MMM dd")}
                          </span>
                          {task.project && (
                            <span className={`px-1.5 py-0.5 rounded ${isNotified ? 'bg-slate-200 text-slate-500' : 'text-indigo-500 bg-indigo-50'}`}>
                              {task.project.name}
                            </span>
                          )}
                          <span className="capitalize bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            {task.status.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isNotified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                          <RiCheckLine size={12} /> Notified
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent toggling selection
                            handleNotify(task._id);
                          }}
                          disabled={isNotifyLoading || isBulkNotifying}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isNotifyLoading ? "Sending..." : "Notify"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bulk Action Footer */}
            {selectedTasks.size > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                <div className="text-[11px] font-bold text-slate-600">
                  <span className="text-indigo-600">{selectedTasks.size}</span> tasks selected
                </div>
                <button
                  onClick={handleBulkNotify}
                  disabled={isBulkNotifying}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                >
                  <RiNotification3Line size={14} />
                  {isBulkNotifying ? "Reporting..." : `Report ${selectedTasks.size} Tasks`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OverlappingTasks;
