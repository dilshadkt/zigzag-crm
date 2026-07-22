import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import LeadsFeature from "../../../features/leads";
import Campaigns from "../../campaigns";
import { OverviewTab } from "../../../components/projects/projectOverview/OverviewTab";
import ScheduleTab from "../../../components/projects/projectOverview/ScheduleTab";
import SalesTeamTab from "./SalesTeamTab";
import LeadDashboardPage from "../LeadDashboard";
import LeadDetailsPage from "../../leads/LeadDetails";

export const ClientOverviewPage = () => {
  const { currentProject } = useOutletContext();
  return (
    <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <OverviewTab currentProject={currentProject} isClient />
    </div>
  );
};

export const ClientStatsDashboardPage = () => {
  const { handleDashboardNavigation, branches, user } = useOutletContext();
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const activeBranchFilter = selectedBranchId || user?.branchName || "";

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <LeadDashboardPage 
        viewMode="stats" 
        branchFilter={activeBranchFilter} 
        onBranchFilterChange={!user?.branchName ? setSelectedBranchId : undefined}
        branches={branches}
        onNavigateToLeads={handleDashboardNavigation} 
      />
    </div>
  );
};

export const ClientLeadsPage = () => {
  const { projectId, branches, handleSelectLead, user } = useOutletContext();
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const activeBranchFilter = selectedBranchId || user?.branchName || "";

  return (
    <LeadsFeature 
      isClient 
      projectId={projectId} 
      branchFilter={activeBranchFilter} 
      branches={branches} 
      onSelectLead={handleSelectLead} 
      onBranchFilterChange={!user?.branchName ? setSelectedBranchId : undefined} 
    />
  );
};

export const ClientFollowUpsPage = () => {
  const { projectId, branches, handleSelectLead, user } = useOutletContext();
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const activeBranchFilter = selectedBranchId || user?.branchName || "";

  return (
    <LeadsFeature 
      isClient 
      isFollowUpOnly 
      projectId={projectId} 
      branchFilter={activeBranchFilter} 
      branches={branches} 
      onSelectLead={handleSelectLead} 
      onBranchFilterChange={!user?.branchName ? setSelectedBranchId : undefined} 
    />
  );
};

export const ClientCampaignsPage = () => {
  const { projectId } = useOutletContext();
  return (
    <Campaigns isClient projectId={projectId} branchFilter={""} />
  );
};

export const ClientInsightsPage = () => {
  const { handleDashboardNavigation, branches, user } = useOutletContext();
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const activeBranchFilter = selectedBranchId || user?.branchName || "";

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <LeadDashboardPage 
        viewMode="insights" 
        branchFilter={activeBranchFilter} 
        onBranchFilterChange={!user?.branchName ? setSelectedBranchId : undefined}
        branches={branches}
        onNavigateToLeads={handleDashboardNavigation} 
      />
    </div>
  );
};

export const ClientSchedulePage = () => {
  const { currentProject } = useOutletContext();
  return (
    <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <ScheduleTab currentProject={currentProject} isClient />
    </div>
  );
};

export const ClientSalesTeamPage = () => {
  const { projectId } = useOutletContext();
  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <SalesTeamTab projectId={projectId} />
    </div>
  );
};

export const ClientLeadDetailsPage = () => {
  return (
    <div className="h-full w-full relative">
       <LeadDetailsPage isClient={true} />
    </div>
  );
};
