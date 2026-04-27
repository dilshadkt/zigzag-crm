import React, { useState } from "react";
import { RiMoreLine, RiTimeLine, RiCalendarCheckLine, RiCloseCircleLine } from "react-icons/ri";
import { FaCheck, FaTimes, FaEdit } from "react-icons/fa";
import { format } from "date-fns";
import ApprovalMenu from "./ApprovalMenu";
import ModifyDatesModal from "./ModifyDatesModal";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
    cancelled: "bg-gray-50 text-gray-400 border-gray-100",
  };

  const icons = {
    pending: <RiTimeLine className="w-3 h-3" />,
    approved: <RiCalendarCheckLine className="w-3 h-3" />,
    rejected: <RiCloseCircleLine className="w-3 h-3" />,
    cancelled: <RiCloseCircleLine className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || styles.pending}`}>
      {icons[status] || icons.pending}
      {status}
    </span>
  );
};

const VacationCard = ({
  item,
  updateStatus,
  canApproveVacations,
  canModifyVacations,
  onModifyRequest,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState(true); // Default expanded for better visibility
  const [modifyingRequest, setModifyingRequest] = useState(null);

  const pendingRequests = item.vacationRequests.filter((req) => req.status === "pending");
  const otherRequests = item.vacationRequests.filter((req) => req.status !== "pending");

  const handleApprove = (requestId) => updateStatus({ vacationId: requestId, status: "approved" });
  const handleReject = (requestId) => updateStatus({ vacationId: requestId, status: "rejected" });
  const handleModifyOpen = (request) => { setModifyingRequest(request); setMenuOpen(false); };
  const handleCancel = (requestId) => updateStatus({ vacationId: requestId, status: "cancelled" });

  const handleModifySave = (requestId, newDates) => {
    if (!onModifyRequest) return Promise.resolve();
    return onModifyRequest(requestId, newDates);
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header Info */}
      <div className="p-4 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {item.employee.profileImage ? (
              <img src={item.employee.profileImage} alt={item.employee.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-600 font-bold text-sm">{item.employee.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-gray-800">{item.employee.name}</h4>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Vac: <span className="text-gray-600">{item?.vacations?.vacation || 0}d</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Sick: <span className="text-gray-600">{item?.vacations?.sick_leave || 0}d</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Rem: <span className="text-gray-600">{item?.vacations?.remote_work || 0}d</span>
              </span>
            </div>
          </div>
        </div>

        {canApproveVacations && pendingRequests.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <RiMoreLine size={18} />
            </button>
            <ApprovalMenu
              isOpen={menuOpen}
              setIsOpen={setMenuOpen}
              onApprove={() => handleApprove(pendingRequests[0].id)}
              onModify={() => handleModifyOpen(pendingRequests[0])}
              onReject={() => handleReject(pendingRequests[0].id)}
              onCancel={() => handleCancel(pendingRequests[0].id)}
            />
          </div>
        )}
      </div>

      {/* Requests Section */}
      {(pendingRequests.length > 0 || otherRequests.length > 0) && (
        <div className="p-3 border-t border-gray-50 bg-white">
          <div className="space-y-2">
            {[...pendingRequests, ...otherRequests.slice(0, 2)].map((request) => (
              <div
                key={request.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  request.status === "pending" 
                    ? "bg-amber-50/30 border-amber-100 shadow-sm" 
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-700 capitalize">
                      {request.type.replace("_", " ")}
                    </span>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <RiCalendarCheckLine className="w-3 h-3 text-gray-400" />
                      {format(new Date(request.startDate), "MMM dd")} — {format(new Date(request.endDate), "MMM dd, yyyy")}
                    </div>
                    {request.originalStartDate && request.originalEndDate && 
                     (format(new Date(request.startDate), "yyyy-MM-dd") !== format(new Date(request.originalStartDate), "yyyy-MM-dd") ||
                      format(new Date(request.endDate), "yyyy-MM-dd") !== format(new Date(request.originalEndDate), "yyyy-MM-dd")) && (
                      <span className="text-[9px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 italic">
                        Originally: {format(new Date(request.originalStartDate), "MMM dd")} - {format(new Date(request.originalEndDate), "MMM dd")}
                      </span>
                    )}
                    {request.project && (
                      <span className="flex items-center gap-1 ml-1 pl-2 border-l border-gray-200 text-indigo-500">
                        {request.project.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {request.status === "pending" && canApproveVacations ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-sm shadow-emerald-100 transition-all"
                        title="Approve"
                      >
                        <FaCheck size={10} />
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-sm shadow-rose-100 transition-all"
                        title="Reject"
                      >
                        <FaTimes size={10} />
                      </button>
                      {canModifyVacations && (
                        <button
                          onClick={() => handleModifyOpen(request)}
                          className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 shadow-sm shadow-blue-100 transition-all"
                          title="Modify"
                        >
                          <FaEdit size={10} />
                        </button>
                      )}
                    </div>
                  ) : request.status === "pending" && canModifyVacations ? (
                    <button
                      onClick={() => handleCancel(request.id)}
                      className="text-[10px] font-bold text-gray-400 hover:text-rose-500 px-2 py-1 transition-colors"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modify dates modal */}
      {modifyingRequest && (
        <ModifyDatesModal
          isOpen={true}
          onClose={() => setModifyingRequest(null)}
          request={modifyingRequest}
          onSave={(newDates) => handleModifySave(modifyingRequest.id, newDates)}
        />
      )}
    </div>
  );
};

export default VacationCard;
