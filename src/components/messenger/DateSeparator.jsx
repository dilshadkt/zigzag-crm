import React from "react";

const DateSeparator = ({ date, isSticky = false, className = "" }) => {
  const formatDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare only dates
    const messageDateOnly = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Yesterday";
    } else {
      // Check if it's within the current year
      if (messageDate.getFullYear() === today.getFullYear()) {
        return messageDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
      } else {
        return messageDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
    }
  };

  return (
    <div
      className={`flex items-center justify-center py-3 ${className} ${
        isSticky ? "sticky top-0 z-20" : ""
      }`}
      style={{
        background: isSticky
          ? "linear-gradient(to bottom, rgba(249, 250, 251, 0.95) 0%, rgba(249, 250, 251, 0.9) 70%, transparent 100%)"
          : "transparent",
      }}
    >
      <div className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm backdrop-blur-sm date-separator-backdrop">
        <span className="text-sm font-medium text-gray-700">
          {formatDate(date)}
        </span>
      </div>
    </div>
  );
};

export default DateSeparator;
