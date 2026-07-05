import React, { useState } from "react";
import { useUpdateSubTaskById } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import ReworkReasonModal from "../../shared/reworkReasonModal";
import WorkLinkModal from "../../shared/workLinkModal";
import { toast } from "react-hot-toast";

const SubTaskStatusButton = ({
  subTask,
  parentTaskId,
  canEdit = true,
  showAllOptions = false,
  parentTaskFlow = [],
  canEditTask = false,
  isAdmin = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [isWorkLinkModalOpen, setIsWorkLinkModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const updateSubTaskMutation = useUpdateSubTaskById(subTask._id, parentTaskId);
  const { isCompany } = useAuth();

  const getCurrentLink = (subt) => {
    if (!subt) return "";
    const field = (subt.customFields || []).find(f => 
      f.label?.toLowerCase().includes("work link") || 
      f.label?.toLowerCase().includes("google drive") ||
      f.label?.toLowerCase().includes("link")
    );
    return field?.value || "";
  };

  // Status options for employees
  const employeeStatusOptions = [
    { value: "todo", label: "To Do", color: "bg-gray-100 text-gray-800" },
    {
      value: "in-progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "paused",
      label: "Paused",
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "on-review",
      label: "On Review",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  // Status options for company admins (all options)
  const adminStatusOptions = [
    { value: "todo", label: "To Do", color: "bg-gray-100 text-gray-800" },
    {
      value: "in-progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "on-review",
      label: "On Review",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "paused",
      label: "Paused",
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "on-hold",
      label: "On Hold",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "re-work",
      label: "Re-work",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "approved",
      label: "Approved",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      value: "client-approved",
      label: "Client Approved",
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
    },
  ];

  // Check if work link is required (from subtask itself or inherited from parent task flow)
  const isWorkLinkRequired = subTask.requiresWorkLink || (parentTaskFlow?.flows?.some(flow => 
    flow.taskName?.toLowerCase() === subTask.title?.toLowerCase() && flow.requiresWorkLink
  ));

  // Check if client approval is required
  const isClientApprovalRequired = subTask.requiresClientApproval || (parentTaskFlow?.flows?.some(flow => 
    flow.taskName?.toLowerCase() === subTask.title?.toLowerCase() && flow.requiresClientApproval
  ));

  // Get status options based on user role or explicit override
  const statusOptions = (isCompany || showAllOptions)
    ? adminStatusOptions.filter(opt => {
        // Always hide "Completed" as a manual option; it's handled via Approved/Client Approved
        if (opt.value === "completed") return false;

        if (isClientApprovalRequired) {
          // If client approval is required, show everything except manual "Completed"
          return true;
        }
        // If client approval is NOT required, hide "Client Approved"
        return opt.value !== "client-approved";
      })
    : employeeStatusOptions;

  const currentStatus = adminStatusOptions.find(
    (status) => status.value === subTask.status
  );

  // Check if subtask is locked (sequential flow dependency)
  // Bypass lock if user is company, admin, or has edit permission
  const isLocked = subTask.isLocked && !isCompany && !isAdmin && !canEditTask;

  const handleStatusChange = async (newStatus) => {
    if (!canEdit || isLocked) return;

    if (newStatus === "re-work") {
      setPendingStatus(newStatus);
      setIsReworkModalOpen(true);
      setIsOpen(false);
      return;
    }

    // Check if work link is required for the selected status
    if ((newStatus === "on-review" || newStatus === "completed" || newStatus === "client-approved") && isWorkLinkRequired) {
      // Check if link already exists in custom fields or publish URLs
      const hasLink = (subTask.customFields || []).some(f => 
        (f.label?.toLowerCase().includes("work link") || f.label?.toLowerCase().includes("google drive") || f.label?.toLowerCase().includes("url")) && 
        f.value && f.value.toString().trim() !== ""
      ) || (subTask.publishUrls && Object.values(subTask.publishUrls).some(v => v && typeof v === 'string' && v.trim() !== ""));

      // Always prompt for a link if moving from re-work to on-review
      const isMovingFromReworkToReview = subTask.status === "re-work" && (newStatus === "on-review" || newStatus === "completed" || newStatus === "client-approved");

      let needsNewLinkAfterRework = false;
      if (subTask.reworkHistory && subTask.reworkHistory.length > 0) {
        const lastRework = subTask.reworkHistory[subTask.reworkHistory.length - 1];
        const lastReworkDate = lastRework?.changedAt ? new Date(lastRework.changedAt) : new Date(0);
        
        if (subTask.workLinkHistory && subTask.workLinkHistory.length > 0) {
          const lastLink = subTask.workLinkHistory[subTask.workLinkHistory.length - 1];
          const lastLinkUpdateDate = lastLink?.submittedAt ? new Date(lastLink.submittedAt) : new Date(0);
          needsNewLinkAfterRework = lastReworkDate > lastLinkUpdateDate;
        } else {
          needsNewLinkAfterRework = true;
        }
      } else if (subTask.reworkCount > 0 && (!subTask.workLinkHistory || subTask.workLinkHistory.length === 0)) {
        needsNewLinkAfterRework = true;
      }

      if (!hasLink || isMovingFromReworkToReview || needsNewLinkAfterRework) {
        if (!hasLink && (newStatus === "completed" || newStatus === "client-approved")) {
          toast.error("Work link is mandatory for this subtask. Please add it first.", {
            duration: 4000,
            position: "top-center"
          });
        }
        setPendingStatus(newStatus);
        setIsWorkLinkModalOpen(true);
        setIsOpen(false);
        return;
      }
    }

    try {
      // Map final approval statuses to completed behind the scenes
      let finalStatus = newStatus;
      if (newStatus === "client-approved") {
        finalStatus = "completed";
      } else if (newStatus === "approved" && !isClientApprovalRequired) {
        finalStatus = "completed";
      }
      
      await updateSubTaskMutation.mutateAsync({
        status: finalStatus,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating subtask status:", error);
    }
  };

  const handleReworkSubmit = async ({ reason, voiceNoteUrl }) => {
    try {
      await updateSubTaskMutation.mutateAsync({
        status: pendingStatus,
        reworkReason: reason,
        voiceNoteUrl,
      });
      setIsReworkModalOpen(false);
      setPendingStatus(null);
    } catch (error) {
      console.error("Error updating subtask status with rework:", error);
    }
  };

  const handleWorkLinkSubmit = async (workLink) => {
    try {
      // Update custom fields with the new work link
      let updatedFields = [...(subTask.customFields || [])];
      const linkFieldIndex = updatedFields.findIndex(f => 
        f.label?.toLowerCase().includes("work link") || 
        f.label?.toLowerCase().includes("google drive") ||
        f.label?.toLowerCase().includes("link")
      );

      if (linkFieldIndex !== -1) {
        updatedFields[linkFieldIndex].value = workLink;
      } else {
        updatedFields.push({ label: "Work Link", value: workLink, type: "url" });
      }

      // Map final approval statuses to completed behind the scenes
      let finalStatus = pendingStatus;
      if (pendingStatus === "client-approved") {
        finalStatus = "completed";
      } else if (pendingStatus === "approved" && !isClientApprovalRequired) {
        finalStatus = "completed";
      }

      await updateSubTaskMutation.mutateAsync({
        status: finalStatus,
        customFields: updatedFields,
      });
      
      setIsWorkLinkModalOpen(false);
      setPendingStatus(null);
      toast.success("Work link submitted and status updated!");
    } catch (error) {
      console.error("Error updating subtask status with work link:", error);
      toast.error("Failed to update work link");
    }
  };

  const isBypassed = subTask.isLocked && (isCompany || isAdmin || canEditTask);

  return (
    <div className="relative">
      <button
        onClick={() => canEdit && !isLocked && setIsOpen(!isOpen)}
        className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm flex items-center gap-1.5 ${currentStatus?.color || "bg-gray-100 text-gray-800"
          } ${(!canEdit || isLocked) ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:scale-105 active:scale-95"} ${isBypassed ? "border border-blue-400" : ""}`}
        disabled={updateSubTaskMutation.isLoading || !canEdit || isLocked}
        title={isLocked ? "This subtask is locked until preceding tasks are completed" : (!canEdit ? "You can only edit subtasks assigned to you" : isBypassed ? "Locked subtask (Bypassed due to permissions)" : "")}
      >
        {subTask.isLocked && !isLocked ? (
          // Show unlocked icon if it's normally locked but bypassed
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zM7 7a3 3 0 016 0v2H7V7z" />
          </svg>
        ) : isLocked && (
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        )}
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
            {statusOptions.map((status) => {
              const isSelected = status.value === subTask.status || (status.value === "client-approved" && subTask.status === "completed");
              return (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${isSelected
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                    }`}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <ReworkReasonModal
        isOpen={isReworkModalOpen}
        onClose={() => setIsReworkModalOpen(false)}
        onSubmit={handleReworkSubmit}
        isLoading={updateSubTaskMutation.isLoading}
      />

      <WorkLinkModal
        isOpen={isWorkLinkModalOpen}
        onClose={() => setIsWorkLinkModalOpen(false)}
        onSubmit={handleWorkLinkSubmit}
        isLoading={updateSubTaskMutation.isLoading}
        initialValue={getCurrentLink(subTask)}
        history={subTask.workLinkHistory}
      />
    </div>
  );
};

export default SubTaskStatusButton;
