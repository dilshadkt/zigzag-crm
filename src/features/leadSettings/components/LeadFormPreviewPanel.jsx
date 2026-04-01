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
    <div className="bg-gray-50 rounded-2xl p-3 space-y-2 h-max xl:sticky xl:top-2 shadow-inner border border-slate-100">
      <div className="flex items-center justify-between px-1">
        <p className="text-[13px] font-bold text-slate-700 uppercase tracking-tight">Form Preview</p>
        {previewMessage && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            {previewMessage}
          </span>
        )}
      </div>
      <form className="space-y-2.5 bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm" onSubmit={handleValidate}>
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight ml-0.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {renderField(field, previewValues, setPreviewValues)}
            {previewErrors[field.id] && (
              <span className="text-[10px] font-bold text-red-500 px-1">
                {previewErrors[field.id]}
              </span>
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full h-10 rounded-xl bg-slate-900 text-white text-[12px] font-bold shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98] mt-2"
        >
          Test Validation
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
        className="h-20 rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-blue-500 transition-all"
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
      <label className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          checked={!!previewValues[field.id]}
          onChange={(e) => handleChange(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Confirmed {field.label}
      </label>
    );
  }

  if (field.type === "date") {
    return (
      <input
        type="date"
        className="h-9 rounded-xl border border-slate-200 px-3 text-[12px] font-medium focus:outline-none focus:border-blue-500 transition-all"
        placeholder={field.placeholder || `Select ${field.label}`}
        value={previewValues[field.id] || ""}
        onChange={(e) => handleChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type={field.type}
      className="h-9 rounded-xl border border-slate-200 px-3 text-[12px] font-medium focus:outline-none focus:border-blue-500 transition-all"
      placeholder={field.placeholder || `Enter ${field.label}`}
      value={previewValues[field.id] || ""}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
};

export default LeadFormPreviewPanel;
