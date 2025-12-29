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
        <div className="sticky top-0 bg-[#f4f9fd]">
            <div className="flex sticky top-0 items-start justify-between">
                <div className="flex items-center sticky top-0 gap-x-2">
                    <Navigator />
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {title}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{taskCount} tasks</p>
                </div>
                <div className="flex items-center gap-x-2">
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
        </div>
    );
};

export default CompanyTasksHeader;
