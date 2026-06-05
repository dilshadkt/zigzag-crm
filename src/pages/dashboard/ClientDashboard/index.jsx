import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeadsFeature from "../../../features/leads";
import Campaigns from "../../campaigns";
import { OverviewTab } from "../../../components/projects/projectOverview/OverviewTab";
import InsightsTab from "../../../components/projects/projectOverview/InsightsTab";
import ScheduleTab from "../../../components/projects/projectOverview/ScheduleTab";
import SalesTeamTab from "./SalesTeamTab";
import logo from "../../../assets/icons/logo.svg";
import { useAuth } from "../../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slice/authSlice";
import { useGetLeads } from "../../../features/leads/api";
import { useProjectDetails } from "../../../api/hooks";
import LeadDashboardPage from "../LeadDashboard";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = user?.permissions || [];
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("client_portal_tab");
    if (savedTab) {
      // Validate saved tab against permissions (followups uses leads permission)
      const permCheck = savedTab === "followups" ? "leads" : savedTab;
      if (permissions.includes(`view_${permCheck}`)) return savedTab;
    }
    if (permissions.includes("view_overview")) return "overview";
    if (permissions.includes("view_dashboard")) return "dashboard";
    if (permissions.includes("view_leads")) return "leads";
    if (permissions.includes("view_campaigns")) return "campaigns";
    return "leads";
  });

  React.useEffect(() => {
    sessionStorage.setItem("client_portal_tab", activeTab);
  }, [activeTab]);
  const dispatch = useDispatch();
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const projectId = user?.projectId || (typeof user?.project === "string" ? user?.project : user?.project?._id);
  const { data: currentProject, isLoading: projectLoading } = useProjectDetails(projectId);
  const branches = currentProject?.customFields?.branches || currentProject?.branches || (typeof user?.project === "object" ? (user.project.customFields?.branches || user.project.branches) : null) || [];
  const activeBranchFilter = selectedBranchId || user?.branchName || "";
  const { data: followUpsData } = useGetLeads({
    project: projectId,
    isFollowUp: true,
    limit: 1,
  });

  const followUpsCount = followUpsData?.pagination?.total || 0;

  const handleSelectLead = (lead) => {
    const leadId = lead?._id || lead?.id;
    if (leadId) {
      navigate(`/portal/leads/${leadId}`);
    }
  };

  const handleDashboardNavigation = (path) => {
    if (path.includes('scheduled=today')) {
      setActiveTab("followups");
    } else {
      setActiveTab("leads");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    window.location.href = "/portal/login";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden sm:flex flex-col w-64 bg-white border-r border-slate-100 z-20 shadow-sm shrink-0">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <img src={logo} alt="Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Portal</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                {user?.name || "Client Access"}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 mt-4">
            {permissions.includes("view_overview") && (
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === "overview"
                    ? "bg-blue-50/50 text-blue-600 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Overview
              </button>
            )}
            {permissions.includes("view_dashboard") && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === "dashboard"
                    ? "bg-blue-50/50 text-blue-600 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Dashboard
              </button>
            )}
            {permissions.includes("view_leads") && (
              <button
                onClick={() => setActiveTab("leads")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === "leads"
                    ? "bg-blue-50/50 text-blue-600 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Leads
              </button>
            )}
            {permissions.includes("view_leads") && (
              <button
                onClick={() => setActiveTab("followups")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === "followups"
                    ? "bg-blue-50/50 text-blue-600 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {followUpsCount > 0 && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span>}
                </div>
                Follow-ups
              </button>
            )}
            {permissions.includes("view_campaigns") && (
              <button
                onClick={() => setActiveTab("campaigns")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === "campaigns"
                    ? "bg-blue-50/50 text-blue-600 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                Campaigns
              </button>
            )}
            {permissions.includes("view_insights") && (
              <button
                onClick={() => setActiveTab("insights")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === "insights"
                    ? "bg-blue-50/50 text-blue-600 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                Insights
              </button>
            )}
            {permissions.includes("view_schedule") && (
              <button
                onClick={() => setActiveTab("schedule")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === "schedule"
                    ? "bg-blue-50/50 text-blue-600 shadow-sm border border-blue-100/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Schedule
              </button>
            )}
            {permissions.includes("view_sales_team") && (
              <button
                onClick={() => setActiveTab("sales_team")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === "sales_team"
                    ? "bg-indigo-50/60 text-indigo-600 shadow-sm border border-indigo-100/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Sales Team
              </button>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border border-transparent hover:border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#f8fafc]">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="sm:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-50 rounded-xl">
              <img src={logo} alt="Logo" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">Portal</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                {user?.name || "Client Access"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-hidden p-3 pb-[80px] sm:pb-6 sm:p-6 flex flex-col gap-3">
          <div className="flex-1 bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-200/50 overflow-hidden relative">
            {activeTab === "overview" ? (
              <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <OverviewTab currentProject={currentProject} isClient />
              </div>
            ) : activeTab === "leads" ? (
              <LeadsFeature isClient projectId={projectId} branchFilter={activeBranchFilter} branches={branches} onSelectLead={handleSelectLead} onBranchFilterChange={!user?.branchName ? setSelectedBranchId : undefined} />
            ) : activeTab === "followups" ? (
              <LeadsFeature isClient isFollowUpOnly projectId={projectId} branchFilter={activeBranchFilter} branches={branches} onSelectLead={handleSelectLead} onBranchFilterChange={!user?.branchName ? setSelectedBranchId : undefined} />
            ) : activeTab === "campaigns" ? (
              <Campaigns isClient projectId={projectId} branchFilter={""} />
            ) : activeTab === "insights" ? (
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <LeadDashboardPage viewMode="insights" branchFilter={activeBranchFilter} onNavigateToLeads={handleDashboardNavigation} />
              </div>
            ) : activeTab === "schedule" ? (
              <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <ScheduleTab currentProject={currentProject} isClient />
              </div>
            ) : activeTab === "dashboard" ? (
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <LeadDashboardPage viewMode="stats" branchFilter={activeBranchFilter} onNavigateToLeads={handleDashboardNavigation} />
              </div>
            ) : activeTab === "sales_team" ? (
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <SalesTeamTab projectId={projectId} />
              </div>
            ) : null}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <nav className="sm:hidden absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-slate-200/60 z-50 px-2 py-2 flex justify-around items-center pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {permissions.includes("view_dashboard") && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                activeTab === "dashboard" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-0.5 ${activeTab === "dashboard" ? "bg-blue-50" : ""}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </div>
              <span className="text-[10px] font-bold">Dashboard</span>
            </button>
          )}
          {permissions.includes("view_leads") && (
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                activeTab === "leads" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-0.5 ${activeTab === "leads" ? "bg-blue-50" : ""}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <span className="text-[10px] font-bold">Leads</span>
            </button>
          )}
          {permissions.includes("view_leads") && (
            <button
              onClick={() => setActiveTab("followups")}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                activeTab === "followups" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-0.5 relative ${activeTab === "followups" ? "bg-blue-50" : ""}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {followUpsCount > 0 && <span className="absolute top-1.5 right-1.5 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span></span>}
              </div>
              <span className="text-[10px] font-bold">Follow-ups</span>
            </button>
          )}
          {permissions.includes("view_insights") && (
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                activeTab === "insights" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-0.5 ${activeTab === "insights" ? "bg-blue-50" : ""}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              </div>
              <span className="text-[10px] font-bold">Insights</span>
            </button>
          )}
          {permissions.includes("view_sales_team") && (
            <button
              onClick={() => setActiveTab("sales_team")}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                activeTab === "sales_team" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-0.5 ${activeTab === "sales_team" ? "bg-indigo-50" : ""}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <span className="text-[10px] font-bold">Team</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};

export default ClientDashboard;
