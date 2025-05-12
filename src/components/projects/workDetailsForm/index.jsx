import React, { useState, useRef } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";

const WorkDetailsForm = ({ values, setFieldValue, errors, touched, isEditMode = false }) => {
  const [showOtherWorkType, setShowOtherWorkType] = useState(false);
  const [newWorkType, setNewWorkType] = useState({
    name: "",
    count: 0,
    total: 0,
  });
  const formRef = useRef(null);

  // Handle change for main work types
  const handleWorkDetailChange = (workType, field, value) => {
    const updatedWorkDetails = { ...values.workDetails };

    if (!updatedWorkDetails[workType]) {
      updatedWorkDetails[workType] = {
        count: 0,
        total: 0,
      };
    }

    updatedWorkDetails[workType][field] = value;
    
    // In create mode, set total equal to count
    if (!isEditMode && field === 'count') {
      updatedWorkDetails[workType].total = value;
    }

    setFieldValue("workDetails", updatedWorkDetails);
  };

  // Add new work type to the "other" array
  const handleAddOtherWorkType = () => {
    if (!newWorkType.name) return;

    const updatedWorkDetails = { ...values.workDetails };
    if (!updatedWorkDetails.other) {
      updatedWorkDetails.other = [];
    }

    // In create mode, set total equal to count
    if (!isEditMode) {
      newWorkType.total = newWorkType.count;
    }

    updatedWorkDetails.other.push({ ...newWorkType });
    setFieldValue("workDetails", updatedWorkDetails);
    setNewWorkType({ name: "", count: 0, total: 0 });
    setShowOtherWorkType(false);
  };

  const handleShowOtherWorkType = () => {
    setShowOtherWorkType(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Remove a work type from the "other" array
  const handleRemoveOtherWorkType = (index) => {
    const updatedWorkDetails = { ...values.workDetails };
    updatedWorkDetails.other.splice(index, 1);
    setFieldValue("workDetails", updatedWorkDetails);
  };

  // Initialize workDetails if undefined
  if (!values.workDetails) {
    values.workDetails = {
      reels: { count: 0, total: 0 },
      poster: { count: 0, total: 0 },
      motionPoster: { count: 0, total: 0 },
      shooting: { count: 0, total: 0 },
      motionGraphics: { count: 0, total: 0 },
      other: [],
    };
  }

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
                value={values.workDetails?.[workType]?.total || 0}
                onChange={(e) =>
                  handleWorkDetailChange(
                    workType,
                    "total",
                    parseInt(e.target.value)
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
              value={values.workDetails?.[workType]?.count || 0}
              onChange={(e) =>
                handleWorkDetailChange(
                  workType,
                  "count",
                  parseInt(e.target.value)
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

  return (
    <div className="flex flex-col gap-y-4">
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
            onclick={handleShowOtherWorkType}
            className="text-white px-3 py-1.5 text-sm"
          />
        </div>

        {/* List of other work types */}
        <div className="grid grid-cols-2 gap-4">
          {values.workDetails?.other?.map((item, index) => (
            <div key={index} className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm relative">
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
                        onChange={(e) => {
                          const updatedWorkDetails = { ...values.workDetails };
                          updatedWorkDetails.other[index].total = parseInt(e.target.value);
                          setFieldValue("workDetails", updatedWorkDetails);
                        }}
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
                      value={item.count}
                      onChange={(e) => {
                        const updatedWorkDetails = { ...values.workDetails };
                        updatedWorkDetails.other[index].count = parseInt(e.target.value);
                        if (!isEditMode) {
                          updatedWorkDetails.other[index].total = parseInt(e.target.value);
                        }
                        setFieldValue("workDetails", updatedWorkDetails);
                      }}
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
      </div>

      {/* Add new work type form */}
      {showOtherWorkType && (
        <div ref={formRef} className="border p-4 rounded-lg border-gray-200 bg-gray-50 mt-4">
          <h6 className="font-medium text-sm mb-3">Add New Work Type</h6>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              name="new-work-type-name"
              value={newWorkType.name}
              onChange={(e) =>
                setNewWorkType({ ...newWorkType, name: e.target.value })
              }
              placeholder="Work type name"
              className="p-2 border border-gray-200 rounded"
            />
            <div className="flex gap-2">
              {isEditMode && (
                <input
                  name="new-work-type-total"
                  type="number"
                  value={newWorkType.total}
                  onChange={(e) =>
                    setNewWorkType({
                      ...newWorkType,
                      total: parseInt(e.target.value),
                    })
                  }
                  placeholder="Total items"
                  className="px-2 py-1 border border-gray-200 rounded"
                />
              )}
              <input
                name="new-work-type-count"
                type="number"
                value={newWorkType.count}
                onChange={(e) =>
                  setNewWorkType({
                    ...newWorkType,
                    count: parseInt(e.target.value),
                    ...(isEditMode ? {} : { total: parseInt(e.target.value) }),
                  })
                }
                placeholder="Number of items"
                className="px-2 py-1 border border-gray-200 rounded"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <PrimaryButton
              title="Cancel"
              onclick={() => setShowOtherWorkType(false)}
              className="bg-gray-200 text-gray-800 px-3 py-1.5 text-sm"
            />
            <PrimaryButton
              title="Add"
              onclick={handleAddOtherWorkType}
              className="text-white px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkDetailsForm;
