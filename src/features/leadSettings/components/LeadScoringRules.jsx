import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import {
  useGetLeadScoringRules,
  useCreateLeadScoringRule,
  useUpdateLeadScoringRule,
  useDeleteLeadScoringRule,
} from "../../leads/api";
import { useGetDashboardConfig, useUpdateDashboardConfig } from "../../../api/hooks";
import CustomSelect from "./CustomSelect";

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

// Reusing form configuration fields or we can pass them as props
// We will just use standard fields for now, or text input for field name.
const LeadScoringRules = ({ fields = [], projectId = null }) => {
  const { companyId } = useAuth();
  const { data: response, isLoading } = useGetLeadScoringRules(companyId, projectId);
  const rules = response?.data || [];

  const { data: configData } = useGetDashboardConfig(projectId);
  const updateConfig = useUpdateDashboardConfig();
  const config = configData?.data || {};

  const createRule = useCreateLeadScoringRule(companyId, projectId);
  const updateRule = useUpdateLeadScoringRule(companyId, projectId);
  const deleteRule = useDeleteLeadScoringRule(companyId, projectId);

  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);

  const fieldOptions = fields.map((f) => ({
    value: f.key || f.id,
    label: f.label,
  })).concat([
    { value: "source", label: "Lead Source" },
    { value: "budget", label: "Budget" },
  ]);

  const handleAddNew = () => {
    setCurrentRule({
      name: "",
      isActive: true,
      matchType: "ALL",
      criteria: [{ field: "", operator: "equals", value: "", points: 10 }],
    });
    setIsEditing(true);
  };

  const handleEdit = (rule) => {
    setCurrentRule(rule);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this scoring rule?")) {
      try {
        await deleteRule.mutateAsync(id);
        toast.success("Rule deleted successfully");
      } catch (error) {
        toast.error("Failed to delete rule");
      }
    }
  };

  const handleSave = async () => {
    if (!currentRule.name) {
      toast.error("Rule name is required");
      return;
    }
    
    // Validate criteria
    if (currentRule.criteria.length === 0) {
      toast.error("At least one criterion is required");
      return;
    }
    
    for (const c of currentRule.criteria) {
      if (!c.field) {
        toast.error("Please select a field for all criteria");
        return;
      }
      if (!c.points) c.points = 0;
    }

    try {
      if (currentRule._id) {
        await updateRule.mutateAsync({
          ruleId: currentRule._id,
          ruleData: currentRule,
        });
        toast.success("Rule updated successfully");
      } else {
        await createRule.mutateAsync(currentRule);
        toast.success("Rule created successfully");
      }
      setIsEditing(false);
      setCurrentRule(null);
    } catch (error) {
      toast.error("Failed to save rule");
    }
  };

  const handleAddCriterion = () => {
    setCurrentRule({
      ...currentRule,
      criteria: [
        ...currentRule.criteria,
        { field: "", operator: "equals", value: "", points: 10 },
      ],
    });
  };

  const handleRemoveCriterion = (index) => {
    const newCriteria = [...currentRule.criteria];
    newCriteria.splice(index, 1);
    setCurrentRule({ ...currentRule, criteria: newCriteria });
  };

  const updateCriterion = (index, key, value) => {
    const newCriteria = [...currentRule.criteria];
    newCriteria[index][key] = value;
    setCurrentRule({ ...currentRule, criteria: newCriteria });
  };

  if (isLoading) return <div className="p-4 text-sm text-slate-500">Loading rules...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Scoring Rules</h2>
          <p className="text-[11px] text-slate-500">Automatically assign points to leads matching specific criteria.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-[#3f8cff] text-white px-3 py-1.5 rounded-xl text-[12px] font-bold shadow-sm hover:bg-[#2f6bff] transition-all"
          >
            <FiPlus size={14} /> Add Rule
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">
        <h3 className="text-[13px] font-bold text-slate-800 mb-4">Score Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Hot Lead</label>
              <span className="text-[11px] font-black text-orange-500">{config.hotLeadThreshold || 70}+</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={config.hotLeadThreshold || 70}
              onChange={(e) => updateConfig.mutate({ 
                hotLeadThreshold: parseInt(e.target.value),
                projectId,
                isProjectWide: !!projectId
              })}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Warm Lead</label>
              <span className="text-[11px] font-black text-amber-500">{config.warmLeadThreshold || 40}+</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={config.warmLeadThreshold || 40}
              onChange={(e) => updateConfig.mutate({ 
                warmLeadThreshold: parseInt(e.target.value),
                projectId,
                isProjectWide: !!projectId
              })}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Cold Lead</label>
              <span className="text-[11px] font-black text-blue-500">{config.coldLeadThreshold || 0}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={config.coldLeadThreshold || 0}
              onChange={(e) => updateConfig.mutate({ 
                coldLeadThreshold: parseInt(e.target.value),
                projectId,
                isProjectWide: !!projectId
              })}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      {isEditing && currentRule ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-[13px] font-bold text-slate-800">
              {currentRule._id ? "Edit Rule" : "New Scoring Rule"}
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Rule Name</label>
              <input
                type="text"
                value={currentRule.name}
                onChange={(e) => setCurrentRule({ ...currentRule, name: e.target.value })}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[12px] font-medium focus:border-[#3f8cff] focus:outline-none"
                placeholder="e.g. High Budget Lead"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <div className="flex items-center h-9">
                <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentRule.isActive}
                    onChange={(e) => setCurrentRule({ ...currentRule, isActive: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]"
                  />
                  <span className="font-medium text-slate-700">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Conditions</label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Match</span>
                <CustomSelect
                  value={currentRule.matchType}
                  onChange={(val) => setCurrentRule({ ...currentRule, matchType: val })}
                  options={[
                    { value: "ALL", label: "ALL" },
                    { value: "ANY", label: "ANY" },
                  ]}
                  className="w-24"
                />
              </div>
            </div>

            {currentRule.criteria.map((c, idx) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-gray-50/50 p-2 rounded-xl border border-slate-100">
                <div className="w-full md:w-1/4">
                  <CustomSelect
                    value={c.field}
                    onChange={(val) => updateCriterion(idx, "field", val)}
                    options={fieldOptions}
                    placeholder="Select Field"
                  />
                </div>
                <div className="w-full md:w-1/4">
                  <CustomSelect
                    value={c.operator}
                    onChange={(val) => updateCriterion(idx, "operator", val)}
                    options={OPERATORS}
                  />
                </div>
                <div className="w-full md:w-1/4 flex-1">
                  {(() => {
                    const selectedFieldDef = fields.find(f => (f.key || f.id) === c.field);
                    let options = [];
                    if (selectedFieldDef && Array.isArray(selectedFieldDef.options) && selectedFieldDef.options.length > 0) {
                      options = selectedFieldDef.options.map(o => ({ value: o, label: o }));
                    } else if (c.field === "source") {
                      options = ["Website", "Referral", "Social Media", "Direct", "Other"].map(o => ({ value: o, label: o }));
                    }

                    if (options.length > 0) {
                      return (
                        <CustomSelect
                          value={c.value}
                          onChange={(val) => updateCriterion(idx, "value", val)}
                          options={options}
                          disabled={["is_empty", "is_not_empty"].includes(c.operator)}
                          placeholder="Select Value"
                        />
                      );
                    }

                    return (
                      <input
                        type="text"
                        value={c.value}
                        onChange={(e) => updateCriterion(idx, "value", e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[12px] focus:border-[#3f8cff] focus:outline-none disabled:opacity-50 disabled:bg-slate-50"
                        placeholder="Value (leave blank if empty/not empty)"
                        disabled={["is_empty", "is_not_empty"].includes(c.operator)}
                      />
                    );
                  })()}
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    value={c.points}
                    onChange={(e) => updateCriterion(idx, "points", parseInt(e.target.value))}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[12px] focus:border-[#3f8cff] focus:outline-none"
                    placeholder="Pts"
                  />
                </div>
                <button
                  onClick={() => handleRemoveCriterion(idx)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddCriterion}
              className="text-[11px] font-bold text-[#3f8cff] hover:text-[#2f6bff] inline-flex items-center gap-1"
            >
              <FiPlus size={12} /> Add Condition
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 rounded-xl text-[12px] font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl text-[12px] font-bold text-white bg-slate-900 border border-slate-900 shadow-sm hover:bg-slate-800 inline-flex items-center gap-2"
              disabled={createRule.isLoading || updateRule.isLoading}
            >
              <FiSave size={14} /> Save Rule
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {rules.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-[13px] text-slate-500 font-medium">No scoring rules configured yet.</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule._id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[13px] font-bold text-slate-800">{rule.name}</h3>
                    {!rule.isActive && (
                      <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">Disabled</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {rule.criteria.map((c, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-600 border border-slate-100 text-[11px] px-2 py-1 rounded-lg font-medium">
                        {c.field} {c.operator.replace("_", " ")} {c.value}
                        <span className="ml-1 text-[#3f8cff] font-bold">({c.points > 0 ? `+${c.points}` : c.points} pts)</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(rule)} className="p-2 text-slate-400 hover:text-[#3f8cff] bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(rule._id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LeadScoringRules;
