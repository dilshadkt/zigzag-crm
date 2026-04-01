import React, { useState } from "react";
import LeadSettingsTabs from "./components/LeadSettingsTabs";
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
  const { data: formConfig, isLoading } = useGetLeadFormConfig();
  
  // Extract fields from config for use in rules
  const fields = formConfig?.fields || [];

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
        onTabChange={setActiveTab}
      />

      <div className="flex-1 overflow-auto min-h-0 pt-2">
        {activeTab === TABS.FORM && <LeadFormFieldList />}
        {activeTab === TABS.STATUSES && <LeadStatusList />}
        {activeTab === TABS.SCORING && <LeadScoringRules fields={fields} />}
        {activeTab === TABS.ASSIGNMENT && <LeadAssignmentRules fields={fields} />}
      </div>
    </div>
  );
};

export default LeadSettingsFeature;
