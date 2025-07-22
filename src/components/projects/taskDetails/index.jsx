import React, { useState } from "react";
import FileAndLinkUpload from "../../shared/fileUpload";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useAuth } from "../../../hooks/useAuth";
import StatusButton from "../../shared/StatusUpadate";
import AddSubTask from "../addSubTask";
import SubTaskStatusButton from "../subTaskStatus";
import SubTaskAttachments from "../../shared/SubTaskAttachments";
import {
  useCreateSubTask,
  useGetSubTasksByParentTask,
  useDeleteSubTask,
  useUpdateSubTaskById,
} from "../../../api/hooks";

const TaskDetails = ({ taskDetails, setShowModalTask, teams }) => {
  const { isCompany, user } = useAuth();
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState(null);
  const [expandedSubTasks, setExpandedSubTasks] = useState(new Set());

  // Check if current user is assigned to this task
  const isAssignedToTask = taskDetails?.assignedTo?.some(
    (assignedUser) => assignedUser._id === user?.id
  );
  // Employees can only edit tasks assigned to them, company admins can edit any task
  const canEditTask = isCompany || isAssignedToTask;

  // Fetch subtasks for this task
  const { data: subTasks = [], isLoading: subTasksLoading } =
    useGetSubTasksByParentTask(taskDetails?._id);

  // Create subtask mutation
  const createSubTaskMutation = useCreateSubTask(taskDetails?._id);

  // Update subtask mutation
  const updateSubTaskMutation = useUpdateSubTaskById(
    editingSubTask?._id,
    taskDetails?._id
  );

  // Delete subtask mutation
  const deleteSubTaskMutation = useDeleteSubTask(taskDetails?._id);

  const handleSubTaskSubmit = async (subTaskData) => {
    try {
      if (editingSubTask) {
        // Update existing subtask
        await updateSubTaskMutation.mutateAsync(subTaskData);
      } else {
        // Create new subtask
        const finalSubTaskData = {
          ...subTaskData,
          parentTaskId: taskDetails._id,
        };
        await createSubTaskMutation.mutateAsync(finalSubTaskData);
      }
      handleCloseSubTaskModal();
    } catch (error) {
      console.error("Error saving subtask:", error);
    }
  };

  const handleDeleteSubTask = async (subTaskId) => {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
      try {
        await deleteSubTaskMutation.mutateAsync(subTaskId);
      } catch (error) {
        console.error("Error deleting subtask:", error);
      }
    }
  };

  const handleEditSubTask = (subTask) => {
    setEditingSubTask(subTask);
    setShowSubTaskModal(true);
  };

  const handleCloseSubTaskModal = () => {
    setShowSubTaskModal(false);
    setEditingSubTask(null);
  };

  const handleAddSubTask = () => {
    setEditingSubTask(null);
    setShowSubTaskModal(true);
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
    setExpandedSubTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskId)) {
        newSet.delete(subtaskId);
      } else {
        newSet.add(subtaskId);
      }
      return newSet;
    });
  };

  const getRecurringPatternText = (pattern, interval) => {
    if (!pattern || pattern === "none") return "Not recurring";

    const intervalText = interval > 1 ? interval : "";
    switch (pattern) {
      case "daily":
        return `Every ${intervalText ? `${intervalText} ` : ""}${
          interval > 1 ? "days" : "day"
        }`;
      case "weekly":
        return `Every ${intervalText ? `${intervalText} ` : ""}${
          interval > 1 ? "weeks" : "week"
        }`;
      case "monthly":
        return `Every ${intervalText ? `${intervalText} ` : ""}${
          interval > 1 ? "months" : "month"
        }`;
      default:
        return "Custom recurring";
    }
  };

  return (
    <>
      <div className="col-span-3 overflow-y-auto  mr-5 flex flex-col">
        <div className="flexBetween">
          <h4 className="text-lg font-medium">Task Details</h4>
          <div className="flex gap-2">
            <PrimaryButton
              disable={!isCompany}
              className={"bg-[#3F8CFF] text-white"}
              title="Add Subtask"
              onclick={handleAddSubTask}
            />
            <PrimaryButton
              disable={!isCompany}
              className={"bg-white "}
              icon={"/icons/edit.svg"}
              onclick={() => setShowModalTask(true)}
            />
          </div>
        </div>
        <div className="flex flex-col h-full bg-white  overflow-hidden  rounded-3xl mt-5 p-6 pb-4">
          <div className="overflow-y-auto flex flex-col  h-full   gap-y-1 ">
            <span className="text-sm text-[#91929E] uppercase">
              {taskDetails?._id?.slice(0, 8)}
            </span>
            <div className="flexBetween">
              <h4 className="text-lg font-medium">{taskDetails?.title}</h4>
              <StatusButton taskDetails={taskDetails} disabled={!canEditTask} />
            </div>

            {/* Recurring Task Info */}
            {taskDetails?.isRecurring && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    Recurring Task
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  <p>
                    <strong>Pattern:</strong>{" "}
                    {getRecurringPatternText(
                      taskDetails.recurringPattern,
                      taskDetails.recurringInterval
                    )}
                  </p>
                  {taskDetails.recurringEndDate && (
                    <p>
                      <strong>Until:</strong>{" "}
                      {new Date(
                        taskDetails.recurringEndDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                  {taskDetails.maxRecurrences && (
                    <p>
                      <strong>Max Instances:</strong>{" "}
                      {taskDetails.maxRecurrences}
                    </p>
                  )}
                  {taskDetails.currentRecurrenceCount !== undefined && (
                    <p>
                      <strong>Created Instances:</strong>{" "}
                      {taskDetails.currentRecurrenceCount}
                    </p>
                  )}
                  {taskDetails.nextRecurrenceDate && (
                    <p>
                      <strong>Next Creation:</strong>{" "}
                      {new Date(
                        taskDetails.nextRecurrenceDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Parent Recurring Task Info */}
            {taskDetails?.parentRecurringTask && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    This is a recurring task instance
                  </span>
                </div>
              </div>
            )}
            {taskDetails?.copyOfDescription && (
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
                  Content For Description
                </h5>
                <p className="text-gray-600">
                  {taskDetails?.copyOfDescription}
                </p>
              </div>
            )}
            {taskDetails?.copyOfDescription && (
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-[#91929E] uppercase mb-2">
                  Copy of Description
                </h5>
                <p className="text-gray-600">
                  {taskDetails?.copyOfDescription}
                </p>
              </div>
            )}

            {/* Recurring Task Instances */}
            {taskDetails?.recurringInstances &&
              taskDetails.recurringInstances.length > 0 && (
                <div className="mt-6">
                  <h5 className="text-sm font-medium text-[#91929E] uppercase mb-3">
                    Recurring Instances ({taskDetails.recurringInstances.length}
                    )
                  </h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {taskDetails.recurringInstances.map((instance) => (
                      <div
                        key={instance._id}
                        className="bg-green-50 rounded-lg p-3 border border-green-200"
                      >
                        <div className="flexBetween">
                          <span className="text-sm font-medium text-green-800">
                            {instance.title}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              instance.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : instance.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {instance.status.replace("-", " ")}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Due:{" "}
                          {instance.dueDate
                            ? new Date(instance.dueDate).toLocaleDateString()
                            : "No date"}
                          {instance.assignedTo &&
                            instance.assignedTo.length > 0 &&
                            ` • Assigned to: ${instance.assignedTo
                              .slice(0, 2)
                              .map((user) => user.firstName)
                              .join(", ")}${
                              instance.assignedTo.length > 2
                                ? ` +${instance.assignedTo.length - 2} more`
                                : ""
                            }`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Subtasks Section */}
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
                  {subTasks.map((subtask) => {
                    // Check if current user is assigned to this subtask
                    const isAssignedToSubTask = subtask.assignedTo?.some(
                      (assignedUser) => assignedUser._id === user?.id
                    );

                    return (
                      <div
                        key={subtask._id}
                        className="bg-gray-50 rounded-2xl p-4 relative group"
                      >
                        <div className="flexBetween mb-2">
                          <h6 className="font-medium text-gray-800">
                            {subtask.title}
                          </h6>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                subtask.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : subtask.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {subtask.priority}
                            </span>

                            <SubTaskStatusButton
                              subTask={subtask}
                              parentTaskId={taskDetails?._id}
                              canEdit={isCompany || isAssignedToSubTask}
                            />
                            {/* Edit button for admins and assigned users */}
                            {isCompany && (
                              <button
                                onClick={() => handleEditSubTask(subtask)}
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
                            {/* Only company admins can delete subtasks */}
                            {isCompany && (
                              <button
                                onClick={() => handleDeleteSubTask(subtask._id)}
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

                        {/* Show More button and expanded content */}
                        {hasAdditionalContent(subtask) && (
                          <>
                            <button
                              onClick={() => toggleSubTaskExpanded(subtask._id)}
                              className="text-xs text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1 transition-colors"
                            >
                              {expandedSubTasks.has(subtask._id) ? (
                                <>
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Show More
                                </>
                              )}
                            </button>

                            {/* Expanded content */}
                            {expandedSubTasks.has(subtask._id) && (
                              <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 space-y-3">
                                {/* Content for Description */}
                                {subtask.copyOfDescription && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3 text-blue-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Content for Description
                                    </h6>
                                    <p className="text-xs text-gray-600">
                                      {subtask.copyOfDescription}
                                    </p>
                                  </div>
                                )}

                                {/* Description for Publishing */}
                                {subtask.description && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3 text-green-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Description for Publishing
                                    </h6>
                                    <p className="text-xs text-gray-600">
                                      {subtask.description}
                                    </p>
                                  </div>
                                )}

                                {/* Ideas */}
                                {subtask.ideas && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3 text-yellow-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Ideas
                                    </h6>
                                    <p className="text-xs text-gray-600">
                                      {subtask.ideas}
                                    </p>
                                  </div>
                                )}

                                {/* Publish URLs */}
                                {subtask.publishUrls &&
                                  Object.keys(subtask.publishUrls).length >
                                    0 && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <svg
                                          className="w-3 h-3 text-purple-600"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5a2 2 0 11-2.828 2.828l-1.5 1.5a4 4 0 105.656 5.656l1.5-1.5a1 1 0 001.414-1.414l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        Publish URLs
                                      </h6>
                                      <div className="space-y-1">
                                        {Object.entries(
                                          subtask.publishUrls
                                        ).map(([platform, url]) => (
                                          <div
                                            key={platform}
                                            className="flex items-center justify-between"
                                          >
                                            <span className="text-xs text-gray-600 capitalize">
                                              {platform}:
                                            </span>
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 hover:text-blue-800 truncate ml-2"
                                            >
                                              {url}
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}
                          </>
                        )}

                        <div className="flex justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <span>Assigned to:</span>
                            {subtask.assignedTo?.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <div className="flex -space-x-1">
                                  {subtask.assignedTo
                                    .slice(0, 2)
                                    .map((user, index) => (
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
                          <span>
                            Due:{" "}
                            {subtask.dueDate
                              ? new Date(subtask.dueDate).toLocaleDateString()
                              : "No date"}
                          </span>
                        </div>
                        <SubTaskAttachments
                          subTask={subtask}
                          parentTaskId={taskDetails?._id}
                          canEdit={isCompany || isAssignedToSubTask}
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
            </div>

            <FileAndLinkUpload
              disable={true}
              fileClassName={"grid grid-cols-3 gap-3"}
              initialFiles={
                taskDetails?.attachments?.filter(
                  (file) => file.type !== "link"
                ) || []
              }
              initialLinks={
                taskDetails?.attachments?.filter(
                  (file) => file.type === "link"
                ) || []
              }
            />
          </div>
        </div>
      </div>

      {/* Add Subtask Modal */}
      <AddSubTask
        isOpen={showSubTaskModal}
        setShowSubTaskModal={handleCloseSubTaskModal}
        teams={teams}
        onSubmit={handleSubTaskSubmit}
        parentTaskId={taskDetails?._id}
        isLoading={
          editingSubTask
            ? updateSubTaskMutation.isLoading
            : createSubTaskMutation.isLoading
        }
        isEdit={!!editingSubTask}
        initialValues={editingSubTask}
        projectData={taskDetails.project} // <-- Pass projectData here
      />
    </>
  );
};

export default TaskDetails;
