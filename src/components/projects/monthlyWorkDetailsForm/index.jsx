import React, { useState, useEffect, useCallback } from "react";
import CategoryQuotaSection from "../workDetailsForm/CategoryQuotaSection";

const MonthlyWorkDetailsForm = ({
  values,
  setFieldValue,
  errors,
  touched,
  isEditMode = false,
  projectStartDate,
  projectEndDate,
}) => {
  // Default to current month
  const now = new Date();
  const defaultMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthKey);

  // Parse "YYYY-MM" → { year, month (1-12), name }
  const parseMonthKey = (key) => {
    const [yearStr, monthStr] = key.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const date = new Date(year, month - 1, 1);
    return {
      key,
      year,
      month,
      name: date.toLocaleString("default", { month: "long", year: "numeric" }),
    };
  };

  // Navigate to previous / next month
  const navigateMonth = (direction) => {
    const parsed = parseMonthKey(selectedMonth);
    const date = new Date(parsed.year, parsed.month - 1 + direction, 1);
    const newKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    setSelectedMonth(newKey);
  };

  // Create an empty month entry, optionally copying totals from a template month.
  const createMonthEntry = useCallback(
    (monthKey, template) => {
      const parsed = parseMonthKey(monthKey);
      const copySlot = (src) => ({
        count: (src && src.total) || 0,
        total: (src && src.total) || 0,
        completed: 0,
        extra: 0,
        description: (src && src.description) || "",
      });

      return {
        month: monthKey,
        year: parsed.year,
        monthNumber: parsed.month,
        reels: copySlot(template?.reels),
        poster: copySlot(template?.poster),
        motionPoster: copySlot(template?.motionPoster),
        shooting: copySlot(template?.shooting),
        motionGraphics: copySlot(template?.motionGraphics),
        other: Array.isArray(template?.other)
          ? template.other.map((item) => ({
              name: item.name,
              taskCategory: item.taskCategory || null,
              count: item.total || 0,
              total: item.total || 0,
              completed: 0,
              extra: 0,
              description: item.description || "",
            }))
          : [],
      };
    },
    []
  );

  // Ensure the workDetails array exists and the selected month is present
  useEffect(() => {
    if (!values.workDetails) {
      setFieldValue("workDetails", []);
      return;
    }

    // Convert legacy single-object workDetails to array
    if (!Array.isArray(values.workDetails)) {
      const oldWd = values.workDetails;
      const entry = createMonthEntry(selectedMonth, oldWd);
      setFieldValue("workDetails", [entry]);
      return;
    }

    // If the selected month doesn't exist in the array yet, create it
    const exists = values.workDetails.some(
      (wd) => wd.month === selectedMonth
    );
    if (!exists) {
      // Find most recent month before selectedMonth as template
      const sorted = values.workDetails
        .filter((wd) => wd.month && wd.month < selectedMonth)
        .sort((a, b) => (a.month > b.month ? -1 : 1));
      const template = sorted.length > 0 ? sorted[0] : null;
      const newEntry = createMonthEntry(selectedMonth, template);
      setFieldValue("workDetails", [...values.workDetails, newEntry]);
    }
  }, [selectedMonth, values.workDetails, setFieldValue, createMonthEntry]);

  // Get current month's work details
  const getCurrentMonthDetails = () => {
    if (!selectedMonth || !values.workDetails) return null;
    if (!Array.isArray(values.workDetails)) return null;
    return values.workDetails.find(
      (details) => details.month === selectedMonth
    );
  };

  const currentMonthDetails = getCurrentMonthDetails();

  const handleMonthWorkDetailsChange = (nextMonthDetails) => {
    if (!selectedMonth) return;
    const updatedWorkDetails = [...values.workDetails];
    const monthIndex = updatedWorkDetails.findIndex(
      (details) => details.month === selectedMonth
    );
    if (monthIndex === -1) return;
    updatedWorkDetails[monthIndex] = {
      ...updatedWorkDetails[monthIndex],
      ...nextMonthDetails,
      month: selectedMonth,
    };
    setFieldValue("workDetails", updatedWorkDetails);
  };

  const handleSyncFromPrevious = () => {
    const sorted = values.workDetails
      .filter((wd) => wd.month && wd.month < selectedMonth)
      .sort((a, b) => (a.month > b.month ? -1 : 1));
    const prevMonth = sorted.length > 0 ? sorted[0] : null;
    
    if (!prevMonth) {
      alert("No previous month found to sync from.");
      return;
    }

    if (window.confirm("This will copy quota limits (totals) from the previous month. Existing extra work counts will be preserved. Proceed?")) {
      const updatedWorkDetails = [...values.workDetails];
      const monthIndex = updatedWorkDetails.findIndex(
        (details) => details.month === selectedMonth
      );
      if (monthIndex === -1) return;

      const current = updatedWorkDetails[monthIndex];
      const nextDetails = { ...current };

      const syncSlot = (key) => {
        const prevTotal = prevMonth[key]?.total || 0;
        nextDetails[key] = {
          ...(current[key] || {}),
          total: prevTotal,
          count: prevTotal, // Reset balance to new total
        };
      };

      syncSlot("reels");
      syncSlot("poster");
      syncSlot("motionPoster");
      syncSlot("shooting");
      syncSlot("motionGraphics");

      // Sync other array
      const nextOther = [...(current.other || [])];
      (prevMonth.other || []).forEach(prevItem => {
        const prevTotal = prevItem.total || 0;
        const existingIdx = nextOther.findIndex(i => String(i.name || "").toLowerCase() === String(prevItem.name || "").toLowerCase());
        
        if (existingIdx >= 0) {
          nextOther[existingIdx] = {
            ...nextOther[existingIdx],
            total: prevTotal,
            count: prevTotal,
          };
        } else if (prevTotal > 0) {
          nextOther.push({
            name: prevItem.name,
            taskCategory: prevItem.taskCategory || null,
            total: prevTotal,
            count: prevTotal,
            completed: 0,
            extra: 0,
            description: prevItem.description || "",
          });
        }
      });
      nextDetails.other = nextOther;
      
      updatedWorkDetails[monthIndex] = nextDetails;
      setFieldValue("workDetails", updatedWorkDetails);
    }
  };

  const parsed = parseMonthKey(selectedMonth);

  if (!currentMonthDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Month Navigator (prev / current / next) */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Prev
        </button>

        <h5 className="text-base font-semibold text-gray-800">
          {parsed.name}
        </h5>

        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Next
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Current Month Header */}
      <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
        <h5 className="font-semibold text-blue-800">
          Work Details for {parsed.name}
        </h5>
        {isEditMode && values.workDetails.filter((wd) => wd.month && wd.month < selectedMonth).length > 0 && (
          <button
            type="button"
            onClick={handleSyncFromPrevious}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync from Previous Month
          </button>
        )}
      </div>

      <CategoryQuotaSection
        workDetails={currentMonthDetails}
        onChange={handleMonthWorkDetailsChange}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default MonthlyWorkDetailsForm;
