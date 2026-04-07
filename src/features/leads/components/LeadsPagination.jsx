const PAGE_SIZE_OPTIONS = [15, 30, 50, 100, 150];

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-2 border-t border-slate-100 bg-white rounded-b-2xl">
      <div className="hidden md:flex items-center gap-2 text-[12px] text-slate-600">
        Displaying
        <select
          className="border border-slate-200 rounded-full px-2 py-0.5 text-[12px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3f8cff]/20"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        / {totalCount} ({totalCount === 0 ? 0 : `${startItem}-${endItem}`})
      </div>
      <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
        <div className="text-[11px] md:block text-slate-500">
          {visibleCount} of {totalCount} leads
        </div>
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-0.5 rounded-full border border-slate-200 text-[11px] text-slate-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-[11px] text-slate-600 px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-2 py-0.5 rounded-full border border-slate-200 text-[11px] text-slate-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

