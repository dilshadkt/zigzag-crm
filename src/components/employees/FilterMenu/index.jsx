import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import DatePicker from "../../shared/Field/date";

const FilterMenu = ({ isOpen, setShowModalFilter, onFilterChange }) => {
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: null,
      endDate: null
    },
    gender: [],
    position: [],
    level: []
  });

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };
    if (Array.isArray(filters[filterType])) {
      if (filters[filterType].includes(value)) {
        newFilters[filterType] = filters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...filters[filterType], value];
      }
    } else {
      newFilters[filterType] = value;
    }
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 bg-[#2155A3]/15 py-3 px-3 z-50 flexEnd">
      <div className="w-[400px] overflow-hidden bg-white rounded-3xl flex flex-col
       py-7 h-full shadow-lg">
        <div className="flexBetween px-7 border-b border-[#E4E6E8]/80 pb-4">
          <h4 className="text-lg font-medium text-gray-800">Filters</h4>
          <PrimaryButton
            icon={"/icons/cancel.svg"}
            className={"bg-[#F4F9FD] hover:bg-gray-100 transition-colors"}
            onclick={() => setShowModalFilter(false)}
          />
        </div>

       <div className="w-full h-full flex flex-col overflow-y-auto">
       <div className="px-7 pb-5 pt-4 border-b border-[#E4E6E8]/80">
          <DatePicker 
            title="Birthday Range" 
            onChange={(dates) => handleFilterChange('dateRange', dates)}
          />
        </div>

        {/* Gender Filter */}
        <div className="px-7 py-5 border-b border-[#E4E6E8]/80 flex flex-col">
          <h5 className="text-sm font-medium text-[#7D8592] mb-4">Gender</h5>
          <div className="flex flex-col gap-y-3">
            {['Male', 'Female', 'Other'].map((gender) => (
              <label key={gender} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                  checked={filters.gender.includes(gender)}
                  onChange={() => handleFilterChange('gender', gender)}
                />
                <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors">{gender}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Position Filter */}
        <div className="px-7 py-5 border-b border-[#E4E6E8]/80 flex flex-col">
          <h5 className="text-sm font-medium text-[#7D8592] mb-4">Position</h5>
          <div className="flex flex-col gap-y-3">
            {['Developer', 'Designer', 'Manager', 'HR', 'Marketing'].map((position) => (
              <label key={position} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                  checked={filters.position.includes(position)}
                  onChange={() => handleFilterChange('position', position)}
                />
                <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors">{position}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div className="px-7 py-5 border-b border-[#E4E6E8]/80 flex flex-col">
          <h5 className="text-sm font-medium text-[#7D8592] mb-4">Level</h5>
          <div className="flex flex-col gap-y-3">
            {['Junior', 'Mid', 'Senior', 'Lead', 'Manager'].map((level) => (
              <label key={level} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                  checked={filters.level.includes(level)}
                  onChange={() => handleFilterChange('level', level)}
                />
                <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors">{level}</span>
              </label>
            ))}
          </div>
        </div>
       </div>

        {/* Action Buttons */}
        <div className="px-7 pt-3 mt-auto">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFilters({
                  dateRange: { startDate: null, endDate: null },
                  gender: [],
                  position: [],
                  level: []
                });
                onFilterChange?.(null);
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowModalFilter(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu; 