import { Link } from "react-router-dom";
import { Bot, Compass, Sparkles, Star, Zap, ArrowRight, ChevronRight } from "lucide-react";

/* ─── Data ──────────────────────────────────────────────────────────────── */
const features = [
  {
    id: "fast",
    title: "Fast Picks",
    desc: "Top tools with clear paths — zero confusion.",
    icon: Zap,
    iconBg: "bg-sky-400/10 border-sky-400/20",
    iconColor: "text-sky-400",
    hoverBorder: "hover:border-sky-400/30",
    arrowHover: "group-hover:border-sky-400/30 group-hover:bg-sky-400/10 group-hover:text-sky-400",
  },
  {
    id: "smart",
    title: "Smart Match",
    desc: "Search by need, not noise.",
    icon: Compass,
    iconBg: "bg-emerald-400/10 border-emerald-400/20",
    iconColor: "text-emerald-400",
    hoverBorder: "hover:border-emerald-400/30",
    arrowHover: "group-hover:border-emerald-400/30 group-hover:bg-emerald-400/10 group-hover:text-emerald-400",
  },
  {
    id: "curated",
    title: "Curated Flow",
    desc: "Browse tools that actually fit your workflow.",
    icon: Sparkles,
    iconBg: "bg-amber-400/10 border-amber-400/20",
    iconColor: "text-amber-400",
    hoverBorder: "hover:border-amber-400/30",
    arrowHover: "group-hover:border-amber-400/30 group-hover:bg-amber-400/10 group-hover:text-amber-400",
  },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */
const StatPill = ({ icon: Icon, color, value, label }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-sm text-slate-300 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.07]">
    <Icon size={14} className={color} />
    <span className="font-medium">{value}</span>
    <span className="text-slate-500">{label}</span>
  </span>
);

const MetricCard = ({ value, label }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] sm:p-5">
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</p>
    <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">{label}</p>
  </div>
);

const FeatureRow = ({ icon: Icon, title, desc, iconBg, iconColor, hoverBorder, arrowHover }) => (
  <div
    className={`group flex cursor-default items-center gap-4 rounded-2xl border border-white/[0.07] bg-slate-950/60 p-4 backdrop-blur-sm transition-all duration-200 hover:translate-x-1 hover:bg-slate-950/80 ${hoverBorder}`}
  >
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconBg}`}>
      <Icon size={16} className={iconColor} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
    </div>
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-600 transition-all duration-200 ${arrowHover}`}>
      <ChevronRight size={12} />
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
const HeroSection = ({ stats }) => {
  const toolCount = stats?.totalTools ?? 240;
  const categoryCount = stats?.totalCategories ?? 18;
  const featuredCount = stats?.featuredTools ?? 32;

  return (
    <section className="relative overflow-hidden bg-[#050a14]">

      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[640px] w-[640px] rounded-full bg-sky-500/[0.11] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-40 h-[520px] w-[520px] rounded-full bg-emerald-400/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-violet-500/[0.06] blur-3xl" />

      {/* ── Dot grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Content grid ── */}
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-12 lg:pb-24 lg:pt-14">

        {/* ══════════ LEFT ══════════ */}
        <div className="relative z-10 space-y-8">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/[0.08] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            Trusted AI Discovery Platform
          </span>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="max-w-xl text-[clamp(36px,4.5vw,62px)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">
              Find AI tools that
              <span
                className="mt-1 block"
                style={{
                  background: "linear-gradient(135deg,#38bdf8 0%,#34d399 50%,#a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                actually fit your work.
              </span>
            </h1>
            <p className="max-w-md text-sm leading-7 text-slate-400 sm:text-base">
              Clean search, better picks, faster decisions. Stop scrolling through noise — start building with what works.
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2.5">
            <StatPill icon={Bot}     color="text-sky-400"     value={toolCount}     label="tools" />
            <StatPill icon={Compass} color="text-emerald-400" value={categoryCount} label="categories" />
            <StatPill icon={Star}    color="text-amber-400"   value={featuredCount} label="featured" />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/tools"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(14,165,233,0.38),0_4px_16px_rgba(14,165,233,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_44px_rgba(14,165,233,0.55),0_8px_24px_rgba(14,165,233,0.32)]"
            >
              Explore Tools
              <ArrowRight size={15} />
            </Link>
            <a
              href="#categories"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.05] px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.09]"
            >
              Browse Categories
            </a>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <MetricCard value={`${toolCount}+`} label="Tools" />
            <MetricCard value={categoryCount}   label="Categories" />
            <MetricCard value={featuredCount}   label="Featured" />
          </div>
        </div>

        {/* ══════════ RIGHT ══════════ */}
        <div className="relative z-10 hidden lg:block">

          {/* Glow behind card */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          {/* Glass shell */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-7 shadow-[0_40px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">

            {/* Top shimmer line */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(56,189,248,0.7),rgba(52,211,153,0.5),transparent)",
              }}
            />

            {/* Card header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-white/20 bg-white p-2 shadow-lg shadow-sky-950/20">
                  <img
                    src="/logo.png"
                    alt="Ai Gyan"
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.insertAdjacentHTML(
                        "afterend",
                        '<span style="font-weight:800;font-size:13px;color:#0ea5e9;letter-spacing:-0.02em;">AI</span>'
                      );
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100 tracking-tight">Ai Gyan</p>
                  <p className="text-xs text-slate-500 mt-0.5">Search. Discover. Launch.</p>
                </div>
              </div>

              {/* Live indicator */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/[0.22] bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            {/* Feature list */}
            <div className="mb-5 space-y-2.5">
              {features.map((f) => (
                <FeatureRow key={f.id} {...f} />
              ))}
            </div>

            {/* Bottom info cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Built for",       value: "Creators & builders" },
                { label: "Discovery style", value: "Minimal & curated" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12]"
                >
                  <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-600">{label}</p>
                  <p className="mt-1.5 text-xs font-semibold text-slate-200">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
