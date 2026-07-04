import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// INQUIRY_CLIENT.status — Submitted → In Progress → Completed (seragam di semua
// API user, sampai nilai di DB).
export type InquiryStatus = "submitted" | "in_progress" | "completed";

// Satu permintaan kerja sama (project brief) milik seorang client.
// Field mengikuti tabel INQUIRY_CLIENT pada PRD.
export type ClientInquiry = {
  id: string;
  namaClient: string;
  noTelepon: string;
  judulProject: string;
  brand?: string;
  jenisJob: string;
  tanggalProject?: string; // ISO date — mulai
  tanggalProjectSelesai?: string; // ISO date — selesai (durasi)
  modelPilihan?: string;
  catatanClient?: string;
  status: InquiryStatus;
  catatanAdmin?: string; // catatan internal agency yang ikut dipantau client
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};

// Payload form pengajuan — hanya field yang diisi client.
export type CreateInquiryRequest = {
  namaClient: string;
  noTelepon: string;
  judulProject: string;
  brand?: string;
  jenisJob: string;
  tanggalProject?: string;
  tanggalProjectSelesai?: string;
  modelPilihan?: string;
  catatanClient?: string;
};

// Payload admin saat menindaklanjuti inquiry — ubah status dan/atau catatan.
export type UpdateInquiryRequest = {
  id: string;
  status?: InquiryStatus;
  catatanAdmin?: string;
};

export const inquiryApi = createApi({
  reducerPath: "inquiryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Inquiry"],
  endpoints: (builder) => ({
    // Riwayat inquiry milik client yang login — PER-USER (akun baru → kosong).
    getMyInquiries: builder.query<ClientInquiry[], string>({
      query: (userId) => `inquiries?userId=${encodeURIComponent(userId)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Inquiry" as const, id })),
              { type: "Inquiry" as const, id: "LIST" },
            ]
          : [{ type: "Inquiry" as const, id: "LIST" }],
    }),
    // Seluruh inquiry yang masuk — untuk panel admin (tanpa filter user).
    getAllInquiries: builder.query<ClientInquiry[], void>({
      query: () => "inquiries",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Inquiry" as const, id })),
              { type: "Inquiry" as const, id: "LIST" },
            ]
          : [{ type: "Inquiry" as const, id: "LIST" }],
    }),
    // Mengajukan project brief baru — milik client yang login (status awal baru).
    createInquiry: builder.mutation<
      ClientInquiry,
      { userId: string } & CreateInquiryRequest
    >({
      query: (body) => ({ url: "inquiries", method: "POST", body }),
      invalidatesTags: [{ type: "Inquiry", id: "LIST" }],
    }),
    // Admin menindaklanjuti: ubah status (baru→diproses→selesai) & catatan
    // internal yang ikut dipantau client.
    updateInquiry: builder.mutation<ClientInquiry, UpdateInquiryRequest>({
      query: ({ id, ...patch }) => ({
        url: `inquiries/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Inquiry", id },
        { type: "Inquiry", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMyInquiriesQuery,
  useGetAllInquiriesQuery,
  useCreateInquiryMutation,
  useUpdateInquiryMutation,
} = inquiryApi;
