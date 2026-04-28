import { Link } from "react-router-dom";

const footerLinks = [
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms", "/terms"],
];

const Footer = ({ stats }) => {
  const toolCount = stats?.totalTools || 0;
  const categoryCount = stats?.totalCategories || 0;

  return (
    <footer className="border-t border-white/10 bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 text-sm text-slate-400 sm:px-6 sm:py-8 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="max-w-xl leading-7">Ai Gyan curates modern AI tools for builders, teams, and learners.</p>
          <div className="flex flex-wrap gap-2">
            {footerLinks.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/30 hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <p className="leading-7">
          {toolCount} tools. {categoryCount} categories. Clean discovery experience.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
