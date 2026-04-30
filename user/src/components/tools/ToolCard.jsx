import { Link } from "react-router-dom";

const pricingStyles = {
  Free: "bg-emerald-400/15 text-emerald-200 border-emerald-400/20",
  "Free Trial": "bg-sky-400/15 text-sky-200 border-sky-400/20",
  Paid: "bg-amber-400/15 text-amber-200 border-amber-400/20",
};

const verificationStyles = {
  verified: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  review: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  broken: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  unchecked: "border-white/10 bg-white/5 text-slate-300",
};

const verificationLabels = {
  verified: "Verified",
  review: "Needs review",
  broken: "Link issue",
  unchecked: "Not checked",
};

const formatLastChecked = (value) => {
  if (!value) {
    return "Awaiting check";
  }

  return `Checked ${new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
};

const ToolCard = ({ tool }) => {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-slate-950/20 transition duration-300 hover:border-sky-400/30 hover:bg-white/[0.07] sm:rounded-2xl sm:hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 p-4">
          <img
            src={tool.image.url}
            alt={tool.name}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
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
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200">
              {tool.category}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${pricingStyles[tool.pricing]}`}>
              {tool.pricing}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${verificationStyles[tool.verificationStatus || "unchecked"]}`}>
              {verificationLabels[tool.verificationStatus || "unchecked"]}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{formatLastChecked(tool.lastCheckedAt)}</p>
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
    </article>
  );
};

export default ToolCard;
