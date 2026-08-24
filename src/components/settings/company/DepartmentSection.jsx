import React from "react";
import { FiEdit3, FiTrash2, FiGrid, FiAlertCircle } from "react-icons/fi";

const DepartmentSection = ({
  departments = [],
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-[13px] font-medium text-gray-500">
          Retrieving departments...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-800">
              Connection Error
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Could not fetch departments. {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <FiGrid className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-800 mb-1">
          No Departments
        </h3>
        <p className="text-[12px] text-gray-500 text-center max-w-sm px-6">
          Add departments to organize your company structure.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col font-sans">
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 pl-1">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
              Department Name & Description
            </h3>
          </div>
          <div className="col-span-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
              Status
            </h3>
          </div>
          <div className="col-span-2 text-right">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-tight pr-2">
              Action
            </h3>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {departments.map((department) => (
          <div
            key={department._id}
            className="px-4 py-3 hover:bg-gray-50/50 transition-all duration-200 group bg-white border-b border-gray-50 last:border-b-0"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm bg-blue-50 text-blue-500">
                    <FiGrid className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <div className="text-[13px] font-bold text-gray-800 truncate leading-tight">
                      {department.name}
                    </div>
                    {department.description && (
                      <div className="text-[11px] text-gray-500 truncate leading-tight mt-0.5">
                        {department.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight border ${
                    department.isActive
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-gray-50 text-gray-400 border-gray-100"
                  }`}
                >
                  {department.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="col-span-2 text-right">
                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1 font-sans">
                  <button
                    onClick={() => onEdit(department)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                    title="Edit Department"
                  >
                    <FiEdit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(department)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                    title="Remove Department"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/20">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
          Total Departments: {departments.length}
        </p>
      </div>
    </div>
  );
};

export default DepartmentSection;
