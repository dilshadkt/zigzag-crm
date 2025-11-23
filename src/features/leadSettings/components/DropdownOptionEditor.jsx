import { FiPlus } from "react-icons/fi";

const DropdownOptionEditor = ({
  options,
  inputValue,
  onChange,
  onAdd,
  onRemove,
  placeholder = "Add option",
}) => {
  const handleAdd = () => {
    const trimmed = inputValue?.trim();
    if (!trimmed) return;
    onAdd(trimmed);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500">Dropdown Options</p>
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 h-10 rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
              onChange("");
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            handleAdd();
            onChange("");
          }}
          className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center"
        >
          <FiPlus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <span
            key={`${option}-${index}`}
            className="inline-flex items-center gap-2 bg-slate-100 text-xs font-semibold text-slate-700 px-3 py-1 rounded-full"
          >
            {option}
            <button
              onClick={() => onRemove(index)}
              className="text-slate-400 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default DropdownOptionEditor;

