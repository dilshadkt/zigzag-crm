import React from "react";
import { FiEdit3, FiTrash2, FiRotateCcw, FiShield, FiCheck, FiInfo } from "react-icons/fi";

const PositionTable = ({
  positions,
  isLoading,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isDefaultPosition = (name) => {
    const defaultPositions = [
      "Admin",
      "Project Manager",
      "Team Lead",
      "Employee",
      "Designer",
      "Developer",
    ];
    return defaultPositions.includes(name);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-[13px] font-medium text-gray-400">Loading company roles...</p>
      </div>
    );
  }

  const positionsList = positions?.positions || [];

  if (positionsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed px-6 text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <FiShield className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-800 mb-1">No Positions Defined</h3>
        <p className="text-[12px] text-gray-500 max-w-xs">
          Create roles to define what parts of the system your team members can access.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Section */}
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 uppercase">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-tight">
              Position & Role Details
            </h3>
          </div>
          <div className="col-span-5">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-tight">
              Permitted Routes
            </h3>
          </div>
          <div className="col-span-2">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-tight">
              Access Status
            </h3>
          </div>
          <div className="col-span-1 text-right">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-tight pr-1">
              Cmd
            </h3>
          </div>
        </div>
      </div>

      {/* Role List */}
      <div className="divide-y divide-gray-50">
        {positionsList.map((position, index) => (
          <div
            key={position._id}
            className={`px-4 py-3 hover:bg-gray-50/50 transition-all duration-200 group ${
              !position.isActive ? "bg-gray-50/30 opacity-60" : ""
            }`}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Role Title */}
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    {position.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-1.5 leading-tight mb-0.5">
                      <span className="text-[13px] font-bold text-gray-800 truncate">
                        {position.name}
                      </span>
                      {isDefaultPosition(position.name) && (
                        <FiCheck className="w-3 h-3 text-blue-500" title="Default System Role" />
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-tighter opacity-70">
                      ID: {position._id.slice(-6).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Routes */}
              <div className="col-span-5">
                <div className="flex flex-wrap gap-1">
                  {position.allowedRoutes.map((route) => (
                    <span
                      key={route}
                      className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md capitalize shrink-0"
                    >
                      {route}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Status */}
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight border ${
                    position.isActive
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-red-50 text-red-500 border-red-100"
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full mr-1.5 ${position.isActive ? "bg-green-500" : "bg-red-500"}`} />
                  {position.isActive ? "Active" : "Archived"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="col-span-1 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(position)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit role"
                  >
                    <FiEdit3 className="w-3.5 h-3.5" />
                  </button>
                  {position.isActive ? (
                    <button
                      onClick={() => onDelete(position)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Archive role"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onRestore(position)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Restore role"
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer */}
      <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/20 flex justify-between items-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          Managed system entry points: {positionsList.length}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-400 font-bold uppercase">{positionsList.filter(p => p.isActive).length} Labeled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-[10px] text-gray-400 font-bold uppercase">{positionsList.filter(p => !p.isActive).length} Archived</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionTable;
