import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUpdateSubTaskById } from "../../../api/hooks";
import ReworkReasonModal from "../../shared/reworkReasonModal";
import WorkLinkModal from "../../shared/workLinkModal";
import { toast } from "react-hot-toast";
import { FiPlay, FiPause, FiSend, FiCheck, FiRotateCcw, FiChevronRight } from "react-icons/fi";

/**
 * SubtaskActionBar — replaces the status dropdown for assigned employees
 * and shows reviewer actions for admins/reporters/managers.
 *
 * Modes:
 *  - employee: Start / Pause / Resume / Timer / Submit for Review
 *  - reviewer: Approve / Reject / Forward to Client
 */
const SubtaskActionBar = ({
  subtask,
  parentTaskId,
  parentTaskFlow,
  isAssigned,      // current user is assigned to this subtask
  isReviewer,      // current user can review (admin/reporter/manager)
  isCompany,
  isAdmin,
}) => {
  const updateMutation = useUpdateSubTaskById(subtask._id, parentTaskId);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [isWorkLinkModalOpen, setIsWorkLinkModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const status = subtask.status?.toLowerCase() || "todo";

  // Check if client approval is required
  const isClientApprovalRequired =
    subtask.requiresClientApproval ||
    parentTaskFlow?.flows?.some(
      (flow) =>
        flow.taskName?.toLowerCase() === subtask.title?.toLowerCase() &&
        flow.requiresClientApproval
    );

  // Check if work link is required
  const isWorkLinkRequired =
    subtask.requiresWorkLink ||
    parentTaskFlow?.flows?.some(
      (flow) =>
        flow.taskName?.toLowerCase() === subtask.title?.toLowerCase() &&
        flow.requiresWorkLink
    );

  const getCurrentLink = () => {
    const field = (subtask.customFields || []).find(
      (f) =>
        f.label?.toLowerCase().includes("work link") ||
        f.label?.toLowerCase().includes("google drive") ||
        f.label?.toLowerCase().includes("link")
    );
    return field?.value || "";
  };

  // ─── Timer Logic ────────────────────────────────────────────────────────
  const computeElapsed = useCallback(() => {
    const base = subtask.totalActualTime || 0; // minutes already stored
    if (status === "in-progress" && subtask.lastStartedAt) {
      const started = new Date(subtask.lastStartedAt).getTime();
      const now = Date.now();
      const sessionSeconds = Math.max(0, Math.floor((now - started) / 1000));
      return base * 60 + sessionSeconds; // convert base minutes to seconds + live session
    }
    return base * 60; // just show stored time in seconds
  }, [subtask.totalActualTime, subtask.lastStartedAt, status]);

  useEffect(() => {
    setElapsed(computeElapsed());

    if (status === "in-progress" && subtask.lastStartedAt) {
      intervalRef.current = setInterval(() => {
        setElapsed(computeElapsed());
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, subtask.lastStartedAt, subtask.totalActualTime, computeElapsed]);

  const formatTimer = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ─── Status change helpers ──────────────────────────────────────────────
  const changeStatus = async (newStatus, extra = {}) => {
    try {
      await updateMutation.mutateAsync({ status: newStatus, ...extra });
    } catch (err) {
      console.error("SubtaskActionBar status change error:", err);
      toast.error("Failed to update status");
    }
  };

  const handleStart = () => changeStatus("in-progress");
  const handlePause = () => changeStatus("paused");
  const handleResume = () => changeStatus("in-progress");

  const handleSubmitForReview = () => {
    // Check work link requirement before submitting
    if (isWorkLinkRequired) {
      const hasLink = getCurrentLink().trim() !== "";
      // If reworked, check if link was updated after rework
      let needsNewLink = false;
      if (subtask.reworkHistory?.length > 0) {
        const lastRework = subtask.reworkHistory[subtask.reworkHistory.length - 1];
        const lastReworkDate = lastRework?.changedAt ? new Date(lastRework.changedAt) : new Date(0);
        if (subtask.workLinkHistory?.length > 0) {
          const lastLink = subtask.workLinkHistory[subtask.workLinkHistory.length - 1];
          const lastLinkDate = lastLink?.submittedAt ? new Date(lastLink.submittedAt) : new Date(0);
          needsNewLink = lastReworkDate > lastLinkDate;
        } else {
          needsNewLink = true;
        }
      }

      if (!hasLink || needsNewLink) {
        setPendingAction("on-review");
        setIsWorkLinkModalOpen(true);
        return;
      }
    }
    changeStatus("on-review");
  };

  // Reviewer actions
  const handleApprove = () => {
    if (isClientApprovalRequired) {
      // Move to approved (internal), not completed
      changeStatus("approved");
    } else {
      // No client approval needed → completed
      changeStatus("completed");
    }
  };

  const handleReject = () => {
    setIsReworkModalOpen(true);
  };

  const handleForwardToClient = () => {
    // Client approved → completed
    changeStatus("completed");
  };

  const handleClientReject = () => {
    setIsReworkModalOpen(true);
  };

  const handleReworkSubmit = async ({ reason, voiceNoteUrl }) => {
    try {
      await updateMutation.mutateAsync({
        status: "re-work",
        reworkReason: reason,
        voiceNoteUrl,
      });
      setIsReworkModalOpen(false);
    } catch (err) {
      console.error("Rework submit error:", err);
      toast.error("Failed to send to rework");
    }
  };

  const handleWorkLinkSubmit = async (workLink) => {
    try {
      let updatedFields = [...(subtask.customFields || [])];
      const idx = updatedFields.findIndex(
        (f) =>
          f.label?.toLowerCase().includes("work link") ||
          f.label?.toLowerCase().includes("google drive") ||
          f.label?.toLowerCase().includes("link")
      );
      if (idx !== -1) {
        updatedFields[idx].value = workLink;
      } else {
        updatedFields.push({ label: "Work Link", value: workLink, type: "url" });
      }

      await updateMutation.mutateAsync({
        status: pendingAction || "on-review",
        customFields: updatedFields,
      });
      setIsWorkLinkModalOpen(false);
      setPendingAction(null);
      toast.success("Work link submitted & sent for review!");
    } catch (err) {
      console.error("Work link submit error:", err);
      toast.error("Failed to submit work link");
    }
  };

  const isUpdating = updateMutation.isLoading || updateMutation.isPending;

  // ─── Render ─────────────────────────────────────────────────────────────

  // EMPLOYEE ACTION BAR (assigned user)
  if (isAssigned && !isReviewer) {
    return (
      <>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Timer display (always visible when there's any time logged) */}
          {(status === "in-progress" || elapsed > 0) && (
            <div
              className={`font-mono text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                status === "in-progress"
                  ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                  : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  status === "in-progress" ? "bg-blue-500" : "bg-gray-400"
                }`}
              />
              {formatTimer(elapsed)}
            </div>
          )}

          {/* Start button */}
          {(status === "todo" || status === "re-work") && (
            <button
              onClick={handleStart}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
            >
              <FiPlay className="w-3 h-3" />
              Start
            </button>
          )}

          {/* Pause button */}
          {status === "in-progress" && (
            <button
              onClick={handlePause}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
            >
              <FiPause className="w-3 h-3" />
              Pause
            </button>
          )}

          {/* Resume button */}
          {status === "paused" && (
            <button
              onClick={handleResume}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
            >
              <FiPlay className="w-3 h-3" />
              Resume
            </button>
          )}

          {/* Submit for Review button */}
          {(status === "in-progress" || status === "paused") && (
            <button
              onClick={handleSubmitForReview}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
            >
              <FiSend className="w-3 h-3" />
              Submit for Review
            </button>
          )}

          {/* Read-only status for post-review states */}
          {["on-review", "approved", "completed", "client-approved"].includes(status) && (
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                status === "on-review"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : status === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {status === "on-review"
                ? "📋 In Review"
                : status === "approved"
                ? "✅ Approved"
                : status === "client-approved"
                ? "🎉 Client Approved"
                : "✅ Completed"}
            </span>
          )}
        </div>

        <WorkLinkModal
          isOpen={isWorkLinkModalOpen}
          onClose={() => setIsWorkLinkModalOpen(false)}
          onSubmit={handleWorkLinkSubmit}
          isLoading={isUpdating}
          initialValue={getCurrentLink()}
          history={subtask.workLinkHistory}
        />
      </>
    );
  }

  // REVIEWER ACTION BAR (admin / reporter / manager viewing on-review or approved subtask)
  if (isReviewer && (status === "on-review" || status === "approved")) {
    return (
      <>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-gray-200">
          {/* Timer display for reviewers */}
          {elapsed > 0 && (
            <div className="font-mono text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-200 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              {formatTimer(elapsed)}
            </div>
          )}

          {status === "on-review" && (
            <>
              <button
                onClick={handleApprove}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              >
                <FiCheck className="w-3.5 h-3.5" />
                {isClientApprovalRequired ? "Approve (Internal)" : "Approve & Complete"}
              </button>
              <button
                onClick={handleReject}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
                Rework
              </button>
            </>
          )}

          {status === "approved" && isClientApprovalRequired && (
            <>
              <button
                onClick={handleForwardToClient}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              >
                <FiChevronRight className="w-3.5 h-3.5" />
                Client Approved
              </button>
              <button
                onClick={handleClientReject}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
                Client Rejected
              </button>
            </>
          )}
        </div>

        <ReworkReasonModal
          isOpen={isReworkModalOpen}
          onClose={() => setIsReworkModalOpen(false)}
          onSubmit={handleReworkSubmit}
          isLoading={isUpdating}
        />
      </>
    );
  }

  // READ-ONLY STATUS LABEL (non-assigned, non-reviewer)
  if (!isAssigned && !isReviewer) {
    const statusLabels = {
      todo: { label: "To Do", cls: "bg-gray-100 text-gray-600 border-gray-200" },
      "in-progress": { label: "In Progress", cls: "bg-blue-50 text-blue-600 border-blue-200" },
      paused: { label: "Paused", cls: "bg-gray-100 text-gray-600 border-gray-200" },
      "on-review": { label: "In Review", cls: "bg-purple-50 text-purple-600 border-purple-200" },
      "re-work": { label: "Rework", cls: "bg-red-50 text-red-600 border-red-200" },
      approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
      "client-approved": { label: "Client Approved", cls: "bg-indigo-50 text-indigo-600 border-indigo-200" },
      completed: { label: "Completed", cls: "bg-green-50 text-green-600 border-green-200" },
      "on-hold": { label: "On Hold", cls: "bg-yellow-50 text-yellow-600 border-yellow-200" },
    };
    const info = statusLabels[status] || statusLabels["todo"];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${info.cls}`}>
        {info.label}
      </span>
    );
  }

  // Fallback: admin who is also assigned — show both employee bar + keep dropdown elsewhere
  // This case is handled by SubtasksSection passing isReviewer=true when applicable
  return null;
};

export default SubtaskActionBar;
