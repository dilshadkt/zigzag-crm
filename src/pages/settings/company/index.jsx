import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import {
  useGetTaskFlows,
  useDeleteTaskFlow,
  useRestoreTaskFlow,
  usePermanentDeleteTaskFlow,
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
import Modal from "../../../components/shared/modal";
import { FiTrash2, FiAlertCircle } from "react-icons/fi";
import { usePermissions } from "../../../hooks/usePermissions";

const Company = () => {
  const { companyId } = useAuth();
  const { hasPermission } = usePermissions();

  const canManagePositions = hasPermission("settings", "managePositions");
  const canManageTaskFlows = hasPermission("settings", "manageTaskFlows");

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
  const { mutate: permanentDeleteTaskFlow } = usePermanentDeleteTaskFlow(companyId);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [taskFlowToDelete, setTaskFlowToDelete] = useState(null);

  // Positions State
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { data: positionsData, isLoading: isPositionsLoading } = useGetPositions(companyId);
  const { mutate: deletePosition } = useDeletePosition(companyId);
  const { mutate: restorePosition } = useRestorePosition(companyId);

  // Task Flow Handlers
  const handleDeleteTaskFlow = (taskFlow) => {
    deleteTaskFlow(taskFlow._id, {
      onSuccess: () => toast.success("Task flow deactivated"),
      onError: (err) => toast.error(err.response?.data?.message || "Error deactivating task flow"),
    });
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

  const handlePermanentDeleteClick = (taskFlow) => {
    setTaskFlowToDelete(taskFlow);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmPermanentDelete = () => {
    if (taskFlowToDelete) {
      permanentDeleteTaskFlow(taskFlowToDelete._id, {
        onSuccess: () => {
          toast.success("Task flow permanently deleted");
          setShowDeleteConfirmModal(false);
          setTaskFlowToDelete(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Error deleting task flow"),
      });
    }
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
      {canManagePositions && (
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
      )}

      {canManagePositions && canManageTaskFlows && (
        <div className="w-full h-px bg-gray-100 my-4 px-4" />
      )}

      {/* Task Flow Section */}
      {canManageTaskFlows && (
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
              onPermanentDelete={handlePermanentDeleteClick}
            />
          </div>
        </div>
      )}

      {!canManagePositions && !canManageTaskFlows && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FiAlertCircle className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-800 mb-1">Restricted Content</h3>
          <p className="text-[13px] text-gray-400 max-w-xs">
            You do not have permission to access management features for positions or task flows.
          </p>
        </div>
      )}

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

      {/* Permanent Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Delete Task Flow"
      >
        <div className="flex flex-col items-center py-4 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-800 mb-2">Are you sure?</h3>
          <p className="text-[13px] text-gray-500 max-w-xs mb-8">
            You are about to permanently delete <span className="font-bold text-gray-700">"{taskFlowToDelete?.name}"</span>. 
            This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setShowDeleteConfirmModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPermanentDelete}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-bold hover:bg-red-600 shadow-sm shadow-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete Flow
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Company;
