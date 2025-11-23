import CustomSelect from "./CustomSelect";
import DropdownOptionEditor from "./DropdownOptionEditor";
import { FIELD_TYPES } from "../constants";
import { FiPlus } from "react-icons/fi";

const LeadFormNewFieldPanel = ({
  newField,
  newOptionValue,
  onFieldChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onAddField,
}) => {
  return (
    <div className="space-y-3 border border-slate-100 rounded-3xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={newField.label}
          onChange={(event) => onFieldChange("label", event.target.value)}
          className="h-11 rounded-2xl border border-slate-200 px-4 text-sm focus:outline-none focus:border-[#3f8cff]"
          placeholder="Field label (e.g., Budget)"
        />
        <CustomSelect
          value={newField.type}
          onChange={(value) => onFieldChange("type", value)}
          options={FIELD_TYPES.map((type) => ({
            value: type.value,
            label: type.label,
          }))}
        />
        <input
          value={newField.placeholder}
          onChange={(event) => onFieldChange("placeholder", event.target.value)}
          placeholder="Placeholder"
          className="h-11 rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={newField.required}
            onChange={(event) =>
              onFieldChange("required", event.target.checked)
            }
            className="w-4 h-4 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]"
          />
          Required
        </label>
      </div>

      {newField.type === "select" && (
        <DropdownOptionEditor
          options={newField.options}
          inputValue={newOptionValue}
          onChange={onOptionChange}
          onAdd={onAddOption}
          onRemove={onRemoveOption}
        />
      )}

      <button
        onClick={onAddField}
        className="inline-flex items-center justify-center gap-2 bg-[#3f8cff] text-white text-sm font-semibold h-11 px-5 rounded-2xl"
      >
        <FiPlus size={16} />
        Add Field
      </button>
    </div>
  );
};

export default LeadFormNewFieldPanel;

