import React, { useState } from "react";
import LeadFormBuilder from "./LeadFormBuilder";
import { toast } from "react-hot-toast";
import {
  useGetLeadFormConfig,
  useUpdateLeadFormConfig,
} from "../../../api/hooks";
import { MANDATORY_FIELDS } from "../constants";

const LeadFormFieldList = () => {
  const { data: config, isLoading } = useGetLeadFormConfig();
  const updateConfig = useUpdateLeadFormConfig();

  const fields = config?.fields || [];

  const handleAddField = async (newField) => {
    const updatedFields = [...fields, { ...newField, id: Date.now().toString() }];
    try {
      await updateConfig.mutateAsync(updatedFields);
      toast.success("Field added successfully");
    } catch (error) {
      toast.error("Failed to add field");
    }
  };

  const handleRemoveField = async (fieldId) => {
    const updatedFields = fields.filter((f) => f.id !== fieldId);
    try {
      await updateConfig.mutateAsync(updatedFields);
      toast.success("Field removed");
    } catch (error) {
      toast.error("Failed to remove field");
    }
  };

  const handleUpdateField = async (fieldId, updates) => {
    const updatedFields = fields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    try {
      await updateConfig.mutateAsync(updatedFields);
    } catch (error) {
      toast.error("Failed to update field");
    }
  };

  const handleReplaceFields = async (newFields) => {
    try {
      await updateConfig.mutateAsync(newFields);
      toast.success("Form structure updated");
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleResetFields = async () => {
    try {
      await updateConfig.mutateAsync(MANDATORY_FIELDS);
      toast.success("Form reset to default");
    } catch (error) {
      toast.error("Failed to reset form");
    }
  };

  if (isLoading) return <div className="p-4 text-sm text-slate-500">Loading form configuration...</div>;

  return (
    <LeadFormBuilder
      fields={fields}
      onAddField={handleAddField}
      onRemoveField={handleRemoveField}
      onUpdateField={handleUpdateField}
      onReplaceFields={handleReplaceFields}
      onResetFields={handleResetFields}
    />
  );
};

export default LeadFormFieldList;
