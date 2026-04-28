import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { adminApi } from "./adminApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(adminApi.middleware),
});
