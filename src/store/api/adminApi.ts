import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthRole, AuthUser } from "./authApi";

export type AdminMetrics = {
  activeTalent: number;
  pendingApplications: number;
  newInquiries: number;
  activeClassBatches: number;
};

export type ApplicationStatus = "new" | "under_review" | "approved" | "declined";

export type TalentApplication = {
  id: string;
  name: string;
  appliedAt: string;
  category: string;
  status: ApplicationStatus;
};

export type ClientInquiry = {
  id: string;
  client: string;
  receivedAgo: string;
  excerpt: string;
};

// Satu item feed "notifikasi terbaru" di dashboard admin — diturunkan server
// dari pendaftaran talent & inquiry klien yang baru masuk.
export type AdminNotification = {
  id: string;
  kind: "application" | "inquiry";
  title: string;
  detail: string;
  time: string;
};

// Bentuk data mentah yang disimpan di server-store (tanpa turunan notifikasi).
export type OverviewData = {
  metrics: AdminMetrics;
  applications: TalentApplication[];
  inquiries: ClientInquiry[];
};

// Yang dikirim ke klien: data mentah + feed notifikasi yang sudah dirakit.
export type AdminOverview = OverviewData & {
  notifications: AdminNotification[];
};

export type AdminAccount = AuthUser & {
  createdAt: string;
};

export type AdminAccountsResponse = {
  accounts: AdminAccount[];
  totals: Record<AuthRole, number>;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["AdminOverview", "Account"],
  endpoints: (builder) => ({
    getAdminOverview: builder.query<AdminOverview, void>({
      query: () => "admin/overview",
      providesTags: [{ type: "AdminOverview", id: "OVERVIEW" }],
    }),
    getAccounts: builder.query<AdminAccountsResponse, void>({
      query: () => "admin/accounts",
      providesTags: (result) =>
        result
          ? [
              { type: "Account" as const, id: "LIST" },
              ...result.accounts.map((a) => ({
                type: "Account" as const,
                id: a.id,
              })),
            ]
          : [{ type: "Account" as const, id: "LIST" }],
    }),
  }),
});

export const { useGetAdminOverviewQuery, useGetAccountsQuery } = adminApi;
