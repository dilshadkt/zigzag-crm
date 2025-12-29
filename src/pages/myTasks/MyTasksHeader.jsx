import React from "react";
import Header from "../../components/shared/header";
import { FiArrowLeft, FiSearch, FiFilter, FiX } from "react-icons/fi";

const MyTasksHeader = ({
  title,
  filterColorClass,
  FilterIcon,
  taskCount,
  filters,
  onSearchChange,
  showFilters,
  toggleFilters,
  hasActiveFilters,
  activeFilterCount,
  onClearAllFilters,
  onBack,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flexBetween mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <Header>{title}</Header>
          <div
            className={`px-3 py-1 rounded-full flex items-center gap-2 ${filterColorClass}`}
          >
            <FilterIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{taskCount}</span>
          </div>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            onClick={toggleFilters}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-2 ${
              hasActiveFilters()
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FiFilter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
            {hasActiveFilters() && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {/* Quick clear all when filters panel is open and filters active */}
          {showFilters && hasActiveFilters() && (
            <button
              onClick={onClearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FiX className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MyTasksHeader;


