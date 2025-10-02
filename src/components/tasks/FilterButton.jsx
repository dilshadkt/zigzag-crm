import React from "react";
import { FiFilter, FiX } from "react-icons/fi";

const FilterButton = ({
  onClick,
  hasActiveFilters,
  activeFiltersCount = 0,
}) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    >
      <FiFilter className="w-4 h-4" />
      <span>Filters</span>
      {hasActiveFilters && (
        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
          {activeFiltersCount > 9 ? "9+" : activeFiltersCount}
        </span>
      )}
    </button>
  );
};

export default FilterButton;
