import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiUser, FiUsers } from "react-icons/fi";
import { useGetAllEmployees } from "../../../api/hooks";
import { useGetClientSalesTeam } from "../../../api/clientSalesTeam";

/**
 * AssignLeadModal
 * - isClient=true → shows only the client's sales team
 * - isClient=false → shows CRM employees + client's sales team (if project has one)
 */
const AssignLeadModal = ({ isOpen, onClose, onAssign, currentOwner, currentClientOwner, isClient = false, projectId = null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(null); // "employee" | "salesPerson"
  const [selectedId, setSelectedId] = useState(null);

  const { data: employeesData, isLoading: isLoadingEmployees } = useGetAllEmployees(isOpen && !isClient);
  const { data: salesTeamData, isLoading: isLoadingSalesTeam } = useGetClientSalesTeam(
    isOpen && projectId ? projectId : null
  );

  const employees = employeesData?.employees || [];
  const salesTeam = salesTeamData?.data || [];

  const filteredEmployees = employees.filter((e) => {
    const fullName = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
    const email = (e.email || "").toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const filteredSalesTeam = salesTeam.filter((p) =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id, type) => {
    setSelectedId(id);
    setSelectedType(type);
  };

  const handleAssign = () => {
    if (!selectedId || !selectedType) return;
    onAssign(selectedId, selectedType); // pass type so parent knows which field to update
    handleClose();
  };

  const handleClose = () => {
    setSelectedId(null);
    setSelectedType(null);
    setSearchTerm("");
    onClose();
  };

  // Avatar helper
  const AvatarCircle = ({ name, image, size = "w-10 h-10", selected }) => {
    const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    return image ? (
      <img src={image} alt={name} className={`${size} rounded-full object-cover`} />
    ) : (
      <div className={`${size} rounded-full flex items-center justify-center text-xs font-bold ${selected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
        {initials}
      </div>
    );
  };

  if (!isOpen) return null;

  const showEmployees = !isClient && filteredEmployees.length > 0;
  const showSalesTeam = filteredSalesTeam.length > 0;
  const isLoading = isLoadingEmployees || isLoadingSalesTeam;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Change Owner</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isClient ? "Select from your sales team" : "Select a CRM employee or client's sales team"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
          ) : (
            <>
              {/* ---- CRM Employees (admin only) ---- */}
              {showEmployees && (
                <div>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <FiUser size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CRM Employees</span>
                  </div>
                  <div className="space-y-1">
                    {filteredEmployees.map((employee) => {
                      const id = employee._id || employee.id;
                      const isSelected = selectedId === id && selectedType === "employee";
                      const isCurrent = currentOwner && (currentOwner._id || currentOwner.id || currentOwner) === id;
                      const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown";

                      return (
                        <button
                          key={id}
                          onClick={() => handleSelect(id, "employee")}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                            isSelected ? "bg-blue-600 text-white" : isCurrent ? "bg-slate-100" : "hover:bg-slate-50"
                          }`}
                        >
                          <AvatarCircle name={fullName} image={employee.profileImage} selected={isSelected} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                              {fullName}
                              {isCurrent && <span className="ml-2 text-xs opacity-60">(Current)</span>}
                            </div>
                            {employee.email && (
                              <div className={`text-xs truncate ${isSelected ? "text-white/80" : "text-slate-500"}`}>{employee.email}</div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---- Client Sales Team ---- */}
              {(isClient || showSalesTeam) && (
                <div>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <FiUsers size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                      {isClient ? "Your Sales Team" : "Client's Sales Team"}
                    </span>
                  </div>
                  {filteredSalesTeam.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      {isClient ? "No sales team members added yet." : "No sales team configured for this project."}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredSalesTeam.map((person) => {
                        const isSelected = selectedId === person._id && selectedType === "salesPerson";
                        const isCurrent = currentClientOwner &&
                          (currentClientOwner._id || currentClientOwner) === person._id;

                        return (
                          <button
                            key={person._id}
                            onClick={() => handleSelect(person._id, "salesPerson")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                              isSelected ? "bg-indigo-600 text-white" : isCurrent ? "bg-indigo-50" : "hover:bg-indigo-50/50"
                            }`}
                          >
                            <AvatarCircle name={person.name} image={person.avatar} selected={isSelected} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                                {person.name}
                                {isCurrent && <span className="ml-2 text-xs opacity-60">(Current)</span>}
                              </div>
                              <div className={`text-xs truncate ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                                {person.role}{person.phone ? ` · ${person.phone}` : ""}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {!showEmployees && !showSalesTeam && !isLoading && (
                <div className="text-center py-10 text-slate-400 text-sm">No results found</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedId}
            className={`px-6 py-2 text-sm font-semibold rounded-xl transition-colors ${
              selectedId
                ? selectedType === "salesPerson"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
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
