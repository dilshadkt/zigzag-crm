import {
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiColumns,
  FiDownload,
  FiMoreVertical,
  FiPieChart,
} from "react-icons/fi";
import LeadsSearchBar from "./LeadsSearchBar";

const iconButtonClasses =
  "h-9 w-9 md:h-11 md:w-11 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors";

const LeadsActions = ({
  onAddLead,
  onAddFilter,
  onRefresh,
  isRefreshing,
  onToggleLayout,
  onDownload,
  onMoreActions,
  showDashboard,
  onToggleDashboard,
  searchTerm,
  onSearchChange,
  isClient,
}) => {
  return (
    <div className="flex items-center  w-full justify-between">
      <LeadsSearchBar value={searchTerm} onChange={onSearchChange} />

      <div className="flex items-center  gap-x-2  justify-end">
        <button
          onClick={onToggleDashboard}
          className={`hidden md:flex ${iconButtonClasses} ${showDashboard ? 'bg-slate-100 text-[#3f8cff] border-[#3f8cff]/30 shadow-inner' : ''}`}
          aria-label="Toggle dashboard"
          title={showDashboard ? "Hide Dashboard" : "Show Dashboard"}
        >
          <FiPieChart size={18} />
        </button>
        {!isClient && (
          <button
            onClick={onAddLead}
            className="flex items-center justify-center bg-[#3f8cff] text-white h-9 w-9 md:h-11 md:w-auto md:px-5 rounded-full shadow-sm hover:bg-[#2f6bff] transition-colors"
            aria-label="Add lead"
          >
            <FiPlus size={18} className="md:w-[16px]" />
            <span className="hidden md:inline ml-2">Add Lead</span>
          </button>
        )}
        <button
          onClick={onAddFilter}
          className="flex items-center justify-center border border-slate-200 text-slate-700 h-9 w-9 md:h-11 md:w-auto md:px-4 rounded-full hover:border-slate-300 transition-colors"
          aria-label="Add filter"
        >
          <FiFilter size={16} className="md:w-[16px]" />
          <span className="hidden md:inline ml-2">Filter</span>
        </button>
        <button
          onClick={onRefresh}
          className={`  hidden  md:flex  ${iconButtonClasses} ${isRefreshing && `animate-spin`}   `}
          aria-label="Refresh leads"
          disabled={isRefreshing}
        >
          <FiRefreshCw size={18} />
        </button>
        <button
          onClick={onToggleLayout}
          className={` ml-2  md:ml-0 ${iconButtonClasses}`}
          aria-label="Toggle layout"
        >
          <FiColumns size={18} />
        </button>
        <button
          onClick={onDownload}
          className={`  hidden  md:flex  ${iconButtonClasses}`}
          aria-label="Download leads"
        >
          <FiDownload size={18} />
        </button>
        {onMoreActions && !isClient && (
          <button
            onClick={onMoreActions}
            className={`  hidden  md:flex  ${iconButtonClasses}`}
            aria-label="More actions"
          >
            <FiMoreVertical size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadsActions;
