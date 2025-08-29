import React, { useState, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { useUpdateTaskById } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

// Status options for different user roles
const employeeStatusOptions = [
  "todo",
  "in-progress",
  // "completed",
  "on-review",
];
const adminStatusOptions = [
  "todo",
  "in-progress",
  // "completed",
  "on-review",
  "on-hold",
  "re-work",
  "approved",
];

// Define color schemes for each status
const statusColors = {
  todo: {
    text: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    hover: "hover:bg-orange-100",
  },
  "in-progress": {
    text: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hover: "hover:bg-blue-100",
  },
  completed: {
    text: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    hover: "hover:bg-green-100",
  },
  "on-review": {
    text: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    hover: "hover:bg-purple-100",
  },
  "on-hold": {
    text: "text-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-100",
  },
  "re-work": {
    text: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    hover: "hover:bg-red-100",
  },
  approved: {
    text: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-100",
  },
};

const StatusButton = ({ taskDetails, disabled = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef(null);
  const { isCompany } = useAuth();
  const { mutate } = useUpdateTaskById(taskDetails._id, () =>
    setMenuOpen(false)
  );

  // Get status options based on user role
  const statusOptions = isCompany ? adminStatusOptions : employeeStatusOptions;

  // Close menu when clicking outside
  const handleClickOutside = (event) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  React.useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Handle status update
  const handleStatusUpdate = (status) => {
    if (disabled) return;

    if (taskDetails?.status !== status) {
      mutate({ status });
    }
    setMenuOpen(false);
  };

  // Get color scheme based on current status
  const currentStatus = taskDetails?.status?.toLowerCase() || "todo";
  const colorScheme = statusColors[currentStatus] || statusColors["todo"];

  return (
    <div className="relative inline-block" ref={buttonRef}>
      {/* Button */}
      <button
        onClick={() => !disabled && setMenuOpen((prev) => !prev)}
        className={`text-xs font-medium flex items-center justify-between gap-x-2 px-4 h-8
                   ${colorScheme.text} ${colorScheme.bg} rounded-lg
                   border ${colorScheme.border} transition-all
                   ${
                     disabled
                       ? "opacity-60 cursor-not-allowed"
                       : `cursor-pointer ${colorScheme.hover}`
                   }`}
        disabled={disabled}
        title={disabled ? "You can only edit tasks assigned to you" : ""}
      >
        <span className="capitalize">{taskDetails?.status}</span>
        <IoIosArrowDown
          className={`transform transition-transform ${
            menuOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && !disabled && (
        <div
          className="absolute right-0 top-full mt-2 w-32
                     bg-white shadow-md border border-gray-200 rounded-lg z-10"
        >
          {statusOptions.map((status) => {
            const isCurrentStatus =
              taskDetails?.status?.toLowerCase() === status?.toLowerCase();
            const statusColor = statusColors[status].text;

            return (
              <div
                key={status}
                className={`py-2 px-4 text-sm capitalize text-gray-700
                           cursor-pointer transition-all
                           hover:bg-gray-50 ${
                             isCurrentStatus
                               ? `font-semibold ${statusColor}`
                               : ""
                           }`}
                onClick={() => handleStatusUpdate(status)}
              >
                {status}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusButton;
