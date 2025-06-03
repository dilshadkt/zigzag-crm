import React, { useState } from "react";
import { useUpdateSubTaskById } from "../../../api/hooks";

const SubTaskStatusButton = ({ subTask, parentTaskId, canEdit = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateSubTaskMutation = useUpdateSubTaskById(subTask._id, parentTaskId);

  const statusOptions = [
    { value: "todo", label: "To Do", color: "bg-gray-100 text-gray-800" },
    {
      value: "in-progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
    },
  ];

  const currentStatus = statusOptions.find(
    (status) => status.value === subTask.status
  );

  const handleStatusChange = async (newStatus) => {
    if (!canEdit) return;

    try {
      await updateSubTaskMutation.mutateAsync({ status: newStatus });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating subtask status:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => canEdit && setIsOpen(!isOpen)}
        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
          currentStatus?.color || "bg-gray-100 text-gray-800"
        } ${!canEdit ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        disabled={updateSubTaskMutation.isLoading || !canEdit}
        title={!canEdit ? "You can only edit subtasks assigned to you" : ""}
      >
        {updateSubTaskMutation.isLoading
          ? "Updating..."
          : currentStatus?.label || "To Do"}
      </button>

      {isOpen && canEdit && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-20 min-w-[120px]">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  status.value === subTask.status
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SubTaskStatusButton;
