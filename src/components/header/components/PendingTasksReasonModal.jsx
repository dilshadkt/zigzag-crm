import React, { useState } from "react";
import { MdCheck, MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSubmitPendingReason } from "../../../api/hooks";

const PendingTasksReasonModal = ({ isOpen, onClose, onGlobalClose, tasks = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-[1100] backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">Pending Tasks ({tasks.length})</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {tasks.map((task) => (
            <TaskReasonRow key={task._id} task={task} onClose={onClose} onGlobalClose={onGlobalClose} />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-all active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskReasonRow = ({ task, onClose, onGlobalClose }) => {
  const navigate = useNavigate();
  const [reason, setReason] = useState(task.pendingReasonToday || "");
  const { mutate: submitReason, isPending: isSubmitting } = useSubmitPendingReason(task._id);
  const [isSaved, setIsSaved] = useState(task.hasPendingReasonToday);

  const handleSave = () => {
    if (!reason.trim()) return;
    submitReason(reason, {
      onSuccess: () => setIsSaved(true),
    });
  };

  const handleTitleClick = () => {
    const projectId = task.project?._id || task.project;
    const parentTaskId = task.parentTask?._id || task.parentTask;

    if (onGlobalClose) onGlobalClose();
    onClose();

    if (projectId && parentTaskId) {
      navigate(`/projects/${projectId}/${parentTaskId}`);
    } else if (parentTaskId) {
      navigate(`/tasks/${parentTaskId}`);
    } else {
      navigate(`/tasks/${task._id}`);
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 
          onClick={handleTitleClick}
          className="text-[13px] font-bold text-gray-800 truncate flex-1 cursor-pointer hover:text-blue-600 hover:underline transition-all"
        >
          {task.title}
        </h4>
        <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${isSaved ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
          }`}>
          {isSaved ? "Saved" : "Required"}
        </div>
      </div>

      <div className="flex gap-1.5">
        <input
          type="text"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Reason..."
          className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-[12px] focus:bg-white focus:border-blue-300 outline-none transition-all"
        />
        <button
          onClick={handleSave}
          disabled={isSubmitting || !reason.trim() || (isSaved && reason === task.pendingReasonToday)}
          className={`px-3 rounded-lg text-[11px] font-bold transition-all ${isSaved
            ? "bg-green-500 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isSaved ? (
            <MdCheck size={16} />
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
};

export default PendingTasksReasonModal;
