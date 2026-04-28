import { Link } from "react-router-dom";
import AdsterraDirectLinkCard from "../components/ads/AdsterraDirectLinkCard";
import AdsterraScriptUnit from "../components/ads/AdsterraScriptUnit";
import CategoryStrip from "../components/home/CategoryStrip";
import HeroSection from "../components/home/HeroSection";
import SectionTitle from "../components/shared/SectionTitle";
import ToolGrid from "../components/tools/ToolGrid";
import { adsterraConfig } from "../config/adsterra";
import { useGetCategoriesQuery, useGetTrendingToolsQuery } from "../store/userApi";

const HomePage = ({ stats }) => {
  const { data: trendingTools = [], isLoading: trendingLoading } = useGetTrendingToolsQuery();
  const { data: categories = [] } = useGetCategoriesQuery({ limit: 24 });

  return (
    <div>
      <HeroSection stats={stats} />
      <CategoryStrip categories={categories.slice(0, 10)} />

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
        <ToolGrid tools={trendingTools} loading={trendingLoading} />
      </section>
    </div>
  );
};

export default HomePage;
