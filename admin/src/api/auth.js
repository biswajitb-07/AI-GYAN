import { apiClient } from "./client";

export const loginAdmin = async (payload) => {
  const { data } = await apiClient.post("/admin-auth/login", payload);
  return data.data;
};

export const logoutAdmin = async () => {
  const { data } = await apiClient.post("/admin-auth/logout");
  return data;
};

export const fetchAdminSession = async () => {
  const { data } = await apiClient.get("/admin-auth/session");
  return data.data;
};
