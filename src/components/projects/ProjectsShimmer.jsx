import React from "react";

const ShimmerBox = ({ className = "", rounded = "rounded-2xl" }) => (
  <div
    className={`bg-gray-200 relative overflow-hidden ${rounded} ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const ProjectsShimmer = () => {
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
      <section className="flex flex-col h-full gap-y-3">
        {/* Project Header Shimmer */}
        <div className="flex items-center justify-between">
          <ShimmerBox className="h-8 w-48" />
          <ShimmerBox className="h-10 w-32 rounded-lg" />
        </div>

        {/* Main Content Grid - Mobile Responsive */}
        <div className="w-full h-full overflow-y-auto gap-y-3 md:gap-y-0 md:overflow-hidden md:gap-x-5 grid grid-cols-1 md:grid-cols-5">
          {/* Current Projects Section Shimmer */}
          <div className="col-span-1 bg-white rounded-3xl flex flex-col p-4">
            {/* Header */}
            <div className="flex justify-center border-b border-[#E4E6E8] gap-x-2 py-5">
              <ShimmerBox className="h-6 w-32" />
            </div>

            {/* Project Cards */}
            <div className="flex flex-col my-2 gap-y-2">
              {[1, 2, 3].map((index) => (
                <div key={index} className="px-4 py-3 space-y-2">
                  <ShimmerBox className="h-3 w-20 rounded-md" />
                  <ShimmerBox className="h-4 w-full rounded-md" />
                  <ShimmerBox className="h-3 w-24 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Project Details Section Shimmer */}
          <div className="col-span-1 md:col-span-4 flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <ShimmerBox className="h-7 w-16" />
              <div className="flex gap-2">
                <ShimmerBox className="h-10 w-10 rounded-lg" />
              </div>
            </div>

            {/* Task Sections - List View Style */}
            <div className="flex flex-col gap-y-4 rounded-xl overflow-hidden">
              {/* Active Tasks Section */}
              <div className="space-y-3">
                <ShimmerBox className="h-10 w-full rounded-xl" />
                {[1, 2].map((index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 space-y-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <ShimmerBox className="h-4 w-3/4 rounded-md" />
                        <ShimmerBox className="h-3 w-1/2 rounded-sm" />
                      </div>
                      <ShimmerBox className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <ShimmerBox className="h-6 w-6 rounded-full" />
                      <ShimmerBox className="h-3 w-20 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* In Progress Section */}
              <div className="space-y-3">
                <ShimmerBox className="h-10 w-full rounded-xl" />
                {[1].map((index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 space-y-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <ShimmerBox className="h-4 w-2/3 rounded-md" />
                        <ShimmerBox className="h-3 w-1/3 rounded-sm" />
                      </div>
                      <ShimmerBox className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <ShimmerBox className="h-6 w-6 rounded-full" />
                      <ShimmerBox className="h-3 w-24 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Completed Section */}
              <div className="space-y-3">
                <ShimmerBox className="h-10 w-full rounded-xl" />
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 space-y-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <ShimmerBox className="h-4 w-4/5 rounded-md" />
                        <ShimmerBox className="h-3 w-2/5 rounded-sm" />
                      </div>
                      <ShimmerBox className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <ShimmerBox className="h-6 w-6 rounded-full" />
                      <ShimmerBox className="h-3 w-16 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectsShimmer;
