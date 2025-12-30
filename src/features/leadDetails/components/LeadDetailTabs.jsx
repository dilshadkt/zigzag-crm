const LeadDetailTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-1 lg:gap-2 bg-gray-50 p-1 rounded-xl  border-slate-100 px-1">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={` px-3 lg:px-5 py-2 rounded-2xl text-xs lg:text-sm font-semibold 
                cursor-pointer transition-all ${isActive
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

export default LeadDetailTabs;
