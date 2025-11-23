import { useState, useEffect, useCallback, useMemo } from "react";
import { FiX } from "react-icons/fi";
import DynamicLeadForm from "./DynamicLeadForm";
import {
  useGetLeadFormConfig,
  useGetLeadStatuses,
  useCreateLead,
} from "../api";

const AddLeadModal = ({ isOpen, onClose, onSuccess }) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  // Stable handler for form value changes
  const handleFormValueChange = useCallback((updater) => {
    setFormValues(updater);
  }, []);

  // Use React Query hooks
  const { data: formConfigData, isLoading: formConfigLoading } =
    useGetLeadFormConfig();
  const { data: statusesData } = useGetLeadStatuses();
  const { mutate: createLead, isLoading: isSubmitting } = useCreateLead();

  useEffect(() => {
    if (isOpen) {
      setFormValues({});
      setErrors({});
    }
  }, [isOpen]);

  // Get form fields from config - memoized to prevent recreation
  const formFields = useMemo(() => {
    const fields = formConfigData?.data?.fields || [];
    if (fields.length === 0) {
      // Default fallback if no config exists (should typically be handled by API default)
      return [
        {
          id: "system_name",
          key: "system_name",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Enter full name",
        },
        {
          id: "system_email",
          key: "system_email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "Enter email address",
        },
        {
          id: "system_phone",
          key: "system_phone",
          label: "Phone Number",
          type: "tel",
          required: true, // Mandatory now
          placeholder: "Enter phone number",
        },
        {
          id: "company_1",
          key: "company", // Legacy fallback key
          label: "Company",
          type: "text",
          required: false,
          placeholder: "Enter company name",
        },
      ];
    }
    // Ensure all fields have IDs and keys
    return fields.map((field, index) => ({
      ...field,
      id: String(field.id || `field_${index}`),
      key: field.key || field.id || `field_${index}`,
    }));
  }, [formConfigData?.data?.fields]);

  const statuses = statusesData?.data || [];
  const isLoading = formConfigLoading;

  const validateForm = () => {
    const newErrors = {};
    
    formFields.forEach((field) => {
      const value = formValues[field.id]; // Values keyed by ID in frontend state
      
      // Check required fields
      if (field.required) {
        if (value === undefined || value === null || value === "" || (field.type === "checkbox" && !value)) {
          newErrors[field.id] = `${field.label} is required`;
          return;
        }
      }

      // Validate email format
      if (value && field.type === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field.id] = "Enter a valid email address";
        }
      }

      // Validate number format
      if (value && field.type === "number") {
        if (isNaN(Number(value))) {
          newErrors[field.id] = "Must be a valid number";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Explicit mapping based on keys
    const contact = {
      name: "",
      email: "",
      phone: "",
      company: "",
    };

    const customFields = {};
    
    formFields.forEach((field) => {
      const fieldId = String(field.id); // Frontend ID
      const fieldKey = field.key || fieldId; // Backend Key
      const fieldValue = formValues[fieldId];
      
      if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
        return; // Skip empty fields
      }

      const stringValue = String(fieldValue).trim();

      // Map System Fields using known keys
      if (fieldKey === "system_name") {
        contact.name = stringValue;
        return;
      }
      if (fieldKey === "system_email") {
        contact.email = stringValue;
        return;
      }
      if (fieldKey === "system_phone") {
        contact.phone = stringValue;
        return;
      }
      
      // Map Company Name (common field)
      if (fieldKey === "company" || field.label.toLowerCase() === "company" || field.label.toLowerCase() === "company name") {
         contact.company = stringValue;
         // Also add to custom fields if it's a custom field actually
         if (fieldKey !== "company") {
             customFields[fieldKey] = fieldValue;
         }
         return;
      }

      // Everything else goes to customFields keyed by the STABLE KEY
      customFields[fieldKey] = fieldValue;
    });

    // Get default status if status not provided
    let statusId = formValues.status;
    if (!statusId && statuses.length > 0) {
      const defaultStatus = statuses.find((s) => s.isDefault);
      statusId = defaultStatus?._id || statuses[0]?._id;
    }

    const leadData = {
      contact,
      status: statusId,
      source: formValues.source || "Manual Entry",
      customFields, // Now keyed by stable 'key'
      services: formValues.services || "",
      budget: formValues.budget ? Number(formValues.budget) : undefined,
      notes: formValues.notes || "",
    };

    createLead(leadData, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      },
      onError: (error) => {
        console.error("Error creating lead:", error);
        setErrors({
          submit:
            error.response?.data?.message ||
            "Failed to create lead. Please try again.",
        });
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/35 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-[#3f8cff]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm font-medium text-slate-700">Creating lead...</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Add New Lead</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <FiX size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-slate-500">Loading form...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DynamicLeadForm
              fields={formFields}
              values={formValues}
              onChange={handleFormValueChange}
              errors={errors}
              statuses={statuses}
            />

            {errors.submit && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-full bg-[#3f8cff] text-white text-sm font-semibold hover:bg-[#2f6bff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Lead"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddLeadModal;

