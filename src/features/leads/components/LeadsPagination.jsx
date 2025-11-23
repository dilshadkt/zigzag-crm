const PAGE_SIZE_OPTIONS = [15, 30, 50];

const LeadsPagination = ({
  pageSize,
  onPageSizeChange,
  currentPage = 1,
  onPageChange,
  visibleCount,
  totalCount,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        Displaying
        <select
          className="border border-slate-200 rounded-full px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3f8cff]/20"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        out of {totalCount} ({totalCount === 0 ? 0 : `${startItem}-${endItem}`})
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-slate-500">
          Showing {visibleCount} of {totalCount} leads
        </div>
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPagination;

