import React, { useState } from "react";
import { useGetCampaigns } from "../../api/campaigns";
import CampaignCard from "../../components/dashboard/campaigns/CampaignCard";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Navigator from "../../components/shared/navigator";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFilter } from "react-icons/fi";

const Campaigns = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const { data: campaignsData, isLoading } = useGetCampaigns({
        page: 1,
        limit: 100, // Fetch more for the list view or implement pagination
        search: search,
        status: statusFilter,
    });

    const campaigns = campaignsData?.data || [];

    return (
        <section className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flexBetween mb-4">
                    <div className="flex items-center gap-4">
                        <Navigator />
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 tracking-tight">Campaign Management</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Track and optimize your marketing performance</p>
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
                    </div>
                </div>

                <div className="flexBetween">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1">
                        {["", "planned", "active", "completed", "paused"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest
                                    ${statusFilter === status
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "bg-transparent text-gray-500 hover:bg-gray-100"}`}
                            >
                                {status === "" ? "All" : status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Total: {campaignsData?.totalCampaigns || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-hidden flex flex-col p-6">
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                                    <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider w-16 text-center">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading performance data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : campaigns.length > 0 ? (
                                    campaigns.map((campaign) => (
                                        <tr
                                            key={campaign._id}
                                            className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                            onClick={() => navigate(`${campaign._id}`)}
                                        >
                                            <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {campaign.name}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400 mt-0.5 line-clamp-1">
                                                        {campaign.platform || "Platform Organic"} • {campaign.task?.title || "Untracked Task"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${campaign.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                                                        campaign.status === 'paused' ? 'bg-orange-500' : 'bg-gray-300'
                                                        }`}></div>
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${campaign.status === 'active' ? 'text-green-700' :
                                                        campaign.status === 'paused' ? 'text-orange-700' : 'text-gray-500'
                                                        }`}>
                                                        {campaign.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 text-right font-black text-xs text-gray-800">
                                                {(campaign.totalResults || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-5 text-right font-black text-xs text-gray-800">
                                                ₹{(campaign.cpr || 0).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <div className="text-xs font-black text-gray-800">₹{(campaign.budget || 0).toLocaleString()}</div>
                                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Budget</div>
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <div className="text-xs font-black text-blue-600">₹{(campaign.amountSpent || 0).toLocaleString()}</div>
                                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Total Spent</div>
                                            </td>
                                            <td className="py-4 px-5 text-right font-bold text-xs text-gray-600">
                                                {(campaign.impressions || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-5 text-right font-bold text-xs text-gray-600">
                                                {(campaign.reach || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <div className="text-xs font-bold text-gray-700">
                                                    {new Date(campaign.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    {new Date(campaign.endDate) < new Date() ? 'Ended' : 'Ongoing'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="py-32">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 transition-all hover:scale-105 border border-gray-100 shadow-sm">
                                                    <FiFilter className="text-3xl text-gray-300" />
                                                </div>
                                                <p className="text-sm font-black text-gray-800 uppercase tracking-widest">No matching campaigns</p>
                                                <p className="text-xs mt-1 text-gray-500">Try adjusting your search or filters to see performance data</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    {!isLoading && campaigns.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 flex items-center justify-end gap-12">
                            <div className="text-right">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Results</div>
                                <div className="text-sm font-black text-gray-900">
                                    {campaigns.reduce((acc, c) => acc + (c.totalResults || 0), 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</div>
                                <div className="text-sm font-black text-blue-600">
                                    ₹{campaigns.reduce((acc, c) => acc + (c.amountSpent || 0), 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Campaigns;
