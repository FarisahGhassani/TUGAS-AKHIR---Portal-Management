import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Notifikasi user = PUSH ringan dari DB. TIDAK ada tabel Notification; feed
// diturunkan server dari perubahan status pendaftaran/inquiry milik user
// (dipoll). "unread" dihitung server terhadap SATU kolom `user.notifSeenAt`
// (bukan entity baru). Cukup untuk titik merah kecil di navbar (NotificationDot);
// membuka halaman status menandai sudah dibaca.
export type UserNotificationStatus =
  | "submitted"
  | "in_progress"
  | "accepted"
  | "rejected"
  | "completed";

export type UserNotification = {
  id: string;
  kind: "application" | "inquiry";
  title: string;
  status: UserNotificationStatus;
  time: string; // ISO
  unread: boolean;
  href: string;
};

export type UserNotificationsResponse = {
  items: UserNotification[];
  unreadCount: number;
};

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<UserNotificationsResponse, string>({
      query: (userId) =>
        `dashboard/notifications?userId=${encodeURIComponent(userId)}`,
      providesTags: [{ type: "Notifications", id: "LIST" }],
    }),
    // Tandai semua sudah dibaca (set notifSeenAt = now) → titik merah hilang.
    markNotificationsRead: builder.mutation<{ ok: boolean }, string>({
      query: (userId) => ({
        url: "dashboard/notifications",
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationsReadMutation } =
  notificationsApi;
