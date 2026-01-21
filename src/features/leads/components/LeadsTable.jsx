import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import LeadRow from "./LeadRow";

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
  isEmployee = false,
}) => {
  const visibleLeadIds = leads.map((lead) => String(lead._id || lead.id));
  const isAllSelected =
    visibleLeadIds.length > 0 &&
    visibleLeadIds.every((leadId) => selectedLeadIds.includes(leadId));

  const showEmptyState = leads.length === 0;

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // Estimate height of a row
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  return (
    <div className="overflow-x-auto h-full overflow-y-auto" ref={parentRef}>
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-slate-50 text-slate-500 sticky top-0 z-30">
          <tr>
            <th className={headerClasses}>
              <input
                type="checkbox"
                className={checkboxClasses}
                checked={isAllSelected}
                onChange={() =>
                  onToggleSelectAll(!isAllSelected, visibleLeadIds)
                }
                aria-label="Select all leads"
              />
            </th>
            {columns.map((column) => (
              <th key={column.key} className={headerClasses}>
                {column.label}
              </th>
            ))}
            {!isEmployee && (
              <th className={headerClasses} style={{ width: "60px" }}>
                {/* Actions column */}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white">
          {showEmptyState ? (
            <tr className="h-[400px]">
              <td
                colSpan={columns.length + (isEmployee ? 1 : 2)}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                No leads found. Try adjusting your filters or create a new lead.
              </td>
            </tr>
          ) : (
            <>
              {paddingTop > 0 && (
                <tr>
                  <td colSpan={columns.length + 2} style={{ height: `${paddingTop}px` }} />
                </tr>
              )}
              {virtualRows.map((virtualRow) => {
                const lead = leads[virtualRow.index];
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
                    isEmployee={isEmployee}
                  />
                );
              })}
              {paddingBottom > 0 && (
                <tr>
                  <td colSpan={columns.length + 2} style={{ height: `${paddingBottom}px` }} />
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
