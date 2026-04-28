const termsSections = [
  {
    title: "Use Of The Site",
    body: "Ai Gyan provides informational listings, discovery tools, and comparison content for AI products. Users are responsible for evaluating third-party tools before relying on them.",
  },
  {
    title: "Third-Party Links",
    body: "Tool listings may link to external websites and services that are not controlled by Ai Gyan. We are not responsible for the content, offers, security, or practices of third-party sites.",
  },
  {
    title: "Content Accuracy",
    body: "We try to keep tool information useful and current, but we do not guarantee that every listing, feature, price, availability, or logo will always remain accurate.",
  },
  {
    title: "Limitation Of Liability",
    body: "Use of the site is at your own risk. Ai Gyan is not liable for losses or damages arising from use of this directory or reliance on third-party tools listed on the site.",
  },
];

const TermsPage = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl shadow-slate-950/20 sm:p-9">
        <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100">
          Terms & Conditions
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">Terms for using Ai Gyan</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
          By accessing and using Ai Gyan, you agree to these terms. If you do not agree, please do not use the site.
        </p>

        <div className="mt-10 space-y-5">
          {termsSections.map((section) => (
            <div key={section.title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TermsPage;
