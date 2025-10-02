import React, { useState } from "react";
import FilterButton from "./FilterButton";
import FilterDrawer from "./FilterDrawer";

const SuperFilterPanel = ({
  superFilters,
  handleFilterChange,
  handleMultiSelectFilter,
  clearAllFilters,
  hasActiveFilters,
  users,
  projects,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (superFilters.search) count++;
    if (superFilters.status.length > 0) count += superFilters.status.length;
    if (superFilters.priority.length > 0) count += superFilters.priority.length;
    if (superFilters.assignedTo.length > 0)
      count += superFilters.assignedTo.length;
    if (superFilters.project.length > 0) count += superFilters.project.length;
    if (superFilters.dateRange.start) count++;
    if (superFilters.dateRange.end) count++;
    if (superFilters.sortBy !== "dueDate") count++;
    if (superFilters.sortOrder !== "asc") count++;
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
          hasActiveFilters={hasActiveFilters()}
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
