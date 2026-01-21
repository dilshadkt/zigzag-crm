import React from "react";

const SkeletonItem = ({ className }) => (
  <div className={`bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%] rounded ${className}`} />
);

const LoadingSpinner = () => {
  return (
    <div className="flex h-screen w-full bg-[#F4F9FD] overflow-hidden">
      {/* Sidebar Placeholder */}
      <div className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-100 p-6 gap-8">
        <div className="flex items-center gap-3">
          <SkeletonItem className="h-10 w-10 rounded-xl" />
          <SkeletonItem className="h-6 w-24" />
        </div>
        <div className="flex flex-col gap-4 mt-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonItem key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <div className="mt-auto">
          <SkeletonItem className="h-20 w-full rounded-2xl" />
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Placeholder */}
        <div className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <SkeletonItem className="h-8 w-48" />
            <SkeletonItem className="hidden lg:block h-10 w-64 rounded-xl" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex sm:gap-2">
              <SkeletonItem className="h-10 w-10 rounded-full" />
              <SkeletonItem className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="flex flex-col items-end gap-1">
                <SkeletonItem className="h-4 w-24" />
                <SkeletonItem className="h-3 w-16" />
              </div>
              <SkeletonItem className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Dashboard Content Placeholder */}
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Top Section */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <SkeletonItem className="h-8 w-56" />
              <SkeletonItem className="h-4 w-40" />
            </div>
            <div className="flex gap-3">
              <SkeletonItem className="h-10 w-28 rounded-xl" />
              <SkeletonItem className="h-10 w-28 rounded-xl" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <SkeletonItem className="h-10 w-10 rounded-xl" />
                  <SkeletonItem className="h-4 w-12 rounded-full" />
                </div>
                <div className="space-y-2">
                  <SkeletonItem className="h-4 w-24" />
                  <SkeletonItem className="h-8 w-20" />
                </div>
                <div className="pt-2">
                  <SkeletonItem className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Table / List Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex justify-between items-center pb-2">
              <div className="flex gap-4">
                <SkeletonItem className="h-6 w-32" />
                <SkeletonItem className="h-6 w-32" />
              </div>
              <SkeletonItem className="h-9 w-32 rounded-lg" />
            </div>

            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 py-4 border-b border-slate-50 last:border-0">
                  <SkeletonItem className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <SkeletonItem className="h-4 w-full" />
                      <SkeletonItem className="h-3 w-2/3" />
                    </div>
                    <div className="hidden sm:flex items-center">
                      <SkeletonItem className="h-4 w-24" />
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <SkeletonItem className="h-8 w-8 rounded-full" />
                      <SkeletonItem className="h-4 w-20" />
                    </div>
                  </div>
                  <SkeletonItem className="h-8 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
