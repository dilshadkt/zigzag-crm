import React, { useState } from "react";
import { updateProject } from "../../../api/service";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export const SettingsTab = ({
  clientCreds,
  setClientCreds,
  handleUpdateClientCreds,
  handleShareCreds,
  handleCopyPortalLink,
  selectedLeadForm,
  setSelectedLeadForm,
  leadFormConfigs,
  handleUpdateLeadForm,
  currentProject,
  onRefresh,
}) => {
  const queryClient = useQueryClient();
  const [branchName, setBranchName] = useState("");
  const [branchUsername, setBranchUsername] = useState("");
  const [branchPassword, setBranchPassword] = useState("");

  const branches = currentProject?.customFields?.branches || [];

  const handleAddBranch = async () => {
    if (!branchName || !branchUsername || !branchPassword) {
      toast.error("Please fill in all branch details");
      return;
    }

    const newBranch = {
      id: Date.now().toString(),
      name: branchName,
      username: branchUsername,
      password: branchPassword,
    };

    try {
      const updatedData = {
        customFields: {
          ...(currentProject?.customFields || {}),
          branches: [...branches, newBranch],
        },
      };

      await updateProject(updatedData, currentProject._id);
      toast.success(`Branch "${branchName}" added successfully!`);

      // Clear fields
      setBranchName("");
      setBranchUsername("");
      setBranchPassword("");

      queryClient.invalidateQueries(["projectDetails", currentProject._id]);
      queryClient.invalidateQueries(["project", currentProject._id]);
      queryClient.invalidateQueries(["company-active-projects"]);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to add branch:", error);
      toast.error("Failed to add branch");
    }
  };

  const handleDeleteBranch = async (branchId, bName) => {
    if (!window.confirm(`Are you sure you want to delete branch "${bName}"?`)) return;

    try {
      const updatedData = {
        customFields: {
          ...(currentProject?.customFields || {}),
          branches: branches.filter((b) => b.id !== branchId),
        },
      };

      await updateProject(updatedData, currentProject._id);
      toast.success(`Branch "${bName}" deleted successfully`);

      queryClient.invalidateQueries(["projectDetails", currentProject._id]);
      queryClient.invalidateQueries(["project", currentProject._id]);
      queryClient.invalidateQueries(["company-active-projects"]);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to delete branch:", error);
      toast.error("Failed to delete branch");
    }
  };

  const handleCopyBranchLink = (branch) => {
    const portalLink = `${window.location.origin}/portal/login?username=${encodeURIComponent(branch.username)}&password=${encodeURIComponent(branch.password)}`;
    navigator.clipboard.writeText(portalLink);
    toast.success(`Portal link for branch "${branch.name}" copied to clipboard!`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 p-6 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Client & Branch Settings</h3>
          <p className="text-xs text-gray-500 mt-1">Configure external access, branch logins, and platform credentials.</p>
        </div>
      </div>

      <div className="max-w-xl space-y-5">
        {/* Main Client Authentication */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Main Client Authentication</h4>
              <p className="text-[11px] text-gray-600 italic">Set credentials so the client can log in to view their leads</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Client Username / Email
              </label>
              <input
                type="text"
                placeholder="Enter client username"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs outline-none"
                value={clientCreds.username}
                onChange={(e) => setClientCreds({ ...clientCreds, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Client Password
              </label>
              <input
                type="text"
                placeholder="Create a secure password"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs outline-none font-mono"
                value={clientCreds.password}
                onChange={(e) => setClientCreds({ ...clientCreds, password: e.target.value })}
              />
            </div>

            <div className="pt-1 flex gap-2">
              <button
                onClick={handleUpdateClientCreds}
                disabled={!clientCreds.username || !clientCreds.password}
                className="flex-1 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-blue-200/50"
              >
                Save Credentials
              </button>
              <button
                onClick={handleShareCreds}
                disabled={!clientCreds.username || !clientCreds.password}
                className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-all"
                title="Share credentials"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </div>
              </button>
              <button
                onClick={handleCopyPortalLink}
                disabled={!clientCreds.username || !clientCreds.password}
                className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-all"
                title="Copy direct portal link with credentials prefilled"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Branch Login Management */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Branch Login Management</h4>
              <p className="text-[11px] text-gray-600 italic">Add multiple branch logins for different brands/locations.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Branch / Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Branch"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs outline-none"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Username / Email
                  </label>
                  <input
                    type="text"
                    placeholder="Enter branch username"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs outline-none"
                    value={branchUsername}
                    onChange={(e) => setBranchUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    placeholder="Create a password"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs outline-none font-mono"
                    value={branchPassword}
                    onChange={(e) => setBranchPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddBranch}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-indigo-200/50"
            >
              Add Branch Login
            </button>
          </div>

          {/* List of Branches */}
          {branches.length > 0 && (
            <div className="mt-5 border-t border-indigo-100 pt-4 space-y-2.5">
              <h5 className="text-xs font-bold text-indigo-900 mb-2">Configured Branches</h5>
              {branches.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-3 bg-white border border-indigo-50 rounded-xl hover:border-indigo-200 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800">{branch.name}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      User: <strong className="text-gray-600 font-medium">{branch.username}</strong> |
                      Pwd: <strong className="text-gray-600 font-medium">{branch.password}</strong>
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleCopyBranchLink(branch)}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all"
                      title="Copy Direct Portal Link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch.id, branch.name)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                      title="Delete Branch"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead Capture & Forms */}
        <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/30">
          <h4 className="text-sm font-semibold text-gray-900 mb-0.5">Lead Capture & Forms</h4>
          <p className="text-[11px] text-gray-500 mb-3">Choose which lead form template this client should use.</p>
          <div className="space-y-3">
            <select
              value={selectedLeadForm}
              onChange={(e) => setSelectedLeadForm(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs outline-none"
            >
              <option value="">System Default</option>
              {leadFormConfigs.map((config) => (
                <option key={config._id} value={config._id}>
                  {config.name} {config.isActive ? "(Default)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateLeadForm}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Apply Template
            </button>
          </div>
        </div>

        {/* Access Permissions */}
        <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/30">
          <h4 className="text-sm font-semibold text-gray-900 mb-0.5">Access Permissions</h4>
          <p className="text-[11px] text-gray-500 mb-3">Control what the client can see after logging in.</p>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">View Assigned Leads</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group opacity-50">
              <input type="checkbox" disabled className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-xs text-gray-700">Download Lead Reports (Admin Only)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
