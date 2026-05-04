import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeadsFeature from "../../../features/leads";
import Campaigns from "../../campaigns";
import logo from "../../../assets/icons/logo.svg";
import { useAuth } from "../../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slice/authSlice";
import { useGetLeads } from "../../../features/leads/api";
import { useProjectDetails } from "../../../api/hooks";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("leads");
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const projectId = user?.projectId || user?.project;
  const { data: currentProject } = useProjectDetails(projectId);
  const branches = currentProject?.customFields?.branches || [];
  const activeBranchFilter = user?.branchName || selectedBranchId;

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

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    window.location.href = "/portal/login";
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Client Dashboard Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 shadow-sm z-10 gap-3 sm:gap-0">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-50 rounded-xl">
              <img src={logo} alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">Portal</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                {user?.name || "Client Access"}
              </p>
            </div>
          </div>

          {/* Logout on small screens */}
          <button 
            onClick={handleLogout}
            className="sm:hidden flex items-center gap-1.5 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 border border-transparent hover:border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs font-bold">Logout</span>
          </button>
        </div>

        <nav className="flex items-center bg-slate-100/80 p-1 rounded-xl sm:rounded-2xl gap-1 border border-slate-200/50 w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 ${
              activeTab === "leads" 
                ? "bg-white text-blue-600 shadow-md transform scale-105" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Leads
          </button>
          <button
            onClick={() => setActiveTab("followups")}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 ${
              activeTab === "followups" 
                ? "bg-white text-blue-600 shadow-md transform scale-105" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Follow-ups ({followUpsCount})
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 ${
              activeTab === "campaigns" 
                ? "bg-white text-blue-600 shadow-md transform scale-105" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Campaigns
          </button>
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          {branches.length > 0 && !user?.branchName && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-xl shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-w-[160px] cursor-pointer bg-white"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id || b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 px-5 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border border-transparent hover:border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-3 sm:p-6 bg-[#f8fafc] flex flex-col gap-3">
        <div className="flex-1 bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-200/50 overflow-hidden relative">
          {activeTab === "leads" ? (
            <LeadsFeature isClient projectId={projectId} branchFilter={activeBranchFilter} branches={branches} onSelectLead={handleSelectLead} />
          ) : activeTab === "followups" ? (
            <LeadsFeature isClient isFollowUpOnly projectId={projectId} branchFilter={activeBranchFilter} branches={branches} onSelectLead={handleSelectLead} />
          ) : (
            <Campaigns isClient projectId={projectId} branchFilter={activeBranchFilter} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
