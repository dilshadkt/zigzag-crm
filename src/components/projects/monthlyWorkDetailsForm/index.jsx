import React, { useState, useEffect } from "react";
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
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Generate months between start and end date
  const generateMonths = () => {
    if (!projectStartDate || !projectEndDate) return [];

    const months = [];
    const start = new Date(projectStartDate);
    const end = new Date(projectEndDate);

    const current = new Date(start);
    current.setDate(1); // Start from first day of month

    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, "0")}`;
      const monthName = current.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      months.push({
        key: monthKey,
        name: monthName,
        year,
        month,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const months = generateMonths();

  // Initialize monthly work details if not exists
  useEffect(() => {
    // Handle both old (single object) and new (array) work details structures
    if (!values.workDetails) {
      // No work details at all - initialize empty array
      const initialWorkDetails = months.map((month) => ({
        month: month.key,
        year: month.year,
        monthNumber: month.month,
        reels: { count: 0, total: 0, completed: 0, extra: 0, description: "" },
        poster: { count: 0, total: 0, completed: 0, extra: 0, description: "" },
        motionPoster: {
          count: 0,
          total: 0,
          completed: 0,
          extra: 0,
          description: "",
        },
        shooting: {
          count: 0,
          total: 0,
          completed: 0,
          extra: 0,
          description: "",
        },
        motionGraphics: {
          count: 0,
          total: 0,
          completed: 0,
          extra: 0,
          description: "",
        },
        other: [],
      }));
      setFieldValue("workDetails", initialWorkDetails);
    } else if (!Array.isArray(values.workDetails)) {
      // Old structure - convert single object to monthly array
      const oldWorkDetails = values.workDetails;
      const totalMonths = months.length;

      const convertedWorkDetails = months.map((month) => ({
        month: month.key,
        year: month.year,
        monthNumber: month.month,
        reels: {
          count: Math.ceil((oldWorkDetails.reels?.total || 0) / totalMonths),
          total: Math.ceil((oldWorkDetails.reels?.total || 0) / totalMonths),
          completed: Math.ceil(
            (oldWorkDetails.reels?.completed || 0) / totalMonths
          ),
          extra: Math.ceil((oldWorkDetails.reels?.extra || 0) / totalMonths),
          description: oldWorkDetails.reels?.description || "",
        },
        poster: {
          count: Math.ceil((oldWorkDetails.poster?.total || 0) / totalMonths),
          total: Math.ceil((oldWorkDetails.poster?.total || 0) / totalMonths),
          completed: Math.ceil(
            (oldWorkDetails.poster?.completed || 0) / totalMonths
          ),
          extra: Math.ceil((oldWorkDetails.poster?.extra || 0) / totalMonths),
          description: oldWorkDetails.poster?.description || "",
        },
        motionPoster: {
          count: Math.ceil(
            (oldWorkDetails.motionPoster?.total || 0) / totalMonths
          ),
          total: Math.ceil(
            (oldWorkDetails.motionPoster?.total || 0) / totalMonths
          ),
          completed: Math.ceil(
            (oldWorkDetails.motionPoster?.completed || 0) / totalMonths
          ),
          extra: Math.ceil(
            (oldWorkDetails.motionPoster?.extra || 0) / totalMonths
          ),
          description: oldWorkDetails.motionPoster?.description || "",
        },
        shooting: {
          count: Math.ceil((oldWorkDetails.shooting?.total || 0) / totalMonths),
          total: Math.ceil((oldWorkDetails.shooting?.total || 0) / totalMonths),
          completed: Math.ceil(
            (oldWorkDetails.shooting?.completed || 0) / totalMonths
          ),
          extra: Math.ceil((oldWorkDetails.shooting?.extra || 0) / totalMonths),
          description: oldWorkDetails.shooting?.description || "",
        },
        motionGraphics: {
          count: Math.ceil(
            (oldWorkDetails.motionGraphics?.total || 0) / totalMonths
          ),
          total: Math.ceil(
            (oldWorkDetails.motionGraphics?.total || 0) / totalMonths
          ),
          completed: Math.ceil(
            (oldWorkDetails.motionGraphics?.completed || 0) / totalMonths
          ),
          extra: Math.ceil(
            (oldWorkDetails.motionGraphics?.extra || 0) / totalMonths
          ),
          description: oldWorkDetails.motionGraphics?.description || "",
        },
        other:
          oldWorkDetails.other?.map((item) => ({
            name: item.name,
            taskCategory: item.taskCategory || null,
            count: Math.ceil((item.total || 0) / totalMonths),
            total: Math.ceil((item.total || 0) / totalMonths),
            completed: Math.ceil((item.completed || 0) / totalMonths),
            extra: Math.ceil((item.extra || 0) / totalMonths),
            description: item.description || "",
          })) || [],
      }));

      setFieldValue("workDetails", convertedWorkDetails);
    } else if (Array.isArray(values.workDetails)) {
      // Check if any months are missing and append them
      const missingMonths = months.filter(
        (m) => !values.workDetails.some((wd) => wd.month === m.key)
      );

      if (missingMonths.length > 0) {
        // Find a template month to copy structure from, preferably the first one
        const templateMonth = values.workDetails.length > 0 ? values.workDetails[0] : null;

        const newMonthsData = missingMonths.map((month) => {
          if (templateMonth) {
            const newMonth = JSON.parse(JSON.stringify(templateMonth));
            newMonth.month = month.key;
            newMonth.year = month.year;
            newMonth.monthNumber = month.month;
            
            // Reset all counters to 0
            Object.keys(newMonth).forEach((key) => {
              if (
                typeof newMonth[key] === "object" &&
                newMonth[key] !== null &&
                "completed" in newMonth[key]
              ) {
                newMonth[key].completed = 0;
                newMonth[key].extra = 0;
                newMonth[key].count = newMonth[key].total || 0;
              }
            });
            if (Array.isArray(newMonth.other)) {
              newMonth.other.forEach((item) => {
                item.completed = 0;
                item.extra = 0;
                item.count = item.total || 0;
              });
            }
            return newMonth;
          } else {
            // Default empty structure if no template available
            return {
              month: month.key,
              year: month.year,
              monthNumber: month.month,
              reels: { count: 0, total: 0, completed: 0, extra: 0, description: "" },
              poster: { count: 0, total: 0, completed: 0, extra: 0, description: "" },
              motionPoster: {
                count: 0,
                total: 0,
                completed: 0,
                extra: 0,
                description: "",
              },
              shooting: {
                count: 0,
                total: 0,
                completed: 0,
                extra: 0,
                description: "",
              },
              motionGraphics: {
                count: 0,
                total: 0,
                completed: 0,
                extra: 0,
                description: "",
              },
              other: [],
            };
          }
        });

        setFieldValue("workDetails", [...values.workDetails, ...newMonthsData]);
      }
    }

    // Set first month as selected by default
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0].key);
    }
  }, [months, values.workDetails, setFieldValue, selectedMonth]);

  // Get current month's work details
  const getCurrentMonthDetails = () => {
    if (!selectedMonth || !values.workDetails) return null;

    // Handle case where workDetails is not yet an array (during conversion)
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

  if (!currentMonthDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Month Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <select
          value={selectedMonth || ""}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map((month) => (
            <option key={month.key} value={month.key}>
              {month.name}
            </option>
          ))}
        </select>
      </div>

      {/* Current Month Header */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <h5 className="font-semibold text-blue-800">
          Work Details for {months.find((m) => m.key === selectedMonth)?.name}
        </h5>
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
