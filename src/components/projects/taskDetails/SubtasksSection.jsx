import React, { useState } from "react";
import SubTaskStatusButton from "../subTaskStatus";
import SubTaskAttachments from "../../shared/SubTaskAttachments";

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
}) => {
  const [expandedSubTasks, setExpandedSubTasks] = useState(new Set());

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

  // Determine if subtask should be visible to current user
  const getSubTaskVisibility = (subtask) => {
    const isAssignedToSubTask = subtask.assignedTo?.some(
      (assignedUser) => assignedUser._id === user?.id
    );

    // Show if user is assigned to subtask, has view permission, or is admin
    return isAssignedToSubTask || canManageSubtasks || isAdmin;
  };

  // Get subtask styling classes based on assignment and admin status
  const getSubTaskClasses = (subtask) => {
    const isAssignedToSubTask = subtask.assignedTo?.some(
      (assignedUser) => assignedUser._id === user?.id
    );

    if (isAssignedToSubTask) {
      return "bg-blue-50/50 border-2 border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300";
    } else if (canManageSubtasks || isAdmin) {
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
              (assignedUser) => assignedUser._id === user?.id
            );

            return (
              <div
                key={subtask._id}
                className={`rounded-2xl p-4 relative group transition-all duration-200 ${getSubTaskClasses(
                  subtask
                )}`}
              >
                <div className="flexBetween mb-2">
                  <div className="flex items-center gap-2">
                    <h6 className="font-medium text-gray-800">
                      {subtask.title}
                    </h6>
                    {isAssignedToSubTask && (
                      <span
                        className="px-2 py-1 bg-blue-100 text-blue-500 text-xs font-medium 
                      rounded-full flex items-center gap-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Assigned to me
                      </span>
                    )}
                  </div>
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
                      canEdit={canManageSubtasks || isAssignedToSubTask}
                    />
                    {/* Edit button for users with permission and assigned users */}
                    {(canManageSubtasks || isAssignedToSubTask) && (
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
                    {/* Only company admins can delete subtasks */}
                    {isCompany && (
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
                          Object.keys(subtask.publishUrls).length > 0 && (
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
                                {Object.entries(subtask.publishUrls).map(
                                  ([platform, url]) => (
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
                                  )
                                )}
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
                  canEdit={canManageSubtasks || isAssignedToSubTask}
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
  );
};

export default SubtasksSection;
