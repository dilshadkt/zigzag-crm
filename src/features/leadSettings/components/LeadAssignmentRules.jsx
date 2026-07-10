import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { useGetAllEmployees } from "../../../api/hooks";
import {
  useGetLeadAssignmentRules,
  useCreateLeadAssignmentRule,
  useUpdateLeadAssignmentRule,
  useDeleteLeadAssignmentRule,
  useReorderLeadAssignmentRules,
} from "../../leads/api";
import { useGetClientSalesTeam } from "../../../api/clientSalesTeam";
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

const LeadAssignmentRules = ({ fields = [], projectId = null }) => {
  const { companyId } = useAuth();
  const { data: response, isLoading } = useGetLeadAssignmentRules(companyId, projectId);
  const rules = response?.data || [];

  const { data: empRes } = useGetAllEmployees();
  const employees = empRes?.employees || (Array.isArray(empRes?.data) ? empRes.data : (Array.isArray(empRes) ? empRes : []));
  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.email || "Unknown User"
  }));

  const { data: salesTeamRes } = useGetClientSalesTeam(projectId);
  const salesTeam = salesTeamRes?.data || [];
  const salesTeamOptions = salesTeam.map(person => ({
    value: person._id || person.id,
    label: `${person.name} (Client Sales Team)`,
  }));

  const allAssigneeOptions = [...employeeOptions, ...salesTeamOptions];

  const createRule = useCreateLeadAssignmentRule(companyId, projectId);
  const updateRule = useUpdateLeadAssignmentRule(companyId, projectId);
  const deleteRule = useDeleteLeadAssignmentRule(companyId, projectId);
  const reorderRules = useReorderLeadAssignmentRules(companyId, projectId);

  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);

  const fieldOptions = fields.map((f) => ({
    value: f.key || f.id,
    label: f.label,
  })).concat([
    { value: "source", label: "Lead Source" },
    { value: "budget", label: "Budget" },
    { value: "score", label: "Lead Score" },
  ]);

  const handleAddNew = () => {
    setCurrentRule({
      name: "",
      isActive: true,
      matchType: "ALL",
      criteria: [{ field: "", operator: "equals", value: "" }],
      assignTo: [],
      assignmentMethod: "ROUND_ROBIN"
    });
    setIsEditing(true);
  };

  const handleEdit = (rule) => {
    setCurrentRule({
      ...rule,
      assignTo: (rule.assignTo || []).map(u => typeof u === "object" ? u._id : u)
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment rule?")) {
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
    
    if (currentRule.criteria.length === 0) {
      toast.error("At least one criterion is required");
      return;
    }
    
    if (!currentRule.assignTo || currentRule.assignTo.length === 0) {
      toast.error("Please select at least one assignee");
      return;
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

  const handleReorder = async (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === rules.length - 1)) return;
    
    const newRules = [...rules];
    const temp = newRules[index];
    newRules[index] = newRules[index + direction];
    newRules[index + direction] = temp;
    
    const orderedIds = newRules.map(r => r._id);
    try {
      await reorderRules.mutateAsync(orderedIds);
    } catch (e) {
      toast.error("Failed to reorder rules");
    }
  };

  const handleAddCriterion = () => {
    setCurrentRule({
      ...currentRule,
      criteria: [
        ...currentRule.criteria,
        { field: "", operator: "equals", value: "" },
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

  const toggleAssignee = (userId) => {
    let newAssignTo = [...(currentRule.assignTo || [])];
    if (newAssignTo.includes(userId)) {
      newAssignTo = newAssignTo.filter(id => id !== userId);
    } else {
      newAssignTo.push(userId);
    }
    setCurrentRule({ ...currentRule, assignTo: newAssignTo });
  };

  if (isLoading) return <div className="p-4 text-sm text-slate-500">Loading rules...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Assignment Rules</h2>
          <p className="text-[11px] text-slate-500">Automatically assign leads to specific users based on rules.</p>
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

      {isEditing && currentRule ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-[13px] font-bold text-slate-800">
              {currentRule._id ? "Edit Rule" : "New Assignment Rule"}
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
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
                placeholder="e.g. VIP Leads"
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
                <div className="w-full md:w-1/3">
                  <CustomSelect
                    value={c.field}
                    onChange={(val) => updateCriterion(idx, "field", val)}
                    options={fieldOptions}
                    placeholder="Select Field"
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <CustomSelect
                    value={c.operator}
                    onChange={(val) => updateCriterion(idx, "operator", val)}
                    options={OPERATORS}
                  />
                </div>
                <div className="w-full md:w-1/3 flex-1">
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
                <button onClick={() => handleRemoveCriterion(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}

            <button onClick={handleAddCriterion} className="text-[11px] font-bold text-[#3f8cff] hover:text-[#2f6bff] inline-flex items-center gap-1">
              <FiPlus size={12} /> Add Condition
            </button>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Assign To</label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Method</span>
                <CustomSelect
                  value={currentRule.assignmentMethod}
                  onChange={(val) => setCurrentRule({ ...currentRule, assignmentMethod: val })}
                  options={[
                    { value: "ROUND_ROBIN", label: "Round Robin" },
                    { value: "RANDOM", label: "Randomly" },
                  ]}
                  className="w-32"
                />
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto w-full flex flex-col gap-4">
              {employeeOptions.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Our Team</h4>
                  <div className="flex flex-wrap gap-2">
                    {employeeOptions.map(emp => (
                      <label key={emp.value} className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1.5 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentRule.assignTo?.includes(emp.value)}
                          onChange={() => toggleAssignee(emp.value)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">{emp.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {salesTeamOptions.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Client Sales Team</h4>
                  <div className="flex flex-wrap gap-2">
                    {salesTeamOptions.map(emp => (
                      <label key={emp.value} className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1.5 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentRule.assignTo?.includes(emp.value)}
                          onChange={() => toggleAssignee(emp.value)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">{emp.label.replace(" (Client Sales Team)", "")}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 rounded-xl text-[12px] font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 rounded-xl text-[12px] font-bold text-white bg-slate-900 border border-slate-900 shadow-sm hover:bg-slate-800 inline-flex items-center gap-2" disabled={createRule.isLoading || updateRule.isLoading}>
              <FiSave size={14} /> Save Rule
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {rules.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-[13px] text-slate-500 font-medium">No assignment rules configured yet.</p>
            </div>
          ) : (
            rules.map((rule, idx) => (
              <div key={rule._id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-2 items-center text-slate-400 border-r border-slate-100 pr-3 mr-3">
                  <div className="flex flex-col">
                    <button onClick={() => handleReorder(idx, -1)} disabled={idx === 0} className="hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400"><FiArrowUp size={14}/></button>
                    <button onClick={() => handleReorder(idx, 1)} disabled={idx === rules.length - 1} className="hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400"><FiArrowDown size={14}/></button>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 w-5 h-5 flex items-center justify-center rounded-full text-slate-600">{idx + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[13px] font-bold text-slate-800">{rule.name}</h3>
                    {!rule.isActive && (
                      <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">Disabled</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">If:</span>
                    {rule.criteria.map((c, i) => (
                      <span key={i} className="bg-slate-50 text-slate-600 border border-slate-100 text-[11px] px-2 py-1 rounded-lg font-medium">
                        {c.field} {c.operator.replace("_", " ")} {c.value}
                      </span>
                    ))}
                    <span className="text-[10px] uppercase font-bold text-slate-400">Then Assign:</span>
                    <div className="flex -space-x-1">
                      {rule.assignTo?.map(u => {
                        const userObj = typeof u === 'object' ? u : [...employees, ...salesTeam].find(e => e._id === u);
                        const initials = userObj ? (userObj.name ? userObj.name.substring(0, 2).toUpperCase() : `${userObj.firstName?.charAt(0) || ''}${userObj.lastName?.charAt(0) || ''}`.toUpperCase()) : '?';
                        return (
                          <div key={userObj?._id || u} className="w-6 h-6 rounded-full bg-[#3f8cff] text-white flex items-center justify-center text-[9px] font-bold border-2 border-white" title={userObj ? (userObj.name || `${userObj.firstName || ""} ${userObj.lastName || ""}`) : ''}>
                            {initials}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 pl-3 border-l border-slate-100 ml-3">
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

export default LeadAssignmentRules;
