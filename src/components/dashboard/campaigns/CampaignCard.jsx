import React from "react";
import { FiCalendar, FiDollarSign, FiUsers, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const CampaignCard = ({ campaign, cardStyle = "bg-white" }) => {
    const navigate = useNavigate();

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "INR", // Or user's currency preference
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
            className={`${cardStyle} rounded-3xl p-5 transition-all 
                duration-300 cursor-pointer group hover:shadow-xl hover:shadow-blue-500/5 border border-transparent hover:border-blue-100 flex flex-col gap-4`}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-lg ${getStatusColor(campaign.status)}`}>
                            {campaign.status || "Planned"}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 border-l border-gray-200 pl-2">
                            {campaign.platform || "Organic"}
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">
                        {campaign.name}
                    </h3>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Budget</span>
                    <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(budget)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white/50 rounded-2xl p-3 border border-gray-100/50">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Results</span>
                    <span className="text-sm font-semibold text-gray-800">{(campaign.totalResults || 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Spent</span>
                    <span className="text-sm font-semibold text-blue-600">₹{(campaign.amountSpent || 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">CPR</span>
                    <span className="text-sm font-semibold text-gray-800">₹{(campaign.cpr || 0).toFixed(2)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2.5 overflow-hidden">
                        {campaign.leads && campaign.leads.length > 0 ? (
                            campaign.leads.slice(0, 3).map((lead, index) => {
                                const colors = [
                                    { bg: "bg-indigo-50", text: "text-indigo-600" },
                                    { bg: "bg-pink-50", text: "text-pink-600" },
                                    { bg: "bg-emerald-50", text: "text-emerald-600" },
                                ];
                                const color = colors[index % colors.length];
                                const initial = lead?.contact?.name?.charAt(0) || "?";
                                return (
                                    <div
                                        key={lead._id || index}
                                        className={`flex h-7 w-7 rounded-xl ring-2 ring-white ${color.bg} items-center justify-center text-[10px] font-semibold ${color.text} shadow-sm`}
                                    >
                                        {initial.toUpperCase()}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex h-7 w-7 rounded-xl ring-2 ring-white bg-gray-50 items-center justify-center text-xs text-gray-300">
                                <FiUsers size={12} />
                            </div>
                        )}
                        {leadCount > 3 && (
                            <div className="flex h-7 w-7 rounded-xl ring-2 ring-white bg-gray-50 items-center justify-center text-[10px] font-semibold text-gray-500 shadow-sm">
                                +{leadCount - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">
                        {leadCount} Leads
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-400">
                    <FiCalendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                        Ends {formatDate(campaign.endDate)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;
