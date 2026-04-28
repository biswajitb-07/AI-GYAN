import { createSlice } from "@reduxjs/toolkit";
import { clearAdminToken, getAdminToken, setAdminToken } from "../api/adminSession";

const initialState = {
  admin: null,
  token: getAdminToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { admin, token } = action.payload;
      state.admin = admin;
      state.token = token;
      setAdminToken(token);
    },
    setAdminSession: (state, action) => {
      state.admin = action.payload;
    },
    clearAuth: (state) => {
      state.admin = null;
      state.token = "";
      clearAdminToken();
    },
  },
});

export const { setCredentials, setAdminSession, clearAuth } = authSlice.actions;

export const selectAdmin = (state) => state.auth.admin;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);

export default authSlice.reducer;
