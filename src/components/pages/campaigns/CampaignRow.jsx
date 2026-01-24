import React from "react";
import { useNavigate } from "react-router-dom";

const CampaignRow = ({ campaign }) => {
  const navigate = useNavigate();

  const getStatusStyles = (status) => {
    switch (status) {
      case "active":
        return {
          dot: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
          text: "text-green-700",
        };
      case "paused":
        return {
          dot: "bg-orange-500",
          text: "text-orange-700",
        };
      default:
        return {
          dot: "bg-gray-300",
          text: "text-gray-500",
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
          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {campaign.name}
          </span>
          <span className="text-[10px] font-medium text-gray-400 mt-0.5 line-clamp-1">
            {campaign.platform || "Platform Organic"} •{" "}
            {campaign.task?.title || "Untracked Task"}
          </span>
        </div>
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusStyles.dot}`}></div>
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
