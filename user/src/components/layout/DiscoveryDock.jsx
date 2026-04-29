import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, Trash2 } from "lucide-react";
import {
  DISCOVERY_UPDATED_EVENT,
  getRecentViewed,
  removeRecentViewedBySlug,
} from "../../utils/discoveryStorage";

const tabs = [
  { key: "recent", label: "Recent", icon: History, tone: "text-sky-200" },
];

const DiscoveryDock = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const syncDiscovery = () => {
      setRecentlyViewed(getRecentViewed());
    };

    syncDiscovery();
    window.addEventListener(DISCOVERY_UPDATED_EVENT, syncDiscovery);
    window.addEventListener("focus", syncDiscovery);

    return () => {
      window.removeEventListener(DISCOVERY_UPDATED_EVENT, syncDiscovery);
      window.removeEventListener("focus", syncDiscovery);
    };
  }, []);

  const panelMap = {
    recent: {
      title: "Recently viewed",
      description: "Jump back into tools you opened a few moments ago.",
      data: recentlyViewed,
      empty: "Open a few tools and your recent history will show here.",
      tone: "text-sky-200",
    },
  };

  const currentPanel = panelMap[activeTab];
  const counts = {
    recent: recentlyViewed.length,
  };

  const handleRemove = (slug) => {
    setRecentlyViewed(removeRecentViewedBySlug(slug));
  };

  return (
    <aside className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.92))] p-4 shadow-[0_26px_80px_rgba(2,6,23,0.42)] sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/35 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Workspace</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Your tool stack</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Revisit recently opened tools without leaving the directory flow.</p>
        </div>
        <Link to="/tools" className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
          Browse tools
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-[1.2rem] border px-3 py-3 text-left transition ${
                activeTab === tab.key
                  ? "border-sky-400/35 bg-white/10 shadow-[0_16px_35px_rgba(14,165,233,0.12)]"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/8"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80">
                  <Icon size={16} className={tab.tone} />
                </span>
                <span className="rounded-full bg-slate-950/80 px-2 py-1 text-[11px] font-semibold text-white">{counts[tab.key]}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{tab.label}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-4">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{currentPanel.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{currentPanel.description}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            {counts[activeTab]} items
          </span>
        </div>

        <div className="mt-4">
          {currentPanel.data.length ? (
            <div className="scrollbar-hidden max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {currentPanel.data.map((tool) => (
                <div
                  key={tool.slug}
                  className="group flex items-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-2.5 transition hover:border-sky-400/20 hover:bg-white/[0.06]"
                >
                  <Link to={`/tools/${tool.slug}`} className="min-w-0 flex-1 rounded-[1rem] px-1 py-1">
                    <p className="truncate text-sm font-semibold text-white">{tool.name}</p>
                    {tool.category ? <p className="mt-1 truncate text-xs text-slate-400">{tool.category}</p> : null}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(tool.slug)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/80 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-200"
                    aria-label={`Remove ${tool.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.04] px-4 py-7 text-sm leading-6 text-slate-400">
              {currentPanel.empty}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to="/tools"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse tools
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Send feedback
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default DiscoveryDock;
