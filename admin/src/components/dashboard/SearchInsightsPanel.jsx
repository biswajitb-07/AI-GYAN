const SearchInsightsPanel = ({ topSearches = [], noResultSearches = [] }) => {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">Top searches</h3>
        <div className="mt-4 space-y-3">
          {topSearches.length ? (
            topSearches.map((search) => (
              <div key={search.term} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <span className="text-sm text-white">{search.term}</span>
                <span className="text-sm text-slate-400">{search.count} searches</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No search insights yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">No-result searches</h3>
        <div className="mt-4 space-y-3">
          {noResultSearches.length ? (
            noResultSearches.map((search) => (
              <div key={search.term} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                <span className="text-sm text-white">{search.term}</span>
                <span className="text-sm text-slate-400">{search.noResultCount} misses</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No failed searches yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInsightsPanel;
