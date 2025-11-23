import { useCallback, memo } from "react";
import CustomSelect from "../../leadSettings/components/CustomSelect";

// Individual field component for better isolation
const FormField = memo(({ field, value, error, onChange, statuses }) => {
  const fieldId = String(field.id);
  
  const handleChange = useCallback(
    (newValue) => {
      onChange(fieldId, newValue);
    },
    [fieldId, onChange]
  );

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldId} className="text-sm font-semibold text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id={fieldId}
          name={fieldId}
          className={`h-24 rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:border-[#3f8cff] ${
            error ? "border-red-300" : "border-slate-200"
          }`}
          placeholder={field.placeholder || `Enter ${field.label}`}
          value={value || ""}
          onChange={(e) => {
            e.stopPropagation();
            handleChange(e.target.value);
          }}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldId} className="text-sm font-semibold text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <CustomSelect
          value={value || ""}
          onChange={handleChange}
          options={[
            { value: "", label: `Select ${field.label}` },
            ...(field.options || []).map((option) => ({
              value: option,
              label: option,
            })),
          ]}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldId} className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            id={fieldId}
            name={fieldId}
            checked={!!value}
            onChange={(e) => {
              e.stopPropagation();
              handleChange(e.target.checked);
            }}
            className="h-4 w-4 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]"
          />
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  // Handle special field: status
  if (fieldId === "status" && statuses) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldId} className="text-sm font-semibold text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <CustomSelect
          value={value || ""}
          onChange={handleChange}
          options={[
            { value: "", label: "Select Status" },
            ...statuses.map((status) => ({
              value: status._id || status.id,
              label: status.name,
            })),
          ]}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  // Default input field (text, email, tel, number)
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-semibold text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={field.type}
        id={fieldId}
        name={fieldId}
        className={`h-11 rounded-2xl border px-3 text-sm focus:outline-none focus:border-[#3f8cff] ${
          error ? "border-red-300" : "border-slate-200"
        }`}
        placeholder={field.placeholder || `Enter ${field.label}`}
        value={value || ""}
        onChange={(e) => {
          e.stopPropagation();
          handleChange(e.target.value);
        }}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

FormField.displayName = "FormField";

const DynamicLeadForm = ({ fields, values, onChange, errors, statuses }) => {
  const handleFieldChange = useCallback(
    (fieldId, newValue) => {
      if (typeof onChange === "function" && fieldId) {
        // Create a new object with the updated field value
        onChange((prev) => {
          const currentValues = prev && typeof prev === "object" ? prev : {};
          return {
            ...currentValues,
            [String(fieldId)]: newValue,
          };
        });
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        if (!field.id) {
          console.warn("Field missing id:", field);
          return null;
        }
        const fieldId = String(field.id);
        const fieldValue = values?.[fieldId] ?? "";
        const fieldError = errors?.[fieldId];
        
        return (
          <FormField
            key={fieldId}
            field={field}
            value={fieldValue}
            error={fieldError}
            onChange={handleFieldChange}
            statuses={statuses}
          />
        );
      })}
    </div>
  );
};

export default DynamicLeadForm;

