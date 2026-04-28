import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../api/tools";

const SESSION_STORAGE_KEY = "ai_gyan_session_id";

const getSessionId = () => {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
};

const getToolSlugFromPath = (pathname) => {
  const match = pathname.match(/^\/tools\/([^/]+)$/);
  return match ? match[1] : "";
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const fingerprint = `${location.pathname}${location.search}`;
    const now = Date.now();
    const lastTracked = window.__aiGyanLastTrackedPage;

    if (lastTracked?.fingerprint === fingerprint && now - lastTracked.timestamp < 1000) {
      return;
    }

    window.__aiGyanLastTrackedPage = {
      fingerprint,
      timestamp: now,
    };

    trackPageView({
      path: `${location.pathname}${location.search}`,
      toolSlug: getToolSlugFromPath(location.pathname),
      sessionId: getSessionId(),
    }).catch(() => {});
  }, [location.pathname, location.search]);
};
