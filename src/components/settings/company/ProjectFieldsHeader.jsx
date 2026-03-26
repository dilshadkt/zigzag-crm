import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { Plus } from "lucide-react";

const ProjectFieldsHeader = ({ fieldsCount, onAdd }) => {
  return (
    <div className="pb-3 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[17px] font-bold text-gray-800">
            Custom Project Fields
          </h1>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Define custom inputs for the project creation form
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {fieldsCount} Fields
          </div>
          <PrimaryButton
            title="Add New Field"
            icon={<Plus size={14} />}
            className="text-white px-3.5 py-1.5 font-bold text-[12px]"
            onclick={onAdd}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectFieldsHeader;
