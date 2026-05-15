import React, { useState } from "react";
import { FiX, FiCheck, FiInfo, FiLink } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useMapFacebookField } from "../../leads/api";

const LeadFieldMapModal = ({ 
  isOpen, 
  onClose, 
  leadId, 
  facebookField, 
  facebookValue, 
  crmFields,
  branches = [],
  onSuccess 
}) => {
  const [selectedCrmField, setSelectedCrmField] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const [scope, setScope] = useState("this_lead");
  
  const { mutate: mapField, isLoading: isSubmitting } = useMapFacebookField();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCrmField) {
      toast.error("Please select a CRM field to map to");
      return;
    }

    if (selectedCrmField === "branch" && !targetBranch) {
      toast.error("Please select a target branch");
      return;
    }

    mapField({
      leadId,
      facebookField,
      crmFieldKey: selectedCrmField,
      scope,
      targetBranch: selectedCrmField === "branch" ? targetBranch : undefined,
      facebookValue
    }, {
      onSuccess: (data) => {
        toast.success(data.message || "Field mapped successfully");
        onSuccess && onSuccess();
        onClose();
      },
      onError: (error) => {
        console.error("Error mapping field:", error);
        toast.error(error.message || "Failed to map field");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3f8cff] flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FiLink size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Map Lead Field</h3>
              <p className="text-[11px] text-slate-500 font-medium">Configure data mapping</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column: Configuration */}
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-4 h-4 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-2.5 h-2.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </span>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Facebook Source</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Field</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{facebookField}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Value</p>
                    <p className="text-xs font-bold text-[#3f8cff] truncate">{facebookValue || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Map to CRM Field</label>
                  <select
                    value={selectedCrmField}
                    onChange={(e) => setSelectedCrmField(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-[#3f8cff] outline-none transition-all text-[13px] appearance-none bg-white font-medium"
                    required
                  >
                    <option value="">Select field...</option>
                    <optgroup label="System Fields">
                      <option value="system_name">Full Name</option>
                      <option value="system_email">Email</option>
                      <option value="system_phone">Phone Number</option>
                      <option value="company">Company</option>
                      {branches.length > 0 && (
                        <option value="branch">Branch / Assignment</option>
                      )}
                    </optgroup>
                    <optgroup label="Form Fields">
                      {crmFields.map(field => (
                        <option key={field.id} value={field.key || field.id}>
                          {field.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {selectedCrmField === "branch" && branches.length > 0 && (
                  <div className="animate-in slide-in-from-top-3 duration-200">
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Assign to Branch</label>
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                      <p className="text-[10px] text-slate-600 leading-tight">
                        Map <span className="font-bold">"{facebookField}: {facebookValue}"</span> to:
                      </p>
                      <select
                        value={targetBranch}
                        onChange={(e) => setTargetBranch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 outline-none transition-all text-xs bg-white font-semibold"
                        required
                      >
                        <option value="">Select Branch...</option>
                        {branches.map((b) => (
                          <option key={b.id || b.name} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Scope */}
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2.5">
                  Apply mapping to:
                </label>
                <div className="space-y-2">
                  {[
                    { id: "this_lead", title: "Only this lead", icon: "👤" },
                    { id: "entire_project", title: "Project leads", icon: "📁" }
                  ].map((item) => (
                    <label key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                      scope === item.id ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="scope"
                        value={item.id}
                        checked={scope === item.id}
                        onChange={(e) => setScope(e.target.value)}
                        className="w-3.5 h-3.5 text-[#3f8cff] focus:ring-0 border-slate-300"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <p className={`text-[13px] font-bold transition-colors ${scope === item.id ? 'text-blue-700' : 'text-slate-700'}`}>
                          {item.title}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-800">
                <FiInfo className="shrink-0 mt-0.5 text-amber-600" size={16} />
                <p className="text-[10px] leading-relaxed font-medium">
                  Mapping for <span className="font-bold">"Entire project"</span> will automate future syncs for this specific field/value.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCrmField || (selectedCrmField === "branch" && !targetBranch)}
              className="flex-1 px-6 py-2.5 rounded-xl bg-[#3f8cff] text-white text-xs font-bold hover:bg-[#2f6bff] shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheck size={16} />
              )}
              {isSubmitting ? "Applying..." : "Confirm Mapping"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFieldMapModal;
