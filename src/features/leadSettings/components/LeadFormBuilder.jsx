import { useState } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { FIELD_TYPES } from "../constants";
import LeadFormNewFieldPanel from "./LeadFormNewFieldPanel";
import LeadFormFieldList from "./LeadFormFieldList";
import LeadFormPreviewPanel from "./LeadFormPreviewPanel";
import LeadFormAIHelper from "./LeadFormAIHelper";

const defaultNewField = {
  label: "",
  type: FIELD_TYPES[0].value,
  required: false,
  placeholder: "",
  options: ["Option 1"],
};

const LeadFormBuilder = ({
  fields,
  onAddField,
  onRemoveField,
  onUpdateField,
  onReplaceFields,
  onResetFields,
}) => {
  const [newField, setNewField] = useState(defaultNewField);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [previewValues, setPreviewValues] = useState({});
  const [previewErrors, setPreviewErrors] = useState({});
  const [previewMessage, setPreviewMessage] = useState("");

  const handleAddField = () => {
    if (!newField.label.trim()) return;
    onAddField({
      ...newField,
      label: newField.label.trim(),
      options:
        newField.type === "select"
          ? newField.options.filter((option) => option.trim())
          : undefined,
    });
    setNewField(defaultNewField);
    setNewOptionValue("");
  };

  const handleNewFieldChange = (key, value) => {
    setNewField((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "type") {
        if (
          value === "select" &&
          (!next.options || next.options.length === 0)
        ) {
          next.options = ["Option 1"];
        }
        if (value !== "select") {
          next.options = ["Option 1"];
        }
      }
      return next;
    });
  };

  const handleAddNewOption = () => {
    if (!newOptionValue.trim()) return;
    setNewField((prev) => ({
      ...prev,
      options: [...prev.options, newOptionValue.trim()],
    }));
    setNewOptionValue("");
  };

  const handleRemoveOption = (optionIndex) => {
    setNewField((prev) => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== optionIndex),
    }));
  };

  const handleFieldOptionChange = (fieldId, options) => {
    onUpdateField(fieldId, { options });
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the form? This will clear all fields and start fresh with mandatory fields (Full Name, Email, Contact)."
      )
    ) {
      if (onResetFields) {
        onResetFields();
      }
      // Reset preview state
      setPreviewValues({});
      setPreviewErrors({});
      setPreviewMessage("");
    }
  };

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-slate-900">
            Lead Form Builder
          </h3>
          <p className="text-sm text-slate-500">
            Define what information you need from leads. Configure fields at
            left and see a live preview on the right.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 hover:border-slate-400 transition-colors"
          title="Reset form and start fresh"
        >
          <FiRotateCcw size={16} />
          Reset Form
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <LeadFormNewFieldPanel
            newField={newField}
            newOptionValue={newOptionValue}
            onFieldChange={handleNewFieldChange}
            onOptionChange={setNewOptionValue}
            onAddOption={handleAddNewOption}
            onRemoveOption={handleRemoveOption}
            onAddField={handleAddField}
          />

          <LeadFormFieldList
            fields={fields}
            onUpdateField={onUpdateField}
            onRemoveField={onRemoveField}
            onFieldOptionChange={handleFieldOptionChange}
          />
        </div>

        <LeadFormPreviewPanel
          fields={fields}
          previewValues={previewValues}
          previewErrors={previewErrors}
          previewMessage={previewMessage}
          setPreviewValues={setPreviewValues}
          setPreviewErrors={setPreviewErrors}
          setPreviewMessage={setPreviewMessage}
        />
      </div>

      <LeadFormAIHelper
        onReplaceFields={onReplaceFields}
        setPreviewMessage={setPreviewMessage}
      />
    </div>
  );
};

export default LeadFormBuilder;
