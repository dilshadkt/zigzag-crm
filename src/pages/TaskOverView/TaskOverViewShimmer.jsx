import React from "react";

const ShimmerBox = ({ className = "", rounded = "rounded-2xl" }) => (
    <div
        className={`bg-gray-100 relative overflow-hidden ${rounded} ${className}`}
    >
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
);

const TaskOverViewShimmer = () => {
    return (
        <>
            <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
            <section className="col-span-4 gap-y-6 md:gap-y-0 md:overflow-hidden grid grid-cols-1 md:grid-cols-4">
                {/* Task Details Shimmer */}
                <div className="col-span-3 overflow-y-auto mr-5 flex flex-col">
                    <div className="flex items-center justify-between">
                        <ShimmerBox className="h-7 w-32" />
                        <div className="flex gap-2">
                            <ShimmerBox className="h-10 w-32 rounded-lg" />
                            <ShimmerBox className="h-10 w-10 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex flex-col h-full bg-white overflow-hidden rounded-3xl mt-5 p-6 space-y-6">
                        <div className="space-y-4">
                            <ShimmerBox className="h-4 w-20" />
                            <div className="flex items-center justify-between">
                                <div className="flex gap-3">
                                    <ShimmerBox className="h-7 w-64" />
                                    <ShimmerBox className="h-6 w-24 rounded-full" />
                                    <ShimmerBox className="h-6 w-24 rounded-full" />
                                </div>
                                <ShimmerBox className="h-10 w-40 rounded-xl" />
                            </div>
                        </div>

                        {/* Description Shimmer */}
                        <div className="space-y-3">
                            <ShimmerBox className="h-5 w-32" />
                            <div className="space-y-2">
                                <ShimmerBox className="h-4 w-full" />
                                <ShimmerBox className="h-4 w-full" />
                                <ShimmerBox className="h-4 w-2/3" />
                            </div>
                        </div>

                        {/* Subtasks Section Shimmer */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <ShimmerBox className="h-6 w-32" />
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex gap-4 items-center">
                                        <ShimmerBox className="h-5 w-5 rounded-md" />
                                        <ShimmerBox className="h-5 w-48" />
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <ShimmerBox className="h-8 w-8 rounded-full" />
                                        <ShimmerBox className="h-6 w-20 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Task Info Shimmer */}
                <div className="col-span-1 bg-white rounded-3xl p-6 flex flex-col space-y-8 h-full">
                    <div className="space-y-6">
                        <ShimmerBox className="h-6 w-24" />

                        {/* Created By */}
                        <div className="space-y-3">
                            <ShimmerBox className="h-4 w-20" />
                            <div className="flex items-center gap-3">
                                <ShimmerBox className="h-10 w-10 rounded-full" />
                                <ShimmerBox className="h-4 w-32" />
                            </div>
                        </div>

                        {/* Assigned To */}
                        <div className="space-y-3">
                            <ShimmerBox className="h-4 w-24" />
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <ShimmerBox key={i} className="h-8 w-8 rounded-full border-2 border-white" />
                                ))}
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-3">
                            <ShimmerBox className="h-4 w-20" />
                            <ShimmerBox className="h-6 w-24 rounded-lg" />
                        </div>
                    </div>

                    {/* Time Tracking */}
                    <div className="bg-[#F4F9FD] rounded-2xl p-4 space-y-4">
                        <ShimmerBox className="h-5 w-32" />
                        <div className="flex items-center gap-3">
                            <ShimmerBox className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <ShimmerBox className="h-4 w-24" />
                                <ShimmerBox className="h-3 w-32" />
                            </div>
                        </div>
                        <ShimmerBox className="h-10 w-full" />
                    </div>

                    {/* Deadline */}
                    <div className="space-y-3 pt-4">
                        <ShimmerBox className="h-4 w-24" />
                        <ShimmerBox className="h-5 w-40" />
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                        <ShimmerBox className="h-4 w-4" />
                        <ShimmerBox className="h-4 w-32" />
                    </div>
                </div>
            </section>
        </>
    );
};

export default TaskOverViewShimmer;
