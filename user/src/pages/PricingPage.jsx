const pricingCards = [
  ["Free Explorer", "Discover trending tools and compare categories at no cost.", "Free"],
  ["Free Trial Stack", "Test launch-ready products with trial plans before you commit.", "Free Trial"],
  ["Paid Powerhouse", "Find premium AI platforms built for teams and scaling workflows.", "Paid"],
];

const PricingPage = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="space-y-5 text-center">
        <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100">
          Pricing intelligence
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Filter by budget before you commit to a stack</h1>
        <p className="mx-auto max-w-3xl text-base leading-8 text-slate-300">
          Ai Gyan highlights which tools are free, free trial, or paid so teams can compare options quickly and make sharper decisions.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {pricingCards.map(([title, description, badge]) => (
          <div key={title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/25">
            <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-200">{badge}</span>
            <h2 className="mt-5 text-2xl font-semibold text-white">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingPage;
