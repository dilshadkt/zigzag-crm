const LeadSettingsTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-100 pb-2">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-1.5 rounded-xl text-[12px] font-bold 
              cursor-pointer transition-all ${
              isActive
                ? "bg-slate-900 border border-slate-900 shadow-md shadow-slate-900/10 text-white"
                : "text-slate-400 bg-white border border-slate-100 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default LeadSettingsTabs;

