import React from "react";
import { statusConfig } from "./StatusConfig";

export const ShimmerBox = ({ className = "" }) => (
    <div
        className={`bg-slate-200 animate-shimmer bg-[linear-gradient(110deg,#e2e8f0,45%,#f1f5f9,55%,#e2e8f0)] bg-[length:200%_100%] rounded ${className}`}
    />
);

export const BoardCardShimmer = () => (
    <div className="p-4 rounded-lg bg-white shadow-sm">
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
                <ShimmerBox className="h-4 w-3/4" />
                <ShimmerBox className="h-3 w-1/2" />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                        <ShimmerBox className="h-6 w-6 rounded-full" />
                        <ShimmerBox className="h-6 w-6 rounded-full" />
                    </div>
                    <ShimmerBox className="h-3 w-10" />
                </div>
                <div className="flex items-center gap-1.5">
                    <ShimmerBox className="h-3 w-7" />
                    <ShimmerBox className="h-6 w-6 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);

export const BoardColumnShimmer = ({ count = 3 }) => (
    <div className="space-y-2 pb-8">
        {Array.from({ length: count }).map((_, index) => (
            <BoardCardShimmer key={index} />
        ))}
    </div>
);

const BoardSkeleton = () => {
    return (
        <div className="col-span-4 overflow-hidden h-full flex flex-col">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-1 mb-2">
                <ShimmerBox className="h-7 w-36" />
                <div className="flex flex-wrap gap-2 items-center">
                    <ShimmerBox className="h-8 w-36 rounded-lg" />
                    <ShimmerBox className="h-8 w-56 rounded-lg" />
                    <ShimmerBox className="h-8 w-32 rounded-lg" />
                    <ShimmerBox className="h-8 w-32 rounded-lg" />
                    <ShimmerBox className="h-8 w-32 rounded-lg" />
                    <ShimmerBox className="h-8 w-28 rounded-lg" />
                </div>
            </div>

            <div className="flex h-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 project-details-scroll">
                {Object.entries(statusConfig).map(([status, config]) => (
                    <div
                        key={status}
                        className="flex-shrink-0 w-80 pt-3 px-1 rounded-lg bg-gray-50 border-2 border-transparent"
                    >
                        <div
                            className={`font-medium text-sm text-center sticky top-0 z-50 py-2 px-4 rounded-lg mb-4 ${config.color}`}
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {config.title}
                                <ShimmerBox className="h-3.5 w-7 bg-white/50" />
                            </span>
                        </div>
                        <div className="px-2">
                            <BoardColumnShimmer />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardSkeleton;
