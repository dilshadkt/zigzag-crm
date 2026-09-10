import React from "react";

const ShimmerBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%] rounded ${className}`}
  />
);

export const VacationCardShimmer = () => (
  <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
    <div className="p-4 flex items-center gap-3 bg-gray-50/50">
      <ShimmerBox className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <ShimmerBox className="h-3.5 w-32" />
        <div className="flex gap-3">
          <ShimmerBox className="h-2.5 w-14" />
          <ShimmerBox className="h-2.5 w-14" />
          <ShimmerBox className="h-2.5 w-14" />
        </div>
      </div>
    </div>
    <div className="p-3 space-y-2">
      <div className="p-3 rounded-xl border border-gray-100 space-y-2">
        <div className="flex items-center gap-2">
          <ShimmerBox className="h-3 w-16" />
          <ShimmerBox className="h-5 w-16 rounded-full" />
        </div>
        <ShimmerBox className="h-2.5 w-40" />
      </div>
      <div className="p-3 rounded-xl border border-gray-100 space-y-2">
        <div className="flex items-center gap-2">
          <ShimmerBox className="h-3 w-20" />
          <ShimmerBox className="h-5 w-16 rounded-full" />
        </div>
        <ShimmerBox className="h-2.5 w-36" />
      </div>
    </div>
  </div>
);

export const VacationCardsShimmer = ({ count = 6 }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-3 pb-6">
    {Array.from({ length: count }).map((_, index) => (
      <VacationCardShimmer key={index} />
    ))}
  </div>
);

const CalendarRowShimmer = () => (
  <div className="flex w-full">
    <div className="min-h-[52px] min-w-[240px] border-r border-b border-[#E6EBF5] flex items-center gap-x-[10px] px-6">
      <ShimmerBox className="w-6 h-6 rounded-full" />
      <ShimmerBox className="h-3 w-28" />
    </div>
    <div className="w-full h-[52px] border-b border-[#E6EBF5] gap-x-1 grid grid-cols-31 items-center px-1">
      {Array.from({ length: 31 }).map((_, index) => (
        <ShimmerBox key={index} className="min-w-[28px] w-full h-10 rounded-[7px]" />
      ))}
    </div>
  </div>
);

export const VacationCalendarShimmer = ({ rows = 8 }) => (
  <div className="w-full h-full flex flex-col mt-3 overflow-hidden bg-white rounded-3xl">
    <div className="min-h-[88px] w-full flex">
      <div className="min-w-[240px] border-b border-r border-[#E6EBF5] h-full flex items-center px-6">
        <ShimmerBox className="h-4 w-24" />
      </div>
      <div className="w-full border-b border-[#E6EBF5] flex flex-col">
        <div className="w-full h-full flex items-center justify-center">
          <ShimmerBox className="h-3 w-28" />
        </div>
        <div className="h-full gap-x-1 grid grid-cols-31 m-1">
          {Array.from({ length: 31 }).map((_, index) => (
            <ShimmerBox key={index} className="min-w-[28px] w-full h-10 rounded-[7px]" />
          ))}
        </div>
      </div>
    </div>
    <div className="w-full overflow-y-auto">
      {Array.from({ length: rows }).map((_, index) => (
        <CalendarRowShimmer key={index} />
      ))}
    </div>
  </div>
);
