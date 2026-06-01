import React, { memo } from "react";
import { FiMoreVertical, FiMail, FiPhone, FiCalendar, FiUser } from "react-icons/fi";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import LeadStatusBadge from "./LeadStatusBadge";
import StatusDropdown from "./StatusDropdown";
import LeadRowContextMenu from "./LeadRowContextMenu";
import { useState, useRef } from "react";

const LeadCard = memo(({
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
    onMoveToBranch,
    branches = [],
    isEmployee = false,
    projects = [],
    onMoveToProject,
}) => {
    const actionButtonRef = useRef(null);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

    const handleActionButtonClick = (e) => {
        e.stopPropagation();
        if (actionButtonRef.current) {
            const rect = actionButtonRef.current.getBoundingClientRect();
            setContextMenuPosition({
                x: rect.right - 180,
                y: rect.bottom + 5,
            });
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
    const leadName = lead.name || lead.contact?.name || "Unknown";
    const leadEmail = lead.email || lead.contact?.email;
    const leadPhone = lead.phone || lead.contact?.phone;
    const leadStatus = lead.status || "Unknown";
    const owner = lead.clientOwner || lead.owner;
    const isClientTeam = !!lead.clientOwner;
    const leadScore = lead.score ?? 0;
    const isWhatsApp = !!lead.whatsappContactId || lead.source?.toLowerCase() === "whatsapp" || lead.platform?.toLowerCase() === "whatsapp";
    const isFacebook = !isWhatsApp && (!!lead.facebookLeadId || lead.source?.toLowerCase() === "facebook" || lead.platform?.toLowerCase() === "facebook");

    const formatDate = (date) => {
        if (!date) return "—";
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div
            onClick={() => onRowClick && onRowClick(lead)}
            className={`p-3 md:p-4 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-[0.98] transition-all ${isSelected ? 'border-[#3f8cff] ring-1 ring-[#3f8cff]' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div 
                      className="p-3 -m-3 hover:bg-slate-100/50 rounded-lg transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(lead._id || lead.id);
                      }}
                    >
                      <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} 
                          className="h-3.5 w-3.5 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]/40 block"
                      />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-slate-900 leading-tight flex items-center gap-1.5 flex-wrap">
                            {leadName}
                            {isFacebook && (
                                <FaFacebook className="text-[#1877F2] w-3.5 h-3.5 flex-shrink-0" title="Facebook Lead" />
                            )}
                            {isWhatsApp && (
                                <FaWhatsapp className="text-[#25D366] w-3.5 h-3.5 flex-shrink-0" title="WhatsApp Lead" />
                            )}
                            {(lead.branch || lead.customFields?.branch) && (
                                <span className="text-[10px] text-slate-400 font-semibold ml-0.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                    {lead.branch || lead.customFields?.branch}
                                </span>
                            )}
                            {lead.project && (
                                <span className="text-[10px] text-[#3f8cff] font-semibold ml-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                    {typeof lead.project === 'object' ? lead.project.name : 'Project'}
                                </span>
                            )}
                        </h3>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <FiCalendar size={9} />
                            {formatDate(lead.createdAt || lead.createdOn)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <StatusDropdown
                        status={leadStatus}
                        statuses={statuses}
                        onStatusChange={(statusId) => onStatusChange(lead, statusId)}
                        compact={true}
                    />
                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ring-1 ${
                        leadScore >= 76 ? 'bg-emerald-50 ring-emerald-200' :
                        leadScore >= 51 ? 'bg-blue-50 ring-blue-200' :
                        leadScore >= 26 ? 'bg-amber-50 ring-amber-200' :
                        'bg-red-50 ring-red-200'
                    }`}>
                        <div className={`w-1 h-1 rounded-full ${
                            leadScore >= 76 ? 'bg-emerald-500' :
                            leadScore >= 51 ? 'bg-blue-500' :
                            leadScore >= 26 ? 'bg-amber-500' :
                            'bg-red-500'
                        }`} />
                        <span className={`text-[10px] font-bold ${
                            leadScore >= 76 ? 'text-emerald-700' :
                            leadScore >= 51 ? 'text-blue-700' :
                            leadScore >= 26 ? 'text-amber-700' :
                            'text-red-600'
                        }`}>{leadScore}</span>
                    </div>
                    <button
                        ref={actionButtonRef}
                        onClick={handleActionButtonClick}
                        className="p-1.5 text-slate-400 hover:text-slate-600"
                        aria-label="Lead actions"
                    >
                        <FiMoreVertical size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
                {leadEmail && (
                    <div
                        onClick={(e) => { e.stopPropagation(); onSendEmail(lead); }}
                        className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg"
                    >
                        <FiMail className="text-[#3f8cff]" size={12} />
                        <span className="truncate">{leadEmail}</span>
                    </div>
                )}
                {leadPhone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg">
                        <FiPhone className="text-[#3f8cff]" size={12} />
                        <span className="truncate">{leadPhone}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isClientTeam ? 'bg-indigo-500 text-white' : 'bg-[#ECF3FF] text-[#3f8cff]'}`}>
                        {owner?.profileImage || owner?.avatar ? (
                            <img src={owner.profileImage || owner.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : isClientTeam ? (
                            <span className="text-[9px] font-bold">{(owner?.name || "?").substring(0, 2).toUpperCase()}</span>
                        ) : (
                            <FiUser size={10} />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                            {owner?.firstName ? `${owner.firstName} ${owner.lastName || ""}` : owner?.name || "Unassigned"}
                        </span>
                        {isClientTeam && (
                            <span className="text-[9px] text-indigo-400 font-medium leading-none">Client Team</span>
                        )}
                    </div>
                </div>

                {/* <button
                    onClick={(e) => { e.stopPropagation(); onCreateTask(lead); }}
                    className="text-[10px] font-bold text-[#3f8cff] hover:underline"
                >
                    Create Task
                </button> */}
            </div>

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
        </div>
    );
});

export default LeadCard;
