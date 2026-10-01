import React from "react";
import Navigator from "../../components/shared/navigator";

const LoadingState = ({ title, FilterIcon, getFilterColor }) => {
  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0 px-1 md:px-0">
          <div className="">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <Navigator />
                <div className="min-w-0 flex items-center gap-2">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Search and Quick Filters Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-2">
              {/* Search */}
              <div className="flex-1">
                <div className="h-10 w-full bg-white border border-gray-200 rounded-full animate-pulse"></div>
              </div>
              {/* Quick Filters */}
              <div className="shrink-0 flex gap-2 overflow-hidden">
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Task List Skeleton */}
            <div className="flex flex-col h-full pb-5 gap-y-2 rounded-xl overflow-hidden overflow-y-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 px-4 py-3 animate-pulse flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-100"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="flex gap-3">
                      <div className="h-4 w-20 bg-gray-100 rounded"></div>
                      <div className="h-4 w-24 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
