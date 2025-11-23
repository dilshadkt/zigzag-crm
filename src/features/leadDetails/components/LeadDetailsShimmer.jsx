const ShimmerBox = ({ className = "", rounded = "rounded-md" }) => (
  <div
    className={`bg-slate-200 relative overflow-hidden ${rounded} ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const LeadDetailsShimmer = () => {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
      <div className="bg-white rounded-3xl border border-slate-100 h-full flex flex-col shadow-sm overflow-hidden">
        <div className="h-full overflow-hidden flex gap-6 p-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-3 w-full h-full overflow-y-auto flex flex-col">
            {/* Header with Back Button and Tabs */}
            <div className="flex items-center gap-x-2">
              <ShimmerBox className="w-10 h-10 rounded-full" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <ShimmerBox key={i} className="h-10 w-24 rounded-full" />
                ))}
              </div>
            </div>

            {/* Content Area - Overview Tab Shimmer */}
            <div className="space-y-4">
              {/* AI Suggestions Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Conversation Coach Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShimmerBox className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <ShimmerBox className="h-5 w-40" />
                      <ShimmerBox className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ShimmerBox className="w-2 h-2 rounded-full mt-1.5" />
                        <ShimmerBox className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <ShimmerBox className="h-10 w-32 rounded-xl" />
                    <ShimmerBox className="h-10 w-28 rounded-xl" />
                  </div>
                </div>

                {/* Deal Stage Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShimmerBox className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <ShimmerBox className="h-5 w-36" />
                      <ShimmerBox className="h-3 w-28" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ShimmerBox className="w-2 h-2 rounded-full mt-1.5" />
                        <ShimmerBox className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <ShimmerBox className="h-10 w-40 rounded-xl" />
                    <ShimmerBox className="h-10 w-28 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Lead Overview Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <ShimmerBox className="h-6 w-32" />
                    <ShimmerBox className="h-4 w-64" />
                  </div>
                  <div className="flex items-center gap-3">
                    <ShimmerBox className="h-8 w-24 rounded-full" />
                    <ShimmerBox className="h-10 w-20 rounded-full" />
                  </div>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <ShimmerBox className="h-3 w-20" />
                      <ShimmerBox className="h-5 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="min-w-[350px] flex flex-col space-y-3">
            {/* Activity Panel */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <ShimmerBox className="h-6 w-32" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShimmerBox className="w-2 h-2 rounded-full" />
                      <ShimmerBox className="h-4 w-24" />
                    </div>
                    <ShimmerBox className="h-3 w-full" />
                    <ShimmerBox className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <ShimmerBox className="h-6 w-32" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <ShimmerBox key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadDetailsShimmer;

