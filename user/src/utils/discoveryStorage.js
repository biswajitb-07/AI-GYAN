const RECENT_VIEWED_KEY = "ai-gyan-recent-viewed";
export const DISCOVERY_UPDATED_EVENT = "ai-gyan-discovery-updated";

const readList = (key) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
};

const writeList = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(DISCOVERY_UPDATED_EVENT, { detail: { key, value } }));
  } catch {
    // Ignore storage failures.
  }
};

export const getRecentViewed = () => readList(RECENT_VIEWED_KEY);

export const pushRecentViewed = (tool) => {
  const recent = getRecentViewed();
  const next = [{ slug: tool.slug, name: tool.name, category: tool.category, image: tool.image }, ...recent.filter((item) => item.slug !== tool.slug)].slice(0, 8);
  writeList(RECENT_VIEWED_KEY, next);
  return next;
};

export const removeRecentViewedBySlug = (slug) => {
  const next = getRecentViewed().filter((item) => item.slug !== slug);
  writeList(RECENT_VIEWED_KEY, next);
  return next;
};
