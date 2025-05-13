const NavigationTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white border-gray-200 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-2 py-3 text-sm font-medium cursor-pointer border-b-2 ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-2 py-3 text-sm font-medium cursor-pointer border-b-2 ${
              activeTab === "team"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Team
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-2 py-3 text-sm font-medium cursor-pointer border-b-2 ${
              activeTab === "tasks"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`px-2 py-3 text-sm font-medium cursor-pointer border-b-2 ${
              activeTab === "social"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Social Media
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;
