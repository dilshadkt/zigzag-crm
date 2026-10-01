import React from "react";
import Navigator from "../../components/shared/navigator";
import SuperFilterPanel from "../../components/tasks/SuperFilterPanel";

const CompanyTasksHeader = ({
    title,
    taskCount,
    users,
    projects,
    superFilters,
    handleFilterChange,
    handleMultiSelectFilter,
    clearAllFilters,
    hasActiveFilters,
}) => {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <Navigator />
                <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-medium text-gray-800 leading-snug">
                        {title} - ({taskCount})
                    </h3>
                </div>
            </div>
            <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                <SuperFilterPanel
                    users={users}
                    projects={projects}
                    superFilters={superFilters}
                    handleFilterChange={handleFilterChange}
                    handleMultiSelectFilter={handleMultiSelectFilter}
                    clearAllFilters={clearAllFilters}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>
        </div>
    );
};

export default CompanyTasksHeader;
