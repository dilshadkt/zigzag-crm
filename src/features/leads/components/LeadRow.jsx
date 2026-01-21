import React, { useState, useRef, useEffect, memo } from "react";
import { FiMoreVertical } from "react-icons/fi";
// ... (rest of imports)
import LeadStatusBadge from "./LeadStatusBadge";
import LeadRowContextMenu from "./LeadRowContextMenu";
import StatusDropdown from "./StatusDropdown";
import SelectFieldDropdown from "./SelectFieldDropdown";

const checkboxClasses =
  "h-[14px] w-[14px] rounded border-2 border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]/40";

// ... (helper functions)
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

const formatDate = (date) => {
  if (!date) return "—";
  if (typeof date === "string") {
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
    <div className="text-xs whitespace-nowrap font-semibold text-slate-500">
      {formatDate(lead.createdAt || lead.createdOn)}
    </div>
  ),
  name: (lead) => (
    <div className="text-[13px] whitespace-nowrap font-medium text-slate-900">
      {lead.name || lead.contact?.name || "—"}
    </div>
  ),
  "contact.name": (lead) => (
    <div className="text-[13px] font-medium text-slate-900">
      {lead.name || lead.contact?.name || "—"}
    </div>
  ),
  status: (lead, statuses, onStatusChange) => {
    if (statuses && onStatusChange) {
      return (
        <StatusDropdown
          status={lead.status || "Unknown"}
          statuses={statuses}
          onStatusChange={(statusId) => onStatusChange(lead, statusId)}
        />
      );
    }
    return <LeadStatusBadge status={lead.status || "Unknown"} />;
  },
  email: (lead) => (
    <div className="text-[13px]    text-slate-600">
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
    const owner = lead.owner;
    if (!owner) {
      return <div className="text-[13px] text-slate-500">—</div>;
    }

    const ownerName = owner.firstName
      ? `${owner.firstName} ${owner.lastName || ""}`.trim()
      : owner.name || "Unknown";

    return (
      <div className="flex items-center gap-2">
        {owner.profileImage ? (
          <img
            src={owner.profileImage}
            alt={ownerName}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-medium text-slate-600">
              {ownerName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
        )}
        <div className="text-[13px] text-slate-600 truncate">{ownerName}</div>
      </div>
    );
  },
};

const LeadRow = memo(({
  lead,
  columns,
  isSelected,
  onToggle,
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
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const actionButtonRef = useRef(null);

  const handleActionButtonClick = (e) => {
    e.stopPropagation();
    if (actionButtonRef.current) {
      const rect = actionButtonRef.current.getBoundingClientRect();
      setContextMenuPosition({
        x: rect.right - 180, // Position menu to the left of button
        y: rect.bottom + 5, // Position menu below button
      });
    }
    setIsContextMenuOpen(true);
  };

  const handleContextMenuClose = () => {
    setIsContextMenuOpen(false);
  };

  const handleAction = (action) => {
    if (action) {
      action(lead);
    }
    handleContextMenuClose();
  };

  const renderCellValue = (column, lead) => {
    if (columnRenderers[column.key]) {
      const renderer = columnRenderers[column.key];
      if (column.key === "status") {
        return renderer(lead, statuses, onStatusChange);
      }
      return renderer(lead);
    }

    const value = lead[column.key];

    if ((column.type === "select" || column.fieldType === "select") && column.options && column.options.length > 0) {
      const displayValue = (value === undefined || value === null || value === "")
        ? column.options[0]
        : value;

      return (
        <SelectFieldDropdown
          value={displayValue}
          options={column.options}
          onValueChange={(newValue) => {
            if (onCustomFieldChange) {
              onCustomFieldChange(lead, column.key, newValue);
            }
          }}
          column={column}
        />
      );
    }

    if (value === undefined || value === null || value === "") {
      return <div className="text-[13px] text-slate-500">—</div>;
    }

    if (column.type === "number" || column.fieldType === "number") {
      return (
        <div className="text-[13px] whitespace-nowrap text-slate-900">
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
        <div className="text-[13px]  whitespace-nowrap text-slate-900">{formatDate(value)}</div>
      );
    }

    return <div className="text-[13px]     whitespace-nowrap text-slate-900">{String(value)}</div>;
  };

  return (
    <>
      <tr
        className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50/70 transition-colors group"
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
        {!isEmployee && (
          <td className="px-6 py-4">
            <div className="flex items-center justify-end">
              <button
                ref={actionButtonRef}
                onClick={handleActionButtonClick}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Lead actions"
              >
                <FiMoreVertical size={18} />
              </button>
            </div>
          </td>
        )}
      </tr>

      <LeadRowContextMenu
        visible={isContextMenuOpen}
        position={contextMenuPosition}
        onClose={handleContextMenuClose}
        onEdit={() => handleAction(onEdit)}
        onSendEmail={() => handleAction(onSendEmail)}
        onCreateTask={() => handleAction(onCreateTask)}
        onAssign={() => handleAction(onAssign)}
        onDelete={() => handleAction(onDelete)}
        onConvert={() => handleAction(onConvert)}
        onCopyURL={() => handleAction(onCopyURL)}
        lead={lead}
      />
    </>
  );
});

export default LeadRow;
