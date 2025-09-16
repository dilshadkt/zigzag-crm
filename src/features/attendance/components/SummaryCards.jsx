import React from "react";
import { useAttendanceAnalytics } from "../hooks/useAttendanceAnalytics";

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

const SummaryCards = ({ selectedDate, selectedPeriod }) => {
  // Use the hook to fetch attendance analytics data
  const { data, isLoading, error } = useAttendanceAnalytics(selectedPeriod);

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toString();
  };

  // Helper function to format hours
  const formatHours = (hours) => {
    if (!hours || hours === 0) return "0h";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-red-50 rounded-lg p-6 shadow-sm border border-red-200">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg
                className="w-8 h-8 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium">
              Failed to load summary data
            </p>
            <p className="text-sm text-red-500 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get analytics data
  const analytics = data?.analytics || {};

  // Calculate metrics based on real data
  const presentMetrics = [
    {
      label: "Total Records",
      value: formatNumber(analytics.totalRecords),
      change: "Current period",
      changeColor: "text-blue-600",
    },
    {
      label: "Late Arrivals",
      value: formatNumber(analytics.lateArrivals),
      change: "Late clock-ins",
      changeColor: "text-orange-600",
    },
    {
      label: "Early Departures",
      value: formatNumber(analytics.earlyDepartures),
      change: "Early clock-outs",
      changeColor: "text-yellow-600",
    },
  ];

  const notPresentMetrics = [
    {
      label: "Pending Approvals",
      value: formatNumber(analytics.pendingApprovals),
      change: "Awaiting review",
      changeColor: "text-purple-600",
    },
    {
      label: "Average Hours",
      value: formatHours(parseFloat(analytics.averageHours)),
      change: "Per employee",
      changeColor: "text-green-600",
    },
    {
      label: "Total Hours",
      value: formatHours(parseFloat(analytics.totalHours)),
      change: "All employees",
      changeColor: "text-blue-600",
    },
  ];

  const awayMetrics = [
    {
      label: "Overtime Hours",
      value: formatHours(parseFloat(analytics.totalOvertimeHours)),
      change: "Total overtime",
      changeColor: "text-red-600",
    },
    {
      label: "Period",
      value: analytics.period || "month",
      change: "Current view",
      changeColor: "text-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <SummaryCard title="Attendance Overview" metrics={presentMetrics} />
      <SummaryCard title="Performance Metrics" metrics={notPresentMetrics} />
      <SummaryCard title="Time Tracking" metrics={awayMetrics} />
    </div>
  );
};

export default SummaryCards;
