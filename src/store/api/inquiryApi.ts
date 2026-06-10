import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Selaras PRD — INQUIRY_CLIENT.status (Baru → Diproses → Selesai)
export type InquiryStatus = "baru" | "diproses" | "selesai";

// Satu permintaan kerja sama (project brief) milik seorang client.
// Field mengikuti tabel INQUIRY_CLIENT pada PRD.
export type ClientInquiry = {
  id: string;
  namaClient: string;
  noTelepon: string;
  judulProject: string;
  brand?: string;
  jenisJob: string;
  tanggalProject?: string; // ISO date
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
  modelPilihan?: string;
  catatanClient?: string;
};

export const inquiryApi = createApi({
  reducerPath: "inquiryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Inquiry"],
  endpoints: (builder) => ({
    // Riwayat inquiry milik client untuk dipantau statusnya.
    getMyInquiries: builder.query<ClientInquiry[], void>({
      query: () => "inquiries",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Inquiry" as const, id })),
              { type: "Inquiry" as const, id: "LIST" },
            ]
          : [{ type: "Inquiry" as const, id: "LIST" }],
    }),
    // Mengajukan project brief baru — status awal selalu "baru".
    createInquiry: builder.mutation<ClientInquiry, CreateInquiryRequest>({
      query: (body) => ({ url: "inquiries", method: "POST", body }),
      invalidatesTags: [{ type: "Inquiry", id: "LIST" }],
    }),
  }),
});

export const { useGetMyInquiriesQuery, useCreateInquiryMutation } = inquiryApi;
