import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdsterraDirectLinkCard from "../components/ads/AdsterraDirectLinkCard";
import AdsterraScriptUnit from "../components/ads/AdsterraScriptUnit";
import CategoryStrip from "../components/home/CategoryStrip";
import HeroSection from "../components/home/HeroSection";
import SeoMeta from "../components/shared/SeoMeta";
import SectionTitle from "../components/shared/SectionTitle";
import ToolGrid from "../components/tools/ToolGrid";
import { adsterraConfig } from "../config/adsterra";
import { useGetCategoriesQuery, useGetTrendingToolsQuery } from "../store/userApi";

const HomePage = ({ stats }) => {
  const { data: trendingTools = [], isLoading: trendingLoading } = useGetTrendingToolsQuery();
  const { data: categories = [] } = useGetCategoriesQuery({ limit: 24 });
  const companyNames = ["OpenAI", "Google", "Anthropic", "Adobe", "Notion", "Canva", "Runway", "Midjourney", "Perplexity", "ElevenLabs", "Hugging Face", "Zapier"];
  const stackCards = [
    { title: "Creators", desc: "Video, thumbnails, scripts, voice, and publishing tools in one clean path." },
    { title: "Developers", desc: "Coding assistants, agents, infra helpers, testing, and documentation tools." },
    { title: "Teams", desc: "Research, productivity, support, automation, and collaboration-ready AI products." },
  ];

  return (
    <div>
      <SeoMeta
        title="Ai Gyan | Discover AI Tools"
        description="Discover curated AI tools for writing, coding, design, productivity, research, and more on Ai Gyan."
        canonicalPath="/"
      />
      <HeroSection stats={stats} />
      <CategoryStrip categories={categories.slice(0, 10)} />

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">How it works</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">From discovery to decision in 3 steps</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Pick your goal", desc: "Choose writing, coding, design, marketing, or research use-case." },
              { title: "Compare quickly", desc: "Review tags, pricing, and health status without opening 20 tabs." },
              { title: "Ship faster", desc: "Open the best-fit tool and move directly into execution." },
            ].map((step, idx) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Step {idx + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.13),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.86),rgba(2,6,23,0.95))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.28)] sm:p-8">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Premium discovery</p>
              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Build a better AI stack without opening fifty tabs.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Ai Gyan groups tools around real work, not just random categories. Start with the outcome, compare the signal, then choose with confidence.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Curated", "Fast", "Clean", "Useful"].map((label) => (
                  <span key={label} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-100">
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stackCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.48, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-slate-950/55 p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-sm font-bold text-cyan-200">
                    0{index + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-blue-500/5 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Why teams switch</p>
            <h3 className="mt-3 text-2xl font-bold text-white">Less noise. More outcomes.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Ai Gyan keeps discovery tight and practical, so your team spends less time browsing and more time shipping.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                "Curated picks only",
                "Live health signals",
                "Clear pricing context",
                "Use-case first navigation",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">Workflow map</p>
            <h3 className="mt-3 text-2xl font-bold text-white">Discovery flow for fast-moving teams</h3>
            <div className="mt-6 space-y-4">
              {[
                { title: "Intent", desc: "Choose a goal: build, write, design, automate." },
                { title: "Shortlist", desc: "Compare curated tools with pricing and status." },
                { title: "Execution", desc: "Open best-fit tool and ship faster with confidence." },
              ].map((step, idx) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/20 text-xs font-semibold text-sky-200">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <AdsterraScriptUnit desktopUnit={adsterraConfig.homeDesktopUnit} mobileUnit={adsterraConfig.homeMobileUnit} title="Sponsored" minHeight={96} />
          <AdsterraDirectLinkCard />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="Trending now"
            title="AI tools that are trending right now"
            description="This section highlights the most viewed and high-interest AI tools so users can quickly see what is gaining momentum right now."
          />
          <Link
            to="/tools?sort=popular"
            className="inline-flex h-fit items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-400/30 hover:bg-white/10"
          >
            See full directory
          </Link>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 20, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
            className="flex w-max items-center gap-3"
          >
            {[...companyNames, ...companyNames].map((name, idx) => (
              <span
                key={`${name}-${idx}`}
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200"
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>

        <ToolGrid tools={trendingTools} loading={trendingLoading} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-400/10 via-white/[0.03] to-emerald-400/10 p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Next move</p>
              <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Ready to build with the right AI stack?</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Skip endless tabs and jump into curated picks. Explore high-signal tools, compare quickly, and choose what actually fits your workflow.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Fast discovery", "Curated quality", "Practical workflows"].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quick links</p>
              <div className="mt-4 grid gap-2">
                <Link to="/tools?sort=popular" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                  Explore trending tools
                </Link>
                <Link to="/tools?featured=true" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                  View featured collection
                </Link>
                <Link to="/contact" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                  Suggest a tool
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
