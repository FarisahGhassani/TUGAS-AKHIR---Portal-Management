import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TalentGender } from "./talentApi";

// PENDAFTARAN.status — Submitted → In Progress → Accepted/Rejected (dua outcome
// terminal). Seragam di UI & DB.
export type ApplicationStatus =
  | "submitted"
  | "in_progress"
  | "accepted"
  | "rejected";
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
  statusKelulusan: GraduationStatus;
  sertifikatUrl?: string;
};

export type DashboardSummary = {
  greeting: { name: string; subtitle: string };
  applications: TalentApplication[];
  classes: TalentClass[];
};

// Batch kelas modelling. `batchKe` (nomor "Batch 01") DITURUNKAN server dari
// urutan baris — bukan kolom DB & bukan input admin.
export type ModellingBatch = {
  id: string;
  namaBatch: string;
  batchKe: number;
  kuota: number;
  tglMulai: string;
  tglBerakhir: string;
  statusPendaftaran: "buka" | "tutup";
};

// Payload create/edit batch dari panel admin (id & batchKe diturunkan server).
export type BatchInput = {
  namaBatch: string;
  kuota: number;
  tglMulai: string;
  tglBerakhir: string;
  statusPendaftaran: "buka" | "tutup";
};

// Status pendaftaran kelas (= pendaftaran.status di DB).
export type ClassRegistrationStatus =
  | "submitted"
  | "in_progress"
  | "accepted"
  | "rejected";

// Satu pendaftaran KELAS (pendaftaran jenis=kelas) untuk panel approval admin.
export type ClassRegistration = {
  id: string;
  name: string;
  noTelepon: string;
  batchId: string | null;
  batchLabel: string;
  status: ClassRegistrationStatus;
  appliedAt: string;
  statusLulus: GraduationStatus;
  sertifikatUrl?: string;
};

// Pendaftaran talent (PRD: PENDAFTARAN, jenis = "talent").
export type TalentRegistrationInput = {
  jenis: "talent";
  namaTalent: string;
  gender: TalentGender;
  tanggalLahir: string;
  tinggiBadan: number;
  beratBadan: number;
  sizeBaju: string;
  sizeSepatu: string; // ukuran EU mentah (angka); UK diturunkan di API
  kartuIdentitas: string;
  noTelepon: string;
  instagram: string; // handle IG (tanpa "@"), wajib — portof atau pribadi
  fotoProfil: string; // wajib
  fotoPortofolio?: string; // opsional, boleh kosong (null di DB)
};

// Pendaftaran kelas (PRD: PENDAFTARAN jenis = "kelas" + PENDAFTARAN_BATCH).
export type ClassRegistrationInput = {
  jenis: "kelas";
  batchId: string;
  namaTalent: string;
  noTelepon: string;
};

// Dua form berbeda, tapi keduanya menulis ke "database" pendaftaran yang sama,
// dibedakan oleh kolom `jenis` (persis seperti tabel PENDAFTARAN di PRD).
export type CreateApplicationRequest =
  | TalentRegistrationInput
  | ClassRegistrationInput;

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Application", "Batch"],
  endpoints: (builder) => ({
    // Dashboard milik user yang login — riwayat & kelasnya sendiri (DB per-user;
    // akun baru → kosong). userId dari auth state diteruskan sebagai query param.
    getDashboardSummary: builder.query<DashboardSummary, string>({
      query: (userId) => `dashboard?userId=${encodeURIComponent(userId)}`,
      providesTags: [{ type: "Application", id: "LIST" }],
    }),
    // Daftar batch kelas yang bisa didaftari (untuk form modelling school &
    // panel admin). Di-tag agar create/update batch otomatis me-refresh.
    getBatches: builder.query<ModellingBatch[], void>({
      query: () => "batches",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Batch" as const, id })),
              { type: "Batch" as const, id: "LIST" },
            ]
          : [{ type: "Batch" as const, id: "LIST" }],
    }),
    createBatch: builder.mutation<ModellingBatch, BatchInput>({
      query: (body) => ({ url: "admin/batches", method: "POST", body }),
      invalidatesTags: [{ type: "Batch", id: "LIST" }],
    }),
    updateBatch: builder.mutation<
      ModellingBatch,
      { id: string } & BatchInput
    >({
      query: ({ id, ...body }) => ({
        url: `admin/batches/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Batch", id },
        { type: "Batch", id: "LIST" },
      ],
    }),
    // Pendaftaran kelas untuk panel approval admin (DB).
    getClassRegistrations: builder.query<ClassRegistration[], void>({
      query: () => "admin/class-registrations",
      providesTags: [{ type: "Application", id: "CLASSREG" }],
    }),
    // Approve/reject (status) DAN set kelulusan + sertifikat (statusLulus/
    // sertifikatUrl) untuk pendaftaran kelas — satu PATCH, field opsional.
    updateClassRegistration: builder.mutation<
      ClassRegistration,
      {
        id: string;
        status?: ClassRegistrationStatus;
        statusLulus?: GraduationStatus;
        sertifikatUrl?: string;
      }
    >({
      query: ({ id, ...patch }) => ({
        url: `admin/class-registrations/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: [
        { type: "Application", id: "CLASSREG" },
        { type: "Batch", id: "LIST" },
      ],
    }),
    // Satu mutation untuk KEDUA form (talent & kelas) → satu store pendaftaran.
    // Status awal selalu "pending". Invalidasi LIST supaya riwayat ter-refresh.
    createApplication: builder.mutation<
      TalentApplication,
      { userId: string } & CreateApplicationRequest
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
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useGetClassRegistrationsQuery,
  useUpdateClassRegistrationMutation,
} = dashboardApi;
