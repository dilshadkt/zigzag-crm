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
        <section className="flex flex-col h-full bg-gray-50/50">
            <div className="flexBetween mb-2">
                <div className="flex items-center gap-3">
                    <Navigator />
                    <h3 className="font-bold text-xl text-gray-800">Campaigns</h3>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                        {campaignsData?.totalCampaigns || 0}
                    </span>
                </div>

                <div className="flex bg-white border border-gray-200 rounded-xl px-3 py-2 w-64 items-center gap-2 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
                    <FiSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                {["", "planned", "active", "completed", "paused"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap
                            ${statusFilter === status
                                ? "bg-blue-500 text-white  border border-transparent"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"}`}
                    >
                        {status === "" ? "All Campaigns" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex-1 flexCenter">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2  gap-3 pb-6 pr-2 overflow-y-auto">
                    {campaigns.map((campaign) => (
                        <CampaignCard key={campaign._id} campaign={campaign} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiFilter className="text-2xl" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">No campaigns found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
                </div>
            )}
        </section>
    );
};

export default Campaigns;
