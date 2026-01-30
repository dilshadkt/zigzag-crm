import React from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";

const CampaignRow = ({ campaign }) => {
  const navigate = useNavigate();

  const getStatusStyles = (status) => {
    switch (status) {
      case "active":
        return {
          dot: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse",
          text: "text-green-700",
          glow: "relative",
        };
      case "paused":
        return {
          dot: "bg-orange-500",
          text: "text-orange-700",
          glow: "",
        };
      default:
        return {
          dot: "bg-gray-300",
          text: "text-gray-500",
          glow: "",
        };
    }
  };

  const statusStyles = getStatusStyles(campaign.status);
  const endDate = new Date(campaign.endDate);
  const isEnded = endDate < new Date();

  return (
    <tr
      key={campaign._id}
      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
      onClick={() => navigate(`${campaign._id}`)}
    >
      <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="py-4 px-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {campaign.name}
            </span>
            {campaign.facebookAdId && (
              <span
                className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase tracking-tighter"
                title="Synced from Facebook"
              >
                FB
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-medium text-gray-400 line-clamp-1">
              {campaign.platform || "Platform Organic"} •{" "}
              {campaign.task?.title || "Untracked Task"}
            </span>
            {campaign.lastSyncedAt && (
              <span
                className="text-[9px] text-gray-400 flex items-center gap-1"
                title={`Last synced: ${new Date(campaign.lastSyncedAt).toLocaleString()}`}
              >
                <FiRefreshCw className="w-2.5 h-2.5" />
                {new Date(campaign.lastSyncedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-2">
          <div className={`${statusStyles.glow} flex items-center justify-center`}>
            {campaign.status === "active" && (
              <div className="absolute h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75"></div>
            )}
            <div className={`h-2 w-2 rounded-full ${statusStyles.dot} relative z-10`}></div>
          </div>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${statusStyles.text}`}
          >
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
        <div className="text-xs font-black text-gray-800">
          ₹{(campaign.budget || 0).toLocaleString()}
        </div>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
          Budget
        </div>
      </td>
      <td className="py-4 px-5 text-right">
        <div className="text-xs font-black text-blue-600">
          ₹{(campaign.amountSpent || 0).toLocaleString()}
        </div>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
          Total Spent
        </div>
      </td>
      <td className="py-4 px-5 text-right font-bold text-xs text-gray-600">
        {(campaign.impressions || 0).toLocaleString()}
      </td>
      <td className="py-4 px-5 text-right font-bold text-xs text-gray-600">
        {(campaign.reach || 0).toLocaleString()}
      </td>
      <td className="py-4 px-5 text-right">
        <div className="text-xs font-bold text-gray-700">
          {endDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
          {isEnded ? "Ended" : "Ongoing"}
        </div>
      </td>
    </tr>
  );
};

export default CampaignRow;
