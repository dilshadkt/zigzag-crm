import { useState, useEffect, useCallback, useMemo } from "react";
import { FiX, FiSave } from "react-icons/fi";
import LeadStatusBadge from "../../leads/components/LeadStatusBadge";
import DynamicLeadForm from "../../leads/components/DynamicLeadForm";
import { useGetLeadFormConfig } from "../../leads/api";
import { mapLeadDataToFormValue } from "../../../utils/leadFormUtils";

const LeadInteractionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  lead, 
  statuses,
  interactionType 
}) => {
  const [note, setNote] = useState("");
  const [statusId, setStatusId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);
  
  // Dynamic Form State
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  const getProjectId = () => {
    if (lead?.project) {
      return typeof lead.project === 'object' ? (lead.project._id || lead.project.id) : lead.project;
    }
    if (lead?.campaign?.project) {
      return typeof lead.campaign.project === 'object' ? (lead.campaign.project._id || lead.campaign.project.id) : lead.campaign.project;
    }
    return null;
  };
  const projectId = getProjectId();

  const { data: formConfigData, isLoading: isLoadingFormConfig } = useGetLeadFormConfig(projectId);
  
  const formFields = useMemo(() => {
    const fields = formConfigData?.data?.fields || [];
    if (fields.length === 0) {
      // Default fields if form config is empty
      return [
        { id: "system_name", key: "system_name", label: "Name", type: "text", required: true },
        { id: "system_email", key: "system_email", label: "Email", type: "email", required: false },
        { id: "system_phone", key: "system_phone", label: "Phone", type: "tel", required: false },
        { id: "company", key: "company", label: "Company", type: "text", required: false },
        { id: "source", key: "source", label: "Lead Source", type: "text", required: false },
      ];
    }
    return fields;
  }, [formConfigData]);

  useEffect(() => {
    if (lead?.status) {
      const currentStatusId = lead.status._id || lead.status.id || lead.status;
      setStatusId(currentStatusId);
    }
    if (isOpen) {
      setNote("");
      setScheduledDate("");
      setIsFollowUp(interactionType === 'followup');
      
      // Initialize dynamic form values
      if (formFields.length > 0) {
        const initialValues = {};
        formFields.forEach((field) => {
          const id = field.id || field._id;
          if (!id) return;
          const fieldId = String(id);
          let value = mapLeadDataToFormValue(field, lead, lead?.contact);

          if (field.type === "date" && value) {
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                value = `${year}-${month}-${day}`;
              }
            } catch (e) {
              value = String(value);
            }
          }
          initialValues[fieldId] = value !== null && value !== undefined ? String(value) : "";
        });
        setFormValues(initialValues);
        setErrors({});
      }
    }
  }, [lead, isOpen, interactionType, formFields]);

  const handleFormValueChange = useCallback((updaterOrValue) => {
    setFormValues(updaterOrValue);
    setErrors((prev) => {
      if (typeof updaterOrValue === "function") return prev;
      return {};
    });
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate dynamic form
    const newErrors = {};
    formFields.forEach((field) => {
      if (field.required) {
        const id = field.id || field._id;
        const value = formValues[id];
        if (!value || (field.type === "checkbox" && !value)) {
          newErrors[id] = `${field.label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Process lead update data
    const contactData = { name: "", email: "", phone: "", company: "" };
    const customFields = {};
    let sourceValue = lead?.source || "";
    // Note: statusId is managed separately for the interaction, but we should also respect the form if it has status
    let formStatusId = statusId; 

    formFields.forEach((field) => {
      const id = field.id || field._id;
      const fieldId = String(id);
      const fieldKey = field.key || fieldId;
      const fieldValue = formValues[fieldId];

      if (fieldValue === undefined || fieldValue === null || fieldValue === "") return;

      const stringValue = String(fieldValue).trim();
      if (!stringValue) return;

      if (fieldKey === "system_name") { contactData.name = stringValue; return; }
      if (fieldKey === "system_email") { contactData.email = stringValue; return; }
      if (fieldKey === "system_phone") { contactData.phone = stringValue; return; }
      
      if (fieldKey === "company" || field.label?.toLowerCase() === "company") {
        contactData.company = stringValue;
        if (fieldKey !== "company") customFields[fieldKey] = fieldValue;
        return;
      }

      if (fieldKey === "status") {
        formStatusId = stringValue; // Form status overrides interaction status if present
        return;
      }

      if (fieldKey === "source") { sourceValue = stringValue; return; }

      customFields[fieldKey] = fieldValue;
    });

    const leadUpdateData = {
      contact: contactData,
      status: formStatusId,
      source: sourceValue,
      customFields,
    };

    onSave({ 
      interactionData: {
        note, 
        statusId: formStatusId, 
        scheduled: scheduledDate,
        isFollowUp 
      },
      leadUpdateData
    });
    onClose();
  };

  const getTitle = () => {
    if (interactionType === 'call') return "How was the call?";
    if (interactionType === 'whatsapp') return "WhatsApp Follow-up";
    if (interactionType === 'followup') return "Schedule Follow-up";
    return "Log Interaction & Update Lead";
  };

  const getPlaceholder = () => {
    if (interactionType === 'call') return "Add a note about the call...";
    if (interactionType === 'whatsapp') return "Add a note about your conversation...";
    if (interactionType === 'followup') return "Reason for follow-up...";
    return "Enter your note here...";
  };

  console.log("LeadInteractionModal State:", { isOpen, projectId, formFields, formValues, isLoadingFormConfig, statuses });

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{getTitle()}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <FiX className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Dynamic Form */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">Update Lead Info</h4>
              {isLoadingFormConfig ? (
                <div className="text-center py-8 text-sm text-slate-500">Loading form...</div>
              ) : formFields.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">No form fields configured.</div>
              ) : Object.keys(formValues).length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">Initializing form...</div>
              ) : (
                <DynamicLeadForm
                  fields={formFields}
                  values={formValues}
                  onChange={handleFormValueChange}
                  errors={errors}
                  statuses={statuses}
                />
              )}
            </div>

            {/* Right Column: Interaction Data */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">Interaction Log</h4>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Add Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-[#3f8cff]/10 focus:border-[#3f8cff] outline-none transition-all resize-none h-32 text-slate-600 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Update Lead Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {statuses.map((status) => (
                    <button
                      key={status.id || status._id}
                      onClick={() => {
                        setStatusId(status.id || status._id);
                        // Also sync to dynamic form if it exists
                        const statusField = formFields.find(f => f.key === "status" || String(f.id) === "status");
                        if (statusField) {
                          setFormValues(prev => ({ ...prev, [statusField.id]: status.id || status._id }));
                        }
                      }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        statusId === (status.id || status._id)
                          ? "border-[#3f8cff] bg-blue-50/50 ring-2 ring-blue-100/50"
                          : "border-slate-50 hover:border-slate-200 bg-slate-50/30"
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" 
                        style={{ backgroundColor: status.color }} 
                      />
                      <span className={`text-sm font-bold truncate ${
                        statusId === (status.id || status._id) ? "text-[#3f8cff]" : "text-slate-600"
                      }`}>
                        {status.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-up Specific Fields */}
              {(interactionType === 'followup' || interactionType === 'call' || interactionType === 'whatsapp') && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Mark as Follow-up Lead?</label>
                    <button
                      onClick={() => setIsFollowUp(!isFollowUp)}
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        isFollowUp ? 'bg-[#3f8cff]' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        isFollowUp ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {isFollowUp && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm font-bold text-slate-700 mb-3">Next Follow-up Date & Time</label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-[#3f8cff]/10 focus:border-[#3f8cff] outline-none transition-all text-slate-600 bg-slate-50/50"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          <button
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#3f8cff] text-white font-bold hover:bg-[#2f6bff] shadow-xl shadow-blue-200 transition-all active:scale-[0.97]"
          >
            <FiSave size={20} />
            Save Log & Update Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadInteractionModal;
