const LeadSettingsTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-5 py-2 rounded-2xl text-sm font-semibold 
              cursor-pointer transition-colors ${
              isActive
                ? "bg-white shadow text-slate-900"
                : "text-slate-500 hover:text-slate-800"
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

