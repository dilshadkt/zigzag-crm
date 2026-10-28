import React, { useState } from "react";
import { useUpdateSubTaskById, useCreateReworkEvent } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import ReworkReasonModal from "../../shared/reworkReasonModal";
import WorkLinkModal from "../../shared/workLinkModal";
import CampaignReportModal from "../../shared/campaignReportModal";
import { useSubmitSubTaskCampaignReport } from "../../../api/campaignDetails";
import CategoryFieldsModal from "../../shared/CategoryFieldsModal";
import ShootSubmitModal from "../../shared/ShootSubmitModal";
import {
  isShootSessionSubtask,
  getShootWorkType,
  withFootageLink,
} from "../../../utils/shootSession";
import { toast } from "react-hot-toast";
import {
  getSubTaskCategoryFields,
  needsCategoryFieldsForReview,
} from "../../../utils/categoryFields";

const SubTaskStatusButton = ({
  subTask,
  parentTaskId,
  canEdit = true,
  showAllOptions = false,
  parentTaskFlow = [],
  siblingSubtasks = [],
  canEditTask = false,
  isAdmin = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [isWorkLinkModalOpen, setIsWorkLinkModalOpen] = useState(false);
  const [isCampaignReportModalOpen, setIsCampaignReportModalOpen] = useState(false);
  const [isCategoryFieldsModalOpen, setIsCategoryFieldsModalOpen] = useState(false);
  const [isShootModalOpen, setIsShootModalOpen] = useState(false);
  const [pendingShoot, setPendingShoot] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [reworkSource, setReworkSource] = useState("internal");
  const updateSubTaskMutation = useUpdateSubTaskById(subTask._id, parentTaskId);
  const reworkMutation = useCreateReworkEvent(parentTaskId);
  const submitCampaignReport = useSubmitSubTaskCampaignReport(subTask._id);
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
      label: "Complete",
      color: "bg-green-100 text-green-800",
    },
  ];

  // Check if work link is required (from subtask itself or inherited from parent task flow)
  const isWorkLinkRequired = subTask.requiresWorkLink || (parentTaskFlow?.flows?.some(flow => 
    flow.taskName?.toLowerCase() === subTask.title?.toLowerCase() && flow.requiresWorkLink
  ));

  // Campaign work needs a report before it can go to review or completion.
  // The report is missing, or stale when it predates the last rework.
  const isCampaignReportRequired =
    subTask.requiresCampaignReport ||
    parentTaskFlow?.flows?.some(
      (flow) =>
        flow.taskName?.toLowerCase() === subTask.title?.toLowerCase() &&
        (flow.requiresCampaignReport ||
          String(flow.taskName || "").toLowerCase() === "campaign")
    );

  const needsCampaignReport = () => {
    if (!isCampaignReportRequired) return false;
    const lastRework = subTask.reworkHistory?.[subTask.reworkHistory.length - 1];
    const submittedAt = subTask.campaignReport?.submittedAt
      ? new Date(subTask.campaignReport.submittedAt)
      : null;
    return (
      !submittedAt ||
      Boolean(lastRework?.changedAt && submittedAt < new Date(lastRework.changedAt))
    );
  };

  // Check if client approval is required
  const isClientApprovalRequired = subTask.requiresClientApproval || (parentTaskFlow?.flows?.some(flow => 
    flow.taskName?.toLowerCase() === subTask.title?.toLowerCase() && flow.requiresClientApproval
  ));

  // Get status options based on user role or explicit override
  const statusOptions = (isCompany || showAllOptions)
    ? adminStatusOptions.filter(opt => {
        // Complete is admin-only, for closing work still on client-approved.
        if (opt.value === "completed") return isCompany || isAdmin;

        if (isClientApprovalRequired) {
          return true;
        }
        // If client approval is NOT required, hide "Client Approved"
        return opt.value !== "client-approved";
      })
    : employeeStatusOptions;

  const currentStatus = adminStatusOptions.find(
    (status) => status.value === subTask.status
  );

  // Sequential lock: only company-admin can start a later step early.
  const isLocked = subTask.isLocked && !isCompany && !isAdmin;
  const waitingForClient =
    subTask.status === "approved" && isClientApprovalRequired;

  // reportDone: the campaign report step already ran, so go on to the next step
  const handleStatusChange = async (newStatus, reportDone = false) => {
    if (!canEdit || isLocked) return;

    if (newStatus === "re-work") {
      setReworkSource(
        ["approved", "client-approved", "completed"].includes(subTask.status)
          ? "client"
          : "internal"
      );
      setPendingStatus(newStatus);
      setIsReworkModalOpen(true);
      setIsOpen(false);
      return;
    }

    // Campaign report comes first, before the work link
    if (
      !reportDone &&
      (newStatus === "on-review" || newStatus === "completed") &&
      needsCampaignReport()
    ) {
      setPendingStatus(newStatus);
      setIsCampaignReportModalOpen(true);
      setIsOpen(false);
      return;
    }

    // Check if work link is required for the selected status
    const isAdminCompletingFinishedWork =
      (isCompany || isAdmin) &&
      newStatus === "completed" &&
      ["approved", "client-approved", "completed"].includes(subTask.status);

    // A shoot session collects its own footage link (see ShootSubmitModal)
    const shootGateApplies =
      (newStatus === "on-review" || newStatus === "completed") &&
      isShootSessionSubtask(subTask) &&
      !["on-review", "approved", "client-approved", "completed"].includes(subTask.status);

    if (
      !isAdminCompletingFinishedWork &&
      !shootGateApplies &&
      (newStatus === "on-review" || newStatus === "completed" || newStatus === "client-approved") &&
      isWorkLinkRequired
    ) {
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

    if (shootGateApplies) {
      setPendingStatus(newStatus);
      setIsShootModalOpen(true);
      setIsOpen(false);
      return;
    }

    if (
      (newStatus === "on-review" || newStatus === "completed") &&
      needsCategoryFieldsForReview(subTask)
    ) {
      setPendingStatus(newStatus);
      setIsCategoryFieldsModalOpen(true);
      setIsOpen(false);
      return;
    }

    try {
      await updateSubTaskMutation.mutateAsync({
        status: newStatus,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating subtask status:", error);
    }
  };

  const handleReworkSubmit = async (payload) => {
    try {
      await reworkMutation.mutateAsync(payload);
      toast.success("Sent back for rework");
      setIsReworkModalOpen(false);
      setPendingStatus(null);
    } catch (error) {
      console.error("Error updating subtask status with rework:", error);
      toast.error(error.response?.data?.message || "Failed to send to rework");
    }
  };

  const handleCampaignReportSubmit = async (payload) => {
    try {
      // deferReview: the server must not move the work to review itself, so the
      // work link and category steps that follow are not skipped
      await submitCampaignReport.mutateAsync({ ...payload, deferReview: true });
      setIsCampaignReportModalOpen(false);
      toast.success("Campaign report saved");
      if (pendingStatus) {
        await handleStatusChange(pendingStatus, true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit campaign report");
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

      const shouldFillCategoryFields =
        pendingStatus === "on-review" && needsCategoryFieldsForReview(subTask);

      await updateSubTaskMutation.mutateAsync(
        shouldFillCategoryFields
          ? { customFields: updatedFields }
          : { status: pendingStatus, customFields: updatedFields }
      );
      
      setIsWorkLinkModalOpen(false);
      if (shouldFillCategoryFields) {
        setIsCategoryFieldsModalOpen(true);
        return;
      }
      setPendingStatus(null);
      toast.success("Work link submitted and status updated!");
    } catch (error) {
      console.error("Error updating subtask status with work link:", error);
      toast.error("Failed to update work link");
    }
  };

  const sendShootForReview = (shootSubmission, extra = {}) =>
    updateSubTaskMutation.mutateAsync({
      status: pendingStatus || "on-review",
      shootSubmission,
      customFields: withFootageLink(subTask.customFields, shootSubmission.footageLink),
      ...extra,
    });

  const handleShootSubmit = async (shootSubmission) => {
    try {
      // The shoot form already asks for the category's fields, so no second step
      await sendShootForReview(shootSubmission);
      setIsShootModalOpen(false);
      setPendingStatus(null);
      toast.success("Shoot submitted and status updated");
    } catch (error) {
      console.error("Error submitting shoot:", error);
      toast.error(error.response?.data?.message || "Failed to submit shoot");
    }
  };

  const handleCategoryFieldsSubmit = async (categoryFieldValues) => {
    try {
      if (pendingShoot) {
        await sendShootForReview(pendingShoot, { categoryFieldValues });
        setPendingShoot(null);
      } else {
        await updateSubTaskMutation.mutateAsync({
          status: pendingStatus || "on-review",
          categoryFieldValues,
        });
      }
      setIsCategoryFieldsModalOpen(false);
      setPendingStatus(null);
      toast.success("Details saved and status updated");
    } catch (error) {
      console.error("Error saving category fields:", error);
      toast.error("Failed to save category details");
    }
  };

  const isBypassed = subTask.isLocked && (isCompany || isAdmin);

  return (
    <div className="relative">
      <button
        onClick={() => canEdit && !isLocked && setIsOpen(!isOpen)}
        className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm flex items-center gap-1.5 ${
          waitingForClient
            ? "bg-amber-100 text-amber-800"
            : currentStatus?.color || "bg-gray-100 text-gray-800"
          } ${(!canEdit || isLocked) ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:scale-105 active:scale-95"} ${isBypassed ? "border border-blue-400" : ""}`}
        disabled={updateSubTaskMutation.isLoading || reworkMutation.isPending || !canEdit || isLocked}
        title={
          isLocked
            ? (subTask.lockedReason || "This subtask is locked until preceding tasks are completed")
            : waitingForClient
            ? "Internally approved. Waiting for client review."
            : (!canEdit ? "You can only edit subtasks assigned to you" : isBypassed ? "Locked subtask (Bypassed due to permissions)" : "")
        }
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
          : waitingForClient
          ? "Waiting for client"
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
        isLoading={reworkMutation.isPending}
        source={reworkSource}
        originSubTask={subTask}
        siblingSubtasks={siblingSubtasks}
        parentTaskId={parentTaskId}
      />

      <CampaignReportModal
        isOpen={isCampaignReportModalOpen}
        onClose={() => {
          setIsCampaignReportModalOpen(false);
          setPendingStatus(null);
        }}
        onSubmit={handleCampaignReportSubmit}
        isLoading={submitCampaignReport.isPending}
        initialReport={subTask.campaignReport}
        projectId={subTask?.project?._id || subTask?.project}
        hasCampaign={Boolean(subTask?.campaign)}
      />

      <WorkLinkModal
        isOpen={isWorkLinkModalOpen}
        onClose={() => setIsWorkLinkModalOpen(false)}
        onSubmit={handleWorkLinkSubmit}
        isLoading={updateSubTaskMutation.isLoading}
        initialValue={getCurrentLink(subTask)}
        history={subTask.workLinkHistory}
      />
      <CategoryFieldsModal
        isOpen={isCategoryFieldsModalOpen}
        onClose={() => setIsCategoryFieldsModalOpen(false)}
        onSubmit={handleCategoryFieldsSubmit}
        isLoading={updateSubTaskMutation.isLoading}
        fields={getSubTaskCategoryFields(subTask)}
        categoryName={subTask.taskCategory?.name}
      />
      {isShootSessionSubtask(subTask) && (
        <ShootSubmitModal
          isOpen={isShootModalOpen}
          onClose={() => setIsShootModalOpen(false)}
          onSubmit={handleShootSubmit}
          isLoading={updateSubTaskMutation.isPending}
          subtask={subTask}
          projectId={subTask.project?._id || subTask.project}
          shootTaskId={parentTaskId}
          workType={getShootWorkType(subTask)}
        />
      )}
    </div>
  );
};

export default SubTaskStatusButton;
