import React, { useState } from "react";
import { useGetLeadFormConfig, useCreateLeadFormConfig } from "../../../features/leads/api";
import toast from "react-hot-toast";
import LeadDashboardConfig from "../../../features/leadSettings/components/LeadDashboardConfig";
import { BranchSettings } from "./settings/BranchSettings";
import { IntegrationSettings } from "./settings/IntegrationSettings";
import LeadStatusList from "../../../features/leadSettings/components/LeadStatusList";
import LeadScoringRules from "../../../features/leadSettings/components/LeadScoringRules";
import LeadAssignmentRules from "../../../features/leadSettings/components/LeadAssignmentRules";
import LeadFormPreviewPanel from "../../../features/leadSettings/components/LeadFormPreviewPanel";
import LeadFormFieldList from "../../../features/leadSettings/components/LeadFormFieldList";

export const SettingsTab = ({
  clientCreds,
  setClientCreds,
  handleUpdateClientCreds,
  handleShareCreds,
  handleCopyPortalLink,
  selectedLeadForm,
  setSelectedLeadForm,
  leadFormConfigs,
  handleUpdateLeadForm,
  currentProject,
  onRefresh,
}) => {
  const [activeSettingTab, setActiveSettingTab] = useState("branch");
  const [editingFormId, setEditingFormId] = useState(null);
  const [previewValues, setPreviewValues] = useState({});
  const [previewErrors, setPreviewErrors] = useState({});
  const [previewMessage, setPreviewMessage] = useState("");

  // Lead Form Config for fields
  const { data: formConfig } = useGetLeadFormConfig(currentProject?._id);
  const fields = formConfig?.data?.fields || formConfig?.fields || [];
  
  const createFormMutation = useCreateLeadFormConfig();

  const handleCreateNewForm = async () => {
    const formName = window.prompt("Enter a name for the new form template:");
    if (!formName || !formName.trim()) return;

    try {
      const newForm = await createFormMutation.mutateAsync({ name: formName.trim() });
      toast.success("New form template created successfully");
      const newFormId = newForm?.data?._id || newForm?.data?.id;
      if (newFormId) {
        setSelectedLeadForm(newFormId);
        setEditingFormId(newFormId);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create new form template");
    }
  };

  const branches = currentProject?.customFields?.branches || [];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 p-4 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">


      <div className="sticky top-0 z-10 bg-white flex gap-2 mb-3 border-b border-gray-100 pb-3 pt-1">
        {[
          { id: "branch", label: "Branch" },
          { id: "integration", label: "Integration" },
          { id: "dashboard", label: "Dashboard" },
          { id: "form", label: "Forms" },
          { id: "status", label: "Statuses" },
          { id: "scoring", label: "Scoring Rules" },
          { id: "assignment", label: "Assignment Rules" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSettingTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeSettingTab === tab.id
              ? "bg-blue-50 text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSettingTab === "branch" && (
        <BranchSettings
          clientCreds={clientCreds}
          setClientCreds={setClientCreds}
          handleUpdateClientCreds={handleUpdateClientCreds}
          handleShareCreds={handleShareCreds}
          handleCopyPortalLink={handleCopyPortalLink}
          currentProject={currentProject}
          onRefresh={onRefresh}
        />
      )}

      {activeSettingTab === "integration" && (
        <IntegrationSettings
          selectedLeadForm={selectedLeadForm}
          setSelectedLeadForm={setSelectedLeadForm}
          leadFormConfigs={leadFormConfigs}
          handleUpdateLeadForm={handleUpdateLeadForm}
          currentProject={currentProject}
          onRefresh={onRefresh}
        />
      )}

      {/* Lead Dashboard Configuration - Full Width */}
      {activeSettingTab === "dashboard" && (
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="bg-slate-50/30 rounded-[2rem] p-4 md:p-8 border border-slate-100/50">
            <LeadDashboardConfig
              fields={fields}
              projectId={currentProject?._id}
              branches={branches}
            />
          </div>
        </div>
      )}

      {activeSettingTab === "status" && (
        <div className="mt-4">
          <LeadStatusList projectId={currentProject?._id} />
        </div>
      )}

      {activeSettingTab === "scoring" && (
        <div className="mt-4 max-w-4xl">
          <LeadScoringRules fields={fields} projectId={currentProject?._id} />
        </div>
      )}

      {activeSettingTab === "form" && (
        <div className="mt-4">
          {editingFormId ? (
            <LeadFormFieldList configId={editingFormId} onBack={() => setEditingFormId(null)} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 max-w-xl">
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/30">
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">Lead Capture & Forms</h4>
                  <p className="text-[11px] text-gray-500 mb-3">Choose which lead form template this client should use.</p>
                  <div className="space-y-3">
                    <select
                      value={selectedLeadForm}
                      onChange={(e) => setSelectedLeadForm(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs outline-none"
                    >
                      <option value="">System Default</option>
                      {leadFormConfigs.map((config) => (
                        <option key={config._id} value={config._id}>
                          {config.name} {config.isActive ? "(Default)" : ""}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateNewForm}
                        disabled={createFormMutation.isPending}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                      >
                        New Form
                      </button>
                      <button
                        onClick={handleUpdateLeadForm}
                        disabled={selectedLeadForm === currentProject?.leadFormConfig}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                      >
                        Apply Template
                      </button>
                      <button
                        onClick={() => {
                          const formToEdit = selectedLeadForm || leadFormConfigs.find(c => c.isActive)?._id;
                          if (formToEdit) setEditingFormId(formToEdit);
                        }}
                        className="flex-1 py-2 bg-white border border-gray-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all"
                      >
                        Edit Form
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-[300px]">
                {(() => {
                  const previewConfig = leadFormConfigs.find(c => c._id === (selectedLeadForm || leadFormConfigs.find(active => active.isActive)?._id));
                  if (!previewConfig) return null;
                  return (
                    <LeadFormPreviewPanel 
                      fields={previewConfig.fields || []}
                      previewValues={previewValues}
                      previewErrors={previewErrors}
                      previewMessage={previewMessage}
                      setPreviewValues={setPreviewValues}
                      setPreviewErrors={setPreviewErrors}
                      setPreviewMessage={setPreviewMessage}
                    />
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSettingTab === "assignment" && (
        <div className="mt-4 max-w-4xl">
          <LeadAssignmentRules fields={fields} projectId={currentProject?._id} />
        </div>
      )}
    </div>
  );
};
