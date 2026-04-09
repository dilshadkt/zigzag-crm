import React, { useState } from "react";
import LeadsFeature from "../../../features/leads";
import Campaigns from "../../campaigns";
import logo from "../../../assets/icons/logo.svg";
import { useAuth } from "../../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slice/authSlice";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("leads");
  const { user } = useAuth();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    window.location.href = "/portal/login";
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Client Dashboard Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-xl">
            <img src={logo} alt="Logo" className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Portal</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              {user?.name || "Client Access"}
            </p>
          </div>
        </div>

        <nav className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl gap-1.5 border border-slate-200/50">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              activeTab === "leads" 
                ? "bg-white text-blue-600 shadow-md transform scale-105" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Leads
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              activeTab === "campaigns" 
                ? "bg-white text-blue-600 shadow-md transform scale-105" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Campaigns
          </button>
        </nav>

        <div className="flex items-center gap-3">
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
      <main className="flex-1 overflow-hidden p-6 bg-[#f8fafc]">
        <div className="h-full bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-200/50 overflow-hidden relative">
          {activeTab === "leads" ? (
            <LeadsFeature isClient projectId={user?.projectId || user?.project} />
          ) : (
            <Campaigns isClient projectId={user?.projectId || user?.project} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
