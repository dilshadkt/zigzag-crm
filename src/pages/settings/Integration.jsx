import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
  useCheckFacebookStatus, 
  useSyncFacebookAds, 
  useGetFacebookAccounts, 
  useSelectFacebookAccount 
} from "../../api/campaigns";
import { 
  FiFacebook, FiCheckCircle, FiXCircle, FiRefreshCw, 
  FiExternalLink, FiSettings, FiActivity, FiLayers, FiChevronRight 
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const Integration = () => {
  const { user } = useAuth();
  const isCompanyAdmin = user?.role === "company-admin";
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  
  const { data: fbStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useCheckFacebookStatus();
  const { data: adAccounts, isLoading: isLoadingAccounts } = useGetFacebookAccounts();
  const { mutate: syncFacebook, isLoading: isSyncing } = useSyncFacebookAds();
  const { mutate: selectAccount, isLoading: isSelecting } = useSelectFacebookAccount();

  const handleSync = () => {
    syncFacebook(undefined, {
      onSuccess: (data) => {
        toast.success(data.message || "Facebook data synced successfully");
        refetchStatus();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to sync Facebook data");
      }
    });
  };

  const handleSelectAccount = (accountId) => {
    selectAccount(accountId, {
      onSuccess: () => {
        toast.success("Ad Account updated successfully");
        setShowAccountSelector(false);
        refetchStatus();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to update Ad Account");
      }
    });
  };

  const handleConnect = () => {
    // Show instructions modal or redirect
    window.open("https://developers.facebook.com/apps", "_blank");
    toast.info("Follow the guide below to set up your Developer App", { duration: 5000 });
  };

  if (!isCompanyAdmin) {
    return (
      <div className="h-full overflow-y-auto flex flex-col pr-1">
        <div className="pb-3 px-1">
          <h1 className="text-[17px] font-bold text-gray-800">Integration Settings</h1>
          <p className="mt-0.5 text-[11px] text-gray-500">Manage external platform connections</p>
        </div>
        <div className="flex-1 bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
              <FiSettings className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4 text-[13px]">Only company administrators can manage platform integrations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col pr-1 custom-scrollbar">
      {/* Header Section */}
      <div className="pb-3 px-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-[17px] font-bold text-gray-800">Integration Hub</h1>
            <p className="mt-0.5 text-[11px] text-gray-500">Connect and manage your marketing platforms</p>
          </div>
          <button 
            onClick={() => refetchStatus()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-5 pb-6">
        {/* Facebook Ads Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 opacity-80" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <FiFacebook className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[16px] font-bold text-gray-800">Facebook Ads Manager</h2>
                  {fbStatus?.connected ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-green-100">
                      <FiCheckCircle className="w-3" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-gray-100">
                      <FiXCircle className="w-3" /> Disconnected
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed max-w-lg">
                  Sync your Facebook campaigns, reach, impressions, and spend data directly into your CRM dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {fbStatus?.connected ? (
                <>
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </button>
                  <button 
                    onClick={handleConnect}
                    className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                    title="Account Settings"
                  >
                    <FiSettings className="w-4.5 h-4.5" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleConnect}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center gap-2"
                >
                  <FiFacebook className="w-4 h-4" />
                  Connect Account
                </button>
              )}
            </div>
          </div>

          {fbStatus?.connected && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-50 pt-6">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ad Account</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-gray-800 truncate">{fbStatus.accountName || "N/A"}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-medium">ID: {fbStatus.accountId}</p>
                  </div>
                  <button 
                    onClick={() => setShowAccountSelector(!showAccountSelector)}
                    className="p-1.5 hover:bg-white rounded-lg text-blue-600 transition-colors"
                  >
                    <FiLayers className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${fbStatus.isTokenExpired ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  <p className="text-[13px] font-bold text-gray-800">
                    {fbStatus.isTokenExpired ? "Token Expired" : "Active Connection"}
                  </p>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Never expires (System User)</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Sync</p>
                <p className="text-[13px] font-bold text-gray-800">
                  {fbStatus.lastSyncedAt ? new Date(fbStatus.lastSyncedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "Never"}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Auto-sync every 30m</p>
              </div>
            </div>
          )}

          {/* Ad Account Selector Dropdown/List */}
          {showAccountSelector && fbStatus?.connected && (
            <div className="mt-4 bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-top duration-300">
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                <h3 className="text-[12px] font-bold text-gray-700">Available Ad Accounts</h3>
                <span className="text-[10px] text-gray-400 font-medium">Choose an account to sync</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {isLoadingAccounts ? (
                  <div className="p-8 text-center">
                    <FiRefreshCw className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-2" />
                    <p className="text-[11px] text-gray-400">Fetching accounts from Facebook...</p>
                  </div>
                ) : adAccounts && adAccounts.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {adAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => handleSelectAccount(account.id)}
                        disabled={isSelecting || account.id === fbStatus.accountId}
                        className={`w-full px-4 py-3 flex items-center justify-between text-left transition-all hover:bg-white group ${account.id === fbStatus.accountId ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${account.id === fbStatus.accountId ? 'bg-blue-100 text-blue-600' : 'bg-white border border-gray-200 text-gray-400 group-hover:text-blue-500 group-hover:border-blue-100'}`}>
                            <FiLayers className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-800">{account.name}</p>
                            <p className="text-[10px] text-gray-500">ID: {account.id} • {account.currency}</p>
                          </div>
                        </div>
                        {account.id === fbStatus.accountId ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded-md">Primary</span>
                        ) : (
                          <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-[12px]">
                    No other ad accounts found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Coming Soon: Google Ads */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <FiActivity className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[16px] font-bold text-gray-800">Google Ads</h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-wider rounded-full border border-gray-200">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed max-w-lg">
                  Track your search, display, and video campaigns from Google Ads alongside your other marketing efforts.
                </p>
              </div>
            </div>
            <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 rounded-xl text-[12px] font-bold cursor-not-allowed border border-gray-200">
              Coming Soon
            </button>
          </div>
        </div>

        {/* Documentation / Info Card */}
        <div className="bg-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-100 relative overflow-hidden mt-4">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-white mb-2">Need help connecting?</h3>
              <p className="text-blue-100 text-[13px] leading-relaxed max-w-xl">
                Connecting your marketing accounts requires a Facebook Developer App and a System User Access Token with 'ads_read' permissions.
              </p>
            </div>
            <a 
              href="https://developers.facebook.com/docs/marketing-apis/" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl text-[12px] font-bold hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 shrink-0"
            >
              <FiExternalLink className="w-4 h-4" />
              View API Docs
            </a>
          </div>
        </div>

        {/* Switch Account Guide */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <FiSettings className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-800">How to switch Facebook accounts?</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold">1</div>
              <div>
                <p className="text-[13px] font-bold text-gray-700">Find your Ad Account ID</p>
                <p className="text-[12px] text-gray-500 mt-1">
                  Go to <a href="https://business.facebook.com/settings/ad-accounts" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Meta Business Settings</a>. Select your Ad Account and copy the ID (number).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold">2</div>
              <div>
                <p className="text-[13px] font-bold text-gray-700">Update Backend Configuration</p>
                <p className="text-[12px] text-gray-500 mt-1">
                  Open your <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800">crm-api/.env</code> file and update the <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800">FACEBOOK_AD_ACCOUNT_ID</code> variable.
                  <br />
                  <span className="text-blue-600 font-medium">Important:</span> Ensure the ID starts with <code className="font-bold">act_</code> (e.g., <code className="font-bold">act_123456789</code>).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold">3</div>
              <div>
                <p className="text-[13px] font-bold text-gray-700">System User Permissions</p>
                <p className="text-[12px] text-gray-500 mt-1">
                  Ensure the "System User" who generated your token has been added to the new Ad Account with "View Performance" permissions in your Meta Business Suite.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                <strong>Note:</strong> After updating the <code className="bg-amber-100/50 px-1 rounded">.env</code> file, you must restart your backend server for the changes to take effect. Then, return here and click <strong>"Sync Now"</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integration;
