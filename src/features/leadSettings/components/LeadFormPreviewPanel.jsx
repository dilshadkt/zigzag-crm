import CustomSelect from "./CustomSelect";

const LeadFormPreviewPanel = ({
  fields,
  previewValues,
  previewErrors,
  previewMessage,
  setPreviewValues,
  setPreviewErrors,
  setPreviewMessage,
}) => {
  const handleValidate = (event) => {
    event.preventDefault();
    const errors = {};
    fields.forEach((field) => {
      const value = previewValues[field.id];
      const requiredError =
        field.required &&
        (value === undefined ||
          value === "" ||
          (field.type === "checkbox" && !value));

      if (requiredError) {
        errors[field.id] = `${field.label} is required`;
        return;
      }

      if (value) {
        if (
          field.type === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          errors[field.id] = "Enter a valid email address";
        } else if (field.type === "number" && isNaN(Number(value))) {
          errors[field.id] = "Number fields must contain digits only";
        } else if (field.type === "date") {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors[field.id] = "Enter a valid date";
          }
        }
      }
    });
    setPreviewErrors(errors);
    setPreviewMessage(
      Object.keys(errors).length === 0 ? "Looks good! Ready to submit." : ""
    );
  };

  return (
    <div className="bg-slate-50 rounded-3xl p-4 space-y-3 h-max xl:sticky xl:top-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Live Preview</p>
        {previewMessage && (
          <span className="text-xs font-semibold text-emerald-600">
            {previewMessage}
          </span>
        )}
      </div>
      <form className="space-y-3" onSubmit={handleValidate}>
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field, previewValues, setPreviewValues)}
            {previewErrors[field.id] && (
              <span className="text-xs text-red-500">
                {previewErrors[field.id]}
              </span>
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full h-11 rounded-2xl bg-slate-900 text-white text-sm font-semibold"
        >
          Validate Form
        </button>
      </form>
    </div>
  );
};

const renderField = (field, previewValues, setPreviewValues) => {
  const handleChange = (value) => {
    setPreviewValues((prev) => ({ ...prev, [field.id]: value }));
  };

  if (field.type === "textarea") {
    return (
      <textarea
        className="h-24 rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#3f8cff]"
        placeholder={field.placeholder || `Enter ${field.label}`}
        value={previewValues[field.id] || ""}
        onChange={(e) => handleChange(e.target.value)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <CustomSelect
        value={previewValues[field.id] || ""}
        onChange={(value) => handleChange(value)}
        options={[
          { value: "", label: `Select ${field.label}` },
          ...(field.options || []).map((option) => ({
            value: option,
            label: option,
          })),
        ]}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="inline-flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={!!previewValues[field.id]}
          onChange={(e) => handleChange(e.target.checked)}
        />
        Enable {field.label}
      </label>
    );
  }

  if (field.type === "date") {
    return (
      <input
        type="date"
        className="h-11 rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
        placeholder={field.placeholder || `Select ${field.label}`}
        value={previewValues[field.id] || ""}
        onChange={(e) => handleChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type={field.type}
      className="h-11 rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
      placeholder={field.placeholder || `Enter ${field.label}`}
      value={previewValues[field.id] || ""}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
};

export default LeadFormPreviewPanel;
