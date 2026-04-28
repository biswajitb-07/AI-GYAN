const SkeletonCard = () => {
  return (
    <div className="animate-pulse rounded-[1.75rem] border border-white/8 bg-white/5 p-5">
      <div className="h-48 rounded-[1.4rem] bg-slate-800/70" />
      <div className="mt-5 h-4 w-24 rounded-full bg-slate-700" />
      <div className="mt-4 h-7 w-2/3 rounded-full bg-slate-700" />
      <div className="mt-4 space-y-3">
        <div className="h-3 rounded-full bg-slate-800" />
        <div className="h-3 w-4/5 rounded-full bg-slate-800" />
      </div>
      <div className="mt-6 h-11 rounded-full bg-slate-700" />
    </div>
  );
};

export default SkeletonCard;
