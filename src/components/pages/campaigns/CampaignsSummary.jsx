import React from "react";

const CampaignsSummary = ({ campaigns }) => {
  const totalResults = campaigns.reduce(
    (acc, c) => acc + (c.totalResults || 0),
    0
  );
  const totalSpent = campaigns.reduce(
    (acc, c) => acc + (c.amountSpent || 0),
    0
  );

  return (
    <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 flex items-center justify-end gap-12">
      <div className="text-right">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Total Results
        </div>
        <div className="text-sm font-black text-gray-900">
          {totalResults.toLocaleString()}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Total Spent
        </div>
        <div className="text-sm font-black text-blue-600">
          ₹{totalSpent.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CampaignsSummary;
