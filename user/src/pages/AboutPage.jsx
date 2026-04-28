const AboutPage = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl shadow-slate-950/20 sm:p-9">
        <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100">
          About Ai Gyan
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">A clean AI tools directory for discovery, comparison, and research</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
          Ai Gyan helps users discover AI tools across coding, writing, design, research, productivity, marketing, and more. We organize
          tools with category, pricing, reviews, and comparison signals so visitors can evaluate options quickly.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-xl font-semibold text-white">What We Do</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              We curate listings, improve metadata, remove duplicate or low-quality entries, and keep the experience useful for people who
              want to find practical AI products.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-xl font-semibold text-white">How We Earn</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              This website may display advertising and may include promotional placements or external links. We aim to keep editorial curation
              separate from user trust and site usability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
