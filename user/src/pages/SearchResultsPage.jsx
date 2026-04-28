import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SectionTitle from "../components/shared/SectionTitle";
import FiltersBar from "../components/tools/FiltersBar";
import Pagination from "../components/tools/Pagination";
import ToolGrid from "../components/tools/ToolGrid";
import { useGetCategoriesQuery, useGetFeaturedToolsQuery, useGetToolsQuery, useTrackSearchQueryMutation } from "../store/userApi";

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const selectedCategory = searchParams.get("category") || "";
  const pricing = searchParams.get("pricing") || "";
  const sort = searchParams.get("sort") || "";
  const featured = searchParams.get("featured") || "";
  const page = sanitizePage(searchParams.get("page"));
  const [searchDraft, setSearchDraft] = useState(query);
  const [trackSearchQuery] = useTrackSearchQueryMutation();
  const { data: allCategories = [] } = useGetCategoriesQuery({ limit: 200 });
  const { data: featuredTools = [] } = useGetFeaturedToolsQuery();
  const { data: toolsResponse, isLoading: toolsLoading, isFetching: toolsFetching } = useGetToolsQuery({
    search: query,
    category: selectedCategory,
    pricing,
    sort,
    featured,
    page,
    limit: 24,
  });
  const { data: matchedCategories = [], isLoading: categoriesLoading, isFetching: categoriesFetching } = useGetCategoriesQuery({
    search: query,
    limit: 12,
  });
  const toolData = toolsResponse?.data || [];
  const toolPagination = toolsResponse?.pagination || null;
  const toolLoading = toolsLoading || toolsFetching;
  const categoryLoading = categoriesLoading || categoriesFetching;

  useEffect(() => {
    setSearchDraft(query);
  }, [query]);

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
    if (!query.trim()) {
      return;
    }

    const timeout = window.setTimeout(() => {
      trackSearchQuery({
        term: query,
        hasResults: (toolPagination?.total || 0) > 0 || matchedCategories.length > 0,
      }).catch(() => {});
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [matchedCategories.length, query, toolPagination?.total, trackSearchQuery]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        <SectionTitle
          eyebrow="Search results"
          title={query ? `Results for "${query}" across tools and categories` : "Explore all searchable results"}
          description="Use this page to browse all matching tools, jump into a category, and refine discovery without losing your search context."
        />

        <FiltersBar
          search={searchDraft}
          onSearchChange={setSearchDraft}
          onSearchSubmit={(value) => updateQueryParams({ query: value, page: 1 })}
          selectedCategory={selectedCategory}
          setSelectedCategory={(value) => updateQueryParams({ category: value, page: 1 })}
          pricing={pricing}
          setPricing={(value) => updateQueryParams({ pricing: value, page: 1 })}
          categories={allCategories}
          tools={featuredTools}
          onReset={() => {
            setSearchDraft("");
            updateQueryParams({ query: "", category: "", pricing: "", sort: "", featured: "", page: 1 });
          }}
        />

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

        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Matching categories</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {categoryLoading ? "Searching categories..." : `${matchedCategories.length} categories found`}
              </h2>
            </div>
          </div>

          {categoryLoading ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                  <div className="h-5 w-32 rounded bg-white/10" />
                  <div className="mt-3 h-4 w-20 rounded bg-white/10" />
                  <div className="mt-4 h-4 w-full rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : matchedCategories.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {matchedCategories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => updateQueryParams({ category: category.name, page: 1 })}
                  className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-5 text-left transition hover:border-sky-400/30 hover:bg-white/10"
                >
                  <p className="text-lg font-semibold text-white">{category.name}</p>
                  <p className="mt-2 text-sm text-sky-200">{category.toolCount || 0} tools</p>
                  <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-300">{category.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-300">
              No matching categories found for this search yet.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Matching tools</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {toolPagination?.total || 0} tools found
              </h2>
            </div>
          </div>
          <ToolGrid tools={toolData} loading={toolLoading} />
          <Pagination pagination={toolPagination} onPageChange={(nextPage) => updateQueryParams({ page: nextPage })} />
        </div>
      </div>
    </section>
  );
};

export default SearchResultsPage;
