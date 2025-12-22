import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import LeadStatusBadge from "./LeadStatusBadge";

const StatusDropdown = ({ status, statuses, onStatusChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle both object (from backend) and string (fallback) formats
  const statusObj = typeof status === "object" ? status : null;
  const currentStatusId = statusObj?._id || statusObj?.id || status || "";
  const currentStatus = statuses?.find(
    (s) => (s._id || s.id) === currentStatusId
  ) || statusObj;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleStatusSelect = (selectedStatus) => {
    if (onStatusChange && selectedStatus) {
      const statusId = selectedStatus._id || selectedStatus.id;
      onStatusChange(statusId);
    }
    setIsOpen(false);
  };

  if (!statuses || statuses.length === 0) {
    // Fallback to badge if no statuses available
    return <LeadStatusBadge status={status} />;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 focus:outline-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <LeadStatusBadge status={currentStatus || status} />
        {!disabled && (
          <FiChevronDown
            className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
            size={14}
          />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 top-full mt-2 z-50 min-w-[180px] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="max-h-60 overflow-auto">
            {statuses.map((statusOption) => {
              const statusId = statusOption._id || statusOption.id;
              const isSelected = statusId === currentStatusId;

              return (
                <button
                  key={statusId}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusSelect(statusOption);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${isSelected
                      ? "bg-[#3f8cff]/10 text-[#3f8cff] font-semibold"
                      : "text-slate-700"
                    }`}
                >
                  <LeadStatusBadge status={statusOption} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;

