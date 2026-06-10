import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Selaras PRD — PENDAFTARAN.status
export type ApplicationStatus = "pending" | "diterima" | "ditolak";
// PENDAFTARAN.jenis
export type ApplicationType = "talent" | "kelas";
// PENDAFTARAN_BATCH.status_pembayaran
export type PaymentStatus = "pending" | "valid" | "tidak_valid";
// PENDAFTARAN_BATCH / TALENT_BATCH.status_kelulusan
export type GraduationStatus = "belum" | "lulus" | "tidak_lulus";

// Riwayat apply (PENDAFTARAN) milik user talent
export type TalentApplication = {
  id: string;
  jenis: ApplicationType;
  judul: string;
  tanggal: string; // ISO date
  status: ApplicationStatus;
};

// Kelas modelling yang diikuti (BATCH_MODELLING + PENDAFTARAN_BATCH / TALENT_BATCH)
export type TalentClass = {
  id: string;
  namaBatch: string;
  batchKe: number;
  tglMulai: string;
  tglBerakhir: string;
  statusPembayaran: PaymentStatus;
  statusKelulusan: GraduationStatus;
  sertifikatUrl?: string;
};

export type DashboardSummary = {
  greeting: { name: string; subtitle: string };
  applications: TalentApplication[];
  classes: TalentClass[];
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Application"],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => "dashboard",
      providesTags: [{ type: "Application", id: "LIST" }],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
