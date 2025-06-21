import React, { useState, useEffect } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";

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
  const [showOtherWorkType, setShowOtherWorkType] = useState(false);
  const [newWorkType, setNewWorkType] = useState({
    name: "",
    count: 0,
    total: 0,
  });

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
            count: Math.ceil((item.total || 0) / totalMonths),
            total: Math.ceil((item.total || 0) / totalMonths),
            completed: Math.ceil((item.completed || 0) / totalMonths),
            extra: Math.ceil((item.extra || 0) / totalMonths),
            description: item.description || "",
          })) || [],
      }));

      setFieldValue("workDetails", convertedWorkDetails);
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

  // Handle change for main work types
  const handleWorkDetailChange = (workType, field, value) => {
    if (!currentMonthDetails) return;

    const updatedWorkDetails = [...values.workDetails];
    const monthIndex = updatedWorkDetails.findIndex(
      (details) => details.month === selectedMonth
    );

    if (monthIndex === -1) return;

    if (!updatedWorkDetails[monthIndex][workType]) {
      updatedWorkDetails[monthIndex][workType] = {
        count: 0,
        total: 0,
        completed: 0,
        extra: 0,
        description: "",
      };
    }

    updatedWorkDetails[monthIndex][workType][field] = value;

    // In create mode, set total equal to count
    if (!isEditMode && field === "count") {
      updatedWorkDetails[monthIndex][workType].total = value;
    }

    setFieldValue("workDetails", updatedWorkDetails);
  };

  // Add new work type to the "other" array
  const handleAddOtherWorkType = () => {
    if (!newWorkType.name || !currentMonthDetails) return;

    const updatedWorkDetails = [...values.workDetails];
    const monthIndex = updatedWorkDetails.findIndex(
      (details) => details.month === selectedMonth
    );

    if (monthIndex === -1) return;

    if (!updatedWorkDetails[monthIndex].other) {
      updatedWorkDetails[monthIndex].other = [];
    }

    // In create mode, set total equal to count
    if (!isEditMode) {
      newWorkType.total = newWorkType.count;
    }

    updatedWorkDetails[monthIndex].other.push({ ...newWorkType });
    setFieldValue("workDetails", updatedWorkDetails);
    setNewWorkType({ name: "", count: 0, total: 0 });
    setShowOtherWorkType(false);
  };

  // Remove a work type from the "other" array
  const handleRemoveOtherWorkType = (index) => {
    if (!currentMonthDetails) return;

    const updatedWorkDetails = [...values.workDetails];
    const monthIndex = updatedWorkDetails.findIndex(
      (details) => details.month === selectedMonth
    );

    if (monthIndex === -1) return;

    updatedWorkDetails[monthIndex].other.splice(index, 1);
    setFieldValue("workDetails", updatedWorkDetails);
  };

  // Handle other work type change
  const handleOtherWorkTypeChange = (index, field, value) => {
    if (!currentMonthDetails) return;

    const updatedWorkDetails = [...values.workDetails];
    const monthIndex = updatedWorkDetails.findIndex(
      (details) => details.month === selectedMonth
    );

    if (monthIndex === -1) return;

    updatedWorkDetails[monthIndex].other[index][field] = value;

    if (!isEditMode && field === "count") {
      updatedWorkDetails[monthIndex].other[index].total = value;
    }

    setFieldValue("workDetails", updatedWorkDetails);
  };

  const renderWorkTypeCard = (title, workType) => (
    <div className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h6 className="font-medium text-sm">{title}</h6>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Total:</span>
              <input
                name={`${workType}-total`}
                type="number"
                value={currentMonthDetails?.[workType]?.total || 0}
                onChange={(e) =>
                  handleWorkDetailChange(
                    workType,
                    "total",
                    parseInt(e.target.value) || 0
                  )
                }
                placeholder="Total"
                className="w-20 px-2 py-1 border rounded border-gray-200 text-gray-600"
              />
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Balance:</span>
            <input
              name={`${workType}-count`}
              type="number"
              value={currentMonthDetails?.[workType]?.count || 0}
              onChange={(e) =>
                handleWorkDetailChange(
                  workType,
                  "count",
                  parseInt(e.target.value) || 0
                )
              }
              placeholder="Balance"
              className="w-20 px-2 py-1 border rounded border-gray-200 text-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );

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

      <div className="grid grid-cols-2 gap-4">
        {renderWorkTypeCard("Reels", "reels")}
        {renderWorkTypeCard("Posters", "poster")}
        {renderWorkTypeCard("Motion Posters", "motionPoster")}
        {renderWorkTypeCard("Shooting", "shooting")}
        {renderWorkTypeCard("Motion Graphics", "motionGraphics")}
      </div>

      {/* Other Work Types */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-3">
          <h6 className="font-medium text-sm">Other Work Types</h6>
          <PrimaryButton
            title="Add Type"
            onclick={() => setShowOtherWorkType(true)}
            className="text-white px-3 py-1.5 text-sm"
          />
        </div>

        {/* List of other work types */}
        <div className="grid grid-cols-2 gap-4">
          {currentMonthDetails.other?.map((item, index) => (
            <div
              key={index}
              className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm relative"
            >
              <div className="flex items-center justify-between">
                <h6 className="font-medium text-sm">{item.name}</h6>
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Total:</span>
                      <input
                        name={`other-${index}-total`}
                        type="number"
                        value={item.total || 0}
                        onChange={(e) =>
                          handleOtherWorkTypeChange(
                            index,
                            "total",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Total"
                        className="w-20 px-2 py-1 border rounded border-gray-200 text-gray-600"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Balance:</span>
                    <input
                      name={`other-${index}-count`}
                      type="number"
                      value={item.count || 0}
                      onChange={(e) =>
                        handleOtherWorkTypeChange(
                          index,
                          "count",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Balance"
                      className="w-20 px-2 py-1 border rounded border-gray-200 text-gray-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOtherWorkType(index)}
                    className="cursor-pointer text-red-500 p-1 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add new other work type form */}
        {showOtherWorkType && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h6 className="font-medium text-sm mb-3">Add New Work Type</h6>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Work Type Name"
                value={newWorkType.name}
                onChange={(e) =>
                  setNewWorkType({ ...newWorkType, name: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Count"
                value={newWorkType.count}
                onChange={(e) =>
                  setNewWorkType({
                    ...newWorkType,
                    count: parseInt(e.target.value) || 0,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <PrimaryButton
                  title="Add"
                  onclick={handleAddOtherWorkType}
                  className="text-white px-4 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowOtherWorkType(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyWorkDetailsForm;
