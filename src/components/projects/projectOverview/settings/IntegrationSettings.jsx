import React, { useState } from "react";
import { updateProject, updateProjectSocialConfig } from "../../../../api/service";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGetFacebookAccounts, useRefreshFacebookAccounts } from "../../../../api/campaigns";
import { FiActivity, FiLayers, FiSearch, FiInstagram, FiFacebook, FiShield, FiRefreshCw } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export const IntegrationSettings = ({
  selectedLeadForm,
  setSelectedLeadForm,
  leadFormConfigs,
  handleUpdateLeadForm,
  currentProject,
  onRefresh,
}) => {
  const queryClient = useQueryClient();

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

  // Facebook Ad Account Selector State
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");
  const { data: adAccounts, isLoading: isAccountsLoading } = useGetFacebookAccounts();
  const { mutate: refreshAccounts, isPending: isRefreshingAccounts } = useRefreshFacebookAccounts();
  const accountSelectorRef = React.useRef(null);

  const handleRefreshAccounts = () => {
    refreshAccounts(undefined, {
      onSuccess: () => {
        toast.success("Facebook Ad Accounts list refreshed!");
      },
      onError: () => {
        toast.error("Failed to refresh Facebook Ad Accounts");
      }
    });
  };

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

  return (
    <div className="max-w-xl space-y-5">
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
              <div className="p-3 border-b border-gray-50 bg-gray-50/30 flex gap-2 items-center">
                <div className="relative flex-1">
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
                <button
                  onClick={handleRefreshAccounts}
                  disabled={isRefreshingAccounts}
                  className="p-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-50 rounded-xl text-gray-600 transition-all text-xs"
                  title="Fetch latest accounts from Facebook"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshingAccounts ? 'animate-spin' : ''}`} />
                </button>
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
  );
};
