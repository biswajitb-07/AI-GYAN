const SectionTitle = ({ eyebrow, title, description }) => {
  return (
    <div className="space-y-4">
      <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
        {eyebrow}
      </span>
      <div className="space-y-3">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{description}</p>
      </div>
    </div>
  );
};

export default SectionTitle;
