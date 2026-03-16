const ShimmerBox = ({ className = "", rounded = "rounded-md" }) => (
  <div
    className={`bg-slate-200 relative overflow-hidden ${rounded} ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const LeadsTableShimmer = ({ columns }) => {
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
      <div className="h-full flex flex-col">
        {/* Table View - Desktop */}
        <div className="hidden lg:block overflow-x-auto h-full">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 z-20">
              <tr>
                <th className="px-6 py-4 text-left sticky top-0 z-20 bg-slate-50 border-b border-slate-100">
                  <ShimmerBox className="h-4 w-4 rounded" />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-4 text-left sticky top-0 z-20 bg-slate-50 border-b border-slate-100"
                  >
                    <ShimmerBox className="h-4 w-20" />
                  </th>
                ))}
                <th className="px-6 py-4 text-left sticky top-0 z-20 bg-slate-50 border-b border-slate-100 w-[60px]" />
              </tr>
            </thead>
            <tbody className="bg-white">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <tr key={index} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-4">
                    <ShimmerBox className="h-4 w-4 rounded" />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <ShimmerBox
                        className={`h-4 ${
                          column.key === "contact.name" || column.key === "name"
                            ? "w-32"
                            : column.key === "contact.email" || column.key === "email"
                            ? "w-40"
                            : column.key === "status"
                            ? "w-20 rounded-full"
                            : "w-24"
                        }`}
                      />
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <ShimmerBox className="h-8 w-8 rounded-full ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card View - Mobile */}
        <div className="lg:hidden flex flex-col h-full bg-slate-50/30 overflow-y-auto">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="p-4 bg-white border-b border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShimmerBox className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <ShimmerBox className="h-4 w-32" />
                    <ShimmerBox className="h-3 w-48" />
                  </div>
                </div>
                <ShimmerBox className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex gap-2">
                  <ShimmerBox className="h-8 w-24 rounded-lg" />
                  <ShimmerBox className="h-8 w-8 rounded-lg" />
                </div>
                <ShimmerBox className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LeadsTableShimmer;

