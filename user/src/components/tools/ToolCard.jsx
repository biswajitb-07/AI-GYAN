import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck, Clock3 } from "lucide-react";

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
  const status = tool.verificationStatus || "unchecked";
  const tags = Array.isArray(tool.tags) ? tool.tags.slice(0, 2) : [];

  return (
    <article className="group relative flex h-full overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.92),rgba(8,13,28,0.96))] p-4 shadow-[0_18px_55px_rgba(2,6,23,0.28)] transition duration-300 hover:-translate-y-1 hover:border-sky-400/35 hover:shadow-[0_22px_70px_rgba(14,165,233,0.14)]">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/35 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="flex w-full items-start gap-4">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-inner shadow-black/20 sm:h-28 sm:w-28">
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.12),transparent_48%)]" />
          <img
            src={tool.image?.url}
            alt={tool.name}
            className="relative h-full w-full object-contain transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col self-stretch">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 truncate text-xl font-semibold tracking-tight text-white">{tool.name}</h3>
              {tool.featured ? (
                <span className="rounded-full border border-violet-300/25 bg-violet-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-100">
                  Sponsor
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{tool.description}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-slate-100">
              {tool.category}
            </span>
            <span className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${pricingStyles[tool.pricing] || pricingStyles.Free}`}>
              {tool.pricing}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${verificationStyles[status]}`}>
              <BadgeCheck size={13} />
              {verificationLabels[status]}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} />
              {formatLastChecked(tool.lastCheckedAt)}
            </span>
            {tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>

          <div className="mt-auto pt-5">
            <Link
              to={`/tools/${tool.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-300"
            >
              View Tool
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ToolCard;
