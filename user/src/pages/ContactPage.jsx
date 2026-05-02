import { useState } from "react";
import { Link } from "react-router-dom";
import SeoMeta from "../components/shared/SeoMeta";
import { useSubmitFeedbackMutation } from "../store/userApi";

const contactMethods = [
  ["General support", "bussinessgamerpulse077@gmail.com"],
  ["Business inquiries", "bussinessgamerpulse077@gmail.com"],
  ["Policy/privacy requests", "bussinessgamerpulse077@gmail.com"],
];

const ContactPage = () => {
  const [submitFeedback] = useSubmitFeedbackMutation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "site-improvement",
    pageUrl: "",
    message: "",
  });
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  return (
    <section className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <SeoMeta
        title="Contact Ai Gyan | Support and Feedback"
        description="Reach out to Ai Gyan for support, corrections, business requests, or product feedback."
        canonicalPath="/contact"
      />
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

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Before you contact us</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Useful pages that answer common questions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/tools" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-sky-400/30 hover:bg-white/10">Browse AI tools</Link>
              <Link to="/blog" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-sky-400/30 hover:bg-white/10">Latest AI news</Link>
              <Link to="/privacy-policy" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-sky-400/30 hover:bg-white/10">Privacy policy</Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Best message format</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">For faster help, mention the exact page, the issue, what you expected to happen, and any tool or category involved.</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 sm:p-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Feedback</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Suggest how we should improve the website</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Share bugs, quality issues, missing tools, design suggestions, or workflow ideas. We review this feedback to keep the directory
              cleaner and more useful.
            </p>
          </div>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setStatus({ loading: true, message: "", error: false });

              try {
                const response = await submitFeedback({
                  ...form,
                  pageUrl: form.pageUrl || window.location.href,
                }).unwrap();

                setStatus({
                  loading: false,
                  message: response?.message || "Thanks for the feedback. We will review your suggestion.",
                  error: false,
                });
                setForm({
                  name: "",
                  email: "",
                  type: "site-improvement",
                  pageUrl: "",
                  message: "",
                });
              } catch (error) {
                setStatus({
                  loading: false,
                  message: error?.data?.message || "We could not send your feedback right now. Please try again.",
                  error: true,
                });
              }
            }}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email (optional)"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
            />
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
            >
              <option value="site-improvement">Site improvement</option>
              <option value="tool-quality">Tool quality issue</option>
              <option value="bug-report">Bug report</option>
              <option value="feature-request">Feature request</option>
            </select>
            <input
              type="url"
              value={form.pageUrl}
              onChange={(event) => setForm((current) => ({ ...current, pageUrl: event.target.value }))}
              placeholder="Page URL (optional)"
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
            />
            <textarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Tell us what should change and why"
              rows={6}
              required
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40 md:col-span-2"
            />
            <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <p className={`text-sm ${status.error ? "text-rose-300" : "text-slate-400"}`}>{status.message || "We read feedback to improve quality, trust, and usability."}</p>
              <button
                type="submit"
                disabled={status.loading}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status.loading ? "Sending..." : "Send feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
