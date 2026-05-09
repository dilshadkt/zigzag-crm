import React, { useState } from "react";
import { FiX, FiCheck, FiInfo } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useMapFacebookField } from "../../leads/api";

const LeadFieldMapModal = ({ 
  isOpen, 
  onClose, 
  leadId, 
  facebookField, 
  facebookValue, 
  crmFields,
  onSuccess 
}) => {
  const [selectedCrmField, setSelectedCrmField] = useState("");
  const [scope, setScope] = useState("this_lead");
  
  const { mutate: mapField, isLoading: isSubmitting } = useMapFacebookField();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCrmField) {
      toast.error("Please select a CRM field to map to");
      return;
    }

    mapField({
      leadId,
      facebookField,
      crmFieldKey: selectedCrmField,
      scope
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
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Map Lead Field</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Source Field (Facebook)</p>
              <p className="text-sm font-semibold text-slate-700">{facebookField}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Current Value</p>
              <p className="text-sm font-medium text-slate-600 truncate">{facebookValue || "—"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Map to CRM Field</label>
              <select
                value={selectedCrmField}
                onChange={(e) => setSelectedCrmField(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#3f8cff] focus:border-transparent outline-none transition-all text-sm appearance-none bg-white"
                required
              >
                <option value="">Select a field...</option>
                <optgroup label="System Fields">
                  <option value="system_name">Full Name</option>
                  <option value="system_email">Email</option>
                  <option value="system_phone">Phone Number</option>
                  <option value="company">Company</option>
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

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Apply mapping to:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                  <input
                    type="radio"
                    name="scope"
                    value="this_lead"
                    checked={scope === "this_lead"}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-4 h-4 text-[#3f8cff] focus:ring-[#3f8cff]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#3f8cff] transition-colors">Only this lead</p>
                    <p className="text-[11px] text-slate-500">Update value for this specific lead only.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                  <input
                    type="radio"
                    name="scope"
                    value="entire_project"
                    checked={scope === "entire_project"}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-4 h-4 text-[#3f8cff] focus:ring-[#3f8cff]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#3f8cff] transition-colors">Entire project leads</p>
                    <p className="text-[11px] text-slate-500">Update all leads in this project and remember for future syncs.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                  <input
                    type="radio"
                    name="scope"
                    value="entire_company"
                    checked={scope === "entire_company"}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-4 h-4 text-[#3f8cff] focus:ring-[#3f8cff]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#3f8cff] transition-colors">Entire company leads</p>
                    <p className="text-[11px] text-slate-500">Apply globally to all leads across the company.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700">
            <FiInfo className="shrink-0 mt-0.5" size={16} />
            <p className="text-[11px] leading-relaxed">
              Mapping a field for "Entire project" or "Entire company" will update existing leads that have this field and configure future Facebook lead syncs to map this field automatically.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCrmField}
              className="flex-1 px-6 py-3 rounded-2xl bg-[#3f8cff] text-white text-sm font-bold hover:bg-[#2f6bff] shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheck size={18} />
              )}
              {isSubmitting ? "Mapping..." : "Apply Mapping"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFieldMapModal;
