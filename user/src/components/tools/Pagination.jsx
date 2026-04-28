const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  const { page, pages, total } = pagination;
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(pages, page + 2);
  const visiblePages = [];

  for (let currentPage = startPage; currentPage <= endPage; currentPage += 1) {
    visiblePages.push(currentPage);
  }

  return (
    <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-white">Showing paginated results</p>
        <p className="mt-1 text-sm text-slate-300">
          Page {page} of {pages} with {total} total tools
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white transition hover:border-sky-400/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {visiblePages.map((visiblePage) => (
          <button
            key={visiblePage}
            type="button"
            onClick={() => onPageChange(visiblePage)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              visiblePage === page
                ? "bg-sky-400 text-slate-950"
                : "border border-white/10 bg-slate-950/70 text-white hover:border-sky-400/30 hover:bg-white/10"
            }`}
          >
            {visiblePage}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white transition hover:border-sky-400/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
