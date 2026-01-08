import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import StatusButton from "../../shared/StatusUpadate";
import Modal from "../../shared/modal";
import AddSubTask from "../addSubTask";
import {
  useCreateSubTask,
  useGetSubTasksByParentTask,
  useDeleteSubTask,
  useUpdateSubTaskById,
} from "../../../api/hooks";
import RecurringTaskInfo from "./RecurringTaskInfo";
import TaskDescription from "./TaskDescription";
import SubtasksSection from "./SubtasksSection";
import TaskAttachments from "./TaskAttachments";
import ActivityTimeline from "./ActivityTimeline";
import { FiActivity } from "react-icons/fi";

const TaskDetails = ({ taskDetails, setShowModalTask, teams }) => {
  const { isCompany, user } = useAuth();
  const { hasPermission } = usePermissions();
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState(null);
  const [isReworkHistoryOpen, setIsReworkHistoryOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const isAdmin = user?.role === "company-admin";

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

  // Check if current user is assigned to this task
  const isAssignedToTask = taskDetails?.assignedTo?.some(
    (assignedUser) => assignedUser._id === user?._id
  );

  // Check permissions for task editing
  const canEditTask =
    isCompany || hasPermission("tasks", "edit") || isAssignedToTask;


  // Check permissions for subtask management
  const canManageSubtasks = isCompany || hasPermission("tasks", "create");

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

  return (
    <>
      <div className="col-span-3 overflow-y-auto  mr-5 flex flex-col">
        <div className="flexBetween">
          <h4 className="text-lg font-medium">Task Details</h4>
          <div className="flex gap-2">
            <PrimaryButton
              disable={!canManageSubtasks}
              className={"bg-[#3F8CFF] text-white"}
              title="Add Subtask"
              onclick={handleAddSubTask}
            />
            <PrimaryButton
              disable={!canEditTask}
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
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-medium">{taskDetails?.title}</h4>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 cursor-pointer transition-all duration-200 ${taskDetails?.reworkCount > 0
                    ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                    : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                    }`}
                  onClick={() => setIsReworkHistoryOpen(true)}
                  title={taskDetails?.reworkCount > 0 ? "Click to view rework history" : "No rework history"}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Rework: {taskDetails?.reworkCount || 0}
                </span>
                <span
                  className="px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 cursor-pointer transition-all duration-200 bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                  onClick={() => setIsTimelineOpen(true)}
                  title="View task activity timeline"
                >
                  <FiActivity className="w-3 h-3" />
                  Timeline
                </span>
              </div>
              {canEditTask && (
                <StatusButton
                  taskDetails={taskDetails}
                  disabled={!canEditTask}
                />
              )}
            </div>

            <RecurringTaskInfo taskDetails={taskDetails} />
            <TaskDescription taskDetails={taskDetails} />

            <SubtasksSection
              subTasks={subTasks}
              subTasksLoading={subTasksLoading}
              user={user}
              isCompany={isCompany}
              taskDetails={taskDetails}
              onEditSubTask={handleEditSubTask}
              onDeleteSubTask={handleDeleteSubTask}
              isAdmin={isAdmin}
              canManageSubtasks={canManageSubtasks}
            />

            <TaskAttachments taskDetails={taskDetails} />
          </div>
        </div>
      </div>

      {/* Add Subtask Modal */}
      <AddSubTask
        isOpen={showSubTaskModal}
        isAssignee={isAssignedToTask}
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

      {/* Rework History Modal */}
      <Modal
        isOpen={isReworkHistoryOpen}
        onClose={() => setIsReworkHistoryOpen(false)}
        title={`Task Rework History (${taskDetails?.reworkCount || 0})`}
      >
        {taskDetails?.reworkHistory && taskDetails.reworkHistory.length > 0 ? (
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: "500px" }}>
            {[...taskDetails.reworkHistory].slice().reverse().map((entry, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <div className="text-gray-800 leading-relaxed font-medium">
                    {entry?.reason || "No reason provided"}
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500 ml-5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-400">Previous Status:</span>
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200 capitalize">
                      {entry?.previousStatus || "N/A"}
                    </span>
                  </div>
                  {entry?.changedBy && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Sent back by:</span>
                      <span className="text-gray-700 font-semibold">
                        {entry.changedBy?.firstName} {entry.changedBy?.lastName}
                      </span>
                    </div>
                  )}
                  {entry?.changedAt && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-gray-700">{formatDate(entry.changedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No rework history found.</p>
          </div>
        )}
      </Modal>

      {/* Activity Timeline Modal */}
      <Modal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        title="Task Activity Timeline"
        size="lg"
      >
        <div className="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <ActivityTimeline activities={taskDetails?.activityLog} />
        </div>
      </Modal>
    </>
  );
};

export default TaskDetails;
