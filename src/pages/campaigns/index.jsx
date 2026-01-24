import React, { useState } from "react";
import { useGetCampaigns } from "../../api/campaigns";
import CampaignsHeader from "../../components/pages/campaigns/CampaignsHeader";
import CampaignsTable from "../../components/pages/campaigns/CampaignsTable";
import CampaignsSummary from "../../components/pages/campaigns/CampaignsSummary";
import CreateCampaignDrawer from "../../components/pages/campaigns/CreateCampaignDrawer";

const Campaigns = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: campaignsData, isLoading } = useGetCampaigns({
    page: 1,
    limit: 100, // Fetch more for the list view or implement pagination
    search: search,
    status: statusFilter,
  });

  const campaigns = campaignsData?.data || [];

  return (
    <section className="flex flex-col rounded-2xl overflow-hidden h-full bg-white">
      <CampaignsHeader
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCampaigns={campaignsData?.totalCampaigns || 0}
        onAddCampaign={() => setIsDrawerOpen(true)}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <CampaignsTable campaigns={campaigns} isLoading={isLoading} />
        {!isLoading && campaigns.length > 0 && (
          <CampaignsSummary campaigns={campaigns} />
        )}
      </div>

      <CreateCampaignDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </section>
  );
};

export default Campaigns;
