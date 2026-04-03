import React, { useState } from "react";
import LeadFormBuilder from "./LeadFormBuilder";
import { toast } from "react-hot-toast";
import {
  useGetFormConfigById,
  useUpdateFormConfigById,
  useActivateFormConfig,
} from "../../../api/hooks";
import { MANDATORY_FIELDS } from "../constants";
import { FiArrowLeft, FiSave, FiZap } from "react-icons/fi";

/**
 * Normalize a field coming from the API so it always has a stable `id`.
 * MongoDB returns `_id`; the frontend works with `id`.
 */
const normalizeField = (field) => {
  const id = field.id || field._id?.toString?.() || field._id;
  return { ...field, id };
};

const LeadFormFieldList = ({ configId, onBack }) => {
  const { data: configData, isLoading } = useGetFormConfigById(configId);
  const updateConfig = useUpdateFormConfigById();
  const activateConfig = useActivateFormConfig();

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [nameInitialized, setNameInitialized] = useState(false);

  const config = configData?.data;

  // Initialize form name/description from loaded data
  React.useEffect(() => {
    if (config) {
      setFormName(config.name || "");
      setFormDescription(config.description || "");
    }
  }, [config]);

  // Normalize: always ensure every field has an `id` property
  const rawFields = config?.fields || [];
  const fields = rawFields.map(normalizeField);

  const handleSaveMeta = async () => {
    if (!formName.trim()) {
      toast.error("Form name is required");
      return;
    }
    try {
      await updateConfig.mutateAsync({
        configId,
        name: formName.trim(),
        description: formDescription.trim(),
      });
      toast.success("Form details saved");
    } catch (error) {
      toast.error("Failed to save form details");
    }
  };

  const handleAddField = async (newField) => {
    const key = `custom_${Date.now()}`;
    const updatedFields = [...fields, { ...newField, id: key, key }];
    try {
      await updateConfig.mutateAsync({
        configId,
        fields: updatedFields,
      });
      toast.success("Field added successfully");
    } catch (error) {
      toast.error("Failed to add field");
    }
  };

  const handleRemoveField = async (fieldId) => {
    const updatedFields = fields.filter((f) => f.id !== fieldId);
    try {
      await updateConfig.mutateAsync({
        configId,
        fields: updatedFields,
      });
      toast.success("Field removed");
    } catch (error) {
      toast.error("Failed to remove field");
    }
  };

  const handleActivate = async () => {
    try {
      await activateConfig.mutateAsync(configId);
      toast.success(`"${formName}" is now the active form`);
    } catch (error) {
      toast.error("Failed to activate form");
    }
  };

  const handleUpdateField = async (fieldId, updates) => {
    const updatedFields = fields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    try {
      await updateConfig.mutateAsync({
        configId,
        fields: updatedFields,
      });
    } catch (error) {
      toast.error("Failed to update field");
    }
  };

  const handleReplaceFields = async (newFields) => {
    try {
      await updateConfig.mutateAsync({
        configId,
        fields: newFields,
      });
      toast.success("Form structure updated");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleResetFields = async () => {
    try {
      await updateConfig.mutateAsync({
        configId,
        fields: MANDATORY_FIELDS,
      });
      toast.success("Form reset to default");
    } catch (error) {
      toast.error("Failed to reset form");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Loading form configuration...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm text-red-500">Form not found.</p>
        <button
          onClick={onBack}
          className="text-sm text-blue-500 hover:underline"
        >
          ← Back to forms
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Bar: Back + Form Name Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
            title="Back to forms list"
          >
            <FiArrowLeft size={18} />
          </button>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-lg font-bold text-slate-900 border-none outline-none bg-transparent placeholder:text-slate-300 focus:ring-0 min-w-0 flex-1"
                placeholder="Form name..."
                onBlur={handleSaveMeta}
              />
              {config.isActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-md shadow-emerald-500/20">
                  <FiZap size={10} />
                  Active
                </span>
              ) : (
                <button
                  onClick={handleActivate}
                  disabled={activateConfig.isPending}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 rounded-full hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                >
                  Set Active
                </button>
              )}
            </div>
            <input
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="text-[12px] font-medium text-slate-400 border-none outline-none bg-transparent placeholder:text-slate-300 focus:ring-0 w-full"
              placeholder="Add a description..."
              onBlur={handleSaveMeta}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveMeta}
              disabled={updateConfig.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <FiSave size={12} />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Form Builder */}
      <LeadFormBuilder
        fields={fields}
        onAddField={handleAddField}
        onRemoveField={handleRemoveField}
        onUpdateField={handleUpdateField}
        onReplaceFields={handleReplaceFields}
        onResetFields={handleResetFields}
      />
    </div>
  );
};

export default LeadFormFieldList;
