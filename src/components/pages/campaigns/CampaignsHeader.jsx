import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiPlus, FiRefreshCw, FiMoreVertical } from "react-icons/fi";
import Navigator from "../../shared/navigator";
import { useAuth } from "../../../hooks/useAuth";

const CampaignsHeader = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  totalCampaigns,
  onAddCampaign,
  onSyncFacebook,
  isSyncing = false,
  lastSyncedAt = null,
  projects = [],
  selectedProjectId = "",
  setSelectedProjectId,
}) => {
  const { user } = useAuth();
  const isClient = user?.role === "client";
  const statusOptions = ["", "planned", "active", "completed", "paused"];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-t-2xl border-gray-200 px-4 md:px-6 py-3 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Navigator />
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex-1 sm:w-72 items-center gap-3 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-gray-700 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="px-3.5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm select-none"
              title="Filter by status"
            >
              <FiMoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl p-2 z-50 flex flex-col gap-1 select-none animate-fadeIn shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 py-1 mb-1 select-none">
                  Status
                </span>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-all uppercase tracking-wide whitespace-nowrap
                      ${statusFilter === status
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {status === "" ? "All Statuses" : status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {!isClient && (
            <button
              onClick={onSyncFacebook}
              disabled={isSyncing}
              className={`px-4 py-2.5 border border-gray-200 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${isSyncing
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              title={
                lastSyncedAt
                  ? `Last synced: ${new Date(lastSyncedAt).toLocaleString()}`
                  : "Sync Facebook ads"
              }
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Sync Facebook"}
            </button>
          )}
          {!isClient && (
            <button
              onClick={onAddCampaign}
              className="px-5 py-2.5 bg-[#3F8CFF] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4" />
              Add Campaign
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-3 mt-3">
        {/* Total and client filter stays cleanly in lower row */}
        <div className="flex items-center gap-4">
          {projects?.length > 0 && (
            <div className="flex items-center gap-2 relative" ref={dropdownRef}>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clients:</span>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 font-bold cursor-pointer select-none min-w-[170px] hover:border-gray-300 flex items-center justify-between gap-2"
              >
                <span className="truncate max-w-[130px]">
                  {projects.find((p) => p._id === selectedProjectId)?.name ||
                    projects.find((p) => p._id === selectedProjectId)?.projectName ||
                    "All Clients"}
                </span>
                <span className="text-[10px] text-gray-400">▼</span>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-64 bg-white border border-gray-100 rounded-xl p-2 z-50 flex flex-col gap-1.5 select-none animate-fadeIn">
                  <div className="flex bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 items-center gap-2 shrink-0">
                    <FiSearch className="text-gray-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      className="bg-transparent border-none outline-none text-xs w-full text-gray-700 placeholder-gray-400 font-medium"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId("");
                        setIsDropdownOpen(false);
                        setProjectSearch("");
                      }}
                      className={`flex items-center px-3 py-2 text-left text-xs font-bold rounded-lg transition-all ${selectedProjectId === ""
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      All Clients
                    </button>
                    {projects
                      .filter((proj) => {
                        const projName = (proj.name || proj.projectName || "").toLowerCase();
                        return projName.includes(projectSearch.toLowerCase());
                      })
                      .map((proj) => (
                        <button
                          key={proj._id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProjectId(proj._id);
                            setIsDropdownOpen(false);
                            setProjectSearch("");
                          }}
                          className={`flex items-center px-3 py-2 text-left text-xs font-bold rounded-lg transition-all ${selectedProjectId === proj._id
                            ? "bg-blue-50 text-blue-600 font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          <span className="truncate">
                            {proj.name || proj.projectName || "Unnamed Project"}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Total: {totalCampaigns || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CampaignsHeader;
