import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import {
  useGetTaskFlows,
  useDeleteTaskFlow,
  useRestoreTaskFlow,
} from "../../../api/hooks";

// Import new components
import TaskFlowModal from "../../../components/settings/company/TaskFlowModal";
import TaskFlowHeader from "../../../components/settings/company/TaskFlowHeader";
import TaskFlowSection from "../../../components/settings/company/TaskFlowSection";

const Company = () => {
  const { companyId } = useAuth();

  const [showTaskFlowModal, setShowTaskFlowModal] = useState(false);
  const [selectedTaskFlow, setSelectedTaskFlow] = useState(null);
  const {
    data: taskFlows,
    isLoading: isTaskFlowsLoading,
    error: taskFlowsError,
  } = useGetTaskFlows(companyId);
  const { mutate: deleteTaskFlow } = useDeleteTaskFlow(companyId);
  const { mutate: restoreTaskFlow } = useRestoreTaskFlow(companyId);





  const handleDeleteTaskFlow = (taskFlow) => {
    if (window.confirm("Are you sure you want to delete this task flow?")) {
      deleteTaskFlow(taskFlow._id, {
        onSuccess: () => {
          toast.success("Task flow deleted successfully");
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Error deleting task flow"
          );
        },
      });
    }
  };

  const handleRestoreTaskFlow = (taskFlow) => {
    restoreTaskFlow(taskFlow._id, {
      onSuccess: () => {
        toast.success("Task flow restored successfully");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Error restoring task flow"
        );
      },
    });
  };

  const handleEditTaskFlow = (taskFlow) => {
    setSelectedTaskFlow(taskFlow);
    setShowTaskFlowModal(true);
  };



  const handleTaskFlowModalClose = () => {
    setShowTaskFlowModal(false);
    setSelectedTaskFlow(null);
  };



  return (
    <div className="  h-fit md:h-full  md:overflow-y-auto flex flex-col">
      {/* Position Access Info */}
      {/* <div className="px-2 py-2">
        <PositionAccessInfo />
      </div> */}



      {/* Task Flow Header */}
      <TaskFlowHeader
        taskFlowsCount={taskFlows ? taskFlows.length : 0}
        onAdd={() => setShowTaskFlowModal(true)}
      />

      {/* Task Flow Section */}
      <TaskFlowSection
        taskFlows={taskFlows}
        isLoading={isTaskFlowsLoading}
        error={taskFlowsError}
        onEdit={handleEditTaskFlow}
        onDelete={handleDeleteTaskFlow}
        onRestore={handleRestoreTaskFlow}
      />
      {showTaskFlowModal && (
        <TaskFlowModal
          isOpen={showTaskFlowModal}
          onClose={handleTaskFlowModalClose}
          companyId={companyId}
          taskFlow={selectedTaskFlow}
        />
      )}


    </div>
  );
};

export default Company;
