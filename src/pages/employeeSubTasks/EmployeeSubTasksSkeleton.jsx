import React from "react";

const EmployeeSubTasksSkeleton = () => {
  return (
    <ul className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <li
          key={i}
          className="p-4 bg-white rounded-xl border border-gray-200 animate-pulse"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-5 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-1">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
          <div className="mt-2 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default EmployeeSubTasksSkeleton;


