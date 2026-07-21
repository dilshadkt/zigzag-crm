import React, { useState, useRef, useEffect, memo } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
// ... (rest of imports)
import LeadStatusBadge from "./LeadStatusBadge";
import LeadRowContextMenu from "./LeadRowContextMenu";
import StatusDropdown from "./StatusDropdown";
import SelectFieldDropdown from "./SelectFieldDropdown";
import { getDueDateColor } from "../../../utils/workingDayUtils";
import { useGetLeadStatuses, useGetDashboardConfig } from "../../../api/hooks";

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

const OwnerCell = ({ owner, clientOwner }) => {
  const [imgError, setImgError] = useState(false);

  // Prefer clientOwner if set (client's sales team member)
  if (clientOwner && (clientOwner._id || clientOwner.name)) {
    const personName = clientOwner.name || "Unknown";
    const initials = personName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
          {clientOwner.avatar ? (
            <img src={clientOwner.avatar} alt={personName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white">
              <span className="text-[10px] font-medium">{initials}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="text-[13px] text-slate-600 truncate">{personName}</div>
          <div className="text-[10px] text-indigo-400 font-medium">Client Team</div>
        </div>
      </div>
    );
  }

  if (!owner) {
    return <div className="text-[13px] text-slate-500">—</div>;
  }

  const ownerName = owner.firstName
    ? `${owner.firstName} ${owner.lastName || ""}`.trim()
    : owner.name || "Unknown";

  const initials = ownerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-100">
        {owner.profileImage && !imgError ? (
          <img
            src={owner.profileImage}
            alt={ownerName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#3F8CFF] text-white">
            <span className="text-[10px] font-medium">
              {initials}
            </span>
          </div>
        )}
      </div>
      <div className="text-[13px] text-slate-600 truncate">{ownerName}</div>
    </div>
  );
};

const columnRenderers = {
  createdAt: (lead) => {
    const fbTime = lead.fb_created_time || lead.customFields?.fb_created_time;
    return (
      <div className="text-xs whitespace-nowrap font-semibold text-slate-500">
        {formatDate(fbTime || lead.createdAt || lead.createdOn)}
      </div>
    );
  },
  name: (lead) => {
    const isWhatsApp = !!lead.whatsappContactId || lead.source?.toLowerCase() === "whatsapp" || lead.platform?.toLowerCase() === "whatsapp";
    const isFacebook = !isWhatsApp && (!!lead.facebookLeadId || lead.source?.toLowerCase() === "facebook" || lead.platform?.toLowerCase() === "facebook");
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <div className="text-[13px] whitespace-nowrap font-medium text-slate-900">
            {lead.name || lead.contact?.name || "—"}
          </div>
          {isFacebook && (
            <FaFacebook className="text-[#1877F2] w-3.5 h-3.5 flex-shrink-0" title="Facebook Lead" />
          )}
          {isWhatsApp && (
            <FaWhatsapp className="text-[#25D366] w-3.5 h-3.5 flex-shrink-0" title="WhatsApp Lead" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {(lead.branch || lead.customFields?.branch) && (
            <span className="text-[11px] text-slate-400 font-semibold tracking-wide">
              {lead.branch || lead.customFields?.branch}
            </span>
          )}
          {(lead.branch || lead.customFields?.branch) && lead.project && (
            <span className="text-[11px] text-slate-300">•</span>
          )}
          {lead.project && (
            <span className="text-[11px] text-[#3f8cff] font-semibold tracking-wide">
              {typeof lead.project === 'object' ? lead.project.name : 'Project'}
            </span>
          )}
        </div>
      </div>
    );
  },
  "contact.name": (lead) => {
    const isWhatsApp = !!lead.whatsappContactId || lead.source?.toLowerCase() === "whatsapp" || lead.platform?.toLowerCase() === "whatsapp";
    const isFacebook = !isWhatsApp && (!!lead.facebookLeadId || lead.source?.toLowerCase() === "facebook" || lead.platform?.toLowerCase() === "facebook");
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <div className="text-[13px] font-medium text-slate-900">
            {lead.name || lead.contact?.name || "—"}
          </div>
          {isFacebook && (
            <FaFacebook className="text-[#1877F2] w-3.5 h-3.5 flex-shrink-0" title="Facebook Lead" />
          )}
          {isWhatsApp && (
            <FaWhatsapp className="text-[#25D366] w-3.5 h-3.5 flex-shrink-0" title="WhatsApp Lead" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {(lead.branch || lead.customFields?.branch) && (
            <span className="text-[11px] text-slate-400 font-semibold tracking-wide">
              {lead.branch || lead.customFields?.branch}
            </span>
          )}
          {(lead.branch || lead.customFields?.branch) && lead.project && (
            <span className="text-[11px] text-slate-300">•</span>
          )}
          {lead.project && (
            <span className="text-[11px] text-[#3f8cff] font-semibold tracking-wide">
              {typeof lead.project === 'object' ? lead.project.name : 'Project'}
            </span>
          )}
        </div>
      </div>
    );
  },
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
  owner: (lead) => <OwnerCell owner={lead.owner} clientOwner={lead.clientOwner} />,
  score: (lead, thresholds) => {
    const score = lead.score ?? 0;
    const hot = thresholds?.hot ?? 70;
    const warm = thresholds?.warm ?? 40;
    const cold = thresholds?.cold ?? 0;

    let bgColor, textColor, ringColor, dotColor, label;
    if (score >= hot) {
      bgColor = "bg-orange-50"; textColor = "text-orange-700"; ringColor = "ring-orange-200"; dotColor = "bg-orange-500"; label = "Hot";
    } else if (score >= warm) {
      bgColor = "bg-amber-50"; textColor = "text-amber-700"; ringColor = "ring-amber-200"; dotColor = "bg-amber-500"; label = "Warm";
    } else {
      bgColor = "bg-blue-50"; textColor = "text-blue-700"; ringColor = "ring-blue-200"; dotColor = "bg-blue-500"; label = "Cold";
    }
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${bgColor} ring-1 ${ringColor}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className={`text-[12px] font-bold ${textColor}`}>{label} {score}</span>
      </div>
    );
  },
  branch: (lead) => (
    <div className="text-[13px] font-medium text-slate-700">
      {lead.branch || lead.customFields?.branch || "—"}
    </div>
  ),
  project: (lead) => (
    <div className="text-[13px] font-medium text-[#3f8cff]">
      {lead.project && typeof lead.project === 'object' ? lead.project.name : (lead.project || "—")}
    </div>
  ),
  source: (lead, onSourceChange) => {
    const sources = ["Manual", "Website", "Import", "Facebook", "WhatsApp", "Instagram", "Other"];
    
    let currentSource = lead.source;
    
    // Normalize source strings that come from webhook like "Facebook Lead Ads"
    if (currentSource) {
      const lowerSrc = currentSource.toLowerCase();
      if (lowerSrc.includes("facebook")) currentSource = "Facebook";
      else if (lowerSrc.includes("whatsapp")) currentSource = "WhatsApp";
      else if (lowerSrc.includes("instagram")) currentSource = "Instagram";
    }

    if (!currentSource || currentSource === "Manual") {
      if (lead.facebookLeadId || lead.platform?.toLowerCase() === "facebook") {
        currentSource = "Facebook";
      } else if (lead.whatsappContactId || lead.platform?.toLowerCase() === "whatsapp") {
        currentSource = "WhatsApp";
      } else if (!currentSource) {
        currentSource = "Manual";
      }
    }

    // Prevent select from defaulting to "Manual" if the value isn't in options
    if (currentSource && !sources.includes(currentSource)) {
      currentSource = "Other";
    }
    
    if (onSourceChange) {
      return (
        <select
          value={currentSource}
          onChange={(e) => onSourceChange(lead, e.target.value)}
          className="text-[12px] font-medium px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer w-28"
          onClick={(e) => e.stopPropagation()}
        >
          {sources.map(src => (
            <option key={src} value={src}>{src}</option>
          ))}
        </select>
      );
    }
    
    return <div className="text-[13px] font-medium text-slate-700">{currentSource}</div>;
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
  statuses: propStatuses,
  onStatusChange,
  onCustomFieldChange,
  onSourceChange,
  onMoveToBranch,
  branches = [],
  canManage = false,
  index,
  projects = [],
  onMoveToProject,
}) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const actionButtonRef = useRef(null);

  // Extract project ID for the lead
  const getProjectId = () => {
    if (lead?.project) {
      return typeof lead.project === 'object' ? (lead.project._id || lead.project.id) : lead.project;
    }
    if (lead?.campaign?.project) {
      return typeof lead.campaign.project === 'object' ? (lead.campaign.project._id || lead.campaign.project.id) : lead.campaign.project;
    }
    return null;
  };
  const projectId = getProjectId();
  
  // Fetch project-specific statuses
  const { data: projectStatusesData } = useGetLeadStatuses(projectId);
  // Use project statuses if available, otherwise fallback to global statuses passed via props
  const rowStatuses = (projectId && projectStatusesData?.data) ? projectStatusesData.data : propStatuses;

  const { data: configData } = useGetDashboardConfig(projectId);
  const thresholds = {
    hot: configData?.data?.hotLeadThreshold ?? 70,
    warm: configData?.data?.warmLeadThreshold ?? 40,
    cold: configData?.data?.coldLeadThreshold ?? 0,
  };

  const handleActionButtonClick = (e) => {
    e.stopPropagation();
    if (actionButtonRef.current) {
      const rect = actionButtonRef.current.getBoundingClientRect();
      setContextMenuPosition({
        x: rect.right - 180, // Position menu to the left of button
        y: rect.bottom + 5, // Position menu below button
      });
      // Dispatch event to close all other open dropdowns
      window.dispatchEvent(new CustomEvent("close-all-lead-dropdowns"));
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
        return renderer(lead, rowStatuses, onStatusChange);
      }
      if (column.key === "source") {
        return renderer(lead, onSourceChange);
      }
      if (column.key === "score") {
        return renderer(lead, thresholds);
      }
      return renderer(lead);
    }

    const value = lead[column.key];

    if ((column.type === "select" || column.fieldType === "select") && column.options && column.options.length > 0) {
      const isPlaceholder = (value === undefined || value === null || value === "");
      const displayValue = isPlaceholder
        ? `Select ${column.label || 'option'}`
        : value;

      return (
        <SelectFieldDropdown
          value={displayValue}
          isPlaceholder={isPlaceholder}
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
      const leadStatus = lead.status?.name || lead.status || "";
      return (
        <div className={`text-[13px] whitespace-nowrap ${(column.key === 'scheduled' || column.key?.toLowerCase().includes('date')) ? getDueDateColor(value, leadStatus) : 'text-slate-900'}`}>{formatDate(value)}</div>
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
          <td
            className="px-6 py-2 cursor-pointer text-center"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(lead._id || lead.id);
            }}
          >
            <div className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-200/50 transition-colors">
              <input
                type="checkbox"
                className={checkboxClasses}
                checked={isSelected}
                onChange={() => { }} // Controlled via td's onClick
              />
            </div>
          </td>
        {columns
          .filter((col) => col.visible)
          .map((column) => (
            <td key={column.key} className="px-4 py-1.5 whitespace-nowrap">
              {renderCellValue(column, lead)}
            </td>
          ))}
          <td className="px-4 py-1.5">
            <div className="flex items-center justify-end">
              <button
                ref={actionButtonRef}
                onClick={handleActionButtonClick}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Lead actions"
              >
                <FiMoreVertical size={16} />
              </button>
            </div>
          </td>
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
        branches={branches}
        onMoveToBranch={onMoveToBranch}
        projects={projects}
        onMoveToProject={onMoveToProject}
      />
    </>
  );
});

export default LeadRow;
