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

// Batch kelas modelling yang tersedia untuk didaftari (PRD: BATCH_MODELLING).
export type ModellingBatch = {
  id: string;
  namaBatch: string;
  batchKe: number;
  kuota: number;
  tglMulai: string;
  tglBerakhir: string;
  statusPendaftaran: "buka" | "tutup";
};

// Pendaftaran talent (PRD: PENDAFTARAN, jenis = "talent").
export type TalentRegistrationInput = {
  jenis: "talent";
  namaTalent: string;
  tanggalLahir: string;
  tinggiBadan: number;
  beratBadan: number;
  sizeBaju: string;
  sizeSepatu: string;
  kartuIdentitas: string;
  noTelepon: string;
  fotoProfil?: string;
  fotoPortofolio?: string;
};

// Pendaftaran kelas (PRD: PENDAFTARAN jenis = "kelas" + PENDAFTARAN_BATCH).
export type ClassRegistrationInput = {
  jenis: "kelas";
  batchId: string;
  namaTalent: string;
  noTelepon: string;
  buktiPembayaran?: string;
};

// Dua form berbeda, tapi keduanya menulis ke "database" pendaftaran yang sama,
// dibedakan oleh kolom `jenis` (persis seperti tabel PENDAFTARAN di PRD).
export type CreateApplicationRequest =
  | TalentRegistrationInput
  | ClassRegistrationInput;

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Application"],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => "dashboard",
      providesTags: [{ type: "Application", id: "LIST" }],
    }),
    // Daftar batch kelas yang bisa didaftari (untuk form modelling school).
    getBatches: builder.query<ModellingBatch[], void>({
      query: () => "batches",
    }),
    // Satu mutation untuk KEDUA form (talent & kelas) → satu store pendaftaran.
    // Status awal selalu "pending". Invalidasi LIST supaya riwayat ter-refresh.
    createApplication: builder.mutation<
      TalentApplication,
      CreateApplicationRequest
    >({
      query: (body) => ({
        url: "dashboard/applications",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Application", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetBatchesQuery,
  useCreateApplicationMutation,
} = dashboardApi;
