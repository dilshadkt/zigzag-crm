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
    <div className="space-y-3 border border-slate-100 rounded-2xl p-3 bg-gray-50/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={newField.label}
          onChange={(event) => onFieldChange("label", event.target.value)}
          className="h-9 rounded-xl border border-slate-200 px-3 text-[12px] font-bold focus:outline-none focus:border-[#3f8cff] bg-white"
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
          placeholder="Placeholder hint"
          className="h-9 rounded-xl border border-slate-200 px-3 text-[12px] font-bold focus:outline-none focus:border-[#3f8cff] bg-white"
        />
        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1 cursor-pointer">
          <input
            type="checkbox"
            checked={newField.required}
            onChange={(event) =>
              onFieldChange("required", event.target.checked)
            }
            className="w-3.5 h-3.5 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]"
          />
          Mandatory
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
        className="w-full inline-flex items-center justify-center gap-2 bg-[#3f8cff] text-white text-[12px] font-bold h-9 px-5 rounded-xl shadow-sm hover:bg-[#2f6bff] transition-all active:scale-[0.98]"
      >
        <FiPlus size={14} />
        Add Field to Form
      </button>
    </div>
  );
};

export default LeadFormNewFieldPanel;

