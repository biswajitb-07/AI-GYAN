const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-14 text-center shadow-2xl shadow-slate-950/30">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-300">{description}</p>
    </div>
  );
};

export default EmptyState;
