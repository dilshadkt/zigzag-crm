import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiUser } from "react-icons/fi";
import { useGetAllEmployees } from "../../../api/hooks";

const AssignLeadModal = ({ isOpen, onClose, onAssign, currentOwner }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const { data: employeesData, isLoading } = useGetAllEmployees(isOpen);

  const employees = employeesData?.employees || [];

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.toLowerCase();
    const email = (employee.email || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleAssign = () => {
    if (selectedEmployeeId) {
      onAssign(selectedEmployeeId);
      onClose();
      setSelectedEmployeeId(null);
      setSearchTerm("");
    }
  };

  const handleClose = () => {
    setSelectedEmployeeId(null);
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Change Owner</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3f8cff]/20 focus:border-[#3f8cff] text-sm"
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500 text-sm">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              {searchTerm ? "No employees found" : "No employees available"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((employee) => {
                const employeeId = employee._id || employee.id;
                const isSelected = selectedEmployeeId === employeeId;
                const isCurrentOwner = currentOwner && (currentOwner._id || currentOwner.id) === employeeId;
                const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name || "Unknown";

                return (
                  <button
                    key={employeeId}
                    onClick={() => setSelectedEmployeeId(employeeId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                      isSelected
                        ? "bg-[#3f8cff] text-white"
                        : isCurrentOwner
                        ? "bg-slate-100 text-slate-700"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-white/20" : "bg-slate-200"
                    }`}>
                      {employee.profileImage ? (
                        <img
                          src={employee.profileImage}
                          alt={fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className={isSelected ? "text-white" : "text-slate-500"} size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        isSelected ? "text-white" : "text-slate-900"
                      }`}>
                        {fullName}
                        {isCurrentOwner && (
                          <span className="ml-2 text-xs text-slate-500">(Current Owner)</span>
                        )}
                      </div>
                      {employee.email && (
                        <div className={`text-xs truncate ${
                          isSelected ? "text-white/80" : "text-slate-500"
                        }`}>
                          {employee.email}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-[#3f8cff]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedEmployeeId}
            className={`px-6 py-2 text-sm font-semibold rounded-xl transition-colors ${
              selectedEmployeeId
                ? "bg-[#3f8cff] text-white hover:bg-[#2f6bff]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal;

