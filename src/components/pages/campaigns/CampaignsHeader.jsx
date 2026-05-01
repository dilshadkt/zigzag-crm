import React from "react";
import { FiSearch, FiPlus, FiRefreshCw } from "react-icons/fi";
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

  return (
    <div className="bg-white rounded-t-2xl border-gray-200 px-6 py-4 select-none">
      <div className="flexBetween mb-4">
        <div className="flex items-center gap-4">
          <Navigator />
          <div>
            <h3 className="font-bold text-xl text-gray-900 tracking-tight">
              Campaign Management
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Track and optimize your marketing performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-72 items-center gap-3 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-gray-700 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {!isClient && (
            <button
              onClick={onSyncFacebook}
              disabled={isSyncing}
              className={`px-4 py-2.5 border border-gray-200 font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm ${
                isSyncing
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
              className="px-5 py-2.5 bg-[#3F8CFF] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Campaign
            </button>
          )}
        </div>
      </div>

      <div className="flexBetween flex-wrap gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest
                ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
            >
              {status === "" ? "All" : status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {projects?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 font-bold outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all select-none min-w-[150px] shadow-sm hover:border-gray-300"
              >
                <option value="" className="text-gray-900 bg-white">All Projects</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id} className="text-gray-900 bg-white">
                    {proj.name || proj.projectName || "Unnamed Project"}
                  </option>
                ))}
              </select>
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
