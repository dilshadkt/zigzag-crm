import {
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiColumns,
  FiDownload,
  FiMoreVertical,
} from "react-icons/fi";
import LeadsSearchBar from "./LeadsSearchBar";

const iconButtonClasses =
  "h-11 w-11 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors";

const LeadsActions = ({
  onAddLead,
  onAddFilter,
  onRefresh,
  onToggleLayout,
  onDownload,
  onMoreActions,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex items-center  w-full justify-between">
      <LeadsSearchBar value={searchTerm} onChange={onSearchChange} />

      <div className="flex items-center gap-x-2  justify-end">
        <button
          onClick={onAddLead}
          className="inline-flex items-center gap-2 bg-[#3f8cff] text-white text-sm font-medium px-5 h-11 rounded-full shadow-sm hover:bg-[#2f6bff] transition-colors"
        >
          <FiPlus size={16} />
          Add Lead
        </button>
        <button
          onClick={onAddFilter}
          className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 text-sm font-medium px-4 h-11 rounded-full hover:border-slate-300 transition-colors"
        >
          <FiFilter size={16} />
          Add Filter
        </button>
        <button
          onClick={onRefresh}
          className={iconButtonClasses}
          aria-label="Refresh leads"
        >
          <FiRefreshCw size={18} />
        </button>
        <button
          onClick={onToggleLayout}
          className={iconButtonClasses}
          aria-label="Toggle layout"
        >
          <FiColumns size={18} />
        </button>
        <button
          onClick={onDownload}
          className={iconButtonClasses}
          aria-label="Download leads"
        >
          <FiDownload size={18} />
        </button>
        <button
          onClick={onMoreActions}
          className={iconButtonClasses}
          aria-label="More actions"
        >
          <FiMoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};

export default LeadsActions;
