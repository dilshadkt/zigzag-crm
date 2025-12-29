import React from "react";

const StatCard = ({ title, value, color, percent, onClick }) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    cyan: {
      bg: "bg-cyan-50",
      text: "text-cyan-600",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    pink: {
      bg: "bg-pink-50",
      text: "text-pink-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
    },
  };

  return (
    <div
      className={`${colorMap[color].bg} rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
      onClick={onClick}
    >
      <div className={`text-2xl font-bold ${colorMap[color].text}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
      {typeof percent === "number" && (
        <div className="text-xs text-gray-400 mt-1">{percent}%</div>
      )}
    </div>
  );
};

export default StatCard;
