import React from "react";
import { FiCalendar, FiDollarSign, FiUsers, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const CampaignCard = ({ campaign, cardStyle = "bg-white" }) => {
    const navigate = useNavigate();

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED", // Or user's currency preference
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700";
            case "planned":
                return "bg-blue-100 text-blue-700";
            case "completed":
                return "bg-gray-100 text-gray-700";
            case "paused":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const leadCount = campaign.leads?.length || 0;
    const budget = campaign.budget || 0;

    return (
        <div
            onClick={() => navigate(`/campaigns/${campaign._id}`)}
            className={`${cardStyle} rounded-2xl p-5 transition-all 
                duration-300 cursor-pointer group relative overflow-hidden`}
        >


            <div className="relative z-10">
                <div className="flex justify-between items-start ">
                    <div>

                        <div className="flex items-center gap-x-4">

                            <h3 className=" font-medium text-gray-800  group-hover:text-blue-600 transition-colors line-clamp-1">
                                {campaign.name}
                            </h3>
                            <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(
                                    campaign.status
                                )}`}
                            >
                                {campaign.status || "Planned"}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {campaign.platform || "Multi-platform"}
                            </p>
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-3 gap-4 my-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" /> EITHER DATE
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <FiDollarSign className="w-3 h-3" /> Budget
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                            {formatCurrency(budget)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 overflow-hidden">
                            {campaign.leads && campaign.leads.length > 0 ? (
                                campaign.leads.slice(0, 3).map((lead, index) => {
                                    // Generate consistent colors based on index or name
                                    const colors = [
                                        { bg: "bg-indigo-100", text: "text-indigo-600" },
                                        { bg: "bg-pink-100", text: "text-pink-600" },
                                        { bg: "bg-green-100", text: "text-green-600" },
                                        { bg: "bg-yellow-100", text: "text-yellow-600" },
                                        { bg: "bg-purple-100", text: "text-purple-600" },
                                    ];
                                    const color = colors[index % colors.length];
                                    const initial = lead?.contact?.name?.charAt(0) || "?";

                                    return (
                                        <div
                                            key={lead._id || index}
                                            className={`flex h-8 w-8 rounded-full ring-2 ring-white ${color.bg} items-center justify-center text-xs font-bold ${color.text}`}
                                            title={lead?.contact?.name || "Lead"}
                                        >
                                            {initial.toUpperCase()}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 items-center justify-center text-xs text-gray-400">
                                    <FiUsers />
                                </div>
                            )}
                            {campaign.leads && campaign.leads.length > 3 && (
                                <div className="flex h-8 w-8 rounded-full ring-2 ring-white bg-gray-100
                                 items-center justify-center text-xs font-medium text-gray-600">
                                    +{campaign.leads.length - 3}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Total Leads</span>
                            <span className="text-xs font-medium text-gray-800">{leadCount} Contacts</span>
                        </div>
                    </div>
                </div>

                {/* Leads Highlight Section */}
                <div className=" border-t border-gray-50 flex items-center justify-end">


                    <div className="text-right">
                        <button className="text-xs font-medium text-blue-500 hover:text-blue-700 flex items-center gap-1">
                            View Details <span className="text-lg">›</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;
