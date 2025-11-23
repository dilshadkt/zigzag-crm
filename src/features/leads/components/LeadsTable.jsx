import LeadRow from "./LeadRow";

const headerClasses =
  "px-6 py-3 text-left text-xs font-semibold uppercase sticky top-0 z-20 bg-slate-50 tracking-wide text-slate-500";

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
  isEmployee = false,
}) => {
  const visibleLeadIds = leads.map((lead) => String(lead._id || lead.id));
  const isAllSelected =
    visibleLeadIds.length > 0 &&
    visibleLeadIds.every((leadId) => selectedLeadIds.includes(leadId));

  const showEmptyState = leads.length === 0;

  return (
    <div className="overflow-x-auto h-full">
      <table className="min-w-full">
        <thead className="bg-slate-50 text-slate-500">
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
            <tr>
              <td
                colSpan={columns.length + (isEmployee ? 1 : 2)}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                No leads found. Try adjusting your filters or create a new lead.
              </td>
            </tr>
          ) : (
            leads.map((lead) => {
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
                  isEmployee={isEmployee}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;
