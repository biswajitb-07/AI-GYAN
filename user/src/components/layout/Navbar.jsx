import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { useLazyGetCategoriesQuery, useLazyGetToolsQuery } from "../../store/userApi";

const links = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/blog", label: "Blog" },
  { to: "/pricing", label: "Pricing" },
];

const MOBILE_DRAWER_DURATION = 520;

const SearchSuggestionPanel = ({ query, loading, tools, categories, onToolSelect, onCategorySelect, onViewAll, inline = false }) => {
  if (!query.trim()) {
    return inline ? null : (
      <div className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[90] rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-sm text-slate-400 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        Type a tool, category, or use case to search.
      </div>
    );
  }

  return (
    <div className={`${inline ? "mt-4" : "absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[90]"} overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 text-white shadow-[0_18px_44px_rgba(2,6,23,0.32)]`}>
      <button type="button" onClick={onViewAll} className="flex w-full items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-left transition hover:bg-white/5">
        <span className="text-sm">
          Search all results for <span className="font-semibold text-sky-200">"{query}"</span>
        </span>
        <ArrowRight size={16} className="text-sky-200" />
      </button>

      <div className="max-h-[25rem] overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="mt-2 h-3 w-20 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : null}

        {!loading && categories.length ? (
          <div className="p-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => onCategorySelect(category)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-sky-300/30 hover:bg-sky-400/10"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && tools.length ? (
          <div className="p-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Tools</p>
            <div className="space-y-1.5">
              {tools.slice(0, 6).map((tool) => (
                <button
                  key={tool.slug}
                  type="button"
                  onClick={() => onToolSelect(tool)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-left transition hover:border-sky-300/30 hover:bg-white/[0.07]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-2">
                    <img src={tool.image?.url} alt={tool.name} className="h-full w-full object-contain" loading="lazy" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{tool.name}</span>
                    <span className="block truncate text-xs text-slate-400">{tool.category}</span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && !tools.length && !categories.length ? (
          <div className="p-5 text-sm text-slate-400">No quick match found. View all results to search deeper.</div>
        ) : null}
      </div>
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const shellRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchCloseTimerRef = useRef(null);
  const menuCloseTimerRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchMounted, setMobileSearchMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ tools: [], categories: [], loading: false });
  const [triggerCategories] = useLazyGetCategoriesQuery();
  const [triggerTools] = useLazyGetToolsQuery();

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    window.clearTimeout(searchCloseTimerRef.current);
    searchCloseTimerRef.current = window.setTimeout(() => {
      setMobileSearchMounted(false);
    }, MOBILE_DRAWER_DURATION);
  };

  const openMobileSearch = () => {
    setMobileMenuOpen(false);
    setMobileMenuMounted(false);
    setSearchOpen(false);
    setSearchQuery("");
    window.clearTimeout(searchCloseTimerRef.current);
    setMobileSearchMounted(true);
    window.requestAnimationFrame(() => {
      setMobileSearchOpen(true);
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    window.clearTimeout(menuCloseTimerRef.current);
    menuCloseTimerRef.current = window.setTimeout(() => {
      setMobileMenuMounted(false);
    }, MOBILE_DRAWER_DURATION);
  };

  const openMobileMenu = () => {
    setMobileSearchOpen(false);
    setMobileSearchMounted(false);
    window.clearTimeout(menuCloseTimerRef.current);
    setMobileMenuMounted(true);
    window.requestAnimationFrame(() => {
      setMobileMenuOpen(true);
    });
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        closeMobileMenu();
        setSearchOpen(false);
        closeMobileSearch();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileMenuMounted(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setMobileSearchMounted(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    return () => {
      window.clearTimeout(searchCloseTimerRef.current);
      window.clearTimeout(menuCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) {
      const frameId = window.requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });

      return () => window.cancelAnimationFrame(frameId);
    }
  }, [searchOpen]);

  useEffect(() => {
    const query = searchQuery.trim();

    if ((!searchOpen && !mobileSearchOpen) || query.length < 2) {
      setSuggestions({ tools: [], categories: [], loading: false });
      return undefined;
    }

    let isCancelled = false;
    setSuggestions((current) => ({ ...current, loading: true }));

    const timeout = window.setTimeout(async () => {
      try {
        const [categoriesResponse, toolsResponse] = await Promise.all([
          triggerCategories({ search: query, limit: 6 }, true).unwrap(),
          triggerTools({ search: query, limit: 8 }, true).unwrap(),
        ]);

        if (!isCancelled) {
          setSuggestions({
            categories: categoriesResponse || [],
            tools: toolsResponse?.data || [],
            loading: false,
          });
        }
      } catch {
        if (!isCancelled) {
          setSuggestions({ tools: [], categories: [], loading: false });
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
    };
  }, [mobileSearchOpen, searchOpen, searchQuery, triggerCategories, triggerTools]);

  const submitSearch = (event) => {
    event?.preventDefault();
    const query = searchQuery.trim();

    if (!searchOpen && !mobileSearchOpen && event?.type !== "submit") {
      setSearchOpen(true);
      return;
    }

    if (!query) {
      searchInputRef.current?.focus();
      return;
    }

    navigate(`/search?query=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const openTool = (tool) => {
    navigate(`/tools/${tool.slug}`);
    setSearchQuery("");
    setSearchOpen(false);
    closeMobileSearch();
  };

  const openCategory = (category) => {
    navigate(`/categories/${category.slug}`);
    setSearchQuery("");
    setSearchOpen(false);
    closeMobileSearch();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 xl:bg-slate-950/75 xl:backdrop-blur-xl">
      <div ref={shellRef} className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src="/logo.png" alt="Ai Gyan" className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-lg shadow-sky-500/20 sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-white sm:text-lg">Ai Gyan</p>
              <p className="text-[10px] uppercase tracking-[0.32em] text-sky-200 sm:text-xs sm:tracking-[0.25em]">Discover . Learn . Grow</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 xl:hidden">
            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                openMobileSearch();
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label="Open search"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                if (mobileMenuOpen) {
                  closeMobileMenu();
                  return;
                }

                openMobileMenu();
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <div className="hidden w-full flex-col gap-3 xl:flex xl:w-auto xl:min-w-0 xl:flex-1 xl:flex-row xl:items-center xl:justify-end xl:gap-4">
          <nav className="grid w-full grid-cols-2 gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-1.5 sm:grid-cols-4 sm:max-w-2xl xl:w-auto xl:min-w-[420px] xl:flex-none">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2.5 text-center text-sm font-medium transition sm:px-5 ${
                    isActive ? "bg-sky-500 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <form
            onSubmit={submitSearch}
            className={`relative flex h-[3.35rem] items-center rounded-[1.35rem] border border-white/10 bg-white/5 transition-all duration-300 ${
              searchOpen ? "w-[340px] border-sky-300/25 bg-slate-950/75 px-3" : "w-[8.6rem] px-2"
            }`}
          >
            {searchOpen ? (
              <>
                <Search size={18} className="shrink-0 text-sky-200" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search tools..."
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button type="submit" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400 text-slate-950 transition hover:bg-sky-300" aria-label="Search">
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setSearchOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-200 transition hover:text-white">
                <Search size={17} />
                Search
              </button>
            )}
            {searchOpen ? (
              <SearchSuggestionPanel
                query={searchQuery}
                loading={suggestions.loading}
                tools={suggestions.tools}
                categories={suggestions.categories}
                onToolSelect={openTool}
                onCategorySelect={openCategory}
                onViewAll={submitSearch}
              />
            ) : null}
          </form>
        </div>

        {mobileSearchMounted ? (
          <>
            <div
              className={`fixed inset-0 z-[70] bg-slate-950/55 transition-opacity duration-[420ms] ease-out xl:hidden ${
                mobileSearchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={closeMobileSearch}
            />

            <aside
              className={`fixed inset-y-0 right-0 z-[80] flex h-dvh w-[92vw] max-w-[25rem] transform-gpu flex-col border-l border-white/10 bg-slate-950 p-4 shadow-[-8px_0_24px_rgba(2,6,23,0.25)] transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [contain:layout_paint_style] xl:hidden motion-reduce:transition-none ${
                mobileSearchOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">Search</p>
              <p className="mt-2 text-lg font-semibold text-white">Find AI tools</p>
            </div>
            <button
              type="button"
              onClick={closeMobileSearch}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submitSearch} className="relative mt-5">
            <div className="flex items-center gap-2 rounded-2xl border border-sky-300/20 bg-slate-950/80 px-3 py-2.5">
              <Search size={18} className="shrink-0 text-sky-200" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setMobileSearchOpen(true)}
                placeholder="Search tools, categories..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button type="submit" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400 text-slate-950">
                <ArrowRight size={17} />
              </button>
            </div>
            {mobileSearchOpen ? (
              <SearchSuggestionPanel
                query={searchQuery}
                loading={suggestions.loading}
                tools={suggestions.tools}
                categories={suggestions.categories}
                onToolSelect={openTool}
                onCategorySelect={openCategory}
                onViewAll={submitSearch}
              />
            ) : null}
          </form>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
            Search by tool name, category, or task. Results open directly like an ecommerce product search.
          </div>
            </aside>
          </>
        ) : null}

        {mobileMenuMounted ? (
          <>
            <div
              className={`fixed inset-0 z-[70] bg-slate-950/55 transition-opacity duration-[420ms] ease-out xl:hidden ${mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
              onClick={closeMobileMenu}
            />

            <div
              className={`fixed inset-y-0 left-0 z-[80] flex h-dvh w-[88vw] max-w-[22rem] transform-gpu flex-col border-r border-white/10 bg-slate-950 p-4 shadow-[8px_0_24px_rgba(2,6,23,0.25)] transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [contain:layout_paint_style] xl:hidden motion-reduce:transition-none ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">Navigation</p>
              <p className="mt-2 text-lg font-semibold text-white">Browse AI Gyan</p>
            </div>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
            <nav className="grid gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-1.5">
              {links.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-3 text-center text-sm font-medium transition ${
                      isActive ? "bg-sky-500 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
