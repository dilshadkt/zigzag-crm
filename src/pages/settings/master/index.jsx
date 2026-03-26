import React, { useState } from "react";
import { toast } from "react-toastify";

// Custom Project Fields imports
import ProjectFieldsHeader from "../../../components/settings/company/ProjectFieldsHeader";
import ProjectFieldsSection from "../../../components/settings/company/ProjectFieldsSection";
import ProjectFieldModal from "../../../components/settings/company/ProjectFieldModal";

import { useAuth } from "../../../hooks/useAuth";
import {
  useGetProjectFields,
  useCreateProjectField,
  useUpdateProjectField,
  useDeleteProjectField,
} from "../../../api/hooks";

const Master = () => {
  const { companyId } = useAuth();
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const {
    data: customFields,
    isLoading,
    error,
  } = useGetProjectFields(companyId);

  const createField = useCreateProjectField(companyId, () => {
    toast.success("Custom field added successfully");
    handleFieldModalClose();
  });

  const updateField = useUpdateProjectField(companyId, () => {
    toast.success("Custom field updated successfully");
    handleFieldModalClose();
  });

  const deleteField = useDeleteProjectField(companyId, () => {
    toast.success("Custom field deleted successfully");
  });

  const handleEditField = (field) => {
    setSelectedField(field);
    setShowFieldModal(true);
  };

  const handleDeleteField = (field) => {
    if (window.confirm("Are you sure you want to delete this custom field?")) {
      deleteField.mutate(field._id || field.id);
    }
  };

  const handleFieldModalClose = () => {
    setShowFieldModal(false);
    setSelectedField(null);
  };

  const handleSaveField = (values) => {
    if (selectedField) {
      updateField.mutate({
        fieldId: selectedField._id || selectedField.id,
        fieldData: values,
      });
    } else {
      createField.mutate(values);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col pr-1">
      {/* Project Fields Header */}
      <ProjectFieldsHeader
        fieldsCount={customFields ? customFields.length : 0}
        onAdd={() => setShowFieldModal(true)}
      />

      {/* Content Section */}
      <div className="flex-1 space-y-4">
        <ProjectFieldsSection
          fields={customFields || []}
          isLoading={isLoading}
          error={error}
          onEdit={handleEditField}
          onDelete={handleDeleteField}
        />
      </div>

      {/* Project Field Modal */}
      {showFieldModal && (
        <ProjectFieldModal
          isOpen={showFieldModal}
          onClose={handleFieldModalClose}
          field={selectedField}
          onSave={handleSaveField}
        />
      )}
    </div>
  );
};

export default Master;
