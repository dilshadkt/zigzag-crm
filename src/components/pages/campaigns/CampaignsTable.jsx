import React from "react";
import { FiFilter } from "react-icons/fi";
import CampaignRow from "./CampaignRow";

const CampaignsTable = ({ campaigns, isLoading }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
              <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider w-16 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
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
            {isLoading ? (
              <tr>
                <td colSpan="10" className="py-32">
                  <div className="flexCenter flex-col gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600/20 border-t-blue-600"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Loading performance data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <CampaignRow key={campaign._id} campaign={campaign} />
              ))
            ) : (
              <tr>
                <td colSpan="10" className="py-32">
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
