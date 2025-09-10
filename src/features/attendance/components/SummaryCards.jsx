import React from "react";

const SummaryCard = ({ title, icon, metrics }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-600">{metric.label}</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {metric.value}
              </div>
              <div className={`text-sm ${metric.changeColor}`}>
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SummaryCards = () => {
  const presentMetrics = [
    {
      label: "On time",
      value: "265",
      change: "+ 12 vs yesterday",
      changeColor: "text-green-600",
    },
    {
      label: "Late clock-in",
      value: "62",
      change: "- 6 vs yesterday",
      changeColor: "text-red-600",
    },
    {
      label: "Early clock-in",
      value: "224",
      change: "- 6 vs yesterday",
      changeColor: "text-red-600",
    },
  ];

  const notPresentMetrics = [
    {
      label: "Absent",
      value: "42",
      change: "+ 12 vs yesterday",
      changeColor: "text-green-600",
    },
    {
      label: "No clock-in",
      value: "36",
      change: "- 6 vs yesterday",
      changeColor: "text-red-600",
    },
    {
      label: "No clock-out",
      value: "0",
      change: "0 vs yesterday",
      changeColor: "text-gray-600",
    },
    {
      label: "Invalid",
      value: "0",
      change: "0 vs yesterday",
      changeColor: "text-gray-600",
    },
  ];

  const awayMetrics = [
    {
      label: "Day off",
      value: "0",
      change: "- 2 vs yesterday",
      changeColor: "text-red-600",
    },
    {
      label: "Time off",
      value: "0",
      change: "- 6 vs yesterday",
      changeColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <SummaryCard title="Present Summary" metrics={presentMetrics} />
      <SummaryCard title="Not Present Summary" metrics={notPresentMetrics} />
      <SummaryCard title="Away Summary" metrics={awayMetrics} />
    </div>
  );
};

export default SummaryCards;
