const NewsCardSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/5 sm:rounded-[1.75rem]">
      <div className="flex gap-4 p-3 sm:block sm:p-0">
        <div className="h-24 w-24 shrink-0 rounded-[1.1rem] bg-slate-800/70 sm:h-56 sm:w-full sm:rounded-none" />
        <div className="min-w-0 flex-1 space-y-4 sm:p-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="h-7 w-24 rounded-full bg-slate-800 sm:h-8 sm:w-32" />
            <div className="h-7 w-20 rounded-full bg-slate-900 sm:h-8 sm:w-24" />
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            <div className="h-6 w-4/5 rounded-full bg-slate-700 sm:h-8" />
            <div className="h-6 w-2/3 rounded-full bg-slate-700 sm:h-8" />
          </div>
          <div className="space-y-3">
            <div className="h-3 rounded-full bg-slate-800" />
            <div className="h-3 rounded-full bg-slate-800" />
            <div className="h-3 w-5/6 rounded-full bg-slate-800" />
          </div>
          <div className="h-10 w-36 rounded-full bg-slate-700 sm:h-11 sm:w-40" />
        </div>
      </div>
    </div>
  );
};

export default NewsCardSkeleton;
