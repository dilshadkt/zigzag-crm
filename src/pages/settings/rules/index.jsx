import React from "react";
import GamificationRulesSection from "../../../components/settings/company/GamificationRulesSection";
import LeadKpiRulesSection from "../../../components/settings/company/LeadKpiRulesSection";

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

    <div className="flex flex-col">
      <div className="pb-3 px-1">
        <h2 className="text-[17px] font-bold text-gray-800">Lead Team KPI</h2>
        <p className="mt-0.5 text-[11px] text-gray-500">
          Set how telecallers and the sales team are scored each day, with points added and taken away.
        </p>
      </div>
      <LeadKpiRulesSection />
    </div>
  </div>
);

export default Rules;
