import { Link } from "react-router-dom";
import { Bot, BrainCircuit, Code2, Compass, Image, Megaphone, Mic2, Sparkles, Workflow } from "lucide-react";

const iconMap = {
  Bot,
  BrainCircuit,
  Code2,
  Compass,
  Image,
  Megaphone,
  Mic2,
  Sparkles,
  Workflow,
};

const CategoryStrip = ({ categories = [] }) => {
  const loopedCategories = [...categories, ...categories];

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Categories</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">Explore focused AI use cases</h2>
        </div>
      </div>

      <div className="category-marquee-wrapper">
        <div className="category-marquee-track">
          {loopedCategories.map((category, index) => {
            const Icon = iconMap[category.icon] || Sparkles;

            return (
              <Link
                key={`${category.slug}-${index}`}
                to={`/categories/${category.slug}`}
                className={`w-[290px] shrink-0 rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${category.color} p-[1px] shadow-lg shadow-slate-950/20 sm:w-[320px] lg:w-[340px]`}
              >
                <div className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-slate-950/90 p-5">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/5 blur-2xl" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sky-200">
                      <Icon size={22} />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                      Focused
                    </span>
                  </div>
                  <p className="mt-5 line-clamp-2 text-lg font-semibold leading-7 text-white">{category.name}</p>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-300">{category.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-200">{category.toolCount || 0} tools</p>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
                      <Sparkles size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;
