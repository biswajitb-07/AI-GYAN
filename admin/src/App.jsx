import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/shared/ToastProvider";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const timer = window.setTimeout(() => NProgress.done(), 250);

    return () => {
      window.clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname, location.search]);

  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
