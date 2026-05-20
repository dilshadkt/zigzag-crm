import React, { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { 
  useGetCampaigns, 
  useSyncFacebookAds, 
  useCheckFacebookStatus, 
  useGetFacebookAccounts, 
  useSelectFacebookAccount 
} from "../../api/campaigns";
import { useAuth } from "../../hooks/useAuth";
import { useCompanyActiveProjects } from "../../api/hooks";
import CampaignsHeader from "../../components/pages/campaigns/CampaignsHeader";
import CampaignsTable from "../../components/pages/campaigns/CampaignsTable";
import CampaignsSummary from "../../components/pages/campaigns/CampaignsSummary";
import CreateCampaignDrawer from "../../components/pages/campaigns/CreateCampaignDrawer";
import { FiLayers, FiActivity, FiRefreshCw } from "react-icons/fi";

const Campaigns = ({ isClient: propIsClient, projectId, branchFilter = "" }) => {
  const { user } = useAuth();
  const isClient = propIsClient || user?.role === "client";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const accountSelectorRef = React.useRef(null);

  // Close account selector on click outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountSelectorRef.current && !accountSelectorRef.current.contains(event.target)) {
        setShowAccountSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: fbStatus } = useCheckFacebookStatus();
  const { data: adAccounts } = useGetFacebookAccounts();
  const { mutate: selectAccount, isLoading: isSelecting } = useSelectFacebookAccount();

  const filteredAdAccounts = useMemo(() => {
    if (!adAccounts) return [];
    if (!accountSearch) return adAccounts;
    const searchLower = accountSearch.toLowerCase();
    return adAccounts.filter(acc => 
      acc.name?.toLowerCase().includes(searchLower) || 
      acc.id?.toString().includes(searchLower)
    );
  }, [adAccounts, accountSearch]);

  const { data: activeProjects } = useCompanyActiveProjects();

  const { data: campaignsData, isLoading } = useGetCampaigns({
    search: search,
    status: statusFilter,
    projectId: selectedProjectId || projectId, // Pass projectId filter
    facebookAdAccountId: fbStatus?.accountId, // Explicitly pass for query key/filtering
  });
  const { mutate: syncFacebookAds, isLoading: isSyncing } = useSyncFacebookAds();

  const campaigns = useMemo(() => {
    let filtered = campaignsData?.data || [];
    
    // Frontend search filter for instant responsiveness
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(searchLower) || 
        c.facebookAdId?.toLowerCase().includes(searchLower)
      );
    }
    
    if (branchFilter) {
      filtered = filtered.filter(c => c.branch === branchFilter || c.customFields?.branch === branchFilter);
    }

    // Sort by status - active first
    return [...filtered].sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return 0;
    });
  }, [campaignsData, branchFilter, search]);

  const handleSelectAccount = (accountId) => {
    setIsSwitchingAccount(true); // Start persistent shimmer
    selectAccount(accountId, {
      onSuccess: () => {
        toast.success("Ad Account updated. Fetching fresh data...");
        setShowAccountSelector(false);
        // Automatically trigger sync
        handleSyncFacebook(undefined);
      },
      onError: (error) => {
        setIsSwitchingAccount(false);
        toast.error(error.response?.data?.message || "Failed to update Ad Account");
      }
    });
  };

  const handleSyncFacebook = (projectId) => {
    syncFacebookAds(projectId, {
      onSuccess: (data) => {
        setIsSwitchingAccount(false); // Stop persistent shimmer
        const responseData = data.data || {};
        const created = responseData.created || 0;
        const updated = responseData.updated || 0;
        const total = created + updated;

        if (total === 0 && responseData.totalFacebookCampaigns === 0) {
          toast.error("No campaigns found for this account.");
        } else {
          toast.success(`Synced ${total} campaigns for the selected account.`);
        }

        setLastSyncedAt(new Date());
      },
      onError: (error) => {
        setIsSwitchingAccount(false); // Stop persistent shimmer
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to sync Facebook ads";
        toast.error(errorMessage, { duration: 5000 });
      },
    });
  };

  return (
    <section className="flex flex-col rounded-2xl overflow-hidden h-full bg-white select-none">
      <CampaignsHeader
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCampaigns={campaigns.length}
        // onAddCampaign={() => setIsDrawerOpen(true)}
        onSyncFacebook={() => handleSyncFacebook(undefined)}
        lastSyncedAt={lastSyncedAt}
        isClient={isClient}
        projects={activeProjects || []}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        // Facebook props
        fbStatus={fbStatus}
        adAccounts={adAccounts}
        isSelecting={isSelecting || isSwitchingAccount}
        isSyncing={isSyncing || isSwitchingAccount}
        onSelectAccount={handleSelectAccount}
      />

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <CampaignsTable campaigns={campaigns} isLoading={isLoading || isSelecting || isSyncing || isSwitchingAccount} isClient={isClient} />
        {!isLoading && !isSwitchingAccount && campaigns.length > 0 && (
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
