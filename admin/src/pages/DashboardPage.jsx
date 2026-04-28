import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../api/dashboard";
import CategoryBarChart from "../components/charts/CategoryBarChart";
import PricingPieChart from "../components/charts/PricingPieChart";
import RecentToolsTable from "../components/dashboard/RecentToolsTable";
import SearchInsightsPanel from "../components/dashboard/SearchInsightsPanel";
import StatCard from "../components/dashboard/StatCard";
import Loader from "../components/shared/Loader";

const DashboardPage = () => {
  const [state, setState] = useState({ data: null, loading: true });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDashboardStats();
      setState({ data, loading: false });
    };

    loadData();
  }, []);

  if (state.loading) {
    return <Loader />;
  }

  const { overview, pricingBreakdown, categoryBreakdown, recentTools, topSearches, noResultSearches } = state.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tools" value={overview.totalTools} tone="sky" />
        <StatCard label="Categories" value={overview.totalCategories} tone="emerald" />
        <StatCard label="Featured tools" value={overview.featuredTools} tone="violet" />
        <StatCard label="Total visitors" value={overview.totalVisitors.toLocaleString()} tone="amber" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <PricingPieChart data={pricingBreakdown} />
        <CategoryBarChart data={categoryBreakdown} />
      </div>
      <SearchInsightsPanel topSearches={topSearches} noResultSearches={noResultSearches} />
      <RecentToolsTable tools={recentTools} />
    </div>
  );
};

export default DashboardPage;
