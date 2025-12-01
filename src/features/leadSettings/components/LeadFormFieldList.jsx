import CustomSelect from "./CustomSelect";
import { FIELD_TYPES, isMandatoryField } from "../constants";
import { FiPlus, FiTrash2, FiLock } from "react-icons/fi";
import { useState } from "react";

const LeadFormFieldList = ({
  fields,
  onUpdateField,
  onRemoveField,
  onFieldOptionChange,
}) => {
  const [optionDrafts, setOptionDrafts] = useState({});

  const handleOptionDraftChange = (fieldId, value) => {
    setOptionDrafts((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleAddOption = (fieldId) => {
    const draft = optionDrafts[fieldId]?.trim();
    if (!draft) return;
    onFieldOptionChange(fieldId, [
      ...(fields.find((field) => field.id === fieldId)?.options || []),
      draft,
    ]);
    handleOptionDraftChange(fieldId, "");
  };

  return (
    <div className="space-y-3">
      {fields.map((field) => {
        const isMandatory = isMandatoryField(field);
        return (
          <div
            key={field.id}
            className={`space-y-3 border rounded-2xl p-4 ${
              isMandatory ? "border-blue-200 bg-blue-50/30" : "border-slate-100"
            }`}
          >
            {isMandatory && (
              <div className="flex items-center gap-1 mb-2">
                <FiLock size={12} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">
                  Mandatory Field
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={field.label}
                onChange={(event) => {
                  // Prevent changing label for mandatory fields to maintain consistency
                  if (
                    !isMandatory ||
                    (field.key === "system_name" &&
                      event.target.value.toLowerCase().includes("name")) ||
                    (field.key === "system_email" &&
                      (event.target.value.toLowerCase().includes("email") ||
                        field.type === "email")) ||
                    (field.key === "system_phone" &&
                      (event.target.value.toLowerCase().includes("contact") ||
                        event.target.value.toLowerCase().includes("phone") ||
                        field.type === "tel"))
                  ) {
                    onUpdateField(field.id, { label: event.target.value });
                  }
                }}
                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
              />
              <CustomSelect
                value={field.type}
                onChange={(value) => {
                  // Prevent changing type for mandatory fields
                  if (!isMandatory) {
                    onUpdateField(field.id, { type: value });
                  } else if (
                    (field.key === "system_email" && value === "email") ||
                    (field.key === "system_phone" && value === "tel") ||
                    (field.key === "system_name" && value === "text")
                  ) {
                    // Allow if it maintains the mandatory field type
                    onUpdateField(field.id, { type: value });
                  }
                }}
                disabled={isMandatory}
                options={FIELD_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
              />
              <input
                value={field.placeholder || ""}
                onChange={(event) =>
                  onUpdateField(field.id, { placeholder: event.target.value })
                }
                placeholder="Placeholder"
                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
              />
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={field.required}
                  disabled={isMandatory}
                  onChange={(event) => {
                    if (!isMandatory) {
                      onUpdateField(field.id, {
                        required: event.target.checked,
                      });
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="flex items-center gap-1">
                  Required field
                  {isMandatory && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <FiLock size={12} />
                      Mandatory
                    </span>
                  )}
                </span>
              </label>
              <button
                className={`${
                  isMandatory
                    ? "text-slate-300 cursor-not-allowed opacity-50"
                    : "text-slate-400 hover:text-red-500"
                }`}
                onClick={() => {
                  if (isMandatory) {
                    alert(
                      "This is a mandatory field and cannot be deleted. Full Name, Email, and Contact are required for the lead form to work properly."
                    );
                    return;
                  }
                  if (
                    window.confirm(
                      `Are you sure you want to remove "${field.label}"?`
                    )
                  ) {
                    onRemoveField(field.id);
                  }
                }}
                disabled={isMandatory}
                title={
                  isMandatory
                    ? "Mandatory fields cannot be deleted"
                    : "Remove field"
                }
              >
                <FiTrash2 size={18} />
              </button>
            </div>
            {field.type === "select" && (
              <div className="space-y-2">
                <p className="text-xs	font-semibold text-slate-500">
                  Dropdown Options
                </p>
                <div className="flex flex-wrap gap-2">
                  {(field.options || []).map((option, index) => (
                    <span
                      key={`${option}-${index}`}
                      className="inline-flex items-center gap-2 bg-slate-100 text-xs font-semibold text-slate-700 px-3 py-1 rounded-full"
                    >
                      {option}
                      <button
                        onClick={() =>
                          onFieldOptionChange(
                            field.id,
                            field.options.filter((_, idx) => idx !== index)
                          )
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 h-10 rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
                    placeholder="Add option"
                    value={optionDrafts[field.id] || ""}
                    onChange={(event) =>
                      handleOptionDraftChange(field.id, event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddOption(field.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center"
                    onClick={() => handleAddOption(field.id)}
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LeadFormFieldList;
