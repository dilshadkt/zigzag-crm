import React, { useState } from "react";
import { toast } from "react-toastify";

// Custom Project Fields imports
import ProjectFieldsHeader from "../../../components/settings/company/ProjectFieldsHeader";
import ProjectFieldsSection from "../../../components/settings/company/ProjectFieldsSection";
import ProjectFieldModal from "../../../components/settings/company/ProjectFieldModal";

// Holidays imports
import HolidaysHeader from "../../../components/settings/company/HolidaysHeader";
import HolidaysSection from "../../../components/settings/company/HolidaysSection";
import HolidayModal from "../../../components/settings/company/HolidayModal";
import HolidayPresetsModal from "../../../components/settings/company/HolidayPresetsModal";

// Work Schedule imports
import WorkScheduleSection from "../../../components/settings/company/WorkScheduleSection";

// Leave Policy imports
import LeavePolicySection from "../../../components/settings/company/LeavePolicySection";

import { useAuth } from "../../../hooks/useAuth";
import {
  useGetProjectFields,
  useCreateProjectField,
  useUpdateProjectField,
  useDeleteProjectField,
  useReorderProjectFields,
  // Holiday hooks
  useGetHolidays,
  useCreateHoliday,
  useBulkCreateHolidays,
  useUpdateHoliday,
  useDeleteHoliday,
  // Work Schedule hooks
  useGetWorkSchedule,
  useSaveWorkSchedule,
  useGetLeavePolicy,
  useSaveLeavePolicy,
} from "../../../api/hooks";

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, description }) => (
  <div className="pb-3 px-1">
    <h2 className="text-[17px] font-bold text-gray-800">{title}</h2>
    <p className="mt-0.5 text-[11px] text-gray-500">{description}</p>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const Master = () => {
  const { companyId } = useAuth();

  // ── Project Fields ──────────────────────────────────────────────────────────
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [localFields, setLocalFields] = useState([]);

  const { data: customFields, isLoading, error } = useGetProjectFields(companyId);

  React.useEffect(() => {
    if (customFields) setLocalFields(customFields);
  }, [customFields]);

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
  const reorderFields = useReorderProjectFields(companyId, () => {
    toast.success("Fields reordered successfully");
  });

  const handleEditField   = (field) => { setSelectedField(field); setShowFieldModal(true); };
  const handleDeleteField = (field) => {
    if (window.confirm("Are you sure you want to delete this custom field?"))
      deleteField.mutate(field._id || field.id);
  };
  const handleFieldModalClose = () => { setShowFieldModal(false); setSelectedField(null); };
  const handleReorder = (newOrder) => {
    setLocalFields(newOrder);
    reorderFields.mutate(newOrder.map((f) => f._id || f.id));
  };
  const handleSaveField = (values) => {
    if (selectedField) {
      updateField.mutate({ fieldId: selectedField._id || selectedField.id, fieldData: values });
    } else {
      createField.mutate(values);
    }
  };

  // ── Holidays ────────────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear]       = useState(currentYear);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday]   = useState(null);
  const [showPresetsModal, setShowPresetsModal]  = useState(false);

  const { data: holidays, isLoading: holidaysLoading, error: holidaysError } =
    useGetHolidays(companyId, selectedYear);

  const createHoliday = useCreateHoliday(companyId, () => {
    toast.success("Holiday added successfully");
    setShowHolidayModal(false);
    setSelectedHoliday(null);
  });
  const bulkCreateHolidays = useBulkCreateHolidays(companyId, (data) => {
    const count = data?.holidays?.length || "";
    toast.success(`${count ? count + " " : ""}Holidays added successfully`);
    setShowPresetsModal(false);
  });
  const updateHoliday = useUpdateHoliday(companyId, () => {
    toast.success("Holiday updated successfully");
    setShowHolidayModal(false);
    setSelectedHoliday(null);
  });
  const deleteHoliday = useDeleteHoliday(companyId, () => {
    toast.success("Holiday deleted successfully");
  });

  const handleEditHoliday   = (holiday) => { setSelectedHoliday(holiday); setShowHolidayModal(true); };
  const handleDeleteHoliday = (holiday) => {
    if (window.confirm(`Delete "${holiday.name}"? This cannot be undone.`))
      deleteHoliday.mutate(holiday._id || holiday.id);
  };
  const handleHolidayModalClose = () => { setShowHolidayModal(false); setSelectedHoliday(null); };
  const handleSaveHoliday = (values) => {
    if (selectedHoliday) {
      updateHoliday.mutate({ holidayId: selectedHoliday._id || selectedHoliday.id, holidayData: values });
    } else {
      createHoliday.mutate(values);
    }
  };

  // ── Work Schedule ───────────────────────────────────────────────────────────
  const { data: workSchedule, isLoading: scheduleLoading, error: scheduleError } =
    useGetWorkSchedule(companyId);

  const saveWorkSchedule = useSaveWorkSchedule(companyId, () => {
    toast.success("Work schedule saved successfully");
  });

  // ── Leave Policy ────────────────────────────────────────────────────────────
  const { data: leavePolicy, isLoading: leaveLoading, error: leaveError } =
    useGetLeavePolicy(companyId);

  const saveLeavePolicy = useSaveLeavePolicy(companyId, () => {
    toast.success("Leave policy saved successfully");
  });

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto flex flex-col pr-1 gap-8">

      {/* ── Weekly Off Rules ── */}
      <div className="flex flex-col">
        <SectionHeader
          title="Weekly Off Rules"
          description="Define which days of the week your company is closed on a recurring basis"
        />
        <WorkScheduleSection
          schedule={workSchedule}
          isLoading={scheduleLoading}
          error={scheduleError}
          onSave={(data) => saveWorkSchedule.mutate(data)}
          isSaving={saveWorkSchedule.isPending}
        />
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-gray-100" />

      {/* ── Leave Policy ── */}
      <div className="flex flex-col">
        <SectionHeader
          title="Leave Management"
          description="Configure annual leave quotas and accrual rules for employees"
        />
        <LeavePolicySection
          policy={leavePolicy}
          isLoading={leaveLoading}
          error={leaveError}
          onSave={(data) => saveLeavePolicy.mutate(data)}
          isSaving={saveLeavePolicy.isPending}
        />
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-gray-100" />

      {/* ── Company Holidays ── */}
      <div className="flex flex-col">
        <HolidaysHeader
          holidaysCount={holidays ? holidays.length : 0}
          onAdd={() => setShowHolidayModal(true)}
          onAddPresets={() => setShowPresetsModal(true)}
        />
        <HolidaysSection
          holidays={holidays || []}
          isLoading={holidaysLoading}
          error={holidaysError}
          onEdit={handleEditHoliday}
          onDelete={handleDeleteHoliday}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-gray-100" />

      {/* ── Custom Project Fields ── */}
      <div className="flex flex-col">
        <ProjectFieldsHeader
          fieldsCount={customFields ? customFields.length : 0}
          onAdd={() => setShowFieldModal(true)}
        />
        <div className="flex-1 space-y-4">
          <ProjectFieldsSection
            fields={localFields || []}
            isLoading={isLoading}
            error={error}
            onEdit={handleEditField}
            onDelete={handleDeleteField}
            onReorder={handleReorder}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {showFieldModal && (
        <ProjectFieldModal
          isOpen={showFieldModal}
          onClose={handleFieldModalClose}
          field={selectedField}
          onSave={handleSaveField}
        />
      )}

      {showHolidayModal && (
        <HolidayModal
          isOpen={showHolidayModal}
          onClose={handleHolidayModalClose}
          holiday={selectedHoliday}
          onSave={handleSaveHoliday}
          isSaving={createHoliday.isPending || updateHoliday.isPending}
        />
      )}

      {showPresetsModal && (
        <HolidayPresetsModal
          isOpen={showPresetsModal}
          onClose={() => setShowPresetsModal(false)}
          year={selectedYear}
          onAdd={(holidays) => bulkCreateHolidays.mutate(holidays)}
          isSaving={bulkCreateHolidays.isPending}
        />
      )}
    </div>
  );
};

export default Master;
