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
          ? template.other.filter((item) => Number(item.total) > 0).map((item) => ({
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

  const parsed = parseMonthKey(selectedMonth);
  const previousMonth = (values.workDetails || [])
    .filter((wd) => wd.month && wd.month < selectedMonth)
    .sort((a, b) => (a.month > b.month ? -1 : 1))[0];
  const previousMonthName = previousMonth
    ? parseMonthKey(previousMonth.month).name
    : null;

  if (!currentMonthDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="rounded-xl border border-gray-100 bg-[#F7F9FC] px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <h5 className="text-sm font-semibold text-gray-900">{parsed.name}</h5>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900"
          >
            Next
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-center text-[11px] text-gray-500">
          {previousMonthName
            ? `Starts from ${previousMonthName}. Change the numbers only if this month is different.`
            : "Set the monthly package for this project."}
        </p>
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
