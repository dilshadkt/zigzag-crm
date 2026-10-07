import React from "react";
import GamificationRulesSection from "../../../components/settings/company/GamificationRulesSection";

const Rules = () => (
  <div className="h-full overflow-y-auto flex flex-col pr-1 gap-8">
    <div className="flex flex-col">
      <div className="pb-3 px-1">
        <h2 className="text-[17px] font-bold text-gray-800">Gamification & Performance</h2>
        <p className="mt-0.5 text-[11px] text-gray-500">
          Configure how points are awarded or deducted for employee performance.
        </p>
      </div>
      <GamificationRulesSection />
    </div>
  </div>
);

export default Rules;
