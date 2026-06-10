import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type AnnouncementStatus = "aktif" | "nonaktif";

export type AnnouncementKategori = "casting" | "kelas" | "umum";

export type Announcement = {
  id: string;
  judul: string;
  ringkasan: string;
  kategori: AnnouncementKategori;
  fotoPoster: string;
  fotoPosterAlt: string;
  link: string;
  tanggalBerakhir: string;
  status: AnnouncementStatus;
};

/**
 * Selisih hari kalender antara hari ini dan tanggal deadline.
 * 0  = hari terakhir (deadline = hari ini)
 * >0 = masih ada N hari tersisa
 * <0 = sudah lewat deadline → kandidat takedown
 */
export function daysUntilDeadline(
  tanggalBerakhir: string,
  now: Date = new Date(),
): number {
  const deadline = new Date(`${tanggalBerakhir}T00:00:00`);
  if (Number.isNaN(deadline.getTime())) return Number.POSITIVE_INFINITY;
  const startOfDeadline = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate(),
  );
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  return Math.round(
    (startOfDeadline.getTime() - startOfToday.getTime()) / 86_400_000,
  );
}

/** Pengumuman otomatis di-takedown setelah tanggal deadline-nya terlewat. */
export function isAnnouncementExpired(
  tanggalBerakhir: string,
  now: Date = new Date(),
): boolean {
  return daysUntilDeadline(tanggalBerakhir, now) < 0;
}

export const announcementsApi = createApi({
  reducerPath: "announcementsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Announcement"],
  endpoints: (builder) => ({
    getActiveAnnouncements: builder.query<Announcement[], void>({
      query: () => "announcements?status=aktif",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Announcement" as const,
                id,
              })),
              { type: "Announcement" as const, id: "LIST" },
            ]
          : [{ type: "Announcement" as const, id: "LIST" }],
    }),
  }),
});

export const { useGetActiveAnnouncementsQuery } = announcementsApi;
