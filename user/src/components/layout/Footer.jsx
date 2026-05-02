import { Link } from "react-router-dom";

const footerLinks = [
  ["About", "/about"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms", "/terms"],
];

const Footer = ({ stats }) => {
  const toolCount = stats?.totalTools || 0;
  const categoryCount = stats?.totalCategories || 0;

  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.72),rgba(2,6,23,0.96))]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-slate-400 sm:px-6 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Ai Gyan</p>
            <p className="mt-3 max-w-xl leading-7">Modern AI tools curated for builders, teams, creators, and learners who want clean discovery without noise.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {footerLinks.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/30 hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-right sm:w-[320px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Tools</p>
            <p className="mt-1 text-2xl font-semibold text-white">{toolCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Categories</p>
            <p className="mt-1 text-2xl font-semibold text-white">{categoryCount}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
