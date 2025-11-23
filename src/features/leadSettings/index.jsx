import { useMemo, useState, useEffect } from "react";
import LeadSettingsTabs from "./components/LeadSettingsTabs";
import LeadStatusList from "./components/LeadStatusList";
import LeadFormBuilder from "./components/LeadFormBuilder";
import EditStatusModal from "./components/EditStatusModal";
import {
  useGetLeadFormConfig,
  useUpdateLeadFormConfig,
  useGetLeadStatuses,
  useCreateLeadStatus,
  useUpdateLeadStatus,
  useDeleteLeadStatus,
} from "../leads/api";
import {
  LEAD_SETTINGS_TABS,
  ensureMandatoryFields,
  MANDATORY_FIELDS,
} from "./constants";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LeadSettingsFeature = () => {
  const [activeTab, setActiveTab] = useState("Statuses");
  const [editingStatus, setEditingStatus] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch data from API
  const { data: formConfigData, isLoading: formConfigLoading } =
    useGetLeadFormConfig();
  const { data: statusesData, isLoading: statusesLoading } =
    useGetLeadStatuses();

  // Mutations
  const { mutate: updateFormConfig } = useUpdateLeadFormConfig();
  const { mutate: createStatus } = useCreateLeadStatus();
  const { mutate: updateStatus, isLoading: isUpdatingStatus } =
    useUpdateLeadStatus();
  const { mutate: deleteStatus } = useDeleteLeadStatus();

  // Extract form fields and statuses from API data
  // Ensure mandatory fields are always present
  const formFields = useMemo(() => {
    const fields = formConfigData?.data?.fields || [];
    return ensureMandatoryFields(fields);
  }, [formConfigData?.data?.fields]);
  const statuses = statusesData?.data || [];

  const handleAddStatus = () => {
    // Create new status
    const newStatus = {
      name: `Custom Status ${statuses.length + 1}`,
      description: "Custom status description",
      color: "#94a3b8",
      order: statuses.length + 1,
      isDefault: false,
    };
    createStatus(newStatus);
  };

  const handleSetDefault = (statusId) => {
    updateStatus({
      statusId,
      statusData: { isDefault: true },
    });
  };

  const handleEditStatus = (status) => {
    setEditingStatus(status);
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = (statusData) => {
    if (!editingStatus) return;

    const statusId = editingStatus._id || editingStatus.id;
    updateStatus(
      {
        statusId,
        statusData,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setEditingStatus(null);
        },
        onError: (error) => {
          console.error("Error updating status:", error);
          alert(
            error.response?.data?.message ||
              "Failed to update status. Please try again."
          );
        },
      }
    );
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStatus(null);
  };

  const handleDeleteStatus = (statusId) => {
    if (window.confirm("Are you sure you want to delete this status?")) {
      deleteStatus(statusId);
    }
  };

  const handleAddField = (fieldInput) => {
    // Generate a key from label
    const slug = fieldInput.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const key = `${slug}_${Date.now().toString(36)}`;

    const newFields = [
      ...formFields,
      {
        id: Date.now().toString(),
        key: key,
        label: fieldInput.label,
        type: fieldInput.type,
        required: fieldInput.required ?? false,
        placeholder: fieldInput.placeholder || "",
        options: fieldInput.options || [],
      },
    ];
    // Ensure mandatory fields are maintained
    const fieldsWithMandatory = ensureMandatoryFields(newFields);
    updateFormConfig(fieldsWithMandatory);
  };

  const replaceFields = (nextFields) => {
    const fieldsWithIds = nextFields.map((field) => {
      // Ensure key exists
      let key = field.key;
      if (!key) {
        const slug = (field.label || "field")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
        key = `${slug}_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .substr(2, 5)}`;
      }

      return {
        ...field,
        key: key,
        id: field.id || Date.now().toString() + Math.random().toString(16),
      };
    });
    // Ensure mandatory fields are maintained
    const fieldsWithMandatory = ensureMandatoryFields(fieldsWithIds);
    updateFormConfig(fieldsWithMandatory);
  };

  const handleRemoveField = (fieldId) => {
    // Note: fieldId here is likely the 'id' not 'key', depending on what LeadFormBuilder passes
    // LeadFormBuilder passes field.id
    const newFields = formFields.filter((field) => field.id !== fieldId);
    // Ensure mandatory fields are maintained after removal
    const fieldsWithMandatory = ensureMandatoryFields(newFields);
    updateFormConfig(fieldsWithMandatory);
  };

  const handleUpdateField = (fieldId, update) => {
    const newFields = formFields.map((field) =>
      field.id === fieldId ? { ...field, ...update } : field
    );
    // Ensure mandatory fields are maintained and required
    const fieldsWithMandatory = ensureMandatoryFields(newFields);
    updateFormConfig(fieldsWithMandatory);
  };

  const handleResetFields = () => {
    // Reset to just the mandatory fields
    const resetFields = MANDATORY_FIELDS.map((field) => ({
      ...field,
      id: field.id, // Keep original IDs
      key: field.key,
    }));
    updateFormConfig(resetFields);
  };

  const statusSummary = useMemo(
    () => `${statuses.length} statuses • ${statuses[0]?.name} is default`,
    [statuses]
  );

  return (
    <div className="bg-slate-50 min-h-full">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-center gap-x-2">
            <button
              title="back to list"
              onClick={() => navigate("/leads")}
              className="w-10 h-10 rounded-full bg-gray-50 border border-slate-200 flex
              cursor-pointer items-center  group justify-center hover:bg-[#3f8cff]"
            >
              <FiArrowLeft size={16} className="group-hover:text-white" />
            </button>
            <h1 className="text-2xl font-semibold text-slate-900">
              Configure your lead process
            </h1>
          </div>
          <p className="text-sm text-slate-500">{statusSummary}</p>
        </div>
        <LeadSettingsTabs
          tabs={LEAD_SETTINGS_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="space-y-6">
          {activeTab === "Statuses" ? (
            <>
              <LeadStatusList
                statuses={statuses}
                onSetDefault={handleSetDefault}
                onEdit={handleEditStatus}
                onDelete={handleDeleteStatus}
                onAdd={handleAddStatus}
              />
              <EditStatusModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                status={editingStatus}
                onSave={handleSaveStatus}
                isLoading={isUpdatingStatus}
              />
            </>
          ) : activeTab === "Form Builder" ? (
            <LeadFormBuilder
              fields={formFields}
              onAddField={handleAddField}
              onRemoveField={handleRemoveField}
              onUpdateField={handleUpdateField}
              onReplaceFields={replaceFields}
              onResetFields={handleResetFields}
            />
          ) : (
            <div className="bg-slate-50 rounded-3xl min-h-96 flex items-center justify-center p-10 text-center text-slate-500 border border-dashed border-slate-200">
              {activeTab} configuration coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadSettingsFeature;
