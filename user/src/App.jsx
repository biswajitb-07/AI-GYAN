import { useEffect } from "react";
import AppLayout from "./components/layout/AppLayout";
import ScrollToTop from "./components/shared/ScrollToTop";
import { usePageTracking } from "./hooks/usePageTracking";
import { useRouteProgress } from "./hooks/useRouteProgress";
import AppRoutes from "./routes/AppRoutes";
import { useGetDashboardStatsQuery } from "./store/userApi";

const App = () => {
  useRouteProgress();
  usePageTracking();
  const { data: statsData } = useGetDashboardStatsQuery();

  useEffect(() => {
    window.localStorage.removeItem("ai-gyan-favorites");
    window.localStorage.removeItem("ai-gyan-recent-searches");
  }, []);

  return (
    <AppLayout stats={statsData?.overview}>
      <ScrollToTop />
      <AppRoutes stats={statsData?.overview} />
    </AppLayout>
  );
};

export default App;
