import { FiX } from "react-icons/fi";

const LeadsColumnEditor = ({
  columns,
  onToggleColumn,
  onReset,
  onApply,
  onClose,
  canToggleColumn,
}) => {
  return (
    <div className="bg-white w-96 rounded-3xl border border-slate-200 shadow-xl p-5 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Edit Columns</h3>
          <p className="text-sm text-slate-500">
            Select the columns to rearrange
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center
          hover:bg-gray-100 cursor-pointer text-slate-500 hover:text-slate-900"
          aria-label="Close column editor "
        >
          <FiX />
        </button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {columns.map((column) => (
          <label
            key={column.key}
            className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700"
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded-md border-2 border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]/40"
              checked={column.visible}
              disabled={column.visible && !canToggleColumn}
              onChange={() => onToggleColumn(column.key)}
            />
            {column.label}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="flex-1 h-11 rounded-full border border-slate-200 text-sm
          cursor-pointer  font-semibold text-slate-600 hover:border-slate-300"
        >
          Reset to Default
        </button>
        <button
          onClick={onApply}
          className="flex-1 h-11 rounded-full bg-[#3f8cff] text-white text-sm font-semibold
           hover:bg-[#3f8cff]/80 cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default LeadsColumnEditor;
