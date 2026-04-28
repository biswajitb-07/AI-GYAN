const privacyItems = [
  {
    title: "Information We Collect",
    body: "We may collect basic technical information such as page visits, search interactions, device/browser signals, and contact details you submit voluntarily.",
  },
  {
    title: "How We Use Information",
    body: "We use data to improve listings, measure site usage, respond to messages, maintain security, and support monetization features such as analytics and advertising.",
  },
  {
    title: "Advertising And Cookies",
    body: "Third-party vendors, including Google, may use cookies to serve ads based on a user’s prior visits to this website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads based on visits to this site and/or other sites on the Internet.",
  },
  {
    title: "User Choices",
    body: "Users may manage cookie preferences through browser controls and, where applicable, through consent and privacy tools shown on the site.",
  },
];

const PrivacyPolicyPage = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl shadow-slate-950/20 sm:p-9">
        <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100">
          Privacy Policy
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">Privacy, cookie, and advertising disclosure</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
          This Privacy Policy explains how Ai Gyan may collect, use, and disclose information when users browse the site, use search or
          comparison features, contact us, or interact with advertising and analytics technologies.
        </p>

        <div className="mt-10 space-y-5">
          {privacyItems.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-xl font-semibold text-white">Google Advertising</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Users may opt out of personalized advertising by visiting Google Ads Settings. They may also visit{" "}
            <a href="https://www.aboutads.info/" target="_blank" rel="noreferrer" className="text-sky-300 hover:text-sky-200">
              aboutads.info
            </a>{" "}
            to learn more about interest-based advertising options.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;
