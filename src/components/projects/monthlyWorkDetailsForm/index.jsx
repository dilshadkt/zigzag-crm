import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import apiClient from "../../../api/client";
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

  // Sets Remaining / Extra from the tasks that already exist this month, using
  // the totals currently in the form. Nothing is saved until the form is saved.
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { projectId } = useParams();
  const handleRecalculate = async () => {
    if (!projectId || !currentMonthDetails) return;
    setIsRecalculating(true);
    try {
      const res = await apiClient.get(
        `/projects/${projectId}/monthly-work-details/${selectedMonth}/recalculate`
      );
      const slots = res.data?.slots || [];
      const next = {
        ...currentMonthDetails,
        other: [...(currentMonthDetails.other || [])],
      };
      let changed = 0;

      const recompute = (slot, { used, extraTasks }) => {
        const total = Number(slot.total) || 0;
        const count = Math.max(0, total - used);
        const extra = extraTasks + Math.max(0, used - total);
        if ((Number(slot.count) || 0) !== count || (Number(slot.extra) || 0) !== extra) {
          changed += 1;
        }
        return { ...slot, count, extra };
      };

      slots.forEach((slot) => {
        if (slot.kind === "standard") {
          if (next[slot.id]) next[slot.id] = recompute(next[slot.id], slot);
          return;
        }
        const index = next.other.findIndex(
          (entry) => String(entry._id) === slot.id
        );
        if (index >= 0) next.other[index] = recompute(next.other[index], slot);
      });

      handleMonthWorkDetailsChange(next);
      toast.success(
        changed
          ? `Updated ${changed} work type${changed > 1 ? "s" : ""} from this month's tasks. Click Save to keep the changes.`
          : "Already matches this month's tasks."
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not recalculate from tasks"
      );
    } finally {
      setIsRecalculating(false);
    }
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
        {isEditMode && projectId && (
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              title="Set Remaining and Extra from the tasks already created this month. Nothing is saved until you click Save."
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 disabled:opacity-60"
            >
              {isRecalculating ? "Recalculating..." : "Recalculate from tasks"}
            </button>
          </div>
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
