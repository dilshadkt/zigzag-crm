import React from "react";

const ShimmerBox = ({ className = "", rounded = "rounded-2xl" }) => (
    <div
        className={`bg-gray-100 relative overflow-hidden ${rounded} ${className}`}
    >
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
);

export const ProjectOverViewShimmer = ({ isBoardView = true }) => {
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
            <div className="col-span-4 flex flex-col h-full">
                {isBoardView ? (
                    <div className="flex gap-4 h-full mt-4 overflow-x-auto pb-2 project-details-scroll">
                        {[1, 2, 3, 4].map((col) => (
                            <div key={col} className="flex-shrink-0 w-80 rounded-lg p-4 bg-gray-50/50 border-2 border-transparent">
                                <ShimmerBox className="h-10 w-full mb-4 rounded-lg" />
                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                                            <div className="flex justify-between">
                                                <ShimmerBox className="h-4 w-20" />
                                                <ShimmerBox className="h-6 w-6 rounded-full" />
                                            </div>
                                            <ShimmerBox className="h-5 w-full" />
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="flex -space-x-2">
                                                    <ShimmerBox className="h-6 w-6 rounded-full border-2 border-white" />
                                                    <ShimmerBox className="h-6 w-6 rounded-full border-2 border-white" />
                                                </div>
                                                <ShimmerBox className="h-4 w-24" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full pb-5 gap-y-6 mt-4 rounded-xl">
                        {[1, 2, 3].map(section => (
                            <div key={section} className="space-y-3">
                                <ShimmerBox className="h-10 w-full rounded-xl" />
                                {[1, 2].map(item => (
                                    <div key={item} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <ShimmerBox className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <ShimmerBox className="h-4 w-1/3" />
                                                <ShimmerBox className="h-3 w-1/4" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <ShimmerBox className="h-6 w-20 rounded-full" />
                                            <div className="flex -space-x-2">
                                                <ShimmerBox className="h-8 w-8 rounded-full border-2 border-white" />
                                                <ShimmerBox className="h-8 w-8 rounded-full border-2 border-white" />
                                            </div>
                                            <ShimmerBox className="h-5 w-24" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export const SelectedProjectShimmer = () => {
    return (
        <div className="col-span-1 bg-white rounded-3xl flex flex-col p-6 space-y-6 h-full overflow-hidden">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <ShimmerBox className="h-4 w-24" />
                    <ShimmerBox className="h-5 w-16" />
                </div>
                <ShimmerBox className="h-10 w-10 rounded-xl" />
            </div>

            <div className="space-y-3">
                <ShimmerBox className="h-5 w-32" />
                <div className="space-y-2">
                    <ShimmerBox className="h-3 w-full" />
                    <ShimmerBox className="h-3 w-full" />
                    <ShimmerBox className="h-3 w-2/3" />
                </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                    <ShimmerBox className="h-4 w-20" />
                    <div className="flex items-center gap-2">
                        <ShimmerBox className="h-6 w-6 rounded-full" />
                        <ShimmerBox className="h-4 w-24" />
                    </div>
                </div>

                <div className="space-y-2">
                    <ShimmerBox className="h-4 w-16" />
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <ShimmerBox key={i} className="h-6 w-6 rounded-full border-2 border-white" />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <ShimmerBox className="h-4 w-20" />
                    <div className="flex items-center gap-2">
                        <ShimmerBox className="h-4 w-4 rounded-full" />
                        <ShimmerBox className="h-4 w-16" />
                    </div>
                </div>

                <div className="space-y-2">
                    <ShimmerBox className="h-4 w-24" />
                    <ShimmerBox className="h-4 w-32" />
                </div>

                <div className="space-y-3">
                    <ShimmerBox className="h-4 w-32" />
                    <div className="grid grid-cols-1 gap-2">
                        <ShimmerBox className="h-10 w-full rounded-xl" />
                        <ShimmerBox className="h-10 w-full rounded-xl" />
                    </div>
                </div>

                <div className="space-y-2 pt-4">
                    <ShimmerBox className="h-10 w-full" />
                    <ShimmerBox className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
};
