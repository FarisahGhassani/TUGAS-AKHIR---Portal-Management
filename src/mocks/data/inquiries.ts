import type { ClientInquiry } from "@/store/api/inquiryApi";

// Seed riwayat inquiry milik client — mencakup ketiga status agar tampilan
// "memantau" terisi: baru, diproses (dengan catatan admin), dan selesai.
export const clientInquiries: ClientInquiry[] = [
  {
    id: "inq-01",
    namaClient: "Lukas Beaumont",
    noTelepon: "0812-3456-7890",
    judulProject: "Spring Editorial — Maison Arno",
    brand: "MAISON ARNO",
    jenisJob: "Editorial",
    tanggalProject: "2026-07-18",
    modelPilihan: "2 talent runway wanita, tinggi 175cm+",
    catatanClient: "Konsep monokrom, lokasi studio Jakarta Selatan.",
    status: "selesai",
    catatanAdmin:
      "Kontrak selesai. Talent Aria & Naya dikonfirmasi untuk sesi 18 Juli.",
    createdAt: "2026-05-20T09:12:00.000Z",
    updatedAt: "2026-06-01T14:30:00.000Z",
  },
  {
    id: "inq-02",
    namaClient: "Lukas Beaumont",
    noTelepon: "0812-3456-7890",
    judulProject: "Campaign Resort 25 Lookbook",
    brand: "ATELIER NORD",
    jenisJob: "Campaign",
    tanggalProject: "2026-08-05",
    modelPilihan: "1 talent pria untuk lookbook resort.",
    catatanClient: "Butuh talent dengan pengalaman kampanye internasional.",
    status: "diproses",
    catatanAdmin:
      "Sedang menyiapkan 3 opsi portfolio talent. Akan kami kirim minggu ini.",
    createdAt: "2026-06-04T03:45:00.000Z",
    updatedAt: "2026-06-08T08:10:00.000Z",
  },
  {
    id: "inq-03",
    namaClient: "Lukas Beaumont",
    noTelepon: "0812-3456-7890",
    judulProject: "Runway Show — Jakarta Fashion Week",
    brand: "",
    jenisJob: "Runway",
    tanggalProject: "2026-09-12",
    modelPilihan: "5 talent runway (campuran).",
    catatanClient: "Casting awal, jumlah final menyusul.",
    status: "baru",
    createdAt: "2026-06-09T11:20:00.000Z",
    updatedAt: "2026-06-09T11:20:00.000Z",
  },
];

export function listInquiries(): ClientInquiry[] {
  return [...clientInquiries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function addInquiry(
  input: Omit<ClientInquiry, "id" | "status" | "createdAt" | "updatedAt">,
): ClientInquiry {
  const now = new Date().toISOString();
  const inquiry: ClientInquiry = {
    ...input,
    id: `inq-${Date.now()}`,
    status: "baru",
    createdAt: now,
    updatedAt: now,
  };
  clientInquiries.unshift(inquiry);
  return inquiry;
}
