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

export type AdminOverview = {
  metrics: AdminMetrics;
  applications: TalentApplication[];
  inquiries: ClientInquiry[];
};

export type AnnouncementDraft = {
  headline: string;
  message: string;
  publish: boolean;
};

export type AnnouncementResponse = {
  id: string;
  headline: string;
  message: string;
  publishedAt: string | null;
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
  tagTypes: ["AdminOverview", "Announcement", "Account"],
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
    publishAnnouncement: builder.mutation<AnnouncementResponse, AnnouncementDraft>({
      query: (body) => ({
        url: "admin/announcements",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Announcement", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminOverviewQuery,
  useGetAccountsQuery,
  usePublishAnnouncementMutation,
} = adminApi;
