import React from "react";
import { useNavigate } from "react-router-dom";
import { useSyncFacebookAds } from "../../../api/campaigns";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-hot-toast";

export const CampaignTab = ({ isCampaignsLoading, projectCampaigns, branchFilter = "", currentProject, onRefresh }) => {
  const navigate = useNavigate();
  const { mutate: syncFacebookAds, isLoading: isSyncing } = useSyncFacebookAds();

  const handleSync = () => {
    syncFacebookAds(currentProject?._id, {
      onSuccess: () => {
        toast.success("Facebook campaigns synced successfully!");
        if (onRefresh) onRefresh();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Sync failed");
      }
    });
  };

  const visibleCampaigns = React.useMemo(() => {
    if (!branchFilter) return projectCampaigns;
    return projectCampaigns.filter((campaign) => {
      const campBranch = campaign?.branch || campaign?.customFields?.branch;
      return campBranch === branchFilter;
    });
  }, [projectCampaigns, branchFilter]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Project Campaigns</h3>
          <p className="text-xs text-gray-500 mt-1">Marketing and engagement campaigns linked to this client.</p>
        </div>
        {currentProject?.facebookAdAccountId && (
          <button
            onClick={handleSync}
            disabled={isSyncing || isCampaignsLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isSyncing
              ? 'bg-gray-50 text-gray-400 border-gray-200'
              : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
              }`}
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {isCampaignsLoading ? (
        <div className="flexCenter py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : visibleCampaigns.length === 0 ? (
        <div className="flexCenter flex-col py-20 text-gray-400">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-sm font-medium">No campaigns found for this client</p>
          <p className="text-xs">Active campaigns will appear here after sync.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b sticky top-0 bg-white z-50 border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-wider">
                <th className="pb-3 pr-4">Campaign Name</th>
                <th className="pb-3 px-4">Platform</th>
                <th className="pb-3 px-4 text-center">Status</th>
                <th className="pb-3 px-4 text-right">Budget</th>
                <th className="pb-3 px-4 text-right">Spent</th>
                <th className="pb-3 px-4 text-right">Results</th>
                <th className="pb-3 px-4 text-right">CPR</th>
                <th className="pb-3 pl-4 text-right">Reach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleCampaigns.map((campaign) => (
                <tr
                  key={campaign._id}
                  onClick={() => navigate(`/campaigns/${campaign._id}`)}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 pr-4">
                    <div className="font-semibold text-gray-900 text-xs truncate max-w-[200px]" title={campaign.name}>
                      {campaign.name}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]" title={campaign.description}>
                      {campaign.description}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${campaign.platform === 'Facebook' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                      campaign.platform === 'Instagram' ? 'bg-pink-50 border-pink-100 text-pink-700' :
                        'bg-gray-50 border-gray-100 text-gray-700'
                      }`}>
                      {campaign.platform}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                      <span className={`w-1 h-1 rounded-full mr-1 ${campaign.status === 'active' ? 'bg-green-500' :
                        campaign.status === 'paused' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}></span>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right tabular-nums text-xs font-medium text-gray-700">
                    ₹{(campaign.budget || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right tabular-nums text-xs font-medium text-gray-700">
                    ₹{(campaign.amountSpent || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right tabular-nums text-xs font-bold text-blue-600">
                    {campaign.totalResults || 0}
                  </td>
                  <td className="py-4 px-4 text-right tabular-nums text-xs font-medium text-gray-700">
                    ₹{(campaign.cpr || 0).toFixed(2)}
                  </td>
                  <td className="py-4 pl-4 text-right tabular-nums text-xs font-medium text-gray-700">
                    {(campaign.reach || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
