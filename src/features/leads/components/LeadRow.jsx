import LeadStatusBadge from "./LeadStatusBadge";

const checkboxClasses =
  "h-[14px] w-[14px] rounded border-2 border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]/40";

// Helper function to get nested value from object path
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

// Format date
const formatDate = (date) => {
  if (!date) return "—";
  if (typeof date === "string") {
    // Try to parse ISO date string
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return date;
  }
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const columnRenderers = {
  createdAt: (lead) => (
    <div className="text-xs font-semibold text-slate-500">
      {formatDate(lead.createdAt || lead.createdOn)}
    </div>
  ),
  name: (lead) => (
    <div className="text-[13px] font-medium text-slate-900">
      {lead.name || lead.contact?.name || "—"}
    </div>
  ),
  "contact.name": (
    lead // Keep for backward compat if needed
  ) => (
    <div className="text-[13px] font-medium text-slate-900">
      {lead.name || lead.contact?.name || "—"}
    </div>
  ),
  status: (lead) => <LeadStatusBadge status={lead.status || "Unknown"} />,
  email: (lead) => (
    <div className="text-[13px] text-slate-600">
      {lead.email || lead.contact?.email || "—"}
    </div>
  ),
  "contact.email": (lead) => (
    <div className="text-[13px] text-slate-600">
      {lead.email || lead.contact?.email || "—"}
    </div>
  ),
  phone: (lead) => (
    <div className="text-[13px] text-slate-600">
      {lead.phone || lead.contact?.phone || "—"}
    </div>
  ),
  "contact.phone": (lead) => (
    <div className="text-[13px] text-slate-600">
      {lead.phone || lead.contact?.phone || "—"}
    </div>
  ),
  owner: (lead) => {
    const ownerName = lead.owner?.firstName
      ? `${lead.owner.firstName} ${lead.owner.lastName || ""}`
      : lead.owner?.name || "—";
    return <div className="text-[13px] text-slate-600">{ownerName}</div>;
  },
};

const LeadRow = ({ lead, columns, isSelected, onToggle, onRowClick }) => {
  const renderCellValue = (column, lead) => {
    // Use custom renderer if available
    if (columnRenderers[column.key]) {
      return columnRenderers[column.key](lead);
    }

    // Fallback to direct property access (works for flattened custom fields)
    const value = lead[column.key];

    if (value === undefined || value === null || value === "") {
      return <div className="text-[13px] text-slate-500">—</div>;
    }

    // Format based on field type
    if (column.type === "number" || column.fieldType === "number") {
      return (
        <div className="text-[13px] text-slate-900">
          {Number(value).toLocaleString()}
        </div>
      );
    }

    if (column.type === "checkbox" || column.fieldType === "checkbox") {
      return (
        <div className="text-[13px] text-slate-900">{value ? "Yes" : "No"}</div>
      );
    }

    if (column.type === "date" || column.fieldType === "date") {
      return (
        <div className="text-[13px] text-slate-900">{formatDate(value)}</div>
      );
    }

    return <div className="text-[13px] text-slate-900">{String(value)}</div>;
  };

  return (
    <tr
      className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50/70 transition-colors"
      onClick={() => onRowClick && onRowClick(lead)}
    >
      <td className="px-6 py-4">
        <input
          type="checkbox"
          className={checkboxClasses}
          checked={isSelected}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onChange={(event) => {
            event.stopPropagation();
            onToggle(lead._id || lead.id);
          }}
        />
      </td>
      {columns
        .filter((col) => col.visible)
        .map((column) => (
          <td key={column.key} className="px-6 py-4">
            {renderCellValue(column, lead)}
          </td>
        ))}
    </tr>
  );
};

export default LeadRow;
