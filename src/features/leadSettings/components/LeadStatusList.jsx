import React, { useState } from "react";
import LeadStatusCard from "./LeadStatusCard";
import EditStatusModal from "./EditStatusModal";
import { toast } from "react-hot-toast";
import {
  useGetLeadStatuses,
  useCreateLeadStatus,
  useUpdateLeadStatus,
  useDeleteLeadStatus,
} from "../../../api/hooks";

const LeadStatusList = () => {
  const { data: statuses = [], isLoading } = useGetLeadStatuses();
  const createStatus = useCreateLeadStatus();
  const updateStatus = useUpdateLeadStatus();
  const deleteStatus = useDeleteLeadStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);

  const handleAdd = () => {
    setEditingStatus({
      name: "",
      description: "",
      color: "#94a3b8",
      order: statuses.length,
      isDefault: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (status) => {
    setEditingStatus(status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this status stage?")) {
      try {
        await deleteStatus.mutateAsync(id);
        toast.success("Status deleted successfully");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete status");
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await updateStatus.mutateAsync({
        statusId: id,
        statusData: { isDefault: true },
      });
      toast.success("Default status updated");
    } catch (error) {
      toast.error("Failed to set default status");
    }
  };

  const handleSave = async (statusData) => {
    try {
      if (editingStatus._id) {
        await updateStatus.mutateAsync({
          statusId: editingStatus._id,
          statusData,
        });
        toast.success("Status updated successfully");
      } else {
        await createStatus.mutateAsync(statusData);
        toast.success("Status created successfully");
      }
      setIsModalOpen(false);
      setEditingStatus(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save status");
    }
  };

  if (isLoading) return <div className="p-4 text-sm text-slate-500">Loading statuses...</div>;

  const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
            Lead Status Pipeline
          </h3>
          <p className="text-[11px] font-medium text-slate-500">
            Define the progression stages for your sales cycle.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-[12px] font-bold px-4 py-1.5 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          + Add Stage
        </button>
      </div>
      
      <div className="space-y-3">
        {sortedStatuses.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-[13px] text-slate-500 font-medium">No statuses configured yet.</p>
          </div>
        ) : (
          sortedStatuses.map((status) => (
            <LeadStatusCard
              key={status._id}
              status={status}
              onSetDefault={handleSetDefault}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <EditStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        status={editingStatus}
        onSave={handleSave}
        isLoading={createStatus.isLoading || updateStatus.isLoading}
      />
    </div>
  );
};

export default LeadStatusList;
