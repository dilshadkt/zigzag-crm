import React, { useState } from "react";
import SubTaskStatusButton from "../subTaskStatus";
import SubTaskAttachments from "../../shared/SubTaskAttachments";
import Modal from "../../shared/modal";
import WorkLinkModal from "../../shared/workLinkModal";
import ActivityTimeline from "./ActivityTimeline";
import { FiActivity, FiClock, FiTarget, FiEdit3, FiLink } from "react-icons/fi";
import { usePermissions } from "../../../hooks/usePermissions";
import { useUpdateSubTaskById } from "../../../api/hooks";
import { toast } from "react-hot-toast";

const SubtasksSection = ({
  subTasks,
  subTasksLoading,
  user,
  isCompany,
  taskDetails,
  onEditSubTask,
  onDeleteSubTask,
  isAdmin,
  canManageSubtasks,
  canEditTask,
}) => {
  const { hasPermission } = usePermissions();
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [reworkModalOpen, setReworkModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [historySubTask, setHistorySubTask] = useState(null);
  const [reworkSubTask, setReworkSubTask] = useState(null);
  const [timelineSubTask, setTimelineSubTask] = useState(null);
  const [workLinkSubTask, setWorkLinkSubTask] = useState(null);
  const [isWorkLinkModalOpen, setIsWorkLinkModalOpen] = useState(false);

  // Status-agnostic update for work link
  const updateSubTaskMutation = useUpdateSubTaskById(workLinkSubTask?._id, taskDetails?._id);

  const isWorkLinkRequired = (subtask) => {
    return subtask?.requiresWorkLink || 
           taskDetails?.taskFlow?.flows?.some(flow => 
             flow.taskName?.toLowerCase() === subtask.title?.toLowerCase() && flow.requiresWorkLink
           );
  };

  const getCurrentLink = (subtask) => {
    if (!subtask || !isWorkLinkRequired(subtask)) return "";
    const field = (subtask.customFields || []).find(f => 
      f.label?.toLowerCase().includes("work link") || 
      f.label?.toLowerCase().includes("google drive") ||
      f.label?.toLowerCase().includes("link")
    );
    return field?.value || "";
  };

  const handleWorkLinkSubmit = async (workLink) => {
    try {
      let updatedFields = [...(workLinkSubTask.customFields || [])];
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

      await updateSubTaskMutation.mutateAsync({
        customFields: updatedFields,
      });
      
      setIsWorkLinkModalOpen(false);
      setWorkLinkSubTask(null);
      toast.success("Work link updated successfully!");
    } catch (error) {
      console.error("Error updating work link:", error);
      toast.error("Failed to update work link");
    }
  };

  // Check if user can delete subtasks (company admin or has tasks delete permission)
  const canDeleteSubtasks = isCompany || isAdmin || hasPermission("tasks", "delete");

  const formatTime = (minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Check if subtask has additional content to show
  const hasAdditionalContent = (subtask) => {
    return (
      subtask.description ||
      subtask.copyOfDescription ||
      subtask.ideas ||
      (subtask.publishUrls && Object.keys(subtask.publishUrls).length > 0)
    );
  };

  // Toggle expanded state for a subtask
  const toggleSubTaskExpanded = (subtaskId) => {
    // Deprecated for now as content is shown by default
  };

  // Determine if subtask should be visible to current user
  const getSubTaskVisibility = (subtask) => {
    const isAssignedToSubTask = subtask.assignedTo?.some(
      (assignedUser) => (assignedUser._id || assignedUser) === user?._id
    );

    // Show if user is assigned to subtask, has view/create permission, is assigned to parent task, or is admin
    return isAssignedToSubTask || canManageSubtasks || isAdmin || hasPermission("tasks", "view");
  };

  // Get subtask styling classes based on assignment and admin status
  const getSubTaskClasses = (subtask) => {
    const isAssignedToSubTask = subtask.assignedTo?.some(
      (assignedUser) => (assignedUser._id || assignedUser) === user?._id
    );

    const isLocked = subtask.isLocked && !isCompany && !isAdmin && !canEditTask;

    if (isLocked) {
      return "bg-gray-100/40 border-gray-200 opacity-60 grayscale-[0.2] cursor-not-allowed";
    }

    if (isAssignedToSubTask) {
      return "bg-blue-50/50 border-2 border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300";
    } else if (canManageSubtasks || isAdmin || hasPermission("tasks", "view")) {
      return "bg-gray-50 hover:bg-gray-100";
    } else {
      return "hidden";
    }
  };

  return (
    <div className="mt-6">
      <div className="flexBetween items-center mb-3">
        <h5 className="text-sm font-medium text-[#91929E] uppercase">
          Subtasks ({subTasks.length})
        </h5>
        {subTasksLoading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2155A3]"></div>
            <span className="text-xs text-gray-500">Loading...</span>
          </div>
        )}
      </div>

      {subTasks.length > 0 ? (
        <div className="space-y-3">
          {subTasks.filter(getSubTaskVisibility).map((subtask) => {
            // Check if current user is assigned to this subtask
            const isAssignedToSubTask = subtask.assignedTo?.some(
              (assignedUser) => (assignedUser._id || assignedUser) === user?._id
            );

            const isLocked = subtask.isLocked && !isCompany && !isAdmin && !canEditTask;

            return (
              <div
                key={subtask._id}
                className={`rounded-2xl p-4 relative group transition-all duration-200 ${getSubTaskClasses(
                  subtask
                )}`}
              >
                <div className="flexBetween mb-2">
                  <div className="flex items-center gap-2">
                    <h6 className={`font-medium flex items-center gap-1.5 ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                      {isLocked && (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {subtask.title}
                    </h6>

                    {/* Content Indicators */}
                    <div className="flex items-center gap-1.5 ml-1">
                      {subtask.copyOfDescription && (
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[9px] font-bold uppercase"
                          title="Has Content Description"
                        >
                          <FiEdit3 className="w-2.5 h-2.5" />
                          Content
                        </div>
                      )}
                      {subtask.ideas && (
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-md text-[9px] font-bold uppercase"
                          title="Has Ideas"
                        >
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 3a1 1 0 012 0v2a1 1 0 11-2 0V5zM9 9a1 1 0 000 2v3a1 1 0 102 0v-3a1 1 0 00-2 0z" />
                          </svg>
                          Ideas
                        </div>
                      )}
                      {subtask.publishUrls && Object.keys(subtask.publishUrls).length > 0 && (
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-md text-[9px] font-bold uppercase"
                          title={`${Object.keys(subtask.publishUrls).length} Publish URLs`}
                        >
                          <FiLink className="w-2.5 h-2.5" />
                          URLs ({Object.keys(subtask.publishUrls).length})
                        </div>
                      )}
                    </div>

                    {isAssignedToSubTask && (
                      <span
                        className="px-2 py-0.5 bg-blue-100 text-blue-500 text-[10px] font-medium 
                      rounded-full flex items-center gap-1"
                      >
                        <svg
                          className="w-2.5 h-2.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Assigned
                      </span>
                    )}

                    {subtask?.totalActualTime > 0 && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-full border flex items-center gap-1 bg-orange-50 text-orange-600 border-orange-100"
                        title={`Total actual time spent: ${formatTime(subtask.totalActualTime)}`}
                      >
                        <FiClock className="w-2.5 h-2.5" />
                        {formatTime(subtask.totalActualTime)}
                      </span>
                    )}
                    {subtask?.performance > 0 && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border flex items-center gap-1 ${subtask.performance >= 100
                          ? "bg-green-50 text-green-600 border-green-100"
                          : subtask.performance >= 70
                            ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                            : "bg-red-50 text-red-600 border-red-100"
                          }`}
                        title={`Performance: ${subtask.performance}% (Estimate vs Actual)`}
                      >
                        <FiTarget className="w-2.5 h-2.5" />
                        {subtask.performance}%
                      </span>
                    )}
                    {(subtask?.requiresClientApproval || taskDetails?.taskFlow?.flows?.some(flow => flow.taskName?.toLowerCase() === subtask.title?.toLowerCase() && flow.requiresClientApproval)) && (
                      <span
                        className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold 
                      rounded-full flex items-center gap-1 border border-purple-200"
                        title="Client approval is required for this subtask"
                      >
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Approval Required
                      </span>
                    )}
                    {isWorkLinkRequired(subtask) && (
                      <button
                        onClick={() => {
                          setWorkLinkSubTask(subtask);
                          setIsWorkLinkModalOpen(true);
                        }}
                        className={`px-2 py-0.5 text-[10px] font-bold 
                      rounded-full flex items-center gap-1 border transition-colors ${getCurrentLink(subtask) 
                          ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" 
                          : "bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200"}`}
                        title={getCurrentLink(subtask) ? "Work link provided. Click to edit." : "Work link is mandatory for this subtask. Click to add."}
                      >
                        <FiLink className="w-2.5 h-2.5" />
                        {getCurrentLink(subtask) ? "Work Link Attached" : "Link Required"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${subtask.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : subtask.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                        }`}
                    >
                      {subtask.priority}
                    </span>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 cursor-help transition-all duration-200 ${subtask.reworkCount > 0
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}
                      title={subtask.reworkCount > 0 ? `This subtask has been sent to rework ${subtask.reworkCount} times` : "No rework history"}
                      onClick={() => {
                        if (subtask.reworkCount > 0) {
                          setReworkSubTask(subtask);
                          setReworkModalOpen(true);
                        }
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {subtask.reworkCount || 0}
                    </span>

                    <button
                      onClick={() => {
                        setTimelineSubTask(subtask);
                        setTimelineModalOpen(true);
                      }}
                      className="p-1 px-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                      title="View subtask activity timeline"
                    >
                      <FiActivity className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold uppercase">Log</span>
                    </button>

                    <SubTaskStatusButton
                      subTask={subtask}
                      parentTaskId={taskDetails?._id}
                      parentTaskFlow={taskDetails?.taskFlow}
                      showAllOptions={
                        isCompany ||
                        isAdmin ||
                        hasPermission("tasks", "changeStatus") ||
                        hasPermission("tasks", "edit")
                      }
                      canEdit={
                        isCompany ||
                        hasPermission("tasks", "changeStatus") ||
                        isAssignedToSubTask
                      }
                      canEditTask={canEditTask}
                      isAdmin={isAdmin}
                    />
                    {/* Edit button for users with permission and assigned users */}
                    {(canEditTask || isAdmin) && (
                      <button
                        onClick={() => onEditSubTask(subtask)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-500 hover:text-blue-700 p-1"
                        title="Edit subtask"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    )}
                    {/* Users with delete permission can delete subtasks */}
                    {canDeleteSubtasks && (
                      <button
                        onClick={() => onDeleteSubTask(subtask._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 p-1"
                        title="Delete subtask"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {/* Basic description (always shown) */}
                {subtask.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {subtask.description}
                  </p>
                )}

                {/* Subtask Custom Fields */}
                {subtask.customFields && subtask.customFields.filter(f => {
                  if (!f.value || f.value.trim() === "") return false;
                  // If it's a work link related field, only show it if requiresWorkLink is true
                  const isWorkLinkField = f.label?.toLowerCase().includes("work link") || 
                                         f.label?.toLowerCase().includes("google drive") ||
                                         f.label?.toLowerCase().includes("link");
                  if (isWorkLinkField) return isWorkLinkRequired(subtask);
                  return true;
                }).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {subtask.customFields.filter(f => {
                      if (!f.value || f.value.trim() === "") return false;
                      const isWorkLinkField = f.label?.toLowerCase().includes("work link") || 
                                             f.label?.toLowerCase().includes("google drive") ||
                                             f.label?.toLowerCase().includes("link");
                      if (isWorkLinkField) return isWorkLinkRequired(subtask);
                      return true;
                    }).map((field, idx) => (
                      <div key={idx} className="bg-white/60 border border-gray-100 rounded-lg px-3 py-1.5 shadow-sm">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">{field.label}</span>
                        {field.label.toLowerCase().includes("url") || field.value?.toString().startsWith("http") ? (
                          <a
                            href={field.value.startsWith("http") ? field.value : `https://${field.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1 truncate max-w-[200px]"
                          >
                            {field.value}
                            <FiLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-700 font-medium">{field.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}


                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>Assigned to:</span>
                    {subtask.assignedTo?.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {subtask.assignedTo.slice(0, 2).map((user, index) => (
                            <div
                              key={user._id || index}
                              className="w-4 h-4 overflow-hidden rounded-full border border-white"
                              title={user.firstName}
                            >
                              <img
                                src={user?.profileImage}
                                alt={user?.firstName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <span>
                          {subtask.assignedTo
                            .slice(0, 2)
                            .map((user) => user.firstName)
                            .join(", ")}
                          {subtask.assignedTo.length > 2 &&
                            ` +${subtask.assignedTo.length - 2} more`}
                        </span>
                      </div>
                    ) : (
                      <span>Unassigned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      Due:{" "}
                      {subtask.dueDate
                        ? new Date(subtask.dueDate).toLocaleDateString()
                        : "No date"}
                    </span>
                    {(subtask?.dueDateHistory?.length > 0 || subtask?.reworkHistory?.length > 0) && (
                      <div className="flex items-center gap-1">
                        {subtask?.dueDateHistory?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setHistorySubTask(subtask);
                              setHistoryModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-0.5"
                            title="View due date change history"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {subtask?.reworkHistory?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setReworkSubTask(subtask);
                              setReworkModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors p-0.5 flex items-center gap-1"
                            title={`View rework history (${subtask.reworkCount})`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span className="text-[10px] font-bold">
                              {subtask.reworkCount}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <SubTaskAttachments
                  subTask={subtask}
                  parentTaskId={taskDetails?._id}
                  canEdit={canManageSubtasks || isAssignedToSubTask}
                  projectData={taskDetails?.project}
                  isCompany={isCompany}
                  isAdmin={isAdmin}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm">No subtasks yet</p>
          <p className="text-xs mt-1">
            Click "Add Subtask" to create the first one
          </p>
        </div>
      )}

      {/* Due Date History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setHistorySubTask(null);
        }}
        title={
          historySubTask
            ? `Due Date Change History (${historySubTask.dueDateHistory?.length || 0
            })`
            : "Due Date Change History"
        }
      >
        {historySubTask?.dueDateHistory &&
          historySubTask.dueDateHistory.length > 0 ? (
          <div
            className="space-y-4 overflow-y-auto pr-2 custom-scrollbar"
            style={{ maxHeight: "500px" }}
          >
            {[...historySubTask.dueDateHistory]
              .slice()
              .reverse()
              .map((change, index) => (
                <div
                  key={index}
                  className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                >
                  <div className="text-gray-800 mb-2 leading-relaxed font-medium">
                    {change?.reason || "No reason provided"}
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">From:</span>
                      <span className="text-gray-800">
                        {change?.oldDate ? formatDate(change.oldDate) : "N/A"}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-800 font-medium">
                        {change?.newDate ? formatDate(change.newDate) : "N/A"}
                      </span>
                    </div>
                    {change?.changedBy && (
                      <div>
                        Changed by:{" "}
                        <span className="text-gray-800 font-medium">
                          {change.changedBy?.firstName || ""}{" "}
                          {change.changedBy?.lastName || ""}
                        </span>
                      </div>
                    )}
                    {change?.changedAt && (
                      <div>
                        On:{" "}
                        <span className="text-gray-800 font-medium">
                          {formatDate(change.changedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">
            No due date changes recorded.
          </div>
        )}
      </Modal>

      {/* Rework History Modal */}
      <Modal
        isOpen={reworkModalOpen}
        onClose={() => {
          setReworkModalOpen(false);
          setReworkSubTask(null);
        }}
        title={
          reworkSubTask
            ? `Rework History (${reworkSubTask.reworkCount || 0})`
            : "Rework History"
        }
      >
        {reworkSubTask?.reworkHistory && reworkSubTask.reworkHistory.length > 0 ? (
          <div
            className="space-y-4 overflow-y-auto pr-2 custom-scrollbar"
            style={{ maxHeight: "500px" }}
          >
            {[...reworkSubTask.reworkHistory]
              .slice()
              .reverse()
              .map((entry, index) => (
                <div
                  key={index}
                  className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-red-500"></span>
                    <div className="text-gray-800 leading-relaxed font-medium">
                      {entry?.reason || "No reason provided"}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600 ml-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Previous Status:</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded capitalize">
                        {entry?.previousStatus || "N/A"}
                      </span>
                    </div>
                    {entry?.changedBy && (
                      <div>
                        Sent back by:{" "}
                        <span className="text-gray-800 font-medium">
                          {entry.changedBy?.firstName || ""}{" "}
                          {entry.changedBy?.lastName || ""}
                        </span>
                      </div>
                    )}
                    {entry?.changedAt && (
                      <div>
                        On:{" "}
                        <span className="text-gray-800 font-medium">
                          {formatDate(entry.changedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">
            No rework history available.
          </div>
        )}
      </Modal>

      {/* Subtask Activity Timeline Modal */}
      <Modal
        isOpen={timelineModalOpen}
        onClose={() => {
          setTimelineModalOpen(false);
          setTimelineSubTask(null);
        }}
        title={`Subtask Activity: ${timelineSubTask?.title || ""}`}
        size="lg"
      >
        <div className="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <ActivityTimeline activities={timelineSubTask?.activityLog} />
        </div>
      </Modal>

      <WorkLinkModal
        isOpen={isWorkLinkModalOpen}
        onClose={() => {
          setIsWorkLinkModalOpen(false);
          setWorkLinkSubTask(null);
        }}
        onSubmit={handleWorkLinkSubmit}
        isLoading={updateSubTaskMutation.isLoading}
        initialValue={getCurrentLink(workLinkSubTask)}
      />
    </div>
  );
};

export default SubtasksSection;
