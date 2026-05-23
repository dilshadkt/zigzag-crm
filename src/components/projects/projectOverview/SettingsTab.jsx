import React, { useState } from "react";
import { updateProject } from "../../../api/service";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetFacebookAccounts } from "../../../api/campaigns";
import { FiActivity, FiLayers, FiSearch, FiInstagram, FiFacebook, FiShield } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { updateProjectSocialConfig } from "../../../api/service";
import { useGetLeadFormConfig } from "../../../features/leads/api";
import LeadDashboardConfig from "../../../features/leadSettings/components/LeadDashboardConfig";

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

  // Lead Form Config for fields
  const { data: formConfig } = useGetLeadFormConfig(currentProject?._id);
  const fields = formConfig?.data?.fields || formConfig?.fields || [];
  
  // Social Integration State
  const [socialConfig, setSocialConfig] = useState({
    facebookPageId: currentProject?.facebookPageId || "",
    instagramBusinessId: currentProject?.instagramBusinessId || "",
    whatsappPhoneNumberId: currentProject?.whatsappPhoneNumberId || "",
  });

  const handleUpdateSocialConfig = async () => {
    try {
      await updateProjectSocialConfig(currentProject._id, socialConfig);
      toast.success("Social integration settings updated!");
      queryClient.invalidateQueries(["project", currentProject._id]);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to update social settings");
    }
  };

  const branches = currentProject?.customFields?.branches || [];

  // Facebook Ad Account Selector State
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");
  const { data: adAccounts, isLoading: isAccountsLoading } = useGetFacebookAccounts();
  const accountSelectorRef = React.useRef(null);

  const filteredAdAccounts = React.useMemo(() => {
    if (!adAccounts) return [];
    if (!accountSearch) return adAccounts;
    const searchLower = accountSearch.toLowerCase();
    return adAccounts.filter(acc => 
      acc.name?.toLowerCase().includes(searchLower) || 
      acc.id?.toString().includes(searchLower)
    );
  }, [adAccounts, accountSearch]);

  const handleUpdateAdAccount = async (accountId) => {
    try {
      await updateProject({ facebookAdAccountId: accountId }, currentProject._id);
      toast.success("Facebook Ad Account linked to project!");
      setShowAccountSelector(false);
      queryClient.invalidateQueries(["project", currentProject._id]);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to link Ad Account");
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountSelectorRef.current && !accountSelectorRef.current.contains(event.target)) {
        setShowAccountSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            
            {/* Access Permissions */}
            <div className="pt-2 border-t border-blue-100">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Access Permissions
              </label>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {[
                  { id: "view_overview", label: "View Overview" },
                  { id: "view_leads", label: "View Leads" },
                  { id: "add_lead", label: "Can Add Leads" },
                  { id: "view_campaigns", label: "View Campaigns" },
                  { id: "view_insights", label: "View Social Insights" },
                  { id: "view_schedule", label: "View Content Schedule" },
                ].map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={clientCreds.permissions?.includes(perm.id)} 
                      onChange={(e) => {
                        const newPerms = e.target.checked 
                          ? [...(clientCreds.permissions || []), perm.id]
                          : (clientCreds.permissions || []).filter(p => p !== perm.id);
                        setClientCreds({ ...clientCreds, permissions: newPerms });
                      }}
                      className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-all cursor-pointer" 
                    />
                    <span className="text-[10px] font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                      {perm.label}
                    </span>
                  </label>
                ))}
              </div>
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

        {/* Social Media Integration */}
        <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <FiInstagram className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">Social Media Integration</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Secure Connection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <FiFacebook className="w-3 h-3" /> Facebook Page ID
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Enter Page ID"
                  value={socialConfig.facebookPageId}
                  onChange={(e) => setSocialConfig({...socialConfig, facebookPageId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                   <FiShield className="text-indigo-500 w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <FiInstagram className="w-3 h-3" /> Instagram Business ID
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Enter Business ID"
                  value={socialConfig.instagramBusinessId}
                  onChange={(e) => setSocialConfig({...socialConfig, instagramBusinessId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                   <FiShield className="text-indigo-500 w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <FaWhatsapp className="w-3 h-3 text-[#25D366]" /> WhatsApp Phone ID / Wati Phone Number
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Enter Meta Phone Number ID or Wati Phone Number"
                  value={socialConfig.whatsappPhoneNumberId}
                  onChange={(e) => setSocialConfig({...socialConfig, whatsappPhoneNumberId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                   <FiShield className="text-indigo-500 w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 ml-1 leading-normal">
                Supports Meta WhatsApp Phone Number ID (e.g., <code>1134470496415370</code>) or Wati channel phone number (e.g., <code>918330079551</code> without '+' or spaces).
              </p>
            </div>

            <button 
              onClick={handleUpdateSocialConfig}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-2 active:scale-[0.98]"
            >
              Update Integration
            </button>
          </div>
        </div>

        {/* Facebook Ad Account Integration */}
        <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <FiLayers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Facebook Ads Integration</h4>
              <p className="text-[11px] text-gray-600 italic">Link this project to a specific Facebook Ad Account</p>
            </div>
          </div>

          <div className="relative" ref={accountSelectorRef}>
            <button
              onClick={() => setShowAccountSelector(!showAccountSelector)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold hover:border-blue-300 transition-all text-left"
            >
              <div className="flex items-center gap-2 truncate">
                <FiActivity className={`w-3.5 h-3.5 ${currentProject?.facebookAdAccountId ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="truncate">
                  {currentProject?.facebookAdAccountId 
                    ? `Linked: ${currentProject.facebookAdAccountId}` 
                    : "Choose Facebook Ad Account"}
                </span>
              </div>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>

            {showAccountSelector && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                <div className="p-3 border-b border-gray-50 bg-gray-50/30">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-2 flex flex-col gap-1">
                  {isAccountsLoading ? (
                    <div className="py-4 text-center text-gray-400 text-[10px]">Loading accounts...</div>
                  ) : filteredAdAccounts.length > 0 ? (
                    filteredAdAccounts.map(account => (
                      <button
                        key={account.id}
                        onClick={() => handleUpdateAdAccount(account.id)}
                        className={`w-full px-3 py-2 rounded-lg text-left text-[11px] font-bold transition-all flex items-center justify-between ${
                          currentProject?.facebookAdAccountId === account.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-blue-50 text-gray-700'
                        }`}
                      >
                        <span className="truncate">{account.name}</span>
                        <span className={`text-[9px] ${currentProject?.facebookAdAccountId === account.id ? 'text-blue-100' : 'text-gray-400'}`}>
                          {account.id}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-400 text-[10px]">No accounts found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Lead Dashboard Configuration - Full Width */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <div className="bg-slate-50/30 rounded-[2rem] p-4 md:p-8 border border-slate-100/50">
          <LeadDashboardConfig 
            fields={fields} 
            projectId={currentProject?._id} 
          />
        </div>
      </div>
    </div>
  );
};
