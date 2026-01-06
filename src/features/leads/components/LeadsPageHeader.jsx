import LeadsActions from "./LeadsActions";
import LeadsSearchBar from "./LeadsSearchBar";

const LeadsPageHeader = ({
  searchTerm,
  onSearchChange,
  onAddLead,
  onAddFilter,
  onRefresh,
  isRefreshing,
  onToggleLayout,
  onDownload,
  onMoreActions,
  showDashboard,
  onToggleDashboard,
}) => {
  return (
    <div className="flex flex-col gap-4 px-6 pb-3 pt-1 border-b border-slate-100">
      <div className="flex flex-wrap gap-3 items-center justify-between"></div>
      <div className="flex justify-end">
        <LeadsActions
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onAddLead={onAddLead}
          onAddFilter={onAddFilter}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onToggleLayout={onToggleLayout}
          onDownload={onDownload}
          onMoreActions={onMoreActions}
          showDashboard={showDashboard}
          onToggleDashboard={onToggleDashboard}
        />
      </div>
    </div>
  );
};

export default LeadsPageHeader;
