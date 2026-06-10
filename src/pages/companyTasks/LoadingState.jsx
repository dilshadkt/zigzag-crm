import React from "react";
import Navigator from "../../components/shared/navigator";

const LoadingState = ({ title, FilterIcon, getFilterColor }) => {
    return (
        <div className="">
            {/* Header Skeleton exactly matching CompanyTasksHeader */}
            <div className="sticky top-0 z-50 bg-[#f4f9fd]">
                <div className="flex sticky top-0 items-start justify-between">
                    <div className="flex items-center sticky top-0 gap-x-2">
                        <Navigator />
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {FilterIcon && <FilterIcon className={getFilterColor ? getFilterColor() : ""} />}
                            {title}
                        </h1>
                        <div className="h-4 bg-gray-200 rounded w-16 mt-1 animate-pulse ml-2"></div>
                    </div>
                    {/* SuperFilterPanel Skeleton */}
                    <div className="flex items-center gap-x-2 relative animate-pulse">
                        <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>

            {/* Quick Filters Bar Skeleton */}
            <div className="mb-6 pb-4 border-b border-gray-200 mt-4 animate-pulse flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
                </div>
            </div>

            {/* Task List Skeleton */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse flex items-center justify-between"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="flex gap-3 items-center ml-8">
                                <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
                                <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoadingState;
