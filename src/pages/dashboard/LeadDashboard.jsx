import React from "react";
import LeadsDashboard from "../../features/leads/components/LeadsDashboard";
import { useGetLeadStats } from "../../features/leads/api";

const LeadDashboardPage = () => {
    // Stats
    const { data: statsData, isLoading: statsLoading } = useGetLeadStats();
    const leadStats = statsData?.data;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 h-full">
            <h2 className="text-xl font-bold mb-6">Lead Dashboard</h2>
            <LeadsDashboard
                stats={leadStats}
                isLoading={statsLoading}
                // onStatusClick could be added here if needed to navigate to Leads page with filter
            />
        </div>
    );
};

export default LeadDashboardPage;
