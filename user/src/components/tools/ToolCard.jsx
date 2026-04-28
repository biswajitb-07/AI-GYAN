import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GitCompare } from "lucide-react";
import { getCompareSlugs, toggleCompareSlug } from "../../utils/discoveryStorage";
import { toCategorySlug } from "../../utils/slugify";

const pricingStyles = {
  Free: "bg-emerald-400/15 text-emerald-200 border-emerald-400/20",
  "Free Trial": "bg-sky-400/15 text-sky-200 border-sky-400/20",
  Paid: "bg-amber-400/15 text-amber-200 border-amber-400/20",
};

const ToolCard = ({ tool }) => {
  const [compareSlugs, setCompareSlugs] = useState([]);

  useEffect(() => {
    setCompareSlugs(getCompareSlugs());
  }, []);

  const isCompared = compareSlugs.includes(tool.slug);

  return (
    <article className="group flex h-full flex-col rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3 shadow-xl shadow-slate-950/20 transition duration-300 hover:border-sky-400/30 hover:bg-white/[0.07] sm:rounded-[1.6rem] sm:p-4 sm:hover:-translate-y-1">
      <div className="flex gap-4 sm:block">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 sm:h-44 sm:w-full sm:rounded-[1.25rem] sm:bg-slate-950/80 sm:p-5">
          <img
            src={tool.image.url}
            alt={tool.name}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1 sm:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-xl font-semibold text-white">{tool.name}</h3>
                {tool.featured ? (
                  <span className="rounded-full bg-violet-500/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                    Sponsor
                  </span>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-300">{tool.description}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200">
              {tool.category}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${pricingStyles[tool.pricing]}`}>
              {tool.pricing}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tool.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <Link
              to={`/tools/${tool.slug}`}
              className="inline-flex items-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              View Tool
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-4 hidden flex-1 flex-col sm:flex">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/categories/${toCategorySlug(tool.category)}`}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-sky-400/30 hover:text-white"
          >
            {tool.category}
          </Link>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${pricingStyles[tool.pricing]}`}>
            {tool.pricing}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-white">{tool.name}</h3>
        <p className="mt-2.5 flex-1 text-sm leading-6 text-slate-300">{tool.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCompareSlugs(toggleCompareSlug(tool.slug))}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isCompared ? "bg-sky-400/15 text-sky-100" : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <GitCompare size={13} />
            {isCompared ? "Added to compare" : "Compare"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tool.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{tool.monthlyVisits} visits</p>
          <Link
            to={`/tools/${tool.slug}`}
            className="inline-flex items-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            View Tool
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ToolCard;
