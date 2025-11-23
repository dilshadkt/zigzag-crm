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
      <div className="overflow-x-auto h-full">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase sticky top-0 z-20 bg-slate-50 tracking-wide text-slate-500">
                <ShimmerBox className="h-[14px] w-[14px] rounded" />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase sticky top-0 z-20 bg-slate-50 tracking-wide text-slate-500"
                >
                  <ShimmerBox className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
              <tr key={index} className="border-b border-slate-100">
                <td className="px-6 py-4">
                  <ShimmerBox className="h-[14px] w-[14px] rounded" />
                </td>
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4">
                    <ShimmerBox
                      className={`h-4 ${
                        column.key === "contact.name"
                          ? "w-32"
                          : column.key === "contact.email"
                          ? "w-40"
                          : column.key === "contact.phone"
                          ? "w-28"
                          : column.key === "status"
                          ? "w-20 rounded-full"
                          : column.key === "createdAt"
                          ? "w-24"
                          : "w-24"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LeadsTableShimmer;

