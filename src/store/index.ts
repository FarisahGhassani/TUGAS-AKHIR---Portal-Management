import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { landingApi } from "./api/landingApi";
import { authApi } from "./api/authApi";
import { talentApi } from "./api/talentApi";
import { projectsApi } from "./api/projectsApi";
import { dashboardApi } from "./api/dashboardApi";
import { adminApi } from "./api/adminApi";
import { announcementsApi } from "./api/announcementsApi";
import { agencyApi } from "./api/agencyApi";
import { inquiryApi } from "./api/inquiryApi";
import { siteAssetsApi } from "./api/siteAssetsApi";
import { notificationsApi } from "./api/notificationsApi";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    [landingApi.reducerPath]: landingApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [talentApi.reducerPath]: talentApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [announcementsApi.reducerPath]: announcementsApi.reducer,
    [agencyApi.reducerPath]: agencyApi.reducer,
    [inquiryApi.reducerPath]: inquiryApi.reducer,
    [siteAssetsApi.reducerPath]: siteAssetsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      landingApi.middleware,
      authApi.middleware,
      talentApi.middleware,
      projectsApi.middleware,
      dashboardApi.middleware,
      adminApi.middleware,
      announcementsApi.middleware,
      agencyApi.middleware,
      inquiryApi.middleware,
      siteAssetsApi.middleware,
      notificationsApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
