const FAVORITES_KEY = "ai-gyan-favorites";
const COMPARE_KEY = "ai-gyan-compare";
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

export const getFavorites = () => readList(FAVORITES_KEY);
export const getCompareSlugs = () => readList(COMPARE_KEY);
export const getRecentViewed = () => readList(RECENT_VIEWED_KEY);

export const toggleFavorite = (tool) => {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.slug === tool.slug);
  const next = exists
    ? favorites.filter((item) => item.slug !== tool.slug)
    : [{ slug: tool.slug, name: tool.name, category: tool.category, image: tool.image }, ...favorites].slice(0, 12);

  writeList(FAVORITES_KEY, next);
  return next;
};

export const removeFavoriteBySlug = (slug) => {
  const next = getFavorites().filter((item) => item.slug !== slug);
  writeList(FAVORITES_KEY, next);
  return next;
};

export const toggleCompareSlug = (slug) => {
  const compare = getCompareSlugs();
  const next = compare.includes(slug) ? compare.filter((item) => item !== slug) : [...compare, slug].slice(0, 4);
  writeList(COMPARE_KEY, next);
  return next;
};

export const removeCompareSlug = (slug) => {
  const next = getCompareSlugs().filter((item) => item !== slug);
  writeList(COMPARE_KEY, next);
  return next;
};

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
