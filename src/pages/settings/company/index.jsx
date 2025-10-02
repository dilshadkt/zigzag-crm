import React, { useState } from "react";
import {
  useGetPositions,
  useDeletePosition,
  useRestorePosition,
  useGetTaskFlows,
  useDeleteTaskFlow,
  useRestoreTaskFlow,
} from "../../../api/hooks";
import AddPosition from "../../../components/settings/positions/addPosition";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import PositionAccessInfo from "../../../components/settings/PositionAccessInfo";

// Import new components
import TaskFlowModal from "../../../components/settings/company/TaskFlowModal";
import PositionHeader from "../../../components/settings/company/PositionHeader";
import TaskFlowHeader from "../../../components/settings/company/TaskFlowHeader";
import PositionTable from "../../../components/settings/company/PositionTable";
import TaskFlowSection from "../../../components/settings/company/TaskFlowSection";

const Company = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { user } = useAuth();
  const companyId = user?.company;

  const {
    data: positions,
    isLoading,
    error: positionsError,
  } = useGetPositions(companyId);

  const { mutate: deletePosition } = useDeletePosition(companyId);
  const { mutate: restorePosition } = useRestorePosition(companyId);
  const [showTaskFlowModal, setShowTaskFlowModal] = useState(false);
  const [selectedTaskFlow, setSelectedTaskFlow] = useState(null);
  const {
    data: taskFlows,
    isLoading: isTaskFlowsLoading,
    error: taskFlowsError,
  } = useGetTaskFlows(companyId);
  const { mutate: deleteTaskFlow } = useDeleteTaskFlow(companyId);
  const { mutate: restoreTaskFlow } = useRestoreTaskFlow(companyId);

  const handleEdit = (position) => {
    setSelectedPosition(position);
    setShowAddModal(true);
  };

  const handleDelete = (position) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      deletePosition(position._id, {
        onSuccess: () => {
          toast.success("Position deleted successfully");
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Error deleting position"
          );
        },
      });
    }
  };

  const handleRestore = (position) => {
    restorePosition(position._id, {
      onSuccess: () => {
        toast.success("Position restored successfully");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Error restoring position"
        );
      },
    });
  };

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

  const handleClose = () => {
    setShowAddModal(false);
    setSelectedPosition(null);
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

      {/* Position Header */}
      <PositionHeader
        positionsCount={positions?.positions?.length || 0}
        onAdd={() => setShowAddModal(true)}
      />

      {/* Position Table */}
      <PositionTable
        positions={positions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      {/* Modal */}
      {showAddModal && (
        <AddPosition
          isOpen={showAddModal}
          setShowModal={handleClose}
          initialValues={selectedPosition}
          companyId={companyId}
        />
      )}

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
