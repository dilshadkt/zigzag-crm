import { useRef, useMemo, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import LeadRow from "./LeadRow";
import LeadCard from "./LeadCard";

const headerClasses =
  "px-6 py-3 text-left text-xs whitespace-nowrap font-semibold uppercase sticky top-0 z-20 bg-slate-50 tracking-wide text-slate-500";

const checkboxClasses =
  "h-[14px] w-[14px] cursor-pointer rounded border-2 border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]/40";

const LeadsTable = ({
  leads,
  columns,
  selectedLeadIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  onEdit,
  onSendEmail,
  onCreateTask,
  onAssign,
  onDelete,
  onConvert,
  onCopyURL,
  statuses,
  onStatusChange,
  onCustomFieldChange,
  onSourceChange,
  onMoveToBranch,
  branches = [],
  canManage = false,
  scrollContainerId,
  projects = [],
  onMoveToProject,
  bottomContent,
  onLoadMore,
}) => {
  const visibleLeadIds = leads.map((lead) => String(lead._id || lead.id));
  const isAllSelected =
    visibleLeadIds.length > 0 &&
    visibleLeadIds.every((leadId) => selectedLeadIds.includes(leadId));

  const showEmptyState = leads.length === 0;

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () =>
      scrollContainerId
        ? document.getElementById(scrollContainerId)
        : parentRef.current,
    estimateSize: () => 48, // Reduced estimate height for desktop row
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  if (isMobile) {
    const handleScroll = (e) => {
      if (onLoadMore) {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
          onLoadMore();
        }
      }
    };

    return (
      <div
        className={`flex flex-col px-3 py-2 ${!scrollContainerId ? 'h-full overflow-y-auto' : ''}`}
        ref={!scrollContainerId ? parentRef : null}
        onScroll={handleScroll}
      >
        {showEmptyState ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-100">
            No leads found. Try adjusting your filters or create a new lead.
          </div>
        ) : (
          <>
            <div style={{ height: `${paddingTop}px` }} />
            {virtualRows.map((virtualRow) => {
              const lead = leads[virtualRow.index];
              if (!lead) return null;
              const leadId = String(lead._id || lead.id);
              return (
                <div key={leadId} ref={rowVirtualizer.measureElement} data-index={virtualRow.index} className="pb-1.5">
                  <LeadCard
                    lead={lead}
                    columns={columns}
                    isSelected={selectedLeadIds.includes(leadId)}
                    onToggle={onToggleSelect}
                    onRowClick={onRowClick}
                    onEdit={onEdit}
                    onSendEmail={onSendEmail}
                    onCreateTask={onCreateTask}
                    onAssign={onAssign}
                    onDelete={onDelete}
                    onConvert={onConvert}
                    onCopyURL={onCopyURL}
                    statuses={statuses}
                    onStatusChange={onStatusChange}
                    onCustomFieldChange={onCustomFieldChange}
                    onSourceChange={onSourceChange}
                    onMoveToBranch={onMoveToBranch}
                    branches={branches}
                    canManage={canManage}
                    projects={projects}
                    onMoveToProject={onMoveToProject}
                  />
                </div>
              );
            })}
            <div style={{ height: `${paddingBottom}px` }} />
            {bottomContent}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto ${!scrollContainerId ? 'h-full overflow-y-auto' : ''}`}
      ref={!scrollContainerId ? parentRef : null}
    >
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-slate-50 text-slate-500 sticky top-0 z-30">
          <tr>
              <th
                className={`${headerClasses} cursor-pointer hover:bg-slate-100 transition-colors`}
                onClick={() => onToggleSelectAll(!isAllSelected, visibleLeadIds)}
              >
                <div className="flex items-center justify-center -m-3 p-3">
                  <input
                    type="checkbox"
                    className={checkboxClasses}
                    checked={isAllSelected}
                    onChange={() => { }} // Controlled by the th's onClick
                    aria-label="Select all leads"
                  />
                </div>
              </th>
            {columns.map((column) => (
              <th key={column.key} className={headerClasses}>
                {column.label}
              </th>
            ))}
              <th className={headerClasses} style={{ width: "60px" }}>
                {/* Actions column */}
              </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {showEmptyState ? (
            <tr className="h-[400px]">
              <td
                colSpan={columns.length + 2}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                No leads found. Try adjusting your filters or create a new lead.
              </td>
            </tr>
          ) : (
            <>
              {paddingTop > 0.5 && (
                <tr>
                  <td colSpan={columns.length + 2} style={{ height: `${paddingTop}px`, padding: 0 }} />
                </tr>
              )}
              {virtualRows.map((virtualRow) => {
                const lead = leads[virtualRow.index];
                if (!lead) return null;
                const leadId = String(lead._id || lead.id);
                return (
                  <LeadRow
                    key={leadId}
                    lead={lead}
                    columns={columns}
                    isSelected={selectedLeadIds.includes(leadId)}
                    onToggle={onToggleSelect}
                    onRowClick={onRowClick}
                    onEdit={onEdit}
                    onSendEmail={onSendEmail}
                    onCreateTask={onCreateTask}
                    onAssign={onAssign}
                    onDelete={onDelete}
                    onConvert={onConvert}
                    onCopyURL={onCopyURL}
                    statuses={statuses}
                    onStatusChange={onStatusChange}
                    onCustomFieldChange={onCustomFieldChange}
                    onSourceChange={onSourceChange}
                    onMoveToBranch={onMoveToBranch}
                    branches={branches}
                    canManage={canManage}
                    index={virtualRow.index}
                    projects={projects}
                    onMoveToProject={onMoveToProject}
                  />
                );
              })}
              {paddingBottom > 0.5 && (
                <tr>
                  <td colSpan={columns.length + 2} style={{ height: `${paddingBottom}px`, padding: 0 }} />
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;
