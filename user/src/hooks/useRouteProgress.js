import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";

export const useRouteProgress = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const timer = window.setTimeout(() => NProgress.done(), 250);

    return () => {
      window.clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname, location.search]);
};
