import React from "react";
import { useNavigate } from "react-router-dom";

const CampaignRow = ({ campaign, isClient, visibleColumns }) => {
  const navigate = useNavigate();

  const getDeliveryStyles = (status) => {
    switch (status) {
      case "active":
        return {
          dot: "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]",
          text: "text-green-700",
          label: "Active",
        };
      case "paused":
        return {
          dot: "bg-gray-400",
          text: "text-gray-500",
          label: "Off",
        };
      case "completed":
        return {
          dot: "bg-blue-400",
          text: "text-blue-600",
          label: "Completed",
        };
      default:
        return {
          dot: "bg-gray-300",
          text: "text-gray-500",
          label: campaign.status || "—",
        };
    }
  };

  const delivery = getDeliveryStyles(campaign.status);

  const formatObjective = (obj) => {
    if (!obj) return "";
    return obj.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace("Outcome ", "").trim();
  };

  const isVisible = (key) => visibleColumns?.includes(key) ?? true;

  return (
    <tr
      className="hover:bg-blue-50/30 transition-colors group cursor-pointer border-b border-gray-50 last:border-none"
      onClick={() => navigate(`${campaign._id}`)}
    >
      {!isClient && (
        <td className="py-3.5 px-4 text-center w-12" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
        </td>
      )}

      {/* Campaign Name — always visible */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          {campaign.facebookAdId && (
            <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-blue-600" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <span className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {campaign.name}
            </span>
          </div>
        </div>
      </td>

      {/* Delivery — always visible */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${delivery.dot}`}></div>
          <span className={`text-[12px] font-semibold ${delivery.text}`}>{delivery.label}</span>
        </div>
      </td>

      {isVisible("results") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-900">
            {campaign.totalResults ? campaign.totalResults.toLocaleString() : "—"}
          </div>
          {campaign.objective && (
            <div className="text-[10px] text-gray-400 truncate max-w-[140px] ml-auto">{formatObjective(campaign.objective)}</div>
          )}
        </td>
      )}

      {isVisible("costPerResult") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-900">
            {campaign.cpr ? `₹${campaign.cpr.toFixed(2)}` : "—"}
          </div>
        </td>
      )}

      {isVisible("budget") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-900">
            {campaign.budget ? `₹${campaign.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
          </div>
        </td>
      )}

      {isVisible("amountSpent") && (
        <td className="py-3.5 px-4 text-right">
          <div className={`text-[13px] font-semibold ${campaign.amountSpent > 0 ? "text-gray-900" : "text-gray-400"}`}>
            {campaign.amountSpent ? `₹${campaign.amountSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
          </div>
        </td>
      )}

      {isVisible("reach") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-700">
            {campaign.reach ? campaign.reach.toLocaleString() : "—"}
          </div>
        </td>
      )}

      {isVisible("impressions") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-700">
            {campaign.impressions ? campaign.impressions.toLocaleString() : "—"}
          </div>
        </td>
      )}

      {isVisible("clicks") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-700">
            {campaign.clicks ? campaign.clicks.toLocaleString() : "—"}
          </div>
        </td>
      )}

      {isVisible("cpc") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-700">
            {campaign.cpc ? `₹${campaign.cpc.toFixed(2)}` : "—"}
          </div>
        </td>
      )}

      {isVisible("ctr") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-700">
            {campaign.ctr ? `${campaign.ctr.toFixed(2)}%` : "—"}
          </div>
        </td>
      )}

      {isVisible("frequency") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-700">
            {campaign.frequency ? campaign.frequency.toFixed(2) : "—"}
          </div>
        </td>
      )}

      {isVisible("conversions") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-700">
            {campaign.conversions ? campaign.conversions.toLocaleString() : "—"}
          </div>
        </td>
      )}

      {isVisible("endDate") && (
        <td className="py-3.5 px-4 text-right">
          <div className="text-[13px] font-semibold text-gray-700">
            {campaign.endDate
              ? new Date(campaign.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "—"}
          </div>
          <div className="text-[10px] text-gray-400">
            {campaign.endDate && new Date(campaign.endDate) < new Date() ? "Ended" : "Ongoing"}
          </div>
        </td>
      )}
    </tr>
  );
};

export default CampaignRow;
