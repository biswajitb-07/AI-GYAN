import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdsterraDirectLinkCard from "../components/ads/AdsterraDirectLinkCard";
import AdsterraScriptUnit from "../components/ads/AdsterraScriptUnit";
import SeoMeta from "../components/shared/SeoMeta";
import SectionTitle from "../components/shared/SectionTitle";
import FiltersBar from "../components/tools/FiltersBar";
import Pagination from "../components/tools/Pagination";
import ToolGrid from "../components/tools/ToolGrid";
import { adsterraConfig } from "../config/adsterra";
import { useGetCategoriesQuery, useGetFeaturedToolsQuery, useGetToolsQuery, useTrackSearchQueryMutation } from "../store/userApi";

const useCaseChips = [
  { label: "YouTube video", search: "youtube video" },
  { label: "Thumbnail maker", search: "thumbnail maker" },
  { label: "Resume builder", search: "resume builder" },
  { label: "Coding assistant", search: "coding assistant" },
  { label: "Study notes", search: "study notes" },
  { label: "Voice generator", search: "voice generator" },
];

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const ToolsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const pricing = searchParams.get("pricing") || "";
  const sort = searchParams.get("sort") || "";
  const featured = searchParams.get("featured") || "";
  const page = sanitizePage(searchParams.get("page"));
  const [searchDraft, setSearchDraft] = useState(search);
  const [trackSearchQuery] = useTrackSearchQueryMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ limit: 200 });
  const { data: featuredTools = [] } = useGetFeaturedToolsQuery();
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

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

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
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.92))] p-5 shadow-[0_28px_90px_rgba(2,6,23,0.34)] sm:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/35 to-transparent" />

          <div className="hidden sm:block">
            <SectionTitle
              eyebrow="AI directory"
              title={`Search ${toolPagination?.total || 0} curated AI tools with category and pricing filters`}
              description="Find the right tool for writing, design, automation, research, support, education, and more through a clean, scalable discovery layer."
            />
          </div>

          <div className="space-y-3 sm:hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">AI directory</p>
            <h1 className="text-3xl font-semibold leading-tight text-white">Search {toolPagination?.total || 0} curated AI tools</h1>
            <p className="text-sm leading-7 text-slate-300">Use smart search, category filters, and quick discovery shortcuts to find the right tool faster.</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="block text-base font-semibold text-white">{toolPagination?.total || 0}</span>
                Tools
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="block text-base font-semibold text-white">{categories.length || 0}</span>
                Categories
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="block text-base font-semibold text-white">{page}</span>
                Page
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-slate-950/55 p-4 sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Popular use cases</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Start faster with intent-based shortcuts</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Choose a common task and we will prefill the search with the kind of tool people usually need first.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {useCaseChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setSearchDraft(chip.search);
                    updateQueryParams({ search: chip.search, page: 1 });
                  }}
                  className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    search.toLowerCase() === chip.search ? "border-sky-300 bg-sky-400 text-slate-950" : "border-white/10 bg-slate-950/70 text-white hover:border-sky-400/30 hover:bg-white/10"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <FiltersBar
          search={searchDraft}
          onSearchChange={setSearchDraft}
          onSearchSubmit={(value) => updateQueryParams({ search: value, page: 1 })}
          selectedCategory={selectedCategory}
          setSelectedCategory={(value) => updateQueryParams({ category: value, page: 1 })}
          pricing={pricing}
          setPricing={(value) => updateQueryParams({ pricing: value, page: 1 })}
          categories={categories}
          tools={featuredTools}
          onReset={() => {
            setSearchDraft("");
            updateQueryParams({ search: "", category: "", pricing: "", sort: "", featured: "", page: 1 });
          }}
        />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateQueryParams({ featured: featured === "true" ? "" : "true", page: 1 })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${featured === "true" ? "bg-sky-400 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
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
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${sort === value ? "bg-sky-400 text-slate-950" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <AdsterraScriptUnit desktopUnit={adsterraConfig.toolsDesktopUnit} mobileUnit={adsterraConfig.toolsMobileUnit} title="Sponsored results" minHeight={96} />
          <AdsterraDirectLinkCard />
        </div>
        <ToolGrid tools={toolData} loading={toolLoading} />
        <Pagination pagination={toolPagination} onPageChange={(nextPage) => updateQueryParams({ page: nextPage })} />
      </div>
    </section>
  );
};

export default ToolsPage;
