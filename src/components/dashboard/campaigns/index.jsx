import React from "react";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useGetCampaigns } from "../../../api/campaigns";
import CampaignCard from "./CampaignCard";
import { FiTarget } from "react-icons/fi";

const DashboardCampaigns = () => {
    // Fetch last 3 active or planned campaigns
    const { data: campaignsData, isLoading } = useGetCampaigns({
        limit: 3,
        sort: 'createdAt',
        // You might want to filter by active status if needed, but for now showing recent
    });

    const campaigns = campaignsData?.data || [];

    if (isLoading) return null;

    return (
        <div>
            <div className="flex justify-between items-center mt-4">
                <h4 className="font-semibold text-[17px] text-gray-800 flex items-center gap-2">
                    Active Campaigns
                </h4>
                <Link
                    to="/campaigns"
                    className="text-[#3F8CFF] text-sm cursor-pointer flex items-center gap-x-2 hover:underline"
                >
                    <span>View all campaigns</span>
                    <MdOutlineKeyboardArrowRight />
                </Link>
            </div>

            <div className="mt-3 clear-start bg-white h-[480px] overflow-y-auto rounded-3xl p-4">
                {campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <FiTarget className="text-2xl text-gray-400" />
                        </div>
                        <p className="font-medium text-lg">No active campaigns</p>

                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2   ">
                        {campaigns.map((campaign) => (
                            <CampaignCard
                                cardStyle="bg-[#f4f9fd]"
                                key={campaign._id} campaign={campaign} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCampaigns;
