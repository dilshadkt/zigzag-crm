import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useGetCampaigns, useSyncFacebookAds } from "../../api/campaigns";
import CampaignsHeader from "../../components/pages/campaigns/CampaignsHeader";
import CampaignsTable from "../../components/pages/campaigns/CampaignsTable";
import CampaignsSummary from "../../components/pages/campaigns/CampaignsSummary";
import CreateCampaignDrawer from "../../components/pages/campaigns/CreateCampaignDrawer";

const Campaigns = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const { data: campaignsData, isLoading } = useGetCampaigns({
    page: 1,
    limit: 100, // Fetch more for the list view or implement pagination
    search: search,
    status: statusFilter,
  });

  const { mutate: syncFacebookAds, isLoading: isSyncing } = useSyncFacebookAds();

  const campaigns = campaignsData?.data || [];

  const handleSyncFacebook = () => {
    syncFacebookAds(undefined, {
      onSuccess: (data) => {
        const responseData = data.data || {};
        const totalFacebook = responseData.totalFacebookCampaigns || 0;
        const updated = responseData.updated || 0;
        
        if (totalFacebook === 0) {
          toast.error(
            "No Facebook campaigns found. Make sure you have active campaigns in your Facebook Ads Manager.",
            { duration: 5000 }
          );
        } else if (updated === 0) {
          toast.warning(
            `Found ${totalFacebook} Facebook campaign(s) but none matched your existing campaigns. Check the console for details.`,
            { duration: 6000 }
          );
          // Log unmatched campaigns for debugging
          if (responseData.details?.facebookCampaigns) {
            console.log("Facebook campaigns found:", responseData.details.facebookCampaigns);
          }
        } else {
          toast.success(
            data.message || `Successfully synced ${updated} campaign(s)`
          );
        }
        
        setLastSyncedAt(new Date());
        
        if (responseData.notMatched > 0) {
          toast.info(
            `${responseData.notMatched} Facebook campaign(s) could not be matched with existing campaigns`,
            { duration: 5000 }
          );
        }
        if (responseData.errors > 0) {
          toast.error(
            `${responseData.errors} error(s) occurred during sync. Check console for details.`,
            { duration: 5000 }
          );
        }
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to sync Facebook ads";
        toast.error(errorMessage, { duration: 5000 });
        console.error("Facebook sync error:", error);
      },
    });
  };

  return (
    <section className="flex flex-col rounded-2xl overflow-hidden h-full bg-white">
      <CampaignsHeader
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCampaigns={campaignsData?.totalCampaigns || 0}
        onAddCampaign={() => setIsDrawerOpen(true)}
        onSyncFacebook={handleSyncFacebook}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
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
