import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";

const WorkDetailsForm = ({ values, setFieldValue, errors, touched }) => {
  const [showOtherWorkType, setShowOtherWorkType] = useState(false);
  const [newWorkType, setNewWorkType] = useState({
    name: "",
    count: 0,
  });
  // Handle change for main work types
  const handleWorkDetailChange = (workType, field, value) => {
    const updatedWorkDetails = { ...values.workDetails };

    if (!updatedWorkDetails[workType]) {
      updatedWorkDetails[workType] = {
        count: 0,
      };
    }

    updatedWorkDetails[workType][field] = value;
    setFieldValue("workDetails", updatedWorkDetails);
  };

  // Add new work type to the "other" array
  const handleAddOtherWorkType = () => {
    if (!newWorkType.name) return;

    const updatedWorkDetails = { ...values.workDetails };
    if (!updatedWorkDetails.other) {
      updatedWorkDetails.other = [];
    }

    updatedWorkDetails.other.push({ ...newWorkType });
    setFieldValue("workDetails", updatedWorkDetails);
    setNewWorkType({ name: "", count: 0 });
    setShowOtherWorkType(false);
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
      reels: { count: 0 },
      poster: { count: 0 },
      motionPoster: { count: 0 },
      shooting: { count: 0 },
      motionGraphics: { count: 0 },
      other: [],
    };
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Reels */}
        <div className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h6 className="font-medium text-sm">Reels</h6>
            <input
              name="reels-count"
              type="number"
              value={values.workDetails?.reels?.count || 0}
              onChange={(e) =>
                handleWorkDetailChange(
                  "reels",
                  "count",
                  parseInt(e.target.value)
                )
              }
              placeholder="Count"
              className="w-24 px-2 py-1 border rounded border-gray-200 text-gray-600"
            />
          </div>
        </div>

        {/* Poster */}
        <div className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h6 className="font-medium text-sm">Posters</h6>
            <input
              name="poster-count"
              type="number"
              value={values.workDetails?.poster?.count || 0}
              onChange={(e) =>
                handleWorkDetailChange(
                  "poster",
                  "count",
                  parseInt(e.target.value)
                )
              }
              placeholder="Count"
              className="w-24 px-2 py-1 border rounded border-gray-200 text-gray-600"
            />
          </div>
        </div>

        {/* Motion Poster */}
        <div className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h6 className="font-medium text-sm">Motion Posters</h6>
            <input
              name="motionPoster-count"
              type="number"
              value={values.workDetails?.motionPoster?.count || 0}
              onChange={(e) =>
                handleWorkDetailChange(
                  "motionPoster",
                  "count",
                  parseInt(e.target.value)
                )
              }
              placeholder="Count"
              className="w-24 px-2 py-1 border rounded border-gray-200 text-gray-600"
            />
          </div>
        </div>

        {/* Shooting */}
        <div className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h6 className="font-medium text-sm">Shooting</h6>
            <input
              name="shooting-count"
              type="number"
              value={values.workDetails?.shooting?.count || 0}
              onChange={(e) =>
                handleWorkDetailChange(
                  "shooting",
                  "count",
                  parseInt(e.target.value)
                )
              }
              placeholder="Count"
              className="w-24 px-2 py-1 border rounded border-gray-200 text-gray-600"
            />
          </div>
        </div>

        {/* Motion Graphics */}
        <div className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h6 className="font-medium text-sm">Motion Graphics</h6>
            <input
              name="motionGraphics-count"
              type="number"
              value={values.workDetails?.motionGraphics?.count || 0}
              onChange={(e) =>
                handleWorkDetailChange(
                  "motionGraphics",
                  "count",
                  parseInt(e.target.value)
                )
              }
              placeholder="Count"
              className="w-24 px-2 py-1 border rounded border-gray-200 text-gray-600"
            />
          </div>
        </div>
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
          {values.workDetails?.other?.map((item, index) => (
            <div key={index} className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm relative">
              <button
                type="button"
                onClick={() => handleRemoveOtherWorkType(index)}
                className="absolute right-2 top-2 text-red-500 p-1 text-sm"
              >
                ✕
              </button>
              <div className="flex items-center justify-between">
                <h6 className="font-medium text-sm">{item.name}</h6>
                <input
                  name={`other-${index}-count`}
                  type="number"
                  value={item.count}
                  onChange={(e) => {
                    const updatedWorkDetails = { ...values.workDetails };
                    updatedWorkDetails.other[index].count = parseInt(
                      e.target.value
                    );
                    setFieldValue("workDetails", updatedWorkDetails);
                  }}
                  placeholder="Count"
                  className="w-24 px-2 py-1 border rounded border-gray-200 text-gray-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add new work type form */}
      {showOtherWorkType && (
        <div className="border p-4 rounded-lg border-gray-200 bg-gray-50 mt-4">
          <h6 className="font-medium text-sm mb-3">Add New Work Type</h6>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              name="new-work-type-name"
              value={newWorkType.name}
              onChange={(e) =>
                setNewWorkType({ ...newWorkType, name: e.target.value })
              }
              placeholder="Work type name"
              className="px-2 py-1 border rounded"
            />
            <input
              name="new-work-type-count"
              type="number"
              value={newWorkType.count}
              onChange={(e) =>
                setNewWorkType({
                  ...newWorkType,
                  count: parseInt(e.target.value),
                })
              }
              placeholder="Number of items"
              className="px-2 py-1 border rounded"
            />
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
