import { apiClient } from "./client";

export const fetchDashboardStats = async () => {
  const { data } = await apiClient.get("/admin/dashboard/stats");
  return data.data;
};

export const fetchTools = async (params) => {
  const { data } = await apiClient.get("/admin/tools", { params });
  return data;
};

export const fetchCategories = async (params) => {
  const { data } = await apiClient.get("/admin/categories", { params });
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await apiClient.post("/admin/categories", payload);
  return data.data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await apiClient.put(`/admin/categories/${id}`, payload);
  return data.data;
};

export const deleteCategory = async (id) => {
  await apiClient.delete(`/admin/categories/${id}`);
};

export const createTool = async (formData) => {
  const { data } = await apiClient.post("/admin/tools", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data.data;
};

export const updateTool = async (id, formData) => {
  const { data } = await apiClient.put(`/admin/tools/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data.data;
};

export const deleteTool = async (id) => {
  await apiClient.delete(`/admin/tools/${id}`);
};
