import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Tools", "Categories", "Dashboard", "Tool"],
  endpoints: (builder) => ({
    getFeaturedTools: builder.query({
      query: () => "/tools/featured/list",
      transformResponse: (response) => response.data,
      providesTags: ["Tools"],
    }),
    getTrendingTools: builder.query({
      query: () => ({
        url: "/tools",
        params: {
          sort: "popular",
          limit: 6,
        },
      }),
      transformResponse: (response) => response.data,
      providesTags: ["Tools"],
    }),
    getDashboardStats: builder.query({
      query: () => "/dashboard/stats",
      transformResponse: (response) => response.data,
      providesTags: ["Dashboard"],
    }),
    trackPageView: builder.mutation({
      query: (payload) => ({
        url: "/analytics/view",
        method: "POST",
        body: payload,
      }),
    }),
    trackSearchQuery: builder.mutation({
      query: (payload) => ({
        url: "/analytics/search",
        method: "POST",
        body: payload,
      }),
    }),
    getTools: builder.query({
      query: (params) => ({
        url: "/tools",
        params,
      }),
      providesTags: ["Tools"],
    }),
    getCompareTools: builder.query({
      query: (slugs) => ({
        url: "/tools/compare",
        params: {
          slugs: slugs.join(","),
        },
      }),
      transformResponse: (response) => response.data,
      providesTags: ["Tools"],
    }),
    getToolBySlug: builder.query({
      query: (slug) => `/tools/slug/${slug}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, slug) => [{ type: "Tool", id: slug }],
    }),
    getRelatedTools: builder.query({
      query: (slug) => `/tools/slug/${slug}/related`,
      transformResponse: (response) => response.data,
      providesTags: ["Tools"],
    }),
    createToolReview: builder.mutation({
      query: ({ slug, payload }) => ({
        url: `/tools/slug/${slug}/reviews`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: "Tool", id: slug }],
    }),
    getCategories: builder.query({
      query: (params = { limit: 200 }) => ({
        url: "/categories",
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ["Categories"],
    }),
    getCategoryBySlug: builder.query({
      query: ({ slug, params = {} }) => ({
        url: `/categories/${slug}`,
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ["Categories", "Tools"],
    }),
    chatWithAi: builder.mutation({
      query: (payload) => ({
        url: "/ai/chat",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetFeaturedToolsQuery,
  useGetTrendingToolsQuery,
  useGetDashboardStatsQuery,
  useTrackPageViewMutation,
  useTrackSearchQueryMutation,
  useGetToolsQuery,
  useLazyGetToolsQuery,
  useGetCompareToolsQuery,
  useLazyGetCompareToolsQuery,
  useGetToolBySlugQuery,
  useGetRelatedToolsQuery,
  useCreateToolReviewMutation,
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useChatWithAiMutation,
} = userApi;
