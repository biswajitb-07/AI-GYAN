import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchAdminSession, loginAdmin as loginAdminRequest, logoutAdmin as logoutAdminRequest } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await fetchAdminSession();
        setAdmin(session);
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      isAuthenticated: Boolean(admin),
      login: async (payload) => {
        await loginAdminRequest(payload);
        const session = await fetchAdminSession();
        setAdmin(session);
        return session;
      },
      logout: async () => {
        await logoutAdminRequest();
        setAdmin(null);
      },
    }),
    [admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
