import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories, fetchTools } from "../../api/tools";
import { ArrowRight, ChevronDown, Clock3, Flame, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

const pricingOptions = ["All", "Free", "Free Trial", "Paid"];
const RECENT_SEARCHES_KEY = "ai-gyan-recent-searches";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedText = ({ text = "", query = "", className = "" }) => {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${escapeRegExp(query.trim())})`, "ig");
  const parts = String(text).split(regex);
  const normalizedQuery = query.trim().toLowerCase();

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === normalizedQuery ? (
          <mark key={`${part}-${index}`} className="rounded bg-sky-400/20 px-0.5 text-sky-200">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </span>
  );
};

const FiltersBar = ({ search, onSearchChange, onSearchSubmit, selectedCategory, setSelectedCategory, pricing, setPricing, categories, tools, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(true);
  const [trendingOpen, setTrendingOpen] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestionState, setSuggestionState] = useState({
    categories: [],
    tools: [],
    loading: false,
  });
  const shellRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      setRecentSearches(stored ? JSON.parse(stored) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const normalizedQuery = search.trim().toLowerCase();
  const hasQuery = Boolean(normalizedQuery);

  useEffect(() => {
    if (!hasQuery) {
      setSuggestionState({
        categories: [],
        tools: [],
        loading: false,
      });
      setActiveIndex(-1);
      return;
    }

    let isCancelled = false;

    setSuggestionState((current) => ({
      ...current,
      loading: true,
    }));

    const timeout = window.setTimeout(async () => {
      try {
        const [categoriesResponse, toolsResponse] = await Promise.all([
          fetchCategories({ search, limit: 8 }),
          fetchTools({ search, limit: 8 }),
        ]);

        if (!isCancelled) {
          setSuggestionState({
            categories: categoriesResponse || [],
            tools: toolsResponse.data || [],
            loading: false,
          });
        }
      } catch {
        if (!isCancelled) {
          setSuggestionState({
            categories: [],
            tools: [],
            loading: false,
          });
        }
      }
    }, 280);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
    };
  }, [hasQuery, search]);

  const trendingCategories = categories.slice(0, 5);
  const trendingTools = tools.filter((tool) => tool.featured).slice(0, 5);
  const fallbackTrendingTools = trendingTools.length ? trendingTools : tools.slice(0, 5);
  const relatedCategories = categories
    .filter((category) => {
      if (!hasQuery) {
        return false;
      }

      return (
        category.name.toLowerCase().startsWith(normalizedQuery.slice(0, 1)) ||
        category.name.toLowerCase().includes(normalizedQuery.slice(0, 2))
      );
    })
    .slice(0, 4);

  const matchingCategories = hasQuery ? suggestionState.categories : [];
  const matchingTools = hasQuery ? suggestionState.tools : [];

  const saveRecentSearch = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    const nextSearches = [trimmedValue, ...recentSearches.filter((item) => item.toLowerCase() !== trimmedValue.toLowerCase())].slice(0, 5);

    setRecentSearches(nextSearches);

    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches));
    } catch {
      // Ignore storage failures.
    }
  };

  const submitSearch = (value = search) => {
    saveRecentSearch(value);
    onSearchSubmit(value);
    setIsOpen(false);
    setActiveIndex(-1);
    searchInputRef.current?.blur();
  };

  const applyCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    saveRecentSearch(categoryName);
    setIsOpen(false);
    setActiveIndex(-1);
    searchInputRef.current?.blur();
  };

  const openTool = (slug) => {
    setIsOpen(false);
    setActiveIndex(-1);
    searchInputRef.current?.blur();
    navigate(`/tools/${slug}`);
  };

  const openSearchResultsPage = () => {
    const nextParams = new URLSearchParams();

    if (search.trim()) {
      nextParams.set("query", search.trim());
    }

    if (selectedCategory) {
      nextParams.set("category", selectedCategory);
    }

    if (pricing) {
      nextParams.set("pricing", pricing);
    }

    navigate(`/search${nextParams.toString() ? `?${nextParams.toString()}` : ""}`);
    setIsOpen(false);
    setActiveIndex(-1);
    searchInputRef.current?.blur();
  };

  const clearSearch = () => {
    onSearchChange("");
    setSuggestionState({
      categories: [],
      tools: [],
      loading: false,
    });
    setActiveIndex(-1);
    searchInputRef.current?.focus();
  };

  const getCategoryToolNames = (categoryName) => {
    const relatedTools = (hasQuery ? matchingTools : tools).filter((tool) => tool.category === categoryName).slice(0, 3);
    return relatedTools.map((tool) => tool.name);
  };

  const topAction = hasQuery
    ? {
        key: `search-${search}`,
        onSelect: () => submitSearch(search),
      }
    : null;

  const categoryItems = categoriesOpen
    ? matchingCategories.map((category) => ({
        key: `category-${category.slug}`,
        onSelect: () => applyCategory(category.name),
      }))
    : [];

  const toolItems = toolsOpen
    ? matchingTools.map((tool) => ({
        key: `tool-${tool.slug}`,
        onSelect: () => openTool(tool.slug),
      }))
    : [];

  const recentItems = !hasQuery && recentOpen
    ? recentSearches.map((term) => ({
        key: `recent-${term}`,
        onSelect: () => submitSearch(term),
      }))
    : [];

  const trendingCategoryItems = !hasQuery && trendingOpen
    ? trendingCategories.map((category) => ({
        key: `trending-category-${category.slug}`,
        onSelect: () => applyCategory(category.name),
      }))
    : [];

  const trendingToolItems = !hasQuery && trendingOpen
    ? fallbackTrendingTools.map((tool) => ({
        key: `trending-tool-${tool.slug}`,
        onSelect: () => openTool(tool.slug),
      }))
    : [];

  const navigableItems = [
    ...(topAction ? [topAction] : []),
    ...recentItems,
    ...trendingCategoryItems,
    ...trendingToolItems,
    ...categoryItems,
    ...toolItems,
  ];

  const toggleCategories = () => {
    setCategoriesOpen((current) => {
      const next = !current;
      if (next) {
        setToolsOpen(false);
      }
      return next;
    });
    setActiveIndex(-1);
  };

  const toggleTools = () => {
    setToolsOpen((current) => {
      const next = !current;
      if (next) {
        setCategoriesOpen(false);
      }
      return next;
    });
    setActiveIndex(-1);
  };

  const renderLoadingState = suggestionState.loading ? (
    <div className="space-y-3 px-5 py-4 sm:px-6">
      {[0, 1, 2].map((item) => (
        <div key={item} className="animate-pulse rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="mt-3 h-3 w-24 rounded bg-white/10" />
        </div>
      ))}
    </div>
  ) : null;

  const showNoResults = hasQuery && !suggestionState.loading && !matchingCategories.length && !matchingTools.length;

  return (
    <div className="relative overflow-visible rounded-[1.55rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-2 shadow-[0_18px_48px_rgba(2,6,23,0.3)] backdrop-blur-xl sm:rounded-[1.9rem] sm:p-3">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/20 to-transparent" />

      <div ref={shellRef} className="relative">
        <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-2 shadow-lg shadow-black/10 backdrop-blur sm:rounded-[1.55rem]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.1rem] border border-white/8 bg-slate-950/70 px-3.5 py-3 text-white sm:rounded-[1.25rem] sm:px-4">
              <Search size={18} className="shrink-0 text-sky-200" />
              <input
                ref={searchInputRef}
                value={search}
                onFocus={() => setIsOpen(true)}
                onChange={(event) => {
                  onSearchChange(event.target.value);
                  setIsOpen(true);
                  setActiveIndex(-1);
                }}
                onKeyDown={(event) => {
                  if (!isOpen && event.key === "ArrowDown") {
                    setIsOpen(true);
                    return;
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    if (!navigableItems.length) {
                      return;
                    }

                    setActiveIndex((current) => (current + 1) % navigableItems.length);
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    if (!navigableItems.length) {
                      return;
                    }

                    setActiveIndex((current) => (current <= 0 ? navigableItems.length - 1 : current - 1));
                  }

                  if (event.key === "Enter") {
                    event.preventDefault();

                    if (activeIndex >= 0 && navigableItems[activeIndex]) {
                      navigableItems[activeIndex].onSelect();
                      return;
                    }

                    submitSearch();
                  }

                  if (event.key === "Escape") {
                    setIsOpen(false);
                    setActiveIndex(-1);
                  }
                }}
                placeholder="Search tools, categories, or use cases"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400 sm:text-base"
              />
              {search ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              ) : null}
            </label>

            <button
              type="button"
              onClick={() => submitSearch()}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[1.05rem] bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 sm:min-w-[136px] sm:w-auto sm:rounded-[1.15rem]"
            >
              Search
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.7rem)] z-20 flex max-h-[min(72svh,32rem)] flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/95 text-white shadow-[0_24px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:top-[calc(100%+0.9rem)] sm:max-h-[min(78vh,44rem)] sm:rounded-[1.7rem]">
            <button
              type="button"
              onClick={() => submitSearch()}
              className={`flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition sm:px-6 sm:py-4 ${activeIndex === 0 && topAction ? "bg-white/8" : "hover:bg-white/5"}`}
            >
              <span className="text-sm sm:text-[1.05rem]">
                Search for <HighlightedText text={search || "AI tools"} query={search} className="font-semibold text-sky-300" /> using AI
              </span>
              <Search size={18} className="shrink-0 text-sky-200" />
            </button>

            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
              {!hasQuery ? (
                <>
                  <div className="border-t border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setRecentOpen((current) => !current)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={16} className="text-sky-300" />
                        Recent Searches ({recentSearches.length})
                      </span>
                      <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${recentOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {recentOpen ? (
                    <div className="scrollbar-hidden max-h-[148px] overflow-y-auto py-1.5 sm:max-h-[180px] sm:py-2">
                      {recentSearches.length ? (
                        recentSearches.map((term, index) => {
                          const navOffset = topAction ? 1 : 0;
                          const itemIndex = navOffset + index;

                          return (
                            <button
                              key={term}
                              type="button"
                              onClick={() => submitSearch(term)}
                              className={`flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition sm:px-6 sm:py-4 ${activeIndex === itemIndex ? "bg-white/8" : "hover:bg-white/5"}`}
                            >
                              <span className="truncate text-white">{term}</span>
                              <Clock3 size={16} className="shrink-0 text-slate-500" />
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-5 py-6 text-sm text-slate-400 sm:px-6">Recent searches yahan dikhengi.</div>
                      )}
                    </div>
                  ) : null}

                  <div className="border-t border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setTrendingOpen((current) => !current)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Flame size={16} className="text-amber-300" />
                        Trending Searches
                      </span>
                      <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${trendingOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {trendingOpen ? (
                    <div className="space-y-5 px-4 py-4 sm:space-y-6 sm:px-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Popular Categories</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {trendingCategories.map((category, index) => {
                            const itemIndex = recentItems.length + index;

                            return (
                              <button
                                key={category.slug}
                                type="button"
                                onClick={() => applyCategory(category.name)}
                              className={`rounded-full border px-3.5 py-2 text-sm transition ${activeIndex === itemIndex ? "border-sky-300 bg-sky-400/15 text-sky-100" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}`}
                              >
                                {category.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Trending Tools</p>
                            <div className="mt-3 space-y-2">
                              {fallbackTrendingTools.map((tool, index) => {
                            const itemIndex = recentItems.length + trendingCategoryItems.length + index;

                            return (
                              <button
                                key={tool.slug}
                                type="button"
                                onClick={() => openTool(tool.slug)}
                                className={`flex w-full items-center gap-3 rounded-[1.2rem] border px-3 py-3 text-left transition sm:rounded-[1.3rem] ${activeIndex === itemIndex ? "border-sky-300 bg-sky-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                              >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-2">
                                  <img src={tool.image?.url} alt={tool.name} className="h-full w-full object-contain" loading="lazy" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white">{tool.name}</p>
                                  <p className="truncate text-xs text-slate-400">{tool.category}</p>
                                </div>
                                {tool.featured ? (
                                  <span className="hidden rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200 sm:inline-flex">
                                    Featured
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="border-t border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 sm:px-6">
                    <button type="button" onClick={toggleCategories} className="flex w-full items-center justify-between gap-4 text-left">
                      <span>Categories ({matchingCategories.length})</span>
                      <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${categoriesOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {categoriesOpen ? (
                    <div className="scrollbar-hidden max-h-[220px] overflow-y-auto py-1.5 sm:max-h-[280px] sm:py-2">
                      {renderLoadingState}
                      {!suggestionState.loading && matchingCategories.map((category, index) => {
                        const itemIndex = (topAction ? 1 : 0) + index;

                        return (
                          <button
                            key={category.slug}
                            type="button"
                            onClick={() => applyCategory(category.name)}
                            className={`flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition sm:px-6 sm:py-4 ${activeIndex === itemIndex ? "bg-white/8" : "hover:bg-white/5"}`}
                          >
                            <div className="min-w-0">
                              <HighlightedText text={category.name} query={search} className="truncate text-lg font-medium text-white" />
                              <p className="mt-1 text-sm text-slate-400">{category.toolCount || 0} tools</p>
                              {getCategoryToolNames(category.name).length ? (
                                <p className="mt-2 truncate text-xs text-sky-200">{getCategoryToolNames(category.name).join(", ")}</p>
                              ) : null}
                            </div>
                            <ArrowRight size={18} className="shrink-0 text-slate-500" />
                          </button>
                        );
                      })}

                      {!suggestionState.loading && !matchingCategories.length ? (
                        <div className="px-5 py-6 text-sm text-slate-400 sm:px-6">No matching category found.</div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="border-t border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 sm:px-6">
                    <button type="button" onClick={toggleTools} className="flex w-full items-center justify-between gap-4 text-left">
                      <span>Tools ({matchingTools.length})</span>
                      <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${toolsOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {toolsOpen ? (
                    <div className="scrollbar-hidden max-h-[240px] overflow-y-auto py-1.5 sm:max-h-[320px] sm:py-2">
                      {renderLoadingState}
                      {!suggestionState.loading && matchingTools.map((tool, index) => {
                        const itemIndex = (topAction ? 1 : 0) + categoryItems.length + index;

                        return (
                          <button
                            key={tool.slug}
                            type="button"
                            onClick={() => openTool(tool.slug)}
                            className={`flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition sm:px-6 sm:py-4 ${activeIndex === itemIndex ? "bg-white/8" : "hover:bg-white/5"}`}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 p-2 sm:h-12 sm:w-12 sm:rounded-2xl">
                                <img src={tool.image?.url} alt={tool.name} className="h-full w-full object-contain" loading="lazy" />
                              </div>
                              <div className="min-w-0">
                                <HighlightedText text={tool.name} query={search} className="truncate text-base font-medium text-white sm:text-lg" />
                                <HighlightedText text={tool.category} query={search} className="mt-1 block text-sm text-slate-400" />
                                {tool.description ? (
                                  <HighlightedText text={tool.description} query={search} className="mt-2 line-clamp-1 text-xs text-sky-200" />
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {tool.featured ? (
                                <span className="hidden rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200 sm:inline-flex">
                                  Featured
                                </span>
                              ) : null}
                              <ArrowRight size={18} className="shrink-0 text-slate-500" />
                            </div>
                          </button>
                        );
                      })}

                      {!suggestionState.loading && !matchingTools.length ? (
                        <div className="px-5 py-6 text-sm text-slate-400 sm:px-6">No matching tools found yet. Try another name, category, or keyword.</div>
                      ) : null}
                    </div>
                  ) : null}

                  {showNoResults ? (
                    <div className="border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5">
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">No exact match found</p>
                        <p className="mt-2 text-sm text-slate-400">Try a broader keyword or jump into a related category.</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {relatedCategories.length ? (
                            relatedCategories.map((category) => (
                              <button
                                key={category.slug}
                                type="button"
                                onClick={() => applyCategory(category.name)}
                                className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                              >
                                {category.name}
                              </button>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No related categories available.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="border-t border-white/10 bg-slate-950/90 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                  {hasQuery ? "View all results for this search or keep refining the query." : "Use recent, trending, or type a fresh query."}
                </p>
                <button
                  type="button"
                  onClick={openSearchResultsPage}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20 sm:w-auto"
                >
                  <Sparkles size={16} />
                  {hasQuery ? `View All Results for "${search}"` : "Explore All Tools"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2.5 lg:mt-3 lg:flex-row lg:flex-wrap lg:items-center">
        <label className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-slate-950/55 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.06] lg:min-w-[320px]">
          <SlidersHorizontal size={16} className="text-sky-300" />
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full appearance-none bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.name} className="bg-slate-950 text-white">
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-slate-950/55 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.06] lg:min-w-[280px]">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <select
            value={pricing}
            onChange={(event) => setPricing(event.target.value)}
            className="w-full appearance-none bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
          >
            {pricingOptions.map((option) => (
              <option key={option} value={option === "All" ? "" : option} className="bg-slate-950 text-white">
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            onReset();
            setIsOpen(false);
            setActiveIndex(-1);
          }}
          className="inline-flex items-center justify-center rounded-full px-1 py-2 text-sm font-semibold text-slate-300 transition hover:text-white lg:px-3"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;
