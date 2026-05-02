import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import AdsterraDirectLinkCard from "../components/ads/AdsterraDirectLinkCard";
import AdsterraScriptUnit from "../components/ads/AdsterraScriptUnit";
import SeoMeta from "../components/shared/SeoMeta";
import Pagination from "../components/tools/Pagination";
import ToolGrid from "../components/tools/ToolGrid";
import { adsterraConfig } from "../config/adsterra";
import { useGetCategoriesQuery, useGetToolsQuery, useTrackSearchQueryMutation } from "../store/userApi";

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const pricingOptions = ["Free", "Free Trial", "Paid"];

const ToolsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const pricing = searchParams.get("pricing") || "";
  const sort = searchParams.get("sort") || "";
  const featured = searchParams.get("featured") || "";
  const page = sanitizePage(searchParams.get("page"));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [trackSearchQuery] = useTrackSearchQueryMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ limit: 200 });
  const { data: toolsResponse, isLoading, isFetching } = useGetToolsQuery({
    search,
    category: selectedCategory,
    pricing,
    sort,
    featured,
    page,
    limit: 24,
  });
  const toolData = toolsResponse?.data || [];
  const toolPagination = toolsResponse?.pagination || null;
  const toolLoading = isLoading || isFetching;
  const activeFilterCount = [selectedCategory, pricing].filter(Boolean).length;

  const updateQueryParams = (nextValues) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    Object.entries(nextValues).forEach(([key, value]) => {
      const normalizedValue = typeof value === "string" ? value.trim() : value;

      if (!normalizedValue || normalizedValue === 1) {
        nextSearchParams.delete(key);
        return;
      }

      nextSearchParams.set(key, String(normalizedValue));
    });

    setSearchParams(nextSearchParams);
  };

  useEffect(() => {
    if (!search.trim() || !toolsResponse) {
      return;
    }

    const timeout = window.setTimeout(() => {
      trackSearchQuery({
        term: search,
        hasResults: (toolsResponse.pagination?.total || 0) > 0,
      }).catch(() => {});
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search, toolsResponse, trackSearchQuery]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <SeoMeta
        title={`AI Tools Directory${selectedCategory ? ` - ${selectedCategory}` : ""} | Ai Gyan`}
        description="Search curated AI tools by category, pricing, and use case on Ai Gyan."
        canonicalPath="/tools"
      />
      <div className="space-y-6 sm:space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.92))] p-5 shadow-[0_22px_70px_rgba(2,6,23,0.28)] sm:p-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/35 to-transparent" />

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">AI directory</p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                Find the right AI tool faster
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Search curated tools by category, pricing, use-case, and verification status without turning the page into a landing-page hero.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center lg:min-w-[360px]">
              <div className="rounded-xl border border-sky-300/15 bg-sky-400/10 px-4 py-3">
                <span className="block text-2xl font-semibold text-white">{toolPagination?.total || 0}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200">Tools</span>
              </div>
              <div className="rounded-xl border border-emerald-300/15 bg-emerald-400/10 px-4 py-3">
                <span className="block text-2xl font-semibold text-white">{categories.length || 0}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">Categories</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <span className="block text-2xl font-semibold text-white">{page}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Page</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-slate-300">
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">Verified links</span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">Category-first browsing</span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">Pricing context</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <AdsterraScriptUnit desktopUnit={adsterraConfig.toolsDesktopUnit} mobileUnit={adsterraConfig.toolsMobileUnit} title="Sponsored results" minHeight={96} />
          <AdsterraDirectLinkCard />
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-[0_18px_55px_rgba(2,6,23,0.22)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Directory controls</p>
              <p className="mt-1 text-sm text-slate-400">
                {toolPagination?.total || 0} tools found{selectedCategory ? ` in ${selectedCategory}` : ""}{pricing ? `, ${pricing}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  filtersOpen || activeFilterCount
                    ? "border border-sky-300/30 bg-sky-400/15 text-sky-100"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <SlidersHorizontal size={16} />
                Filter
                {activeFilterCount ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-400 px-1.5 text-[11px] font-bold text-slate-950">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => updateQueryParams({ featured: featured === "true" ? "" : "true", page: 1 })}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${featured === "true" ? "bg-sky-400 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
              >
                Featured only
              </button>
              {[
                ["popular", "Most viewed"],
                ["rating", "Top rated"],
                ["az", "A-Z"],
                ["newest", "Newest"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateQueryParams({ sort: sort === value ? "" : value, page: 1 })}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${sort === value ? "bg-sky-400 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtersOpen ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/65 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-white">Filter tools</p>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Category</span>
                  <select
                    value={selectedCategory}
                    onChange={(event) => updateQueryParams({ category: event.target.value, page: 1 })}
                    className="h-12 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm font-semibold text-white outline-none [color-scheme:dark]"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.name} className="bg-slate-950 text-white">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pricing</span>
                  <select
                    value={pricing}
                    onChange={(event) => updateQueryParams({ pricing: event.target.value, page: 1 })}
                    className="h-12 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm font-semibold text-white outline-none [color-scheme:dark]"
                  >
                    <option value="">All Pricing</option>
                    {pricingOptions.map((option) => (
                      <option key={option} value={option} className="bg-slate-950 text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => updateQueryParams({ category: "", pricing: "", page: 1 })}
                  className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <ToolGrid tools={toolData} loading={toolLoading} />
        <Pagination pagination={toolPagination} onPageChange={(nextPage) => updateQueryParams({ page: nextPage })} />
      </div>
    </section>
  );
};

export default ToolsPage;
