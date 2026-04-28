import AppLayout from "./components/layout/AppLayout";
import ScrollToTop from "./components/shared/ScrollToTop";
import { fetchDashboardStats } from "./api/tools";
import { useAsyncData } from "./hooks/useAsyncData";
import { usePageTracking } from "./hooks/usePageTracking";
import { useRouteProgress } from "./hooks/useRouteProgress";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  useRouteProgress();
  usePageTracking();
  const statsState = useAsyncData(fetchDashboardStats, []);

  return (
    <AppLayout stats={statsState.data?.overview}>
      <ScrollToTop />
      <AppRoutes stats={statsState.data?.overview} />
    </AppLayout>
  );
};

export default App;
