import React from "react";
import { FiFilter } from "react-icons/fi";
import CampaignRow from "./CampaignRow";
import CampaignsTableSkeleton from "./CampaignsTableSkeleton";

const CampaignsTable = ({ campaigns, isLoading, isClient }) => {
  if (isLoading) {
    return <CampaignsTableSkeleton />;
  }

  return (
    <div className="bg-white md:border md:border-gray-200 md:rounded-3xl overflow-hidden md:shadow-sm flex flex-col h-full">
      {/* Mobile-Friendly Campaigns View (Visible on Mobile Only) */}
      <div className="md:hidden flex flex-col gap-4 p-4">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div
              key={campaign._id || campaign.id}
              className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-blue-300 transition-colors cursor-pointer select-none"
              onClick={() => window.location.pathname = `/campaigns/${campaign._id || campaign.id}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {campaign.name}
                    </span>
                    {campaign.facebookAdId && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase tracking-tighter shrink-0">
                        FB
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 mt-1 block">
                    {campaign.platform || "Platform Organic"} • {campaign.task?.title || "Untracked Task"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                  <div className={`h-1.5 w-1.5 rounded-full ${campaign.status === "active" ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-700">
                    {campaign.status}
                  </span>
                </div>
              </div>

              {/* Campaign Stats Matrix */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <div>
                  <div className="text-xs font-black text-gray-800">
                    ₹{(campaign.budget || 0).toLocaleString()}
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    Budget
                  </div>
                </div>
                <div>
                  <div className="text-xs font-black text-blue-600">
                    ₹{(campaign.amountSpent || 0).toLocaleString()}
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    Total Spent
                  </div>
                </div>
                <div>
                  <div className="text-xs font-black text-gray-800">
                    {(campaign.totalResults || 0).toLocaleString()}
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    Results
                  </div>
                </div>
                <div>
                  <div className="text-xs font-black text-gray-800">
                    ₹{(campaign.cpr || 0).toFixed(2)}
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    Cost / Result
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-2.5 mt-0.5">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs font-bold text-gray-800">
                      {(campaign.impressions || 0).toLocaleString()}
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      Impressions
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">
                      {(campaign.reach || 0).toLocaleString()}
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      Reach
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-gray-700">
                    {new Date(campaign.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    End Date
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100 shadow-sm">
              <FiFilter className="text-2xl text-gray-300" />
            </div>
            <p className="text-xs font-black text-gray-800 uppercase tracking-widest">
              No matching campaigns
            </p>
          </div>
        )}
      </div>

      {/* Desktop Table (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
              {!isClient && (
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider w-16 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider min-w-[250px]">
                Campaign
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                Results
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                Cost / Result
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                Budget
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                Spent
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                Impressions
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                Reach
              </th>
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                End Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <CampaignRow key={campaign._id} campaign={campaign} isClient={isClient} />
              ))
            ) : (
              <tr>
                <td colSpan={isClient ? "9" : "10"} className="py-32">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 transition-all hover:scale-105 border border-gray-100 shadow-sm">
                      <FiFilter className="text-3xl text-gray-300" />
                    </div>
                    <p className="text-sm font-black text-gray-800 uppercase tracking-widest">
                      No matching campaigns
                    </p>
                    <p className="text-xs mt-1 text-gray-500">
                      Try adjusting your search or filters to see performance data
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignsTable;
