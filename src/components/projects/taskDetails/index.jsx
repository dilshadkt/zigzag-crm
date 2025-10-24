import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import StatusButton from "../../shared/StatusUpadate";
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

const TaskDetails = ({ taskDetails, setShowModalTask, teams }) => {
  const { isCompany, user } = useAuth();
  const { hasPermission } = usePermissions();
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState(null);
  const isAdmin = user?.role === "company-admin";

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
              <h4 className="text-lg font-medium">{taskDetails?.title}</h4>
              <StatusButton taskDetails={taskDetails} disabled={!canEditTask} />
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
    </>
  );
};

export default TaskDetails;
