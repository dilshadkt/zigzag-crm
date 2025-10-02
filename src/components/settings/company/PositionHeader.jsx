import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";

const PositionHeader = ({ positionsCount, onAdd }) => {
  return (
    <div className="mb-2 px-2 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Position Management
          </h1>
          <p className="mt-0.5 text-xs text-gray-600">
            Manage company positions and their access permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            {positionsCount} positions
          </div>
          <PrimaryButton
            title="Add New Position"
            className="text-xs text-white px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow"
            onclick={onAdd}
          />
        </div>
      </div>
    </div>
  );
};

export default PositionHeader;
