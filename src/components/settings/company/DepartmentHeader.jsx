import React from "react";
import { FiPlus, FiGrid } from "react-icons/fi";

const DepartmentHeader = ({ departmentsCount, onAdd }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 px-1">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold text-gray-800">Departments</h2>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold tracking-tight">
            {departmentsCount}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-gray-500">
          Configure departments for the company
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] font-bold transition-all shadow-sm hover:shadow"
        >
          <FiPlus className="w-3.5 h-3.5" />
          Add Department
        </button>
      </div>
    </div>
  );
};

export default DepartmentHeader;
