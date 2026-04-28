import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAdminToken } from "../api/adminSession";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || getAdminToken();

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Auth", "Dashboard", "Tools", "Categories"],
  endpoints: (builder) => ({
    loginAdmin: builder.mutation({
      query: (payload) => ({
        url: "/admin-auth/login",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response) => response.data,
    }),
    logoutAdmin: builder.mutation({
      query: () => ({
        url: "/admin-auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    getAdminSession: builder.query({
      query: () => "/admin-auth/session",
      transformResponse: (response) => response.data,
      providesTags: ["Auth"],
    }),
    getDashboardStats: builder.query({
      query: () => "/admin/dashboard/stats",
      transformResponse: (response) => response.data,
      providesTags: ["Dashboard", "Tools", "Categories"],
    }),
    getTools: builder.query({
      query: (params) => ({
        url: "/admin/tools",
        params,
      }),
      providesTags: ["Tools"],
    }),
    getAdminCategories: builder.query({
      query: (params) => ({
        url: "/admin/categories",
        params,
      }),
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation({
      query: (payload) => ({
        url: "/admin/categories",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Categories", "Dashboard"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/admin/categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Categories", "Tools", "Dashboard"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories", "Dashboard"],
    }),
    createTool: builder.mutation({
      query: (formData) => ({
        url: "/admin/tools",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Tools", "Categories", "Dashboard"],
    }),
    updateTool: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/tools/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Tools", "Categories", "Dashboard"],
    }),
    deleteTool: builder.mutation({
      query: (id) => ({
        url: `/admin/tools/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tools", "Categories", "Dashboard"],
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useLogoutAdminMutation,
  useGetAdminSessionQuery,
  useGetDashboardStatsQuery,
  useGetToolsQuery,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateToolMutation,
  useUpdateToolMutation,
  useDeleteToolMutation,
} = adminApi;
