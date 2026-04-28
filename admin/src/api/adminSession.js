const ADMIN_TOKEN_KEY = "ai_gyan_admin_token";

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || "";

export const setAdminToken = (token) => {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};
