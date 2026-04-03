import React, { useState } from "react";
import LeadSettingsTabs from "./components/LeadSettingsTabs";
import LeadFormConfigList from "./components/LeadFormConfigList";
import LeadFormFieldList from "./components/LeadFormFieldList";
import LeadStatusList from "./components/LeadStatusList";
import LeadScoringRules from "./components/LeadScoringRules";
import LeadAssignmentRules from "./components/LeadAssignmentRules";
import { useGetLeadFormConfig } from "../../api/hooks";

const TABS = {
  FORM: "Lead Form",
  STATUSES: "Statuses",
  SCORING: "Scoring Rules",
  ASSIGNMENT: "Assignment Rules",
};

const LeadSettingsFeature = () => {
  const [activeTab, setActiveTab] = useState(TABS.FORM);
  const [editingFormId, setEditingFormId] = useState(null);
  const { data: formConfig } = useGetLeadFormConfig();

  // Extract fields from the active form config for use in scoring/assignment rules
  const fields = formConfig?.data?.fields || formConfig?.fields || [];

  const handleEditForm = (configId) => {
    setEditingFormId(configId);
  };

  const handleBackToList = () => {
    setEditingFormId(null);
  };

  // When switching tabs, go back to list view
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditingFormId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-3 md:p-6 space-y-4">
      <div className="flex flex-col space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Lead Settings</h1>
        <p className="text-sm text-slate-500">
          Configure lead capture, lifecycle, scoring, and automated distribution.
        </p>
      </div>

      <LeadSettingsTabs
        tabs={Object.values(TABS)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex-1 overflow-auto min-h-0 pt-2">
        {activeTab === TABS.FORM && (
          editingFormId ? (
            <LeadFormFieldList
              configId={editingFormId}
              onBack={handleBackToList}
            />
          ) : (
            <LeadFormConfigList onEditForm={handleEditForm} />
          )
        )}
        {activeTab === TABS.STATUSES && <LeadStatusList />}
        {activeTab === TABS.SCORING && <LeadScoringRules fields={fields} />}
        {activeTab === TABS.ASSIGNMENT && <LeadAssignmentRules fields={fields} />}
      </div>
    </div>
  );
};

export default LeadSettingsFeature;
