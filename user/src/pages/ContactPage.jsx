const contactMethods = [
  ["General support", "support@aigyan.com"],
  ["Business inquiries", "business@aigyan.com"],
  ["Policy/privacy requests", "privacy@aigyan.com"],
];

const ContactPage = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-xl shadow-slate-950/20 sm:p-9">
        <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-100">
          Contact
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">Get in touch with Ai Gyan</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
          If you need support, want to report a listing issue, request a policy update, or discuss business matters, you can contact us
          using the details below.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {contactMethods.map(([label, value]) => (
            <div key={label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
              <p className="mt-3 break-all text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-xl font-semibold text-white">Response Window</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            We generally respond to important requests as quickly as possible. For compliance, privacy, or correction-related messages, please
            include the exact page URL and enough detail for us to verify the issue.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
