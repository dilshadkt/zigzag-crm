const LeadDetailTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-1 lg:gap-2 bg-gray-50 p-1 rounded-xl border-slate-100 px-1 w-full lg:w-auto">
      <div className="flex gap-1 lg:gap-2">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 lg:px-5 py-2 rounded-2xl text-[11px] lg:text-sm font-semibold whitespace-nowrap
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
    </div>
  );
};

export default LeadDetailTabs;
