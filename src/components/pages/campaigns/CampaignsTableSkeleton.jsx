import React from "react";

const ShimmerBox = ({ className = "", rounded = "rounded-md" }) => (
  <div
    className={`bg-gray-200 relative overflow-hidden ${rounded} ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const CampaignsTableSkeleton = () => {
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
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider w-16 text-center">
                  <ShimmerBox className="h-4 w-4 rounded mx-auto" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider min-w-[250px]">
                  <ShimmerBox className="h-3 w-20" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <ShimmerBox className="h-3 w-16" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                  <ShimmerBox className="h-3 w-16 ml-auto" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                  <ShimmerBox className="h-3 w-20 ml-auto" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                  <ShimmerBox className="h-3 w-16 ml-auto" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                  <ShimmerBox className="h-3 w-16 ml-auto" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                  <ShimmerBox className="h-3 w-20 ml-auto" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                  <ShimmerBox className="h-3 w-16 ml-auto" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">
                  <ShimmerBox className="h-3 w-20 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...Array(8)].map((_, index) => (
                <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-4 px-5 text-center">
                    <ShimmerBox className="h-4 w-4 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-2">
                      <ShimmerBox className="h-4 w-48" />
                      <ShimmerBox className="h-3 w-64" />
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <ShimmerBox className="h-2 w-2 rounded-full" />
                      <ShimmerBox className="h-3 w-16" />
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <ShimmerBox className="h-4 w-12 ml-auto" />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <ShimmerBox className="h-4 w-16 ml-auto" />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <ShimmerBox className="h-4 w-20" />
                      <ShimmerBox className="h-2 w-12" />
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <ShimmerBox className="h-4 w-20" />
                      <ShimmerBox className="h-2 w-16" />
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <ShimmerBox className="h-4 w-16 ml-auto" />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <ShimmerBox className="h-4 w-16 ml-auto" />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <ShimmerBox className="h-4 w-16" />
                      <ShimmerBox className="h-2 w-12" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CampaignsTableSkeleton;
