import React, { useState } from "react";
import { IoArrowUpOutline } from "react-icons/io5";
import Progress from "../../shared/progress";
import PrimaryButton from "../../shared/buttons/primaryButton";
import {
  useGetTaskTimeLogs,
  useCreateTimeLog,
  useDeleteTask,
} from "../../../api/hooks";
import Modal from "../../shared/modal";
import { formatDate } from "../../../lib/dateUtils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { assetPath } from "../../../utils/assetPath";
import "./taskInfo.css";

const TaskInfo = ({ taskDetails, onTaskDeleted }) => {
  const { user, isCompany } = useAuth();
  const { hasPermission } = usePermissions();
  const isEmployee = user?.role === "employee";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [showDueDateHistoryModal, setShowDueDateHistoryModal] = useState(false);
  const navigate = useNavigate();
  const {
    data: timeLogData,
    isLoading,
    error,
  } = useGetTaskTimeLogs(taskDetails?._id);
  const createTimeLog = useCreateTimeLog();
  const deleteTask = useDeleteTask(taskDetails?.project, onTaskDeleted);

  // Permission checks
  const canDeleteTask = isCompany || hasPermission("tasks", "delete");
  const canEditTask = isCompany || hasPermission("tasks", "edit");
  const canLogTime =
    canEditTask ||
    taskDetails?.assignedTo?.some(
      (assignedUser) => assignedUser._id === user?._id
    );
  const handleLogTime = () => {
    if (!duration || !description) return;

    createTimeLog.mutate(
      {
        taskId: taskDetails._id,
        duration: parseInt(duration),
        description,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setDuration("");
          setDescription("");
        },
      }
    );
  };

  const handleDeleteTask = () => {
    deleteTask.mutate(taskDetails._id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate("/projects");
      },
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const totalTime = timeLogData?.data?.totalTime || 0;
  const progress = taskDetails?.timeEstimate
    ? (totalTime / (taskDetails.timeEstimate * 60)) * 100
    : 0;

  return (
    <div
      className="col-span-1 bg-white rounded-3xl px-2 
    overflow-y-auto justify-between py-5 flex flex-col"
    >
      <div>
        <div className="gap-y-3 flex flex-col mx-3">
          <h4 className="font-medium">Task Info</h4>
          <div className="flex flex-col gap-y-2">
            {taskDetails?.creator && (
              <>
                <span className="text-sm text-[#91929E]">Created By</span>
                <div className="flexStart gap-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
                    <img
                      src={taskDetails?.creator?.profileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{taskDetails?.creator?.name}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-[#91929E]">Assigned</span>
            {taskDetails?.assignedTo?.length > 0 ? (
              <div className="flex -space-x-2">
                {taskDetails.assignedTo.slice(0, 4).map((user, index) => (
                  <div
                    key={user._id || index}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-white relative z-10 hover:z-20 transition-all duration-200 hover:scale-110"
                    title={`${user?.firstName} ${user?.lastName || ""}`}
                    style={{ zIndex: taskDetails.assignedTo.length - index }}
                  >
                    {!user?.profileImage ? (
                      <span
                        className="w-full h-full flexCenter text-[10px] 
                        bg-black uppercase
                      text-white font-semibold rounded-full"
                      >
                        {user?.firstName?.slice(0, 1)}
                      </span>
                    ) : (
                      <img
                        src={user?.profileImage}
                        alt={user?.firstName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
                {taskDetails.assignedTo.length > 4 && (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 text-xs flexCenter font-medium text-gray-600 relative z-10 hover:z-20 transition-all duration-200 hover:scale-110"
                    title={`+${
                      taskDetails.assignedTo.length - 4
                    } more: ${taskDetails.assignedTo
                      .slice(4)
                      .map((user) => user.firstName)
                      .join(", ")}`}
                  >
                    +{taskDetails.assignedTo.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex">
                <div className="w-8 h-8 rounded-full bg-gray-200 flexCenter border-2 border-white">
                  <span className="text-xs text-gray-500">?</span>
                </div>
                <span className="text-gray-500 text-sm ml-2 self-center">
                  Unassigned
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-[#91929E]">Priority</span>
            <div className="flexStart gap-x-1 text-[#FFBD21]">
              <IoArrowUpOutline className="text-xl" />
              <span className="text-sm">{taskDetails?.priority}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl mt-5 p-4 bg-[#F4F9FD] flex flex-col">
          <h4 className="font-medium">Time tracking</h4>
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading time data...</div>
          ) : error ? (
            <div className="text-sm text-red-500">Error loading time data</div>
          ) : (
            <>
              <div className="flexStart gap-x-3 my-3">
                <Progress size={33} strokeWidth={2} currentValue={progress} />
                <div className="flex flex-col">
                  <span className="text-sm">
                    {formatTime(totalTime)} logged
                  </span>
                  <span className="text-xs text-[#91929E]">
                    Original Estimate{" "}
                    {formatTime(taskDetails?.timeEstimate * 60)}
                  </span>
                </div>
              </div>
              {canLogTime && (
                <PrimaryButton
                  title="Log time"
                  icon={assetPath("icons/time.svg")}
                  className="w-fit text-white"
                  onclick={() => setIsModalOpen(true)}
                />
              )}
            </>
          )}
        </div>
        <div className="gap-y-3 mt-1 flex flex-col mx-3">
          <div className="flex flex-col gap-y-1">
            <span className="text-sm text-[#91929E]">Dead Line</span>
            <div className="flex flex-col gap-y-1">
              {/* Current Due Date with click to view history */}
              <div className="relative inline-block">
                <span
                  className={`text-sm text-[#0A1629] ${
                    taskDetails?.dueDateHistory &&
                    taskDetails.dueDateHistory.length > 0
                      ? "cursor-pointer hover:text-blue-600 transition-colors underline decoration-dotted"
                      : ""
                  }`}
                  onClick={() => {
                    if (
                      taskDetails?.dueDateHistory &&
                      taskDetails.dueDateHistory.length > 0
                    ) {
                      setShowDueDateHistoryModal(true);
                    }
                  }}
                >
                  {formatDate(taskDetails?.dueDate)}
                </span>
              </div>
              {/* Original Due Date (if different from current) */}
              {taskDetails?.originalDueDate &&
                taskDetails.originalDueDate !== taskDetails?.dueDate && (
                  <div className="flex flex-col gap-y-0.5">
                    <span className="text-xs text-[#91929E]">
                      Original: {formatDate(taskDetails.originalDueDate)}
                    </span>
                    {taskDetails?.dueDateHistory &&
                      taskDetails.dueDateHistory.length > 0 && (
                        <span className="text-xs text-[#91929E]">
                          Changed {taskDetails.dueDateHistory.length}{" "}
                          {taskDetails.dueDateHistory.length === 1
                            ? "time"
                            : "times"}
                        </span>
                      )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <div className="flexStart px-3 gap-x-2">
        <img src={assetPath("icons/calender2.svg")} alt="" className="w-4" />
        <span className="text-sm text-[#7D8592]">
          Created {formatDate(taskDetails?.createdAt)}
        </span>
      </div>
      <div className="mt-4 px-3">
        {canDeleteTask && (
          <PrimaryButton
            title="Remove Task"
            className="w-full text-white bg-red-400 hover:bg-red-500 cursor-pointer mt-4 text-sm"
            onclick={() => setIsDeleteModalOpen(true)}
          />
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Time"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="block w-full rounded-md border-gray-300 pr-12
                p-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="1"
                placeholder="Enter time in minutes"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">min</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
              placeholder="What did you work on?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleLogTime}
              disabled={!duration || !description}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Log Time
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div className="flex flex-col gap-6">
          <p className="text-gray-700">
            Are you sure you want to delete this task? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTask}
              disabled={deleteTask.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {deleteTask.isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Due Date History Modal */}
      <Modal
        isOpen={showDueDateHistoryModal}
        onClose={() => setShowDueDateHistoryModal(false)}
        title={`Due Date Change History (${
          taskDetails?.dueDateHistory?.length || 0
        })`}
      >
        <div className="flex flex-col gap-4">
          {taskDetails?.dueDateHistory &&
          taskDetails.dueDateHistory.length > 0 ? (
            <div
              className="space-y-4 overflow-y-auto pr-2 custom-scrollbar"
              style={{ maxHeight: "500px" }}
            >
              {/* Reverse the array to show most recent first */}
              {[...taskDetails.dueDateHistory]
                .reverse()
                .map((change, index) => (
                  <div
                    key={index}
                    className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    <div className="text-gray-800 mb-2 leading-relaxed font-medium">
                      {change?.reason || "No reason provided"}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
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
                        <div className="text-gray-600 text-xs">
                          Changed by:{" "}
                          <span className="text-gray-800 font-medium">
                            {change.changedBy?.firstName || ""}{" "}
                            {change.changedBy?.lastName || ""}
                          </span>
                        </div>
                      )}
                      {change?.changedAt && (
                        <div className="text-gray-600 text-xs">
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
          <div className="flex justify-end pt-2 border-t border-gray-200">
            <button
              onClick={() => setShowDueDateHistoryModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskInfo;
