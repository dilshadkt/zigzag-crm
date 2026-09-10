import React from "react";
import { statusConfig } from "../constants";

const ShimmerBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%] rounded ${className}`}
  />
);

const TaskCardShimmer = () => (
  <div className="p-4 rounded-lg bg-white shadow-sm">
    <div className="flex flex-col gap-3">
      <ShimmerBox className="h-4 w-3/4" />
      <ShimmerBox className="h-3 w-1/2" />
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1">
          <ShimmerBox className="h-6 w-6 rounded-full" />
          <ShimmerBox className="h-6 w-6 rounded-full" />
        </div>
        <ShimmerBox className="h-6 w-6 rounded-full" />
      </div>
    </div>
  </div>
);

const ProjectDetailsShimmer = () => (
  <div className="flex gap-4 h-full overflow-x-auto pb-4 pt-3">
    {Object.entries(statusConfig).map(([status, config]) => (
      <div
        key={status}
        className="flex-shrink-0 w-72 rounded-lg bg-gray-50 p-2"
      >
        <div
          className={`font-medium text-sm text-center py-2 px-4 rounded-lg mb-3 ${config.color}`}
        >
          {config.title}
        </div>
        <div className="space-y-2 px-1">
          <TaskCardShimmer />
          <TaskCardShimmer />
        </div>
      </div>
    ))}
  </div>
);

export default ProjectDetailsShimmer;
