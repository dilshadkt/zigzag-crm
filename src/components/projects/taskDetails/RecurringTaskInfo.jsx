import React from "react";

const RecurringTaskInfo = ({ taskDetails }) => {
  const getRecurringPatternText = (pattern, interval) => {
    if (!pattern || pattern === "none") return "Not recurring";

    const intervalText = interval > 1 ? interval : "";
    switch (pattern) {
      case "daily":
        return `Every ${intervalText ? `${intervalText} ` : ""}${
          interval > 1 ? "days" : "day"
        }`;
      case "weekly":
        return `Every ${intervalText ? `${intervalText} ` : ""}${
          interval > 1 ? "weeks" : "week"
        }`;
      case "monthly":
        return `Every ${intervalText ? `${intervalText} ` : ""}${
          interval > 1 ? "months" : "month"
        }`;
      default:
        return "Custom recurring";
    }
  };

  if (!taskDetails?.isRecurring) return null;

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium text-blue-800">
          Recurring Task
        </span>
      </div>
      <div className="text-sm text-blue-700">
        <p>
          <strong>Pattern:</strong>{" "}
          {getRecurringPatternText(
            taskDetails.recurringPattern,
            taskDetails.recurringInterval
          )}
        </p>
        {taskDetails.recurringEndDate && (
          <p>
            <strong>Until:</strong>{" "}
            {new Date(taskDetails.recurringEndDate).toLocaleDateString()}
          </p>
        )}
        {taskDetails.maxRecurrences && (
          <p>
            <strong>Max Instances:</strong> {taskDetails.maxRecurrences}
          </p>
        )}
        {taskDetails.currentRecurrenceCount !== undefined && (
          <p>
            <strong>Created Instances:</strong>{" "}
            {taskDetails.currentRecurrenceCount}
          </p>
        )}
        {taskDetails.nextRecurrenceDate && (
          <p>
            <strong>Next Creation:</strong>{" "}
            {new Date(taskDetails.nextRecurrenceDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecurringTaskInfo;
