import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import {
  useGetTaskFlows,
  useDeleteTaskFlow,
  useRestoreTaskFlow,
  useGetPositions,
  useDeletePosition,
  useRestorePosition,
} from "../../../api/hooks";

// Import components
import TaskFlowModal from "../../../components/settings/company/TaskFlowModal";
import TaskFlowHeader from "../../../components/settings/company/TaskFlowHeader";
import TaskFlowSection from "../../../components/settings/company/TaskFlowSection";
import PositionHeader from "../../../components/settings/company/PositionHeader";
import PositionTable from "../../../components/settings/company/PositionTable";
import AddPosition from "../../../components/settings/positions/addPosition";

const Company = () => {
  const { companyId } = useAuth();

  // Task Flow State
  const [showTaskFlowModal, setShowTaskFlowModal] = useState(false);
  const [selectedTaskFlow, setSelectedTaskFlow] = useState(null);
  const {
    data: taskFlows,
    isLoading: isTaskFlowsLoading,
    error: taskFlowsError,
  } = useGetTaskFlows(companyId);
  const { mutate: deleteTaskFlow } = useDeleteTaskFlow(companyId);
  const { mutate: restoreTaskFlow } = useRestoreTaskFlow(companyId);

  // Positions State
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { data: positionsData, isLoading: isPositionsLoading } = useGetPositions(companyId);
  const { mutate: deletePosition } = useDeletePosition(companyId);
  const { mutate: restorePosition } = useRestorePosition(companyId);

  // Task Flow Handlers
  const handleDeleteTaskFlow = (taskFlow) => {
    if (window.confirm("Are you sure you want to delete this task flow?")) {
      deleteTaskFlow(taskFlow._id, {
        onSuccess: () => toast.success("Task flow deleted"),
        onError: (err) => toast.error(err.response?.data?.message || "Error deleting task flow"),
      });
    }
  };

  const handleRestoreTaskFlow = (taskFlow) => {
    restoreTaskFlow(taskFlow._id, {
      onSuccess: () => toast.success("Task flow restored"),
      onError: (err) => toast.error(err.response?.data?.message || "Error restoring task flow"),
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

  // Position Handlers
  const handleDeletePosition = (position) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      deletePosition(position._id, {
        onSuccess: () => toast.success("Position deleted"),
        onError: (err) => toast.error(err.response?.data?.message || "Error deleting position"),
      });
    }
  };

  const handleRestorePosition = (position) => {
    restorePosition(position._id, {
      onSuccess: () => toast.success("Position restored"),
      onError: (err) => toast.error(err.response?.data?.message || "Error restoring position"),
    });
  };

  const handleEditPosition = (position) => {
    setSelectedPosition(position);
    setShowPositionModal(true);
  };

  const handlePositionModalClose = () => {
    setShowPositionModal(false);
    setSelectedPosition(null);
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col pr-1">
      {/* Position Management Section */}
      <div className="mb-6">
        <PositionHeader
          positionsCount={positionsData?.positions?.length || 0}
          onAdd={() => setShowPositionModal(true)}
        />
        <div className="px-1">
          <PositionTable
            positions={positionsData}
            isLoading={isPositionsLoading}
            onEdit={handleEditPosition}
            onDelete={handleDeletePosition}
            onRestore={handleRestorePosition}
          />
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 my-4 px-4" />

      {/* Task Flow Section */}
      <div className="mb-6">
        <TaskFlowHeader
          taskFlowsCount={taskFlows ? taskFlows.length : 0}
          onAdd={() => setShowTaskFlowModal(true)}
        />
        <div className="px-1">
          <TaskFlowSection
            taskFlows={taskFlows}
            isLoading={isTaskFlowsLoading}
            error={taskFlowsError}
            onEdit={handleEditTaskFlow}
            onDelete={handleDeleteTaskFlow}
            onRestore={handleRestoreTaskFlow}
          />
        </div>
      </div>

      {/* Modals */}
      {showTaskFlowModal && (
        <TaskFlowModal
          isOpen={showTaskFlowModal}
          onClose={handleTaskFlowModalClose}
          companyId={companyId}
          taskFlow={selectedTaskFlow}
        />
      )}

      {showPositionModal && (
        <AddPosition
          isOpen={showPositionModal}
          setShowModal={handlePositionModalClose}
          initialValues={selectedPosition}
          companyId={companyId}
        />
      )}
    </div>
  );
};

export default Company;
