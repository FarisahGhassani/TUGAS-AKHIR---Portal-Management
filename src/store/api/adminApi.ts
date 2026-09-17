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

// Notifikasi ringkas (JUDUL saja) yang ditarik LANGSUNG dari tabel pendaftaran &
// inquiry_client. `href` mengarahkan ke submenu admin terkait saat diklik.
// `unread` = lebih baru dari `user.notifSeenAt` admin (untuk titik merah).
export type AdminNotificationItem = {
  id: string;
  kind: "application" | "inquiry";
  title: string;
  time: string;
  href: string;
  unread: boolean;
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

// Peran yang boleh di-set admin lewat "Ubah Role" — hanya client ↔ talent.
// Akun admin tidak boleh diubah perannya.
export type EditableRole = Exclude<AuthRole, "admin">;

// Aktivitas satu akun — diturunkan dari data yang SUDAH ada (pendaftaran &
// inquiry milik user), bukan tabel baru. Dipakai modal detail akun.
export type AccountApplication = {
  id: string;
  title: string; // namaTalent
  jenis: "talent" | "kelas";
  status: string; // StatusPendaftaran
  createdAt: string;
};

export type AccountInquiry = {
  id: string;
  judulProject: string;
  status: string; // StatusInquiry
  createdAt: string;
};

export type AccountActivity = {
  account: AdminAccount;
  applications: AccountApplication[];
  inquiries: AccountInquiry[];
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["AdminOverview", "Account"],
  endpoints: (builder) => ({
    // Metrik dashboard dari DB (count pendaftaran/inquiry/talent).
    getAdminOverview: builder.query<AdminMetrics, void>({
      query: () => "admin/overview",
      providesTags: [{ type: "AdminOverview", id: "OVERVIEW" }],
    }),
    // Notifikasi dari DB (pendaftaran + inquiry terbaru) — judul + link submenu.
    // userId = admin yang login; dipakai server menghitung `unread` vs notifSeenAt.
    getAdminNotifications: builder.query<AdminNotificationItem[], string>({
      query: (userId) =>
        `admin/notifications?userId=${encodeURIComponent(userId)}`,
      providesTags: [{ type: "AdminOverview", id: "NOTIF" }],
    }),
    // Tandai notifikasi admin sudah dibaca (set notifSeenAt admin = now).
    markAdminNotificationsRead: builder.mutation<{ ok: boolean }, string>({
      query: (userId) => ({
        url: "admin/notifications",
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: [{ type: "AdminOverview", id: "NOTIF" }],
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
    // Detail aktivitas satu akun (pendaftaran + inquiry miliknya) untuk modal.
    getAccountActivity: builder.query<AccountActivity, string>({
      query: (id) => `admin/accounts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Account", id }],
    }),
    // Ubah peran akun (client ↔ talent) → UPDATE kolom role di DB.
    updateAccountRole: builder.mutation<
      AdminAccount,
      { id: string; role: EditableRole }
    >({
      query: ({ id, role }) => ({
        url: `admin/accounts/${id}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Account", id: "LIST" },
        { type: "Account", id },
      ],
    }),
  }),
});

export const {
  useGetAdminOverviewQuery,
  useGetAdminNotificationsQuery,
  useMarkAdminNotificationsReadMutation,
  useGetAccountsQuery,
  useGetAccountActivityQuery,
  useUpdateAccountRoleMutation,
} = adminApi;
