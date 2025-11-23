import { useState, useMemo, useEffect, useCallback } from "react";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import LeadStatusBadge from "../../leads/components/LeadStatusBadge";
import DynamicLeadForm from "../../leads/components/DynamicLeadForm";
import {
  useGetLeadFormConfig,
  useGetLeadStatuses,
  useUpdateLead,
} from "../../leads/api";

const SectionCard = ({ children }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
    {children}
  </div>
);

const LabelValue = ({ label, value, isEditing = false, onEdit }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    {isEditing && onEdit ? (
      <button
        onClick={onEdit}
        className="text-sm font-semibold text-slate-900 hover:text-[#3f8cff] flex items-center gap-1"
      >
        {value || "—"}
        <FiEdit2 size={12} />
      </button>
    ) : (
      <p className="text-sm font-semibold text-slate-900">{value || "—"}</p>
    )}
  </div>
);

const BulletList = ({ items }) => (
  <ul className="space-y-2 text-sm text-slate-600">
    {items.map((item, index) => (
      <li key={`${item}-${index}`} className="flex items-start gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
        {item}
      </li>
    ))}
  </ul>
);

const LeadOverviewSection = ({ lead }) => {
  console.log(lead);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  // Get contact from both possible locations
  const contact = lead.contact || lead.details?.contact || {};
  console.log(contact);
  const leadDetails = lead.details?.leadDetails || {};
  // Get AI suggestions from lead data (backwards compatible)
  const aiSuggestions = lead.aiSuggestions || lead.details?.aiSuggestions;

  // Debug: Log lead structure to understand data flow
  useEffect(() => {
    if (lead) {
      console.log("LeadOverviewSection - Lead data:", {
        "lead.contact": lead.contact,
        "lead.details?.contact": lead.details?.contact,
        "contact (extracted)": contact,
        "lead.status": lead.status,
        "lead.source": lead.source,
        "lead.customFields": lead.customFields,
      });
    }
  }, [lead, contact]);
  const { data: formConfigData, isLoading: isLoadingFormConfig } =
    useGetLeadFormConfig();
  const { data: statusesData, isLoading: isLoadingStatuses } =
    useGetLeadStatuses();

  const { mutate: updateLead, isLoading: isUpdating } = useUpdateLead();

  // Stable handler for form value changes (same pattern as AddLeadModal)
  const handleFormValueChange = useCallback((updater) => {
    setFormValues(updater);
  }, []);

  // Default AI suggestions if not provided
  const defaultAiSuggestions = {
    conversationCoach: {
      sentiment: "Neutral",
      recommendations: ["No recommendations available at this time."],
    },
    dealStage: {
      stage: "Initial Contact",
      steps: ["No guidance available at this time."],
    },
  };

  const safeAiSuggestions = aiSuggestions || defaultAiSuggestions;

  // Get form fields - use same pattern as AddLeadModal
  const formFields = useMemo(() => {
    const fields = formConfigData?.data?.fields || [];
    if (fields.length === 0) {
      // Default fields if form config is empty
      return [
        {
          id: "name",
          key: "system_name",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Enter full name",
        },
        {
          id: "email",
          key: "system_email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "Enter email address",
        },
        {
          id: "phone",
          key: "system_phone",
          label: "Phone Number",
          type: "tel",
          required: false,
          placeholder: "Enter phone number",
        },
        {
          id: "company",
          key: "company",
          label: "Company",
          type: "text",
          required: false,
          placeholder: "Enter company name",
        },
        {
          id: "status",
          key: "status",
          label: "Lead Status",
          type: "select",
          required: true,
          options: [],
        },
      ];
    }
    // Ensure all fields have unique IDs and keys
    return fields.map((field, index) => ({
      ...field,
      id: String(field.id || `field_${index}`),
      key: field.key || field.id || `field_${index}`,
    }));
  }, [formConfigData?.data?.fields]);

  const statuses = useMemo(() => statusesData?.data || [], [statusesData]);

  // Helper function to map lead data to form field values
  const mapLeadDataToFormValue = useCallback(
    (field) => {
      const fieldId = String(field.id);
      const fieldKey = field.key || fieldId;

      // 1. System Fields Mapping
      if (fieldKey === "system_name") {
        return contact?.name || lead.contact?.name || "";
      }
      if (fieldKey === "system_email") {
        return contact?.email || lead.contact?.email || "";
      }
      if (fieldKey === "system_phone") {
        return contact?.phone || lead.contact?.phone || "";
      }

      // 2. Common Fields Mapping (Company)
      // Check both key 'company' and label 'Company' for legacy/fallback
      if (fieldKey === "company" || field.label?.toLowerCase() === "company") {
        return contact?.company || lead.contact?.company || "";
      }

      // 3. Status Mapping
      if (fieldKey === "status") {
        if (typeof lead.status === "object" && lead.status !== null) {
          return lead.status._id || lead.status.id || "";
        }
        return lead.status || "";
      }

      // 4. Source Mapping
      if (fieldKey === "source") {
        return lead.source || "";
      }

      // 5. Custom Fields Mapping
      // Try to find value in top-level flat structure (new format)
      if (lead[fieldKey] !== undefined && lead[fieldKey] !== null) {
        return String(lead[fieldKey]);
      }

      // Fallback to nested customFields (old format)
      if (lead.customFields) {
        if (lead.customFields instanceof Map) {
          const val =
            lead.customFields.get(fieldKey) ?? lead.customFields.get(fieldId);
          if (val !== undefined && val !== null) return String(val);
        } else {
          const val = lead.customFields[fieldKey] ?? lead.customFields[fieldId];
          if (val !== undefined && val !== null) return String(val);
        }
      }

      return "";
    },
    [contact, lead]
  );

  // Initialize form values from lead data when entering edit mode
  useEffect(() => {
    if (isEditing && formFields.length > 0) {
      const initialValues = {};

      // Map all fields from form config to lead data
      formFields.forEach((field) => {
        const fieldId = String(field.id); // Use field.id, not field.label!
        let value = mapLeadDataToFormValue(field);

        // Format date fields for HTML date input (YYYY-MM-DD)
        if (field.type === "date" && value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              // Format as YYYY-MM-DD for HTML date input
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              value = `${year}-${month}-${day}`;
            }
          } catch (e) {
            // If parsing fails, use the value as is
            value = String(value);
          }
        }

        // Set the value using field.id as the key (empty string if not found)
        initialValues[fieldId] =
          value !== null && value !== undefined ? String(value) : "";
      });

      setFormValues(initialValues);
      setErrors({});

      // Debug log
      console.log("Edit mode initialized:", {
        formFields: formFields.length,
        formFieldsData: formFields,
        initialValues,
        lead,
        contact,
        "lead.contact": lead.contact,
        customFields: lead.customFields,
      });
    } else if (!isEditing) {
      // Clear form values when exiting edit mode
      setFormValues({});
      setErrors({});
    }
  }, [isEditing, formFields, mapLeadDataToFormValue]);

  const handleSave = () => {
    // Validate form
    const newErrors = {};
    formFields.forEach((field) => {
      if (field.required) {
        const value = formValues[field.id];
        if (!value || (field.type === "checkbox" && !value)) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Smart mapping based on keys
    const contactData = {
      name: "",
      email: "",
      phone: "",
      company: "",
    };

    const customFields = {};
    let statusId = "";
    let sourceValue = lead.source || "";

    formFields.forEach((field) => {
      const fieldId = String(field.id);
      const fieldKey = field.key || fieldId;
      const fieldValue = formValues[fieldId];

      if (
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === ""
      ) {
        return; // Skip empty
      }

      const stringValue = String(fieldValue).trim();
      if (!stringValue) return;

      // 1. System Fields
      if (fieldKey === "system_name") {
        contactData.name = stringValue;
        return;
      }
      if (fieldKey === "system_email") {
        contactData.email = stringValue;
        return;
      }
      if (fieldKey === "system_phone") {
        contactData.phone = stringValue;
        return;
      }

      // 2. Common Fields (Company)
      if (fieldKey === "company" || field.label?.toLowerCase() === "company") {
        contactData.company = stringValue;
        // Also save to custom fields if it's truly a custom field
        if (fieldKey !== "company") customFields[fieldKey] = fieldValue;
        return;
      }

      // 3. Status
      if (fieldKey === "status") {
        statusId = stringValue;
        return;
      }

      // 4. Source
      if (fieldKey === "source") {
        sourceValue = stringValue;
        return;
      }

      // 5. Custom Fields
      customFields[fieldKey] = fieldValue;
    });

    const updateData = {
      contact: contactData,
      status: statusId || lead.status?._id || lead.status?.id || lead.status,
      source: sourceValue,
      customFields, // Keyed by stable 'key'
    };

    updateLead(
      {
        leadId: lead.id || lead._id,
        leadData: updateData,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setFormValues({});
          setErrors({});
        },
        onError: (error) => {
          console.error("Error updating lead:", error);
          setErrors({
            submit:
              error.response?.data?.message ||
              "Failed to update lead. Please try again.",
          });
        },
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormValues({});
    setErrors({});
  };

  // Get all field values for display - check both lead.contact and lead.details.contact
  const getFieldValue = (field) => {
    const fieldId = String(field.id);
    const fieldKey = field.key || fieldId;

    // 1. System Fields
    if (fieldKey === "system_name") {
      return contact?.name || lead.contact?.name || "";
    }
    if (fieldKey === "system_email") {
      return contact?.email || lead.contact?.email || "";
    }
    if (fieldKey === "system_phone") {
      return contact?.phone || lead.contact?.phone || "";
    }

    // 2. Common Fields (Company)
    if (fieldKey === "company" || field.label?.toLowerCase() === "company") {
      return contact?.company || lead.contact?.company || "";
    }

    // 3. Status
    if (fieldKey === "status") {
      if (typeof lead.status === "object" && lead.status !== null) {
        return lead.status.name || "";
      }
      return lead.status || "";
    }

    // 4. Source
    if (fieldKey === "source") {
      return lead.source || "";
    }

    // 5. Custom Fields - Try top-level flat first, then nested
    if (lead[fieldKey] !== undefined && lead[fieldKey] !== null) {
      // Format number/currency if needed
      if (field.type === "number" || fieldKey === "budget") {
        const val = lead[fieldKey];
        return typeof val === "number" ? val.toLocaleString() : val;
      }
      return String(lead[fieldKey]);
    }

    // Fallback to nested customFields
    if (lead.customFields) {
      if (lead.customFields instanceof Map) {
        const val =
          lead.customFields.get(fieldKey) ?? lead.customFields.get(fieldId);
        if (val !== undefined && val !== null) return String(val);
      } else {
        const val = lead.customFields[fieldKey] ?? lead.customFields[fieldId];
        if (val !== undefined && val !== null) return String(val);
      }
    }
    return "";
  };

  return (
    <div className="space-y-4">
      {/* AI Suggestions Section - Show First */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              ✨
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Live Conversation Coach
              </h3>
              <p className="text-xs text-slate-500">
                Sentiment:{" "}
                {safeAiSuggestions?.conversationCoach?.sentiment || "Neutral"}
              </p>
            </div>
          </div>
          <BulletList
            items={safeAiSuggestions?.conversationCoach?.recommendations || []}
          />
          <div className="mt-4 flex gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300">
              Insert ROI Template
            </button>
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300">
              Show Pricing
            </button>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              💡
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Deal Stage Guidance
              </h3>
              <p className="text-xs text-slate-500">
                Current Stage:{" "}
                {safeAiSuggestions?.dealStage?.stage || "Initial Contact"}
              </p>
            </div>
          </div>
          <BulletList items={safeAiSuggestions?.dealStage?.steps || []} />
          <div className="mt-4 flex gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300">
              Competitor Comparison
            </button>
            <button className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300">
              Book Demo
            </button>
          </div>
        </SectionCard>
      </div>

      {/* Lead Overview Section - Show Second */}
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Lead Overview
            </h2>
            <p className="text-sm text-slate-500">
              Contact and lead information. Click edit to modify.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LeadStatusBadge status={lead.status || leadDetails?.status} />
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#3f8cff] hover:text-[#3f8cff] transition-colors"
              >
                <FiEdit2 size={16} />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors disabled:opacity-50"
                >
                  <FiX size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3f8cff] text-white text-sm font-semibold hover:bg-[#2f6bff] transition-colors disabled:opacity-50"
                >
                  <FiSave size={16} />
                  {isUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {isLoadingFormConfig || isLoadingStatuses ? (
              <div className="text-center py-8 text-sm text-slate-500">
                Loading form...
              </div>
            ) : (
              <>
                {errors.submit && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}
                {formFields.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    No form fields configured. Please configure the form in
                    settings.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Edit the fields below to update this lead's information.
                    </p>
                    {Object.keys(formValues).length === 0 &&
                    formFields.length > 0 ? (
                      <div className="text-center py-4 text-sm text-slate-500">
                        Initializing form...
                      </div>
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
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formFields.map((field) => {
              const value = getFieldValue(field);

              // Format value based on field type
              let displayValue = value;
              if (field.type === "checkbox") {
                displayValue = value ? "Yes" : "No";
              } else if (field.type === "number" && value) {
                displayValue = Number(value).toLocaleString();
              } else if (field.type === "date" && value) {
                // Format date fields
                try {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    displayValue = date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                  }
                } catch (e) {
                  displayValue = value;
                }
              } else if (field.type === "select" && value) {
                // For select fields, try to get the label from options
                const option = field.options?.find(
                  (opt) => opt === value || opt.value === value
                );
                displayValue = option?.label || option || value;
              }

              // Show all fields (don't filter out empty ones)
              // Special handling for status field - show badge
              if (field.id === "status") {
                return (
                  <div key={field.id}>
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                      {field.label}
                    </p>
                    <LeadStatusBadge
                      status={lead.status || leadDetails?.status}
                    />
                  </div>
                );
              }

              return (
                <LabelValue
                  key={field.id}
                  label={field.label}
                  value={displayValue || "—"}
                />
              );
            })}

            {/* Show additional fields that might not be in form config */}
            {leadDetails?.created && (
              <LabelValue label="Created" value={leadDetails.created} />
            )}
            {leadDetails?.owner && (
              <LabelValue label="Owner" value={leadDetails.owner} />
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default LeadOverviewSection;
