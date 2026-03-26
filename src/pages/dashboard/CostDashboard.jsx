import React from "react";
import Billing from "../settings/billing";

const CostDashboardPage = () => {
    return (
        <div className="flex flex-col gap-6 h-full">
            <h2 className="text-xl font-bold">Cost Dashboard</h2>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 flex-1 overflow-auto">
                <Billing />
            </div>
        </div>
    );
};

export default CostDashboardPage;
