import React, { useMemo } from "react";
import { useAttendanceData } from "../hooks/useAttendanceData";

const SummaryCard = ({ title, icon, metrics, bgColor = "bg-white" }) => {
  return (
    <div
      className={`${bgColor} rounded-lg p-4 shadow-sm border border-gray-100`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-xs text-gray-600">{metric.label}</span>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {metric.value}
              </div>
              <div className={`text-xs ${metric.changeColor}`}>
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
  // Use the shared data hook for consistency with the table
  const { metrics, isLoading, error } = useAttendanceData(selectedDate);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg
                className="w-6 h-6 mx-auto"
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
            <p className="text-red-600 font-medium text-sm">
              Failed to load summary data
            </p>
            <p className="text-xs text-red-500 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Use the metrics from the shared hook (already calculated)

  // Calculate metrics based on real data from daily report
  const attendanceMetrics = [
    {
      label: "Total",
      value: formatNumber(metrics.totalEmployees),
      change: "Employees",
      changeColor: "text-blue-600",
    },
    {
      label: "Checked In",
      value: formatNumber(metrics.checkedIn),
      change: "Active",
      changeColor: "text-green-600",
    },
    {
      label: "On Break",
      value: formatNumber(metrics.onBreak),
      change: "Break",
      changeColor: "text-yellow-600",
    },
  ];

  const performanceMetrics = [
    {
      label: "Checked Out",
      value: formatNumber(metrics.checkedOut),
      change: "Completed",
      changeColor: "text-gray-600",
    },
    {
      label: "Late",
      value: formatNumber(metrics.lateArrivals),
      change: "Arrivals",
      changeColor: "text-orange-600",
    },
    {
      label: "Early",
      value: formatNumber(metrics.earlyDepartures),
      change: "Departures",
      changeColor: "text-red-600",
    },
  ];

  const timeMetrics = [
    {
      label: "Total Hours",
      value: formatHours(metrics.totalHours),
      change: "All employees",
      changeColor: "text-blue-600",
    },
    {
      label: "Average",
      value: formatHours(metrics.averageHours),
      change: "Per employee",
      changeColor: "text-green-600",
    },
    {
      label: "Overtime",
      value: formatHours(metrics.overtimeHours),
      change: "Extra hours",
      changeColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SummaryCard
        title="Attendance"
        metrics={attendanceMetrics}
        icon={
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      />
      <SummaryCard
        title="Performance"
        metrics={performanceMetrics}
        icon={
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <SummaryCard
        title="Time Tracking"
        metrics={timeMetrics}
        icon={
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
};

export default SummaryCards;
