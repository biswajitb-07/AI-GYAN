import { apiClient } from "./client";

export const fetchFeaturedTools = async () => {
  const { data } = await apiClient.get("/tools/featured/list");
  return data.data;
};

export const fetchTrendingTools = async () => {
  const { data } = await apiClient.get("/tools", {
    params: {
      sort: "popular",
      limit: 6,
    },
  });
  return data.data;
};

export const fetchDashboardStats = async () => {
  const { data } = await apiClient.get("/dashboard/stats");
  return data.data;
};

export const trackPageView = async (payload) => {
  const { data } = await apiClient.post("/analytics/view", payload);
  return data;
};

export const trackSearchQuery = async (payload) => {
  const { data } = await apiClient.post("/analytics/search", payload);
  return data;
};

export const fetchTools = async (params) => {
  const { data } = await apiClient.get("/tools", { params });
  return data;
};

export const fetchCompareTools = async (slugs) => {
  const { data } = await apiClient.get("/tools/compare", {
    params: {
      slugs: slugs.join(","),
    },
  });
  return data.data;
};

export const fetchToolBySlug = async (slug) => {
  const { data } = await apiClient.get(`/tools/slug/${slug}`);
  return data.data;
};

export const fetchRelatedTools = async (slug) => {
  const { data } = await apiClient.get(`/tools/slug/${slug}/related`);
  return data.data;
};

export const createToolReview = async (slug, payload) => {
  const { data } = await apiClient.post(`/tools/slug/${slug}/reviews`, payload);
  return data;
};

export const fetchCategories = async (params = { limit: 200 }) => {
  const { data } = await apiClient.get("/categories", { params });
  return data.data;
};

export const fetchCategoryBySlug = async (slug, params = {}) => {
  const { data } = await apiClient.get(`/categories/${slug}`, { params });
  return data.data;
};

export const chatWithAi = async (payload) => {
  const { data } = await apiClient.post("/ai/chat", payload);
  return data.data;
};
