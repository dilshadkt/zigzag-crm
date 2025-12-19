import React, { useState } from "react";
import FilterButton from "./FilterButton";
import FilterDrawer from "./FilterDrawer";

const SuperFilterPanel = ({
  superFilters = {}, // Default to empty object
  handleFilterChange,
  handleMultiSelectFilter,
  clearAllFilters,
  hasActiveFilters,
  users = [],
  projects = [],
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getActiveFiltersCount = () => {
    // Return 0 if superFilters is not properly initialized
    if (!superFilters) return 0;

    let count = 0;

    // Safely check each filter property
    if (superFilters?.search) count++;

    if (superFilters?.status && Array.isArray(superFilters.status)) {
      count += superFilters.status.length;
    }

    if (superFilters?.priority && Array.isArray(superFilters.priority)) {
      count += superFilters.priority.length;
    }

    if (superFilters?.assignedTo && Array.isArray(superFilters.assignedTo)) {
      count += superFilters.assignedTo.length;
    }

    if (superFilters?.project && Array.isArray(superFilters.project)) {
      count += superFilters.project.length;
    }

    if (superFilters?.dateRange?.start) count++;
    if (superFilters?.dateRange?.end) count++;

    if (superFilters?.sortBy && superFilters.sortBy !== "dueDate") count++;
    if (superFilters?.sortOrder && superFilters.sortOrder !== "asc") count++;

    return count;
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="">
        <FilterButton
          onClick={() => setIsDrawerOpen(true)}
          hasActiveFilters={hasActiveFilters ? hasActiveFilters() : false}
          activeFiltersCount={getActiveFiltersCount()}
        />
      </div>

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        superFilters={superFilters}
        handleFilterChange={handleFilterChange}
        handleMultiSelectFilter={handleMultiSelectFilter}
        clearAllFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        users={users}
        projects={projects}
      />
    </>
  );
};

export default SuperFilterPanel;
